from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class UserBase(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    allowed_to_contact: bool = False


class UserCreate(UserBase):
    uid: str


class UserUpdate(UserBase):
    pass


class UserProfile(UserBase):
    id: int
    uid: str
    email: Optional[str] = None


class User(UserBase):
    id: int
    uid: str
    email: Optional[str] = None
    is_active: bool
    time_created: datetime
    time_updated: Optional[datetime] = None

    class Config:
        from_attributes = True
