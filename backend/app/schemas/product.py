# backend/app/schemas/product.py
from pydantic import BaseModel, HttpUrl
from typing import Any, Dict, Optional
from datetime import datetime
from app.db.models import ProductConditionEnum


# Properties to receive on item creation
class ProductCreate(BaseModel):
    slug: str
    description: str = None
    category: str = None
    attributes: Optional[Dict[str, Any]] = None
    condition: Optional[ProductConditionEnum] = None
    price: float
    currency: str
    image_url: HttpUrl = None
    image_key: str
    location_text: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_source: Optional[str] = None
    min_acceptable_price: Optional[float] = None
    negotiation_notes_for_ai: Optional[str] = None


# Properties to receive on item update
class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None


class ProductInDBBase(BaseModel):
    id: int
    slug: str
    description: Optional[str] = None
    price: float
    currency: str
    category: str
    condition: Optional[ProductConditionEnum] = None
    image_url: Optional[str] = None
    seller_id: str
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
class Product(ProductInDBBase):
    pass


# Properties stored in DB
class ProductInDB(ProductInDBBase):
    pass
