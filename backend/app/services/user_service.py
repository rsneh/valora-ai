from sqlalchemy.orm import Session
from app.db import models
from app.schemas import user as user_schema


def get_user_by_firebase_uid(db: Session, firebase_uid: str):
    return db.query(models.User).filter(models.User.uid == firebase_uid).first()


def create_user(db: Session, user: user_schema.UserCreate):
    db_user = models.User(
        uid=user.uid,
        full_name=user.full_name,
        phone_number=user.phone_number,
        allowed_to_contact=user.allowed_to_contact,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user: models.User, user_update: user_schema.UserUpdate):
    for key, value in user_update.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


def get_or_create_user(db: Session, firebase_uid: str):
    user = get_user_by_firebase_uid(db, firebase_uid)
    if not user:
        user_in = user_schema.UserCreate(uid=firebase_uid)
        user = create_user(db, user_in)
    return user
