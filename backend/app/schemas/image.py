from pydantic import BaseModel
from typing import Any, Dict, Optional
from app.db.models import ProductConditionEnum


class ImageUploadResponse(BaseModel):
    image_key: str
    image_url: str
    suggested_title: str
    suggested_category_id: Optional[int] = None
    suggested_attributes: Optional[Dict[str, Any]] = None
    suggested_description: Optional[str] = None
    suggested_condition: Optional[ProductConditionEnum] = None


class ImageDeleteResponse(BaseModel):
    message: str
    image_key: str
