import firebase_admin
from typing import Optional
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette import status

from app.core.config import settings
from app.schemas.user import User, UserProfile
from app.db.database import get_db
from app.services import user_service
from sqlalchemy.orm import Session

try:
    if not firebase_admin._apps:
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(
            cred,
            {
                "projectId": settings.FIREBASE_PROJECT_ID,
            },
        )
        print("Firebase Admin SDK initialized successfully.")
    else:
        print("Firebase Admin SDK already initialized.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    # Depending on your app's needs, you might want to raise the exception
    # or handle it to allow the app to start for unauthenticated routes.
    # For this PoC, we'll print the error and continue, but auth will fail.

reusable_oauth2 = HTTPBearer(scheme_name="Firebase Token")
optional_bearer_scheme = HTTPBearer(scheme_name="Firebase Token", auto_error=False)


async def get_current_user(
    token: HTTPAuthorizationCredentials = Security(reusable_oauth2),
    db: Session = Depends(get_db),
) -> UserProfile:
    """
    Dependency to verify Firebase ID token and get user details.
    """
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        id_token = token.credentials
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        if not uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token: UID missing",
            )

        user = user_service.get_or_create_user(db, firebase_uid=uid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if email:
            user.email = email

        return user
    except auth.ExpiredIdTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Firebase ID token has expired: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.InvalidIdTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase ID token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:  # Catch any other Firebase Admin SDK errors
        # Log the error for debugging
        print(f"An unexpected error occurred during token verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_optional_current_user(
    cred: Optional[HTTPAuthorizationCredentials] = Depends(optional_bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    An "optional" dependency that attempts to validate a Firebase ID token.
    Returns the decoded token if valid, otherwise returns None.
    Does NOT raise an exception for invalid or missing tokens.
    """
    if cred is None:
        # No token was provided
        return None

    try:
        decoded_token = auth.verify_id_token(cred.credentials)
        uid = decoded_token.get("uid")
        if not uid:
            return None

        user = user_service.get_user_by_firebase_uid(db, firebase_uid=uid)
        if not user or user.is_active is not True:
            return None

    except Exception:
        # Any error in token validation means the user is not authenticated.
        return None

    return user
