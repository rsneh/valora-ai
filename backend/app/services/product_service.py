import math
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.db import models
from app.schemas import product as product_schema
from . import gcp_services, location_service, category_service


def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance in kilometers between two points
    on the Earth's surface specified by latitude/longitude using the Haversine formula.

    Args:
        lat1, lon1: Latitude and longitude of point 1 (in decimal degrees)
        lat2, lon2: Latitude and longitude of point 2 (in decimal degrees)

    Returns:
        Distance in kilometers between the two points
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))
    # Radius of earth in kilometers
    r = 6371
    return c * r


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

    # 2. Create Product DB entry
    db_product = models.Product(
        title=product_in.title,
        price=product_in.price,
        description=product_in.description,
        category_id=product_in.category_id,
        image_url=permanent_image_url,
        condition=product_in.condition,
        seller_id=seller_id,
        min_acceptable_price=product_in.min_acceptable_price,
        attributes=product_in.attributes,
        currency=product_in.currency,
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
    # Add other filters like location, price_range etc. as needed
    user_latitude: Optional[float] = None,
    user_longitude: Optional[float] = None,
    sort_by_distance: bool = False,
    status: Optional[str] = models.ProductStatusEnum.ACTIVE,
) -> List[models.Product]:
    """
    Retrieves a list of products, with optional hierarchical category filtering.
    If a category key is provided, it fetches products matching that key
    OR products whose category key starts with the provided key followed by an underscore
    (e.g., category="electronics" will fetch "electronics", "electronics_laptops", "electronics_phones_smartphones").
    """
    query = db.query(models.Product)

    if status and status != "ALL":
        query = query.filter(models.Product.status == status)

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

    if sort_by_distance and user_latitude is not None and user_longitude is not None:
        # Ensure products have latitude and longitude for distance sorting
        query = query.filter(
            models.Product.latitude.isnot(None), models.Product.longitude.isnot(None)
        )

        # Example using Haversine-like components for ordering (simplified for non-PostGIS)
        # This is a rough approximation for ordering and not true distance.
        # For accurate distance and filtering, a proper Haversine or PostGIS is needed.
        # This simplified version orders by a proxy of distance.
        # NOTE: For accurate distance sorting, especially with filtering by radius,
        # using PostGIS ST_Distance is highly recommended for performance and accuracy.
        # The expression below is a simplified way to get a sortable value roughly proportional to distance.
        # It's not a true distance calculation.
        delta_lat = models.Product.latitude - user_latitude
        delta_lon = models.Product.longitude - user_longitude
        # Order by squared Euclidean distance (cheaper than sqrt for sorting)
        # This is NOT Haversine, but a simpler proxy for sorting.
        distance_proxy = (delta_lat * delta_lat) + (
            delta_lon
            * delta_lon
            * func.cos(func.radians(user_latitude))
            * func.cos(func.radians(user_latitude))
        )
        query = query.order_by(distance_proxy.asc())
    else:
        # Default sorting if not by distance
        query = query.order_by(models.Product.time_created.desc())

    #
    # Fetch products from the database
    products = query.offset(skip).limit(limit).all()

    # Calculate and add the distance to each product if user location is provided
    if user_latitude is not None and user_longitude is not None:
        for product in products:
            if product.latitude is not None and product.longitude is not None:
                # Calculate the precise distance using Haversine formula
                distance = calculate_haversine_distance(
                    user_latitude, user_longitude, product.latitude, product.longitude
                )
                # Add the distance as a dynamic attribute to the product
                setattr(product, "distance_km", round(distance, 2))
            else:
                # Set distance to None if product doesn't have coordinates
                setattr(product, "distance_km", None)

    return products


def get_product(
    db: Session,
    product_id: int,
    status: Optional[str] = None,
    seller_id: Optional[str] = None,
) -> models.Product | None:
    """
    Retrieves a single product by its ID.
    """
    query = db.query(models.Product)
    if seller_id:
        query = query.filter(models.Product.seller_id == seller_id)
    elif status:
        query = query.filter(models.Product.status == status)

    return query.filter(models.Product.id == product_id).first()


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

    latitude = product_in.latitude
    longitude = product_in.longitude
    if latitude is None or longitude is None:
        latitude, longitude = await location_service.geocode_address(
            product_in.location_text
        )
        product_in.latitude = latitude
        product_in.longitude = longitude

    if product_in.status is None:
        product_in.status = models.ProductStatusEnum.ACTIVE

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


async def delete_product(db: Session, product_id: int, seller_id: str) -> bool:
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
            image_url = db_product.image_url
            image_key = gcp_services.get_gcs_image_key(image_url)
            if not image_key:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid image URL format",
                )
            print(f"INFO: Deleting GCS image with key {image_key}")
            await gcp_services.delete_gcs_image(
                image_key=image_key, current_user_id=seller_id
            )
        except Exception as e:
            print(
                f"Error deleting GCS image {db_product.image_url} during product deletion: {e}. Continuing with DB deletion."
            )
    # Check for associated images and delete them
    associated_images = (
        db.query(models.ProductImage)
        .filter(models.ProductImage.product_id == product_id)
        .all()
    )
    for image in associated_images:
        try:
            print(
                f"INFO: Attempting to delete GCS image {image.image_url} for product image {image.id}"
            )
            await gcp_services.delete_gcs_image(
                image_key=image.image_url, current_user_id=seller_id
            )
        except Exception as e:
            print(
                f"Error deleting GCS image {image.image_url} during product image deletion: {e}. Continuing with DB deletion."
            )

    # Now delete the product from the database
    print(f"INFO: Deleting product {product_id} from database.")
    # Delete associated conversations if needed

    db.query(models.Conversation).where(
        models.Conversation.product_id == product_id
    ).delete(synchronize_session=False)

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
