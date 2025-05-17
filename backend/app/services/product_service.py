from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.db import models
from app.schemas import product as product_schema
from . import gcp_services, location_service


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

    latitude = product_in.latitude
    longitude = product_in.longitude
    if latitude is None or longitude is None:
        latitude, longitude = await location_service.geocode_address(
            location_text=product_in.location_text
        )

    # 2. Create Product DB entry
    db_product = models.Product(
        title=product_in.title,
        price=product_in.price,
        description=product_in.description,
        category=product_in.category,
        image_url=permanent_image_url,
        seller_id=seller_id,
        location_text=product_in.location_text,
        latitude=latitude,
        longitude=longitude,
        # location_source=location_source_info
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    location_text: str = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    max_distance: Optional[float] = None,
    category: Optional[str] = None,
) -> List[models.Product]:
    """
    Retrieves a list of products, with optional category filtering.
    """
    query = db.query(models.Product)

    if location_text:
        query = query.filter(models.Product.location_text == location_text)

    if lat is not None and lng is not None and max_distance is not None:
        # Assuming you have a function to filter by distance
        query = query.filter(
            models.Product.latitude.between(lat - max_distance, lat + max_distance),
            models.Product.longitude.between(lng - max_distance, lng + max_distance),
        )

    if category:
        query = query.filter(models.Product.category == category)

    # Add ordering, e.g., by most recent
    query = query.order_by(models.Product.time_created.desc())

    return query.offset(skip).limit(limit).all()


def get_product(db: Session, product_id: int) -> models.Product | None:
    """
    Retrieves a single product by its ID.
    """
    return db.query(models.Product).filter(models.Product.id == product_id).first()
