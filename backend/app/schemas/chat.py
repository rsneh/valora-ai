from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.db.models import (
    MessageSenderType,
    ConversationStatus,
    MessageType,
)


class ChatMessageBase(BaseModel):
    message_text: str


class ChatMessageCreate(ChatMessageBase):
    product_id: int  # Buyer initiates chat related to a product


class ChatMessage(ChatMessageBase):
    id: int
    conversation_id: int
    sender_id: str  # Firebase UID or "VALORA_AI"
    sender_type: MessageSenderType
    message_type: Optional[MessageType] = None
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


class SellerContactInfo(BaseModel):
    # Define what contact info you might share. Start with email from Firebase user.
    phone: Optional[str] = None  # If you store this and seller allows sharing
    name: Optional[str] = None  # Seller's display name or first name


class ChatMessageWithDealInfo(ChatMessage):  # Extends existing ChatMessage
    deal_closed: bool = False
    agreed_price: Optional[float] = None
    seller_contact_info: Optional[SellerContactInfo] = None
