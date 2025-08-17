from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas import user as user_schema
from app.services import user_service
from app.security.firebase_auth import get_current_active_user

router = APIRouter()


@router.post("/", response_model=user_schema.User)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    db_user = user_service.get_user_by_firebase_uid(db, firebase_uid=user.uid)
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")
    return user_service.create_user(db=db, user=user)


@router.put("/me", response_model=user_schema.UserProfile)
def update_user(
    user: user_schema.UserUpdate,
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user),
):
    db_user = user_service.get_user_by_firebase_uid(db, firebase_uid=current_user.uid)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user_service.update_user(db=db, user=db_user, user_update=user)


@router.get("/me", response_model=user_schema.UserProfile)
def read_user(
    db: Session = Depends(get_db),
    current_user: user_schema.User = Depends(get_current_active_user),
):
    db_user = user_service.get_user_by_firebase_uid(db, firebase_uid=current_user.uid)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
