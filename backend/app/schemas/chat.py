from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.db.models import MessageSenderType, ConversationStatus  # Import your enums


class ChatMessageBase(BaseModel):
    message_text: str


class ChatMessageCreate(ChatMessageBase):
    product_id: int  # Buyer initiates chat related to a product


class ChatMessage(ChatMessageBase):
    id: int
    conversation_id: int
    sender_id: str  # Firebase UID or "VALORA_AI"
    sender_type: MessageSenderType
    timestamp: datetime

    class Config:
        from_attributes = True  # For Pydantic V2, replaces orm_mode


class ConversationBase(BaseModel):
    product_id: int
    buyer_id: str
    seller_id: str


class Conversation(ConversationBase):
    id: int
    created_at: datetime
    last_message_at: datetime
    status: ConversationStatus
    messages: List[ChatMessage] = []  # Include messages when returning a conversation

    class Config:
        from_attributes = True
