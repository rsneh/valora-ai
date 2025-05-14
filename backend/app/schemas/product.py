# backend/app/schemas/product.py
from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


# Properties to receive on item creation
class ProductCreate(BaseModel):
    title: str
    price: float
    # Image will be handled as UploadFile in the endpoint, not directly in this schema for creation
    # description: Optional[str] = None # Will be AI generated
    # category: Optional[str] = None # Will be AI suggested


# Properties to receive on item update
class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[HttpUrl] = None  # In case image needs to be updated


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

    class Config:
        from_attributes = True


# Properties to return to client
class Product(ProductInDBBase):
    pass


# Properties stored in DB
class ProductInDB(ProductInDBBase):
    pass
