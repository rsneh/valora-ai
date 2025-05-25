from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db import database
from app.schemas import product as product_schema
from app.schemas import user as user_schema
from app.services import product_service, gcp_services
from app.security.firebase_auth import get_current_active_user

router = APIRouter()


@router.post(
    "/", response_model=product_schema.Product, status_code=status.HTTP_201_CREATED
)
async def create_product(
    *,  # Ensures following arguments are keyword-only
    db: Session = Depends(database.get_db),
    product_data: product_schema.ProductCreate,
    current_user: user_schema.User = Depends(get_current_active_user),
):
    """
    Create new product using a pre-uploaded image_key.
    Expects a JSON body with title, price, and image_key.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated.",
        )
    try:
        created_product = await product_service.create_product(
            db=db,
            product_in=product_data,  # Pass the Pydantic model directly
            seller_id=current_user.uid,
        )
        await gcp_services.delete_gcs_temp_image(
            temp_image_key=product_data.image_key, current_user_id=current_user.uid
        )
        return created_product
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error creating product: {e}")  # Log the full error
        # Consider logging e with traceback for better debugging
        # import traceback
        # print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the product.",
        )


@router.get("/", response_model=List[product_schema.Product])
def read_products(
    db: Session = Depends(database.get_db),
    skip: int = 0,
    limit: int = 100,
    location_query: Optional[str] = Query(
        None, description="Filter products by location text"
    ),
    lat: Optional[float] = Query(
        None, description="Filter products by location latitude"
    ),
    lng: Optional[float] = Query(
        None, description="Filter products by location longitude"
    ),
    category: Optional[str] = Query(
        None, description="Filter products by category name"
    ),
    seller_id: Optional[str] = Query(None, description="Filter products by seller ID"),
):
    """
    Retrieve products.
    Supports pagination with skip and limit.
    Optionally filters by category.
    """
    products = product_service.get_products(
        db,
        skip=skip,
        limit=limit,
        category=category,
        seller_id=seller_id,
    )
    return products


@router.get("/{product_id}", response_model=product_schema.Product)
def read_product(
    product_id: int,
    locale: str = Query("en", description="Locale for category names."),
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


@router.put("/{product_id}", response_model=product_schema.Product)
async def update_product(
    *,
    db: Session = Depends(database.get_db),
    product_id: int,
    product_data: product_schema.ProductUpdate,
    current_user: user_schema.User = Depends(get_current_active_user),
):
    """
    Update an existing product.
    """
    db_product = product_service.get_product(db, product_id=product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    if db_product.seller_id != current_user.uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this product",
        )

    try:
        updated_product = await product_service.update_product(
            db=db,
            product_id=product_id,
            product_in=product_data,
            seller_id=current_user.uid,
        )

        return updated_product
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error updating product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating the product.",
        )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(database.get_db),
    current_user: user_schema.User = Depends(get_current_active_user),
):
    """
    Delete a product.
    """
    db_product = product_service.get_product(db, product_id=product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )
    if db_product.seller_id != current_user.uid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this product",
        )

    try:
        product_service.delete_product(
            db=db, product_id=product_id, seller_id=current_user.uid
        )
        return  # 204 No Content doesn't return a body
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error deleting product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while deleting the product.",
        )
