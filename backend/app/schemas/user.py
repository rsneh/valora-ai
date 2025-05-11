# backend/app/schemas/user.py
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    uid: str  # Firebase UID


class User(UserBase):
    # You could add other fields if you were storing more user info in your DB
    pass
