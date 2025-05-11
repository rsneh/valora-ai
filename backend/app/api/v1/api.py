# backend/app/api/v1/api.py
from fastapi import APIRouter
from .endpoints import products

router = APIRouter()

# Include your endpoint routers here
router.include_router(products.router, prefix="/products", tags=["Products"])
# router.include_router(login.router, prefix="/auth", tags=["Authentication"]) # If you had one
