from fastapi import APIRouter
from .endpoints import products, images  # Import the new images router

router = APIRouter()

router.include_router(products.router, prefix="/products", tags=["Products"])
router.include_router(images.router, prefix="/images", tags=["Images"])
