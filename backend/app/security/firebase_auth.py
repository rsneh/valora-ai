import firebase_admin
from typing import Optional
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette import status

from app.core.config import settings
from app.schemas.user import User

# Determine credentials path
# For local non-Docker execution, you might use LOCAL_GCP_CREDENTIALS_PATH
# For Docker, GOOGLE_APPLICATION_CREDENTIALS is set in docker-compose.yml
# Firebase Admin SDK can also auto-discover credentials if GOOGLE_APPLICATION_CREDENTIALS env var is set.
# However, explicitly initializing with the project ID is good practice.

# Initialize Firebase Admin SDK
# This should only run once.
try:
    # Check if the app is already initialized to prevent re-initialization error
    if not firebase_admin._apps:
        # If GOOGLE_APPLICATION_CREDENTIALS is set in the environment (e.g., by Docker Compose)
        # and points to a valid service account key with necessary permissions,
        # Firebase Admin SDK can use it.
        # You can also explicitly pass the credential path:
        # cred_path = settings.GOOGLE_APPLICATION_CREDENTIALS
        # cred = credentials.Certificate(cred_path)
        # firebase_admin.initialize_app(cred, {'projectId': settings.FIREBASE_PROJECT_ID})

        # Simpler initialization if GOOGLE_APPLICATION_CREDENTIALS env var is correctly set
        # and the service account has "Firebase Admin SDK Administrator Service Agent"
        # or equivalent permissions for user token verification.
        # The service account used for GCP services (Vision, Vertex) might need different permissions
        # than one purely for Firebase Admin tasks. For PoC, using the same one is fine if it has broad enough permissions.
        # Often, just setting GOOGLE_APPLICATION_CREDENTIALS is enough.
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
) -> User:
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
        # You can fetch more user details from Firebase if needed:
        # firebase_user = auth.get_user(uid)
        return User(uid=uid, email=email)
    except auth.InvalidIdTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase ID token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Firebase ID token has expired: {e}",
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
    # If you had a concept of "active" vs "inactive" users in your own DB,
    # you would check that here. For Firebase-only users, this is usually just a pass-through.
    # if not current_user.is_active: # Example if you had an is_active flag
    #     raise HTTPException(status_code=400, detail="Inactive user")
    # Also this is another reasonable response
    # raise HTTPException(
    #     status_code=status.HTTP_401_UNAUTHORIZED,
    #     detail="Bearer token missing",
    #     headers={"WWW-Authenticate": "Bearer"},
    # )
    return current_user


def get_optional_current_user(
    cred: Optional[HTTPAuthorizationCredentials] = Depends(optional_bearer_scheme),
) -> Optional[dict]:
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

        # Check if the user is active
        user = auth.get_user(decoded_token["uid"])
        if user.disabled:
            return None  # Treat disabled user as not logged in

    except Exception:
        # Any error in token validation means the user is not authenticated.
        return None

    return decoded_token
