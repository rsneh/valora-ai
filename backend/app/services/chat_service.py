from typing import List
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db import models
from app.services import ai_negotiation_service


async def get_or_create_conversation_with_greeting(
    db: Session,
    product_id: int,
    buyer_id: str,
    seller_id: str,
    locale: str = "en",
) -> models.Conversation:
    """
    Retrieves an existing conversation or creates a new one if it doesn't exist.
    """
    conversation = (
        db.query(models.Conversation)
        .filter(
            models.Conversation.product_id == product_id,
            models.Conversation.buyer_id == buyer_id,
            models.Conversation.seller_id == seller_id,  # Ensure seller_id also matches
        )
        .first()
    )

    if not conversation:
        product = (
            db.query(models.Product).filter(models.Product.id == product_id).first()
        )
        if not product:
            raise ValueError("Product not found for creating conversation")

        conversation = models.Conversation(
            product_id=product_id,
            buyer_id=buyer_id,
            seller_id=seller_id,
            status=models.ConversationStatus.ACTIVE,
        )
        db.add(conversation)
        db.commit()  # Commit to get conversation.id
        db.refresh(conversation)

        # Add initial AI greeting message
        ai_greeting_text = await ai_negotiation_service.generate_initial_ai_greeting(
            product,
            locale,
        )
        add_message_to_conversation(
            db=db,
            conversation_id=conversation.id,
            sender_id="VALORA_AI_ASSISTANT",
            sender_type=models.MessageSenderType.AI_ASSISTANT,
            message_text=ai_greeting_text,
            update_last_message_at=False,
        )
        db.refresh(conversation)
    return conversation


def add_message_to_conversation(
    db: Session,
    conversation_id: int,
    sender_id: str,
    sender_type: models.MessageSenderType,
    message_text: str,
    update_last_message_at: bool = True,  # Added flag
) -> models.ChatMessage:
    db_message = models.ChatMessage(
        conversation_id=conversation_id,
        sender_id=sender_id,
        sender_type=sender_type,
        message_text=message_text,
    )
    db.add(db_message)

    if update_last_message_at:
        conversation = (
            db.query(models.Conversation)
            .filter(models.Conversation.id == conversation_id)
            .first()
        )
        if conversation:
            conversation.last_message_at = func.now()
            db.add(conversation)

    db.commit()
    db.refresh(db_message)
    return db_message


async def process_buyer_message_and_get_ai_response(
    db: Session,
    product_id: int,
    buyer_id: str,
    buyer_message_text: str,
    locale: str = "en",
) -> models.ChatMessage:
    """
    Processes a buyer's message, gets an AI response, and saves both.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise ValueError("Product not found")  # Or a specific HTTPException

    conversation = await get_or_create_conversation_with_greeting(
        db=db,
        product_id=product_id,
        buyer_id=buyer_id,
        seller_id=product.seller_id,
        locale=locale,
    )

    # Save buyer's message
    add_message_to_conversation(
        db=db,
        conversation_id=conversation.id,
        sender_id=buyer_id,
        sender_type=models.MessageSenderType.BUYER,
        message_text=buyer_message_text,
    )

    recent_messages_db = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.conversation_id == conversation.id)
        .order_by(models.ChatMessage.timestamp.desc())
        .limit(10)
        .all()
    )

    conversation_history_for_ai = [
        {"sender_type": msg.sender_type.value, "text": msg.message_text}
        for msg in reversed(recent_messages_db)  # Ensure chronological for prompt
    ]

    ai_response_text = await ai_negotiation_service.generate_ai_response(
        product=product,
        conversation_history=conversation_history_for_ai,
        buyer_message_text=buyer_message_text,
        locale=locale,
    )

    ai_message_db = add_message_to_conversation(
        db=db,
        conversation_id=conversation.id,
        sender_id="VALORA_AI_ASSISTANT",
        sender_type=models.MessageSenderType.AI_ASSISTANT,
        message_text=ai_response_text,
    )
    return ai_message_db


async def get_chat_history_with_greeting(  # Renamed for clarity
    db: Session,
    product_id: int,
    buyer_id: str,
    seller_id: str,
    locale: str,
) -> List[models.ChatMessage]:
    """
    Retrieves chat history. If conversation is new, it creates it with an AI greeting.
    """
    # This function ensures the conversation (and greeting) exists
    conversation = await get_or_create_conversation_with_greeting(
        db=db,
        product_id=product_id,
        buyer_id=buyer_id,
        seller_id=seller_id,
        locale=locale,
    )

    # Fetch all messages for the conversation, ordered
    # The relationship in Conversation model already orders by timestamp
    # For explicit ordering here:
    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.conversation_id == conversation.id)
        .order_by(models.ChatMessage.timestamp.asc())
        .all()
    )
    return messages
