# backend/app/schemas/token.py
from pydantic import BaseModel
from typing import Optional


class TokenData(BaseModel):
    uid: Optional[str] = None  # Firebase User ID
