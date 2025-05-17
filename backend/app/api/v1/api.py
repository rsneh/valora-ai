from fastapi import APIRouter
from .endpoints import products, images, location

router = APIRouter()

router.include_router(products.router, prefix="/products", tags=["Products"])
router.include_router(images.router, prefix="/images", tags=["Images"])
router.include_router(location.router, prefix="/location", tags=["Images"])
