from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from requests import Session
from app.services import category_service
from app.schemas import category as category_schema
from app.db.database import get_db

router = APIRouter()


@router.get("/", response_model=List[category_schema.CategoryUI])
def read_categories(
    key: Optional[str] = Query(
        None,
        description="Fetch sub-categories of this parent key. If null, fetches top-level categories.",
    ),
    db: Session = Depends(get_db),
):
    """
    Retrieve a list of categories.
    - If `parent_category_key` is provided, returns its direct sub-categories.
    - If `parent_category_key` is null/omitted, returns top-level categories.
    """
    categories = category_service.get_all_categories(db, parent_category_key=key)
    return categories


@router.get("/{category_key}", response_model=category_schema.CategoryUI)
def read_category(
    category_key: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve a specific product by its ID.
    """
    db_category = category_service.get_category_by_key(db, category_key=category_key)
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )
    return db_category


@router.get(
    "/{category_key}/breadcrumbs", response_model=List[category_schema.CategoryUI]
)
def read_category_breadcrumbs(
    category_key: str,
    locale: str = Query(
        "en", description="Locale for category names."
    ),  # Frontend should pass current locale
    db: Session = Depends(get_db),
):
    """
    Retrieve the breadcrumb path for a specific category.
    """
    breadcrumbs = category_service.get_category_breadcrumbs(
        db, category_key=category_key, locale=locale
    )
    if not breadcrumbs:
        # This might happen if the key is invalid.
        # Depending on desired behavior, you might return empty or 404.
        # For now, let's assume an empty list is acceptable if the key is somehow invalid or top-level (though top-level would return itself).
        return []
    return breadcrumbs
