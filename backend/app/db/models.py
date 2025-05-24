import enum
from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class ProductConditionEnum(str, enum.Enum):
    NEW = "NEW"
    LIKE_NEW = "LIKE_NEW"
    VERY_GOOD = "VERY_GOOD"
    GOOD = "GOOD"
    FAIR = "FAIR"


class ProductStatusEnum(str, enum.Enum):  # Changed SAEnum to enum.Enum
    DRAFT = "DRAFT"
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


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    category_id = Column(
        Integer,
        ForeignKey("categories.id", name="fk_products_category_id_categories"),
        nullable=False,
        index=True,
    )

    category = relationship("Category")

    status = Column(
        SAEnum(
            ProductStatusEnum,
            name="product_status_enum",
            create_type=False,
        ),
        default=ProductStatusEnum.DRAFT,
        nullable=False,
        index=True,
    )

    attributes = Column(JSONB, nullable=True)
    condition = Column(
        SAEnum(
            ProductConditionEnum,
            name="product_condition_enum",
            create_type=False,
        ),
        nullable=True,
    )

    price = Column(Float, nullable=False)
    currency = Column(
        String(3),
        nullable=False,
        default="USD",
    )  # e.g., ISO 4217 code, set a default

    image_url = Column(String, nullable=True)  # URL from GCS

    # Location example: "New York, NY"
    location_text = Column(String, index=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_source = Column(String, nullable=True)

    # Store Firebase User ID as the seller_id
    # Firebase UID is a string
    seller_id = Column(String, index=True, nullable=False)

    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())

    # If you had a User model in your DB managed by your app:
    # owner_id = Column(Integer, ForeignKey("users.id"))
    # owner = relationship("User", back_populates="products")

    min_acceptable_price = Column(Float, nullable=True)
    negotiation_notes_for_ai = Column(Text, nullable=True)

    # Relationships
    images = relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductImage.id",
    )

    conversations = relationship("Conversation", back_populates="product")


# Note: We are not creating a User model here because Firebase handles user
# authentication and user data. We will only store the Firebase UID (seller_id)
# in the Product model to associate products with their Firebase users.
# If you needed to store additional app-specific user profile information
# not suitable for Firebase's own user profile, you might create a User model here
# linked by the Firebase UID as a primary or foreign key.


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(
        Integer,
        ForeignKey("products.id", name="fk_product_images_product_id_products"),
        nullable=False,
        index=True,
    )
    image_url = Column(String, nullable=False)

    product = relationship("Product", back_populates="images")

    def __repr__(self):
        return f"<ProductImage(id={self.id}, product_id={self.product_id}, image_url='{self.image_url}')>"


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    buyer_id = Column(String, nullable=False, index=True)  # Firebase UID of the buyer
    seller_id = Column(
        String, nullable=False, index=True
    )  # Firebase UID of the actual seller (owner of the product)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_message_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        index=True,
    )

    status = Column(
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
    product = relationship(
        "Product"
    )  # No back_populates here if Product model doesn't define it explicitly for this
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

    id = Column(Integer, primary_key=True, index=True)

    conversation_id = Column(
        Integer, ForeignKey("conversations.id"), nullable=False, index=True
    )

    # Instead of sender_id and receiver_id, let's simplify for AI context:
    # sender_id will be the Firebase UID if BUYER, or a special string like "VALORA_AI"
    sender_id = Column(String, nullable=False, index=True)
    sender_type = Column(
        SAEnum(
            MessageSenderType,
            name="message_sender_type_enum",
            create_type=False,
        ),
        nullable=False,
        index=True,
    )
    message_text = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    # e.g., "text", "offer_proposed", "question_product_condition"
    message_type = Column(String, nullable=True)

    # Relationship
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.id}, conversation_id={self.conversation_id}, sender_type='{self.sender_type}')>"


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    category_key = Column(String, unique=True, index=True, nullable=False)
    image_path = Column(String, nullable=True)

    parent_category_key = Column(
        String, ForeignKey("categories.category_key"), nullable=True
    )  # Self-referencing for subcategories

    name_en = Column(String, nullable=False)
    name_he = Column(String, nullable=True)  # Or your other default languages

    description_ui_en = Column(
        String(100), nullable=True
    )  # Max 5 words is a UI constraint, DB can be a bit more
    description_ui_he = Column(String(100), nullable=True)
    description_for_ai = Column(Text, nullable=True)  # For the AI prompt

    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())

    parent = relationship(
        "Category", remote_side=[category_key], back_populates="children"
    )  # Check remote_side carefully
    children = relationship("Category", back_populates="parent")
