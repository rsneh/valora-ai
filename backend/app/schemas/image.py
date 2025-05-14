from pydantic import BaseModel
from typing import Optional


class ImageUploadResponse(BaseModel):
    image_key: str
    image_url: Optional[str] = None
    suggested_title: Optional[str] = None
    suggested_category: Optional[str] = None
    suggested_description: Optional[str] = None


class ImageDeleteResponse(BaseModel):
    message: str
    image_key: str
