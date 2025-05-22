from pydantic import BaseModel, constr
from typing import Optional, List, Annotated


# Base schema with fields common to creating and reading a category
class CategoryBase(BaseModel):
    category_key: Annotated[
        str, constr(strip_whitespace=True, min_length=1, max_length=100)
    ]  # Enforce some constraints
    name_en: str
    name_he: Optional[str] = None  # Or other languages
    # Add other name_xx fields as needed

    description_ui_en: Optional[Annotated[str, constr(max_length=255)]] = (
        None  # UI descriptions are short
    )
    description_ui_he: Optional[Annotated[str, constr(max_length=255)]] = None
    # Add other description_ui_xx fields

    description_for_ai: Optional[str] = None  # Can be longer text

    image_path: Optional[str] = None
    parent_category_key: Optional[
        Annotated[str, constr(strip_whitespace=True, max_length=100)]
    ] = None
    sort_order: Optional[int] = 0
    is_active: Optional[bool] = True


# Schema for creating a new category (e.g., via an admin interface or seeding)
# This might be identical to CategoryBase if all fields are provided at creation.
class CategoryCreate(CategoryBase):
    pass


# Schema for reading/returning a category from the API
# This will include the 'id' and potentially relationships like children.
class Category(CategoryBase):
    id: int
    # If you want to return children categories directly nested within a parent category:
    children: List["Category"] = []  # Forward reference for self-referencing model

    class Config:
        from_attributes = True  # For Pydantic V2 (replaces orm_mode)


# Optional: Schema for updating a category
class CategoryUpdate(BaseModel):
    category_key: Optional[
        Annotated[str, constr(strip_whitespace=True, min_length=1, max_length=100)]
    ] = None
    name_en: Optional[str] = None
    name_he: Optional[str] = None
    description_ui_en: Optional[Annotated[str, constr(max_length=255)]] = None
    description_ui_he: Optional[Annotated[str, constr(max_length=255)]] = None
    description_for_ai: Optional[str] = None
    parent_category_key: Optional[
        Annotated[str, constr(strip_whitespace=True, max_length=100)]
    ] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


# Schema for a flat list of categories, perhaps without children for simple dropdowns
class CategoryUI(BaseModel):
    id: int
    category_key: str
    name: str
    image_path: Optional[str]
    description: Optional[Annotated[str, constr(max_length=255)]] = None
    parent_category_key: Optional[str] = None

    class Config:
        from_attributes = True
