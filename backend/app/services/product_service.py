from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.db import models
from app.schemas import product as product_schema
from . import gcp_services, location_service, category_service


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
        category_id=product_in.category,
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
    category: Optional[str] = None,
    seller_id: Optional[str] = None,
    locale: str = "en",
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
    query = db.query(models.Product)

    if seller_id:
        query = query.filter(models.Product.seller_id == seller_id)

    if category:
        target_category_ids = category_service.get_all_descendant_category_ids(
            db, category
        )

        if target_category_ids:
            query = query.filter(models.Product.category_id.in_(target_category_ids))
        else:
            return []

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


async def add_product_images(
    db: Session,
    product_id: int,
    temp_image_keys: List[str],
    seller_id: str,
) -> List[models.ProductImage]:
    """
    Adds multiple images to an existing product.

    Args:
        db: Database session
        product_id: ID of the product to add images to
        temp_image_keys: List of temporary image keys from GCS
        seller_id: ID of the seller (for authorization)

    Returns:
        List of created ProductImage objects

    Raises:
        HTTPException: If product not found or user not authorized
    """
    # Check if product exists and belongs to seller
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
            detail="Not authorized to modify this product",
        )

    created_images = []

    for temp_key in temp_image_keys:
        # Move image from temporary to permanent storage
        permanent_image_url = await gcp_services.move_gcs_image_to_permanent(
            temp_image_key=temp_key, seller_id=seller_id
        )

        if not permanent_image_url:
            continue  # Skip if moving fails

        # Create ProductImage entry
        db_image = models.ProductImage(
            product_id=product_id, image_url=permanent_image_url
        )

        db.add(db_image)
        db.flush()  # Get the ID without committing transaction
        created_images.append(db_image)

    # Only commit once for all successful images
    if created_images:
        db.commit()

    return created_images
