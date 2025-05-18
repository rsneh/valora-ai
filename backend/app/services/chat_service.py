from typing import List
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db import models
from app.services import ai_negotiation_service


def get_or_create_conversation(
    db: Session, product_id: int, buyer_id: str, seller_id: str
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
        conversation = models.Conversation(
            product_id=product_id,
            buyer_id=buyer_id,
            seller_id=seller_id,  # Set the seller_id from the product
            status=models.ConversationStatus.ACTIVE,
        )
        print(f"Creating new conversation: {conversation}")
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    return conversation


def add_message_to_conversation(
    db: Session,
    conversation_id: int,
    sender_id: str,
    sender_type: models.MessageSenderType,
    message_text: str,
) -> models.ChatMessage:
    """
    Adds a message to a conversation and updates the conversation's last_message_at.
    """
    db_message = models.ChatMessage(
        conversation_id=conversation_id,
        sender_id=sender_id,
        sender_type=sender_type,
        message_text=message_text,
    )
    db.add(db_message)

    # Update conversation's last_message_at
    conversation = (
        db.query(models.Conversation)
        .filter(models.Conversation.id == conversation_id)
        .first()
    )
    if conversation:
        conversation.last_message_at = (
            func.now()
        )  # Use func.now() for database's current time
        db.add(conversation)

    db.commit()
    db.refresh(db_message)
    return db_message


async def process_buyer_message_and_get_ai_response(
    db: Session, product_id: int, buyer_id: str, buyer_message_text: str
) -> models.ChatMessage:
    """
    Processes a buyer's message, gets an AI response, and saves both.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise ValueError("Product not found")  # Or a specific HTTPException

    conversation = get_or_create_conversation(
        db=db, product_id=product_id, buyer_id=buyer_id, seller_id=product.seller_id
    )

    # Save buyer's message
    add_message_to_conversation(
        db=db,
        conversation_id=conversation.id,
        sender_id=buyer_id,
        sender_type=models.MessageSenderType.BUYER,
        message_text=buyer_message_text,
    )

    # Prepare conversation history for AI (last N messages)
    # Querying messages again to ensure they are ordered and fresh
    recent_messages_db = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.conversation_id == conversation.id)
        .order_by(models.ChatMessage.timestamp.desc())
        .limit(10)
        .all()
    )

    # Reverse to get chronological order for the prompt
    conversation_history_for_ai = [
        {"sender_type": msg.sender_type.value, "text": msg.message_text}
        for msg in reversed(recent_messages_db)
    ]

    # Get AI response
    ai_response_text = await ai_negotiation_service.generate_ai_response(
        product=product,
        conversation_history=conversation_history_for_ai,  # Pass the formatted history
        buyer_message_text=buyer_message_text,
        # seller_negotiation_params can be built from product.min_acceptable_price etc.
    )

    # Save AI's message
    ai_message_db = add_message_to_conversation(
        db=db,
        conversation_id=conversation.id,
        sender_id="VALORA_AI_ASSISTANT",  # Special ID for the AI
        sender_type=models.MessageSenderType.AI_ASSISTANT,
        message_text=ai_response_text,
    )
    return ai_message_db


def get_chat_history(
    db: Session, product_id: int, buyer_id: str, seller_id: str
) -> List[models.ChatMessage]:
    """
    Retrieves chat history for a given product and buyer.
    """
    conversation = (
        db.query(models.Conversation)
        .filter(
            models.Conversation.product_id == product_id,
            models.Conversation.buyer_id == buyer_id,
            models.Conversation.seller_id == seller_id,
        )
        .first()
    )

    if not conversation:
        return []  # No conversation found, so no history

    # Messages are already ordered by timestamp in the relationship definition
    return conversation.messages
