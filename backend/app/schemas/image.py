from pydantic import BaseModel
from typing import Optional


class ImageUploadResponse(BaseModel):
    image_key: str  # e.g., the GCS object name in the temp folder
    image_url: Optional[str] = None  # Public URL for preview
    suggested_description: Optional[str] = None
    suggested_category: Optional[str] = None


class ImageDeleteResponse(BaseModel):
    message: str
    image_key: str
