from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from firebase_admin import exceptions

from app.api.v1 import api as api_v1  # Import the v1 API router

# from app.core.config import settings

# Ensure Firebase Admin is initialized (idempotent check is in firebase_auth.py)
from app.security import firebase_auth  # This import will trigger the initialization

app = FastAPI(
    title="AidSell API", openapi_url=f"/api/v1/openapi.json"  # Or adjust path as needed
)

origins = [
    "http://localhost:3000",  # Local development
    "https://aidsell-webapp.onrender.com",  # Production URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Global Exception Handlers (Optional but good for consistent error responses) ---
@app.exception_handler(exceptions.FirebaseError)
async def firebase_exception_handler(request: Request, exc: exceptions.FirebaseError):
    # This can catch various Firebase Admin SDK errors not caught by get_current_user
    return JSONResponse(
        status_code=500,  # Or a more specific code if identifiable
        content={"detail": f"An internal Firebase error occurred: {str(exc)}"},
    )


# --- Mount API Routers ---
app.include_router(api_v1.router, prefix="/api/v1")


# --- Root Endpoint ---
@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to AidSell API!"}


# --- Health Check Endpoint ---
@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}


# --- Example of a protected route using the dependency ---
# from app.schemas.user import User
# from app.security.firebase_auth import get_current_active_user
# @app.get("/users/me", response_model=User, tags=["Users"])
# async def read_users_me(current_user: User = Depends(get_current_active_user)):
#     return current_user

# If you are running with uvicorn directly (not through Docker typically for main execution)
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
