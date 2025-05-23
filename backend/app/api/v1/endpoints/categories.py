from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from requests import Session
from app.services import category_service
from app.schemas import category as category_schema
from app.db.database import get_db
from app.core.utils import normalize_category_key

router = APIRouter()


@router.get("/", response_model=List[category_schema.CategoryUI])
def read_categories(
    parentKey: Optional[str] = Query(
        None,
        description="Fetch sub-categories of this parent key. If null, fetches top-level categories.",
    ),
    locale: str = Query("en", description="Locale for category names."),
    db: Session = Depends(get_db),
):
    """
    Retrieve a list of categories.
    - If `parent_category_key` is provided, returns its direct sub-categories.
    - If `parent_category_key` is null/omitted, returns top-level categories.
    """
    categories = category_service.get_all_categories(
        db, parent_category_key=parentKey, locale=locale
    )
    return categories


@router.get("/{category_key}", response_model=category_schema.CategoryUI)
def read_category(
    category_key: str = Depends(normalize_category_key),
    locale: str = Query("en", description="Locale for category names."),
    db: Session = Depends(get_db),
):
    """
    Retrieve a specific product by its ID.
    """
    db_category = category_service.get_category_by_key_for_ui(
        db, category_key=category_key, locale=locale
    )
    if db_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Category not found"
        )
    return db_category


@router.get(
    "/{category_id}/breadcrumbs", response_model=List[category_schema.CategoryUI]
)
def read_category_breadcrumbs(
    category_id: int = Path(
        ..., description="The ID of the category to get breadcrumbs for."
    ),
    locale: str = Query("en", description="Locale for category names."),
    db: Session = Depends(get_db),
):
    """
    Retrieve the breadcrumb path for a specific category ID.
    """
    breadcrumbs = category_service.get_category_breadcrumbs(
        db, category_id=category_id, locale=locale
    )
    if not breadcrumbs:
        # If the initial category_id is invalid, breadcrumbs will be empty.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found or has no path.",
        )
    return breadcrumbs
