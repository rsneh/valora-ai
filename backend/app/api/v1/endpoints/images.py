from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from requests import Session
from app.services import gcp_services, category_service
from app.schemas import image as image_schema, user as user_schema
from app.db.database import get_db
from app.security.firebase_auth import get_current_active_user

# from app.lib.locale import get_locale_from_header, AppLocale


router = APIRouter()


@router.post(
    "/upload",
    response_model=image_schema.ImageUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_image_and_get_suggestions(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),  # NEW: Add DB session dependency
    current_user: user_schema.User = Depends(get_current_active_user),
    # locale: AppLocale = Depends(get_locale_from_header),
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated.",
        )

    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only images are allowed.",
        )

    suggestions = await gcp_services.process_image_for_suggestions(
        db=db, file=image, filename=image.filename
    )

    if suggestions.image_key == "error_upload" or not suggestions.image_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not upload or process image.",
        )

    if suggestions.suggested_category_key:
        # If a category is suggested, you might want to fetch its details
        category = category_service.get_category_by_key(
            db=db, category_key=suggestions.suggested_category_key
        )
        suggestions.suggested_category_id = category.id if category else None

    return suggestions


# @router.delete(
#     "/temp/{image_key:path}",
#     response_model=image_schema.ImageDeleteResponse,
#     status_code=status.HTTP_200_OK,
# )
# async def delete_temporary_image(
#     image_key: str = Path(
#         ...,
#         description="The GCS object name key for the temporary image, including prefix. e.g., temp-uploads/some-uuid-filename.jpg",
#     ),
#     current_user: user_schema.User = Depends(get_current_active_user),
# ):
#     """
#     Deletes a temporary image from GCS.
#     The image_key path parameter should be URL-encoded by the client if it contains special characters like '/'.
#     FastAPI automatically decodes path parameters.
#     """
#     # The image_key from the path is already URL-decoded by FastAPI.
#     # No need for urllib.parse.unquote here unless the client double-encodes.
#     # decoded_image_key = urllib.parse.unquote(image_key) # Usually not needed

#     deleted = await gcp_services.delete_gcs_temp_image(
#         temp_image_key=image_key, current_user_id=current_user.uid
#     )

#     return image_schema.ImageDeleteResponse(
#         message=(
#             "Temporary image successfully deleted."
#             if deleted
#             else "Temporary image not found."
#         ),
#         image_key=image_key,
#     )
