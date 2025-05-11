# Product related endpoints will go here# backend/app/api/v1/endpoints/products.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.db import database, models
from app.schemas import product as product_schema
from app.schemas import user as user_schema
from app.services import product_service
from app.security.firebase_auth import get_current_active_user

router = APIRouter()


@router.post(
    "/", response_model=product_schema.Product, status_code=status.HTTP_201_CREATED
)
async def create_product(
    *,
    db: Session = Depends(database.get_db),
    title: str = Form(...),
    price: float = Form(...),
    image: UploadFile = File(...),
    current_user: user_schema.User = Depends(
        get_current_active_user
    ),  # Protected route
):
    """
    Create new product with AI-assisted description and categorization.
    - **title**: Title of the product.
    - **price**: Price of the product.
    - **image**: Image file of the product.
    """
    product_in = product_schema.ProductCreate(title=title, price=price)
    try:
        created_product = await product_service.create_product_with_ai_assistance(
            db=db, product_in=product_in, image_file=image, seller_id=current_user.uid
        )
        return created_product
    except HTTPException as e:  # Re-raise HTTPExceptions from services
        raise e
    except Exception as e:
        # Log the exception e
        print(f"Unexpected error creating product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the product.",
        )


@router.get("/", response_model=List[product_schema.Product])
def read_products(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve all products.
    """
    products = product_service.get_products(db, skip=skip, limit=limit)
    return products


@router.get("/{product_id}", response_model=product_schema.Product)
def read_product(
    product_id: int,
    db: Session = Depends(database.get_db),
):
    """
    Retrieve a specific product by its ID.
    """
    db_product = product_service.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    return db_product


# You can add PUT (update) and DELETE endpoints later if needed for the PoC
# For PUT, you'd also need to handle image updates (optional: delete old, upload new)
# and potentially re-run AI assistance if key fields change.
