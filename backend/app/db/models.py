# backend/app/db/models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func  # For server-side default timestamp
from .database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)  # AI generated, user can edit
    price = Column(Float, nullable=False)
    category = Column(String, index=True, nullable=True)  # AI suggested
    image_url = Column(String, nullable=True)  # URL from GCS

    # Store Firebase User ID as the seller_id
    # Firebase UID is a string
    seller_id = Column(String, index=True, nullable=False)

    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())

    # If you had a User model in your DB managed by your app:
    # owner_id = Column(Integer, ForeignKey("users.id"))
    # owner = relationship("User", back_populates="products")


# Note: We are not creating a User model here because Firebase handles user
# authentication and user data. We will only store the Firebase UID (seller_id)
# in the Product model to associate products with their Firebase users.
# If you needed to store additional app-specific user profile information
# not suitable for Firebase's own user profile, you might create a User model here
# linked by the Firebase UID as a primary or foreign key.
