# backend/app/services/category_service.py
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from app.schemas import category as category_schema
from app.db import models  # Assuming your Category model is in models.py


def get_all_active_categories_for_ai(db: Session) -> List[Dict[str, str]]:
    """
    Fetches all active categories with their keys and AI descriptions.
    Returns a list of dictionaries, e.g.,
    [{ "category_key": "electronics_laptop", "description_for_ai": "Detailed desc..." }, ...]
    """
    categories_for_ai = []
    active_categories = (
        db.query(models.Category.category_key, models.Category.description_for_ai)
        .filter(models.Category.is_active == True)
        .all()
    )

    for cat in active_categories:
        if (
            cat.category_key and cat.description_for_ai
        ):  # Ensure essential data is present
            categories_for_ai.append(
                {
                    "category_key": cat.category_key,
                    "description_for_ai": cat.description_for_ai,
                }
            )
    return categories_for_ai


def get_category_by_key(db: Session, category_key: str) -> Optional[models.Category]:
    """
    Fetches a single category by its key.
    """
    return (
        db.query(models.Category)
        .filter(
            models.Category.category_key == category_key,
            models.Category.is_active == True,
        )
        .first()
    )


# You can add more functions here as needed, e.g., to get categories for UI display
def get_all_categories(
    db: Session, parent_category_key: Optional[str] = None, locale: str = "en"
) -> List[Dict]:
    """
    Fetches categories for UI display, potentially hierarchical and localized.
    For simplicity, this example fetches based on parent_key and a single locale name.
    """
    name_column = getattr(models.Category, f"name_{locale}", models.Category.name_en)
    desc_ui_column = getattr(
        models.Category, f"description_ui_{locale}", models.Category.description_ui_en
    )

    query = db.query(
        models.Category.id,
        models.Category.category_key,
        models.Category.image_path,
        name_column.label("name"),  # Use label to have a consistent 'name' key
        desc_ui_column.label("description_ui"),
        models.Category.parent_category_key,
    ).filter(models.Category.is_active == True)

    if parent_category_key:
        query = query.filter(models.Category.parent_category_key == parent_category_key)
    else:  # Fetch top-level categories if no parent_key is specified
        query = query.filter(models.Category.parent_category_key.is_(None))

    query = query.order_by(models.Category.sort_order)

    results = []
    for cat in query.all():
        results.append(
            {
                "id": cat.id,
                "category_key": cat.category_key,
                "name": cat.name,
                "image_path": cat.image_path,
                "path": cat.category_key.replace("_", "-"),
                "description": cat.description_ui,
                "parent_category_key": cat.parent_category_key,
                # You could add a flag 'has_children' if needed for UI
            }
        )
    return results


def get_category_breadcrumbs(
    db: Session, category_key: str, locale: str = "en"
) -> List[category_schema.CategoryUI]:  # Or your full Category schema
    """
    Fetches the breadcrumb path for a given category key.
    The list is ordered from the top-level parent to the given category.
    """
    breadcrumbs: List[category_schema.CategoryUI] = []
    current_key: Optional[str] = category_key

    while current_key:
        category_db = get_category_by_key(db, current_key)
        if not category_db:
            break  # Category not found or inactive, stop building breadcrumbs

        name_column_label = f"name_{locale}"
        name_column_value = getattr(category_db, name_column_label, category_db.name_en)

        breadcrumbs.append(
            category_schema.CategoryUI(
                id=category_db.id,
                category_key=category_db.category_key,
                name=name_column_value,
                path=category_db.category_key.replace("_", "-"),
                parent_category_key=category_db.parent_category_key,
            )
        )
        current_key = category_db.parent_category_key

    return list(reversed(breadcrumbs))  # Reverse to get top-down order
