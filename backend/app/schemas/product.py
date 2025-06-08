# backend/app/schemas/product.py
from pydantic import BaseModel, HttpUrl
from typing import Any, Dict, Optional
from datetime import datetime
from app.db.models import ProductConditionEnum, ProductStatusEnum
from app.schemas.category import Category
from app.schemas.product_image import ProductImage


# Properties to receive on item creation
class ProductCreate(BaseModel):
    title: str
    description: str = None
    category_id: int = None
    attributes: Optional[Dict[str, Any]] = None
    condition: Optional[ProductConditionEnum] = None
    price: float
    currency: str
    image_url: HttpUrl = None
    image_key: str
    min_acceptable_price: Optional[float] = None


# Properties to receive on item update
class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[int] = None
    status: ProductStatusEnum = ProductStatusEnum.DRAFT
    currency: Optional[str] = None
    condition: Optional[ProductConditionEnum] = None
    seller_name: Optional[str] = None
    seller_phone: Optional[str] = None
    seller_allowed_to_contact: bool = False
    min_acceptable_price: Optional[float] = None
    location_text: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_source: Optional[str] = None
    negotiation_notes_for_ai: Optional[str] = None


class ProductInDBBase(BaseModel):
    id: int
    title: str
    category_id: int
    description: Optional[str] = None
    price: float
    currency: str
    condition: Optional[ProductConditionEnum] = None
    status: ProductStatusEnum = ProductStatusEnum.DRAFT
    image_url: Optional[str] = None
    seller_id: str
    seller_name: Optional[str] = None
    seller_phone: Optional[str] = None
    seller_allowed_to_contact: bool = False
    time_created: datetime
    time_updated: Optional[datetime] = None
    location_text: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_source: Optional[str] = None
    min_acceptable_price: Optional[float] = None
    negotiation_notes_for_ai: Optional[str] = None
    attributes: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# Properties to return to client
class Product(BaseModel):
    id: int
    title: str
    category_id: int
    description: Optional[str] = None
    price: float
    currency: str
    condition: Optional[ProductConditionEnum] = None
    status: ProductStatusEnum = ProductStatusEnum.DRAFT
    image_url: Optional[str] = None
    location_text: Optional[str] = None
    time_created: datetime
    time_updated: Optional[datetime] = None
    attributes: Optional[Dict[str, Any]] = None
    distance_km: Optional[float] = None  # Distance in kilometers from user's location
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Relationships
    category: Optional[Category] = None
    images: Optional[list[ProductImage]] = None

    class Config:
        from_attributes = True


class ProductForEdit(BaseModel):
    id: int
    title: str
    category_id: int
    description: Optional[str] = None
    price: float
    currency: str
    condition: Optional[ProductConditionEnum] = None
    status: ProductStatusEnum = ProductStatusEnum.DRAFT
    image_url: Optional[str] = None
    location_text: Optional[str] = None
    seller_name: Optional[str] = None
    seller_phone: Optional[str] = None
    seller_allowed_to_contact: Optional[bool] = False
    min_acceptable_price: Optional[float] = None

    # Relationships
    category: Optional[Category] = None
    images: Optional[list[ProductImage]] = None

    class Config:
        from_attributes = True


# Properties stored in DB
class ProductInDB(ProductInDBBase):
    pass
