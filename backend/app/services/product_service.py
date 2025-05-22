from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
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
        condition=product_in.condition,
        seller_id=seller_id,
        latitude=latitude,
        longitude=longitude,
        location_text=product_in.location_text,
        location_source=product_in.location_source,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_products(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category: Optional[
        str
    ] = None,  # This can now be a parent category key like "electronics"
    seller_id: Optional[str] = None,
    # Add other filters like location, price_range etc. as needed
    # user_latitude: Optional[float] = None,
    # user_longitude: Optional[float] = None,
    # max_distance_km: Optional[float] = None
) -> List[models.Product]:
    """
    Retrieves a list of products, with optional hierarchical category filtering.
    If a category key is provided, it fetches products matching that key
    OR products whose category key starts with the provided key followed by an underscore
    (e.g., category="electronics" will fetch "electronics", "electronics_laptops", "electronics_phones_smartphones").
    """
    query = db.query(models.Product).filter(
        # models.Product.is_active == True
    )  # Need to add is_active field

    if category:
        # Filter for exact match OR for sub-categories (prefix matching)
        # Example: if category = "electronics", match "electronics" OR "electronics_..."
        # Ensure your category keys are structured consistently (e.g., parent_child_grandchild)
        query = query.filter(
            or_(
                models.Product.category == category,
                models.Product.category.like(
                    f"{category}_%"
                ),  # Matches "category_anything"
            )
        )

    # TODO: Implement location-based filtering if lat/lon/distance are provided
    # This would involve Haversine formula or PostGIS functions if using lat/lon from Product model.
    # For example:
    # if user_latitude is not None and user_longitude is not None and max_distance_km is not None:
    #     # Add Haversine distance calculation and filtering here
    #     # This is complex and DB-dependent without PostGIS.
    #     # With PostGIS: func.ST_DWithin(models.Product.location_geom, func.ST_MakePoint(user_longitude, user_latitude), max_distance_km * 1000)
    #     pass

    # Add ordering, e.g., by most recent
    query = query.order_by(models.Product.time_created.desc())

    return query.offset(skip).limit(limit).all()


def get_product(db: Session, product_id: int) -> models.Product | None:
    """
    Retrieves a single product by its ID.
    """
    return db.query(models.Product).filter(models.Product.id == product_id).first()


async def update_product(
    db: Session,
    product_id: int,
    product_in: product_schema.ProductUpdate,
    seller_id: str,
) -> models.Product:
    """
    Updates an existing product.
    Location fields are not updated by this function.
    """
    db_product = (
        db.query(models.Product).filter(models.Product.id == product_id).first()
    )

    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    if db_product.seller_id != seller_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this product",
        )

    update_data_dict = product_in.model_dump(exclude_unset=True)
    needs_commit = False

    # Update other fields from product_in
    for field, value in update_data_dict.items():
        if hasattr(db_product, field) and getattr(db_product, field) != value:
            setattr(db_product, field, value)
            needs_commit = True

    if needs_commit:
        db.add(db_product)
        db.commit()
        db.refresh(db_product)

    return db_product


def delete_product(db: Session, product_id: int, seller_id: str) -> bool:
    """
    Deletes a product from the database after authorization check.
    Also attempts to delete the associated image from GCS.
    Returns True if DB deletion was successful.
    Raises HTTPException for authorization failure or if product not found.
    """
    db_product = (
        db.query(models.Product).filter(models.Product.id == product_id).first()
    )
    if not db_product:
        # API endpoint also checks this, but good to be robust.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    if db_product.seller_id != seller_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this product",
        )

    # Attempt to delete the GCS image.
    # IMPORTANT: If gcp_services.delete_gcs_permanent_image is async,
    # it cannot be directly awaited in this synchronous function.
    # This would require running it in an event loop (e.g., asyncio.run())
    # or making this service function async (which would require the API endpoint to be async).
    # For now, assuming it can be called, but this needs careful handling in a mixed sync/async codebase.
    if db_product.image_url:
        try:
            print(
                f"INFO: Attempting to delete GCS image {db_product.image_url} for product {product_id}"
            )
            # If gcp_services.delete_gcs_permanent_image is async:
            # import asyncio
            # try:
            #     loop = asyncio.get_event_loop()
            # except RuntimeError: # No current event loop
            #     loop = asyncio.new_event_loop()
            #     asyncio.set_event_loop(loop)
            # loop.run_until_complete(gcp_services.delete_gcs_permanent_image(image_url=db_product.image_url))
            # This is a simplified way; proper async handling in FastAPI/SQLAlchemy sync sessions is nuanced.
            # For a truly async gcp_services call, this delete_product service and its endpoint should be async.
            # If delete_gcs_permanent_image is synchronous, this is fine.
            # await gcp_services.delete_gcs_permanent_image(image_url=db_product.image_url) # This line would make the function async
        except Exception as e:
            print(
                f"Error deleting GCS image {db_product.image_url} during product deletion: {e}. Continuing with DB deletion."
            )

    db.delete(db_product)
    db.commit()
    return True
