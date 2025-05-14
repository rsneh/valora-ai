from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Path
from app.services import gcp_services
from app.schemas import image as image_schema
from app.schemas import user as user_schema
from app.security.firebase_auth import get_current_active_user


router = APIRouter()


@router.post(
    "/upload",
    response_model=image_schema.ImageUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_image_for_product(
    image: UploadFile = File(...),
    current_user: user_schema.User = Depends(get_current_active_user),
):
    print(f"current_user: {current_user}")
    """
    Uploads an image to a temporary GCS location and returns a key and URL.
    """
    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only images are allowed.",
        )

    image_key, image_url = await gcp_services.upload_image_to_gcs_temp(
        file=image, filename=image.filename
    )
    if not image_key or not image_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not upload image.",
        )

    ai_description, ai_category = await gcp_services.get_ai_assistance(
        None, image_uri=image_url
    )

    return image_schema.ImageUploadResponse(
        image_key=image_key,
        image_url=image_url,
        suggested_category=ai_category,
        suggested_description=ai_description,
    )


@router.delete(
    "/temp/{image_key:path}",
    response_model=image_schema.ImageDeleteResponse,
    status_code=status.HTTP_200_OK,
)
async def delete_temporary_image(
    image_key: str = Path(
        ...,
        description="The GCS object name key for the temporary image, including prefix. e.g., temp-uploads/some-uuid-filename.jpg",
    ),
    current_user: user_schema.User = Depends(get_current_active_user),
):
    """
    Deletes a temporary image from GCS.
    The image_key path parameter should be URL-encoded by the client if it contains special characters like '/'.
    FastAPI automatically decodes path parameters.
    """
    # The image_key from the path is already URL-decoded by FastAPI.
    # No need for urllib.parse.unquote here unless the client double-encodes.
    # decoded_image_key = urllib.parse.unquote(image_key) # Usually not needed

    deleted = await gcp_services.delete_gcs_temp_image(
        temp_image_key=image_key, current_user_id=current_user.uid
    )

    return image_schema.ImageDeleteResponse(
        message=(
            "Temporary image successfully deleted."
            if deleted
            else "Temporary image not found."
        ),
        image_key=image_key,
    )
