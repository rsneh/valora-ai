# backend/app/services/product_service.py
from typing import List
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, status
from app.db import models
from app.schemas import product as product_schema
from . import gcp_services


async def create_product(
    db: Session,
    product_in: product_schema.ProductCreate,  # Now contains title, price, image_key
    seller_id: str,
) -> models.Product:
    """
    Creates a product listing using a pre-uploaded image key.
    """
    # 1. Validate image_key and move image from temp to permanent GCS location
    # The temp_image_key is product_in.image_key
    permanent_image_url = await gcp_services.move_gcs_image_to_permanent(
        temp_image_key=product_in.image_key, seller_id=seller_id
    )
    if not permanent_image_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,  # Or 500 if it's an internal move error
            detail="Invalid image key or failed to process image.",
        )

    # # 2. Get AI-suggested description and category
    # ai_description, ai_category = gcp_services.get_ai_assistance(
    #     title=product_in.title, image_uri=permanent_image_url
    # )
    # if not ai_description:
    #     ai_description = f"A quality used {product_in.title}."

    # 2. Create Product DB entry
    db_product = models.Product(
        title=product_in.title,
        price=product_in.price,
        description=product_in.description,
        category=product_in.category,
        image_url=permanent_image_url,
        seller_id=seller_id,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[models.Product]:
    """
    Retrieves a list of products.
    """
    return db.query(models.Product).offset(skip).limit(limit).all()


def get_product(db: Session, product_id: int) -> models.Product | None:
    """
    Retrieves a single product by its ID.
    """
    return db.query(models.Product).filter(models.Product.id == product_id).first()
