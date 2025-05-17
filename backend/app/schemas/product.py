# backend/app/schemas/product.py
from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


# Properties to receive on item creation
class ProductCreate(BaseModel):
    title: str
    price: float
    description: str = None
    category: str = None
    image_url: HttpUrl = None
    image_key: str
    location_text: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_source: Optional[str] = None


# Properties to receive on item update
class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[HttpUrl] = None


class ProductInDBBase(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None  # Changed to str to accommodate GCS URLs directly
    seller_id: str
    time_created: datetime
    time_updated: Optional[datetime] = None
    location_text: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_source: Optional[str] = None

    class Config:
        from_attributes = True


# Properties to return to client
class Product(ProductInDBBase):
    pass


# Properties stored in DB
class ProductInDB(ProductInDBBase):
    pass
