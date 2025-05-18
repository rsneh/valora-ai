from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import database, models
from app.schemas import chat as chat_schemas
from app.schemas import user as user_schemas
from app.services import chat_service  # Import your new chat service
from app.security.firebase_auth import get_current_active_user

router = APIRouter()


@router.post("/send_message", response_model=chat_schemas.ChatMessage)
async def send_chat_message(
    message_in: chat_schemas.ChatMessageCreate,
    db: Session = Depends(database.get_db),
    current_user: user_schemas.User = Depends(get_current_active_user),
):
    try:
        ai_response_message = (
            await chat_service.process_buyer_message_and_get_ai_response(
                db=db,
                product_id=message_in.product_id,
                buyer_id=current_user.uid,
                buyer_message_text=message_in.message_text,
            )
        )
        return ai_response_message
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        print(f"Error in send_chat_message endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your message.",
        )


@router.get("/history/{product_id}", response_model=List[chat_schemas.ChatMessage])
async def get_conversation_history(  # Made async to align with service
    product_id: int,
    db: Session = Depends(database.get_db),
    current_user: user_schemas.User = Depends(get_current_active_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    if current_user.uid == product.seller_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sellers cannot access chat history through this buyer endpoint.",
        )

    # Use the new service function that ensures greeting for new chats
    history = await chat_service.get_chat_history_with_greeting(
        db=db,
        product_id=product_id,
        buyer_id=current_user.uid,
        seller_id=product.seller_id,
    )
    return history
