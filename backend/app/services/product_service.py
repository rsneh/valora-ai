# backend/app/services/product_service.py
from typing import List
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, status

from app.db import models
from app.schemas import product as product_schema
from . import gcp_services  # Import your GCP service functions


async def create_product_with_ai_assistance(
    db: Session,
    product_in: product_schema.ProductCreate,  # Contains title, price
    image_file: UploadFile,
    seller_id: str,  # Firebase UID from the authenticated user
) -> models.Product:
    """
    Creates a product listing with AI-generated description and category.
    """
    # 1. Upload image to GCS
    image_url = await gcp_services.upload_image_to_gcs(
        file=image_file, filename=image_file.filename
    )
    if not image_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not upload image.",
        )

    # 2. Analyze image with Vision AI (using the public GCS URL or a GCS URI if preferred)
    # For Vision AI, using the public URL is fine. If it were a GCS URI, it would be like:
    # gcs_image_uri = f"gs://{gcp_services.settings.GCS_BUCKET_NAME}/{image_url.split('/')[-1]}" # Construct GCS URI
    labels, objects = await gcp_services.analyze_image_with_vision_ai(image_url)

    image_features = list(set(labels + objects))  # Combine and unique features

    # 3. Get AI-generated description
    ai_description = await gcp_services.get_ai_description(
        title=product_in.title, image_features=image_features
    )
    if not ai_description:  # Fallback if AI fails
        ai_description = f"A quality used {product_in.title}."

    # 4. Get AI-suggested category
    ai_category = await gcp_services.get_ai_category(
        title=product_in.title,
        image_features=image_features,
        predefined_categories=gcp_services.POC_CATEGORIES,
    )

    # 5. Create Product DB entry
    db_product = models.Product(
        title=product_in.title,
        price=product_in.price,
        description=ai_description,
        category=ai_category,
        image_url=image_url,
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
