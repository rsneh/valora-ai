from pydantic import BaseModel, HttpUrl
from typing import List, Optional


class ProductImageCreate(BaseModel):
    image_key: str
    product_id: int


class ProductImageResponse(BaseModel):
    id: int
    product_id: int
    image_url: str

    class Config:
        from_attributes = True


class ProductImagesUploadRequest(BaseModel):
    product_id: int
    image_keys: List[str]


class ProductImagesUploadResponse(BaseModel):
    product_id: int
    images: List[ProductImageResponse]
    message: str


class ProductImage(ProductImageResponse):
    pass
