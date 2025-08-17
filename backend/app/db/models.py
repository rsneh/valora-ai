import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Boolean,
    Integer,
    String,
    DateTime,
    Float,
    ForeignKey,
    Text,
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship, mapped_column
from sqlalchemy.orm import DeclarativeBase, Mapped
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    pass


class ProductConditionEnum(str, enum.Enum):
    NEW = "NEW"
    LIKE_NEW = "LIKE_NEW"
    VERY_GOOD = "VERY_GOOD"
    GOOD = "GOOD"
    FAIR = "FAIR"


class ProductStatusEnum(str, enum.Enum):  # Changed SAEnum to enum.Enum
    DRAFT = "DRAFT"
    PENDING_SALE = "PENDING_SALE"
    ACTIVE = "ACTIVE"
    SOLD = "SOLD"
    ARCHIVED = "ARCHIVED"
    DELETED = "DELETED"


class ConversationStatus(str, enum.Enum):  # Changed SAEnum to enum.Enum
    ACTIVE = "ACTIVE"  # Changed to uppercase
    CLOSED_DEAL = "CLOSED_DEAL"  # Changed to uppercase
    CLOSED_NO_DEAL = "CLOSED_NO_DEAL"  # Changed to uppercase
    ARCHIVED = "ARCHIVED"  # Changed to uppercase


class MessageSenderType(str, enum.Enum):  # Changed SAEnum to enum.Enum
    BUYER = "BUYER"  # Changed to uppercase
    AI_ASSISTANT = "AI_ASSISTANT"  # Changed to uppercase
    SELLER = "SELLER"  # Changed to uppercase


class MessageType(str, enum.Enum):
    GREETING = "GREETING"
    GENERAL = "GENERAL"
    QUESTION = "QUESTION"
    OFFER_PROPOSED = "OFFER_PROPOSED"
    OFFER_ACCEPTED = "OFFER_ACCEPTED"
    OFFER_REJECTED = "OFFER_REJECTED"
    CONDITION_QUESTION = "CONDITION_QUESTION"
    LOCATION_QUESTION = "LOCATION_QUESTION"
    QUESTION_TO_SELLER = "QUESTION_TO_SELLER"
    CLOSED_DEAL = "CLOSED_DEAL"
    UNAVAILABLE_PRODUCT = "UNAVAILABLE_PRODUCT"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uid: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[Optional[str]]
    phone_number: Mapped[Optional[str]]
    allowed_to_contact: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    time_created: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    time_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now()
    )

    products = relationship(
        "Product",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    buyer_conversations = relationship(
        "Conversation",
        foreign_keys="[Conversation.buyer_id]",
        back_populates="buyer",
        cascade="all, delete-orphan",
    )
    seller_conversations = relationship(
        "Conversation",
        foreign_keys="[Conversation.seller_id]",
        back_populates="seller",
        cascade="all, delete-orphan",
    )


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, index=True, nullable=False)
    description: Mapped[Optional[str]]
    category_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("categories.id", name="fk_products_category_id_categories"),
        nullable=False,
        index=True,
    )

    category = relationship("Category")

    status: Mapped[ProductStatusEnum] = mapped_column(
        SAEnum(
            ProductStatusEnum,
            name="product_status_enum",
            create_type=False,
        ),
        default=ProductStatusEnum.DRAFT,
        nullable=False,
        index=True,
    )

    attributes: Mapped[dict] = mapped_column(JSONB, nullable=True)
    condition: Mapped[ProductConditionEnum] = mapped_column(
        SAEnum(
            ProductConditionEnum,
            name="product_condition_enum",
            create_type=False,
        ),
        nullable=True,
    )

    price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(
        String(3),
        nullable=False,
        default="USD",
    )  # e.g., ISO 4217 code, set a default

    image_url: Mapped[Optional[str]]

    # Location example: "New York, NY"
    location_text: Mapped[str] = mapped_column(String, index=True, nullable=False)
    latitude: Mapped[Optional[float]]
    longitude: Mapped[Optional[float]]
    location_source: Mapped[Optional[str]]

    # Store Firebase User ID as the seller_id
    # Firebase UID is a string
    owner_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    owner = relationship("User", back_populates="products")

    time_created: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    time_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now()
    )

    min_acceptable_price: Mapped[Optional[float]]
    negotiation_notes_for_ai: Mapped[Optional[str]]

    # Relationships
    images = relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductImage.id",
    )

    conversations = relationship("Conversation", back_populates="product")


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("products.id", name="fk_product_images_product_id_products"),
        nullable=False,
        index=True,
    )
    image_url: Mapped[str] = mapped_column(String, nullable=False)

    product = relationship("Product", back_populates="images")

    def __repr__(self):
        return f"<ProductImage(id={self.id}, product_id={self.product_id}, image_url='{self.image_url}')>"


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    product_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("products.id"), nullable=False, index=True
    )
    buyer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )
    seller_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    last_message_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        index=True,
    )

    status: Mapped[ConversationStatus] = mapped_column(
        SAEnum(
            ConversationStatus,
            name="conversation_status_enum",
            create_type=False,
        ),
        default=ConversationStatus.ACTIVE,
        nullable=False,
        index=True,
    )

    # Relationships
    product = relationship("Product", back_populates="conversations")
    buyer = relationship(
        "User", foreign_keys=[buyer_id], back_populates="buyer_conversations"
    )
    seller = relationship(
        "User", foreign_keys=[seller_id], back_populates="seller_conversations"
    )
    messages = relationship(
        "ChatMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="ChatMessage.timestamp",
    )

    def __repr__(self):
        return f"<Conversation(id={self.id}, product_id={self.product_id}, buyer_id='{self.buyer_id}')>"


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    conversation_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("conversations.id"), nullable=False, index=True
    )

    # sender_id will be the buyer id, or a special None when it's AI
    sender_id: Mapped[int] = mapped_column(Integer, nullable=True)
    sender_type: Mapped[MessageSenderType] = mapped_column(
        SAEnum(
            MessageSenderType,
            name="message_sender_type_enum",
            create_type=False,
        ),
        nullable=False,
        index=True,
    )
    message_text: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    message_type: Mapped[MessageType] = mapped_column(
        SAEnum(
            MessageType,
            name="message_type_enum",
            create_type=False,
        ),
        nullable=True,
        index=True,
    )

    # Relationship
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, conversation_id={self.conversation_id}, sender_type='{self.sender_type}')>"


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    category_key: Mapped[str] = mapped_column(
        String, unique=True, index=True, nullable=False
    )
    image_path: Mapped[Optional[str]]

    parent_category_key: Mapped[str] = mapped_column(
        String, ForeignKey("categories.category_key"), nullable=True
    )  # Self-referencing for subcategories

    name_en: Mapped[str] = mapped_column(String, nullable=False)
    name_he: Mapped[Optional[str]] = mapped_column(
        String, nullable=True
    )  # Or your other default languages

    description_ui_en: Mapped[Optional[str]]
    description_ui_he: Mapped[Optional[str]]
    description_for_ai: Mapped[Optional[str]]

    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    attribute_schema: Mapped[list[dict]] = mapped_column(
        JSONB, server_default="[]", nullable=True
    )

    time_created: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    time_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now()
    )

    parent = relationship(
        "Category", remote_side=[category_key], back_populates="children"
    )  # Check remote_side carefully
    children = relationship("Category", back_populates="parent")
