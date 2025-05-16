import uuid
import vertexai
from fastapi import UploadFile
from typing import List, Optional, Tuple
from google.cloud import vision, storage
from vertexai.generative_models import GenerativeModel
from app.core.config import settings
from app.core.utils import find_category_by_title
from app.schemas.category import CATEGORIES, Category

TEMP_UPLOAD_PREFIX = "temp-uploads/"
PRODUCT_IMAGE_PREFIX = "product-images/"

# Initialize Google Cloud clients
# These will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
try:
    storage_client = storage.Client()
    vision_client = vision.ImageAnnotatorClient()
    gcp_project_id = settings.FIREBASE_PROJECT_ID
    gcp_location = "europe-north1"
    vertexai.init(project=gcp_project_id, location=gcp_location)
    print(
        f"GCP Clients (Storage, Vision, Vertex AI for project {gcp_project_id} in {gcp_location}) initialized."
    )
except Exception as e:
    print(f"Error initializing GCP clients: {e}")
    # Handle initialization errors as appropriate for your application
    storage_client = None
    vision_client = None


async def upload_image_to_gcs_temp_and_get_title(
    file: UploadFile, filename: str
) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Uploads an image, analyzes it, suggests a title, and returns (key, url, title).
    """
    if not storage_client or not vision_client:
        print("GCP clients not initialized.")
        return None, None, None
    try:
        bucket_name = settings.GCS_BUCKET_NAME
        bucket = storage_client.bucket(bucket_name)

        unique_suffix = f"{uuid.uuid4()}-{filename}"
        gcs_object_name_key = f"{TEMP_UPLOAD_PREFIX}{unique_suffix}"
        blob = bucket.blob(gcs_object_name_key)

        blob.upload_from_file(file.file, content_type=file.content_type)

        print(
            f"Image uploaded to GCS temp: {gcs_object_name_key}, URL: {blob.public_url}"
        )
        # Analyze image to get features for title generation
        labels, objects, web_entities = await analyze_image_with_vision_ai(
            blob.public_url
        )

        # Generate AI title
        suggested_title = ""
        if labels or objects or web_entities:
            all_features = list(set(labels + objects))
            suggested_title = await get_ai_title(all_features, web_entities)

        return gcs_object_name_key, blob.public_url, suggested_title

    except Exception as e:
        print(f"Error in upload_image_to_gcs_temp_and_get_title: {e}")
        if "blob" in locals() and blob.exists():
            try:
                blob.delete()
                print(f"Cleaned up GCS blob {gcs_object_name_key} due to error.")
            except Exception as cleanup_e:
                print(f"Error during GCS blob cleanup: {cleanup_e}")
        return None, None, None


async def move_gcs_image_to_permanent(
    temp_image_key: str, seller_id: str
) -> str | None:
    """
    Moves an image from a temporary GCS location to a permanent one.
    Returns the public URL of the image in the permanent location or None on failure.
    The temp_image_key should include the TEMP_UPLOAD_PREFIX.
    """
    if not storage_client:
        print("Storage client not initialized.")
        return None
    if not temp_image_key.startswith(TEMP_UPLOAD_PREFIX):
        print(
            f"Invalid temp_image_key: {temp_image_key} does not start with {TEMP_UPLOAD_PREFIX}"
        )
        return None

    try:
        bucket_name = settings.GCS_BUCKET_NAME
        bucket = storage_client.bucket(bucket_name)

        source_blob = bucket.blob(temp_image_key)
        if not source_blob.exists():
            print(f"Temporary image not found at {temp_image_key}")
            return None

        # Construct new destination name
        filename_only = temp_image_key.split("/")[
            -1
        ]  # Get the "uuid-filename.ext" part
        permanent_object_name = f"{PRODUCT_IMAGE_PREFIX}{seller_id}/{filename_only}"

        destination_blob = bucket.copy_blob(source_blob, bucket, permanent_object_name)
        source_blob.delete()  # Delete the temporary file

        print(
            f"Image moved to permanent location: {permanent_object_name}, URL: {destination_blob.public_url}"
        )
        return destination_blob.public_url
    except Exception as e:
        print(f"Error moving GCS image: {e}")
        return None


async def delete_gcs_temp_image(temp_image_key: str, current_user_id: str) -> bool:
    """
    Deletes an image from the temporary GCS location.
    Validates that the key is in the temp prefix.
    For enhanced security (post-PoC), one might also check if the current_user_id somehow matches
    an owner of the temp file if such metadata were stored, or if the temp_image_key incorporates user_id.
    For PoC, simply deleting from temp if key is valid is acceptable if endpoint is protected.
    """
    if not storage_client:
        print("Storage client not initialized.")
        return False
    if not temp_image_key.startswith(TEMP_UPLOAD_PREFIX):
        print(
            f"Invalid temp_image_key for deletion: {temp_image_key} does not start with {TEMP_UPLOAD_PREFIX}"
        )
        # Potentially raise HTTPException here if called from an endpoint
        return False

    # Optional: Add a check here if temp_image_key was structured to include user_id
    # e.g., if temp_image_key was "temp-uploads/{user_id}/{uuid}-{filename}"
    # if not temp_image_key.startswith(f"{TEMP_UPLOAD_PREFIX}{current_user_id}/"):
    #     print(f"User {current_user_id} not authorized to delete {temp_image_key} or key format mismatch.")
    #     return False
    # For this PoC, we assume the endpoint protection is sufficient and any valid temp key can be deleted by an auth user.

    try:
        bucket_name = settings.GCS_BUCKET_NAME
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(temp_image_key)

        if blob.exists():
            blob.delete()
            print(f"Temporary image deleted from GCS: {temp_image_key}")
            return True
        else:
            print(f"Temporary image not found for deletion: {temp_image_key}")
            return False  # Or True if "not found" is considered a successful deletion state
    except Exception as e:
        print(f"Error deleting temporary GCS image {temp_image_key}: {e}")
        return False


async def analyze_image_with_vision_ai(
    image_uri: str,
) -> Tuple[List[str], List[str], List[str]]:
    """
    Analyzes an image using Google Cloud Vision AI for labels and objects.
    image_uri can be a GCS URI (gs://bucket_name/object_name) or a public HTTP(S) URL.
    Returns a tuple of (labels, objects).
    """
    if not vision_client:
        print("Vision client not initialized.")
        return [], []
    try:
        image = vision.Image()
        if image_uri.startswith("gs://"):
            image.source.image_uri = image_uri
        else:
            image.source.image_uri = (
                image_uri  # Vision API can also fetch from public URLs
            )

        features = [
            vision.Feature(type_=vision.Feature.Type.LABEL_DETECTION, max_results=10),
            vision.Feature(
                type_=vision.Feature.Type.OBJECT_LOCALIZATION, max_results=5
            ),
            vision.Feature(type_=vision.Feature.Type.WEB_DETECTION, max_results=5),
        ]
        request = vision.AnnotateImageRequest(image=image, features=features)
        response = vision_client.annotate_image(request=request)

        if response.error.message:
            raise Exception(f"Vision API Error: {response.error.message}")

        labels = [label.description for label in response.label_annotations]
        objects = [obj.name for obj in response.localized_object_annotations]

        # Extract web entities for better title generation
        web_entities_descriptions = []
        if response.web_detection and response.web_detection.web_entities:
            web_entities_descriptions = [
                entity.description
                for entity in response.web_detection.web_entities
                if entity.description
            ]

        # Combine features - prioritize web entities if available for title context
        combined_features = list(set(labels + objects + web_entities_descriptions))

        print(f"Vision AI - Combined Features: {combined_features}")
        # Return all features; the calling function can decide what to use
        return labels, objects, web_entities_descriptions
    except Exception as e:
        print(f"Error analyzing image with Vision AI: {e}")
        return [], []


async def generate_text_with_gemini(
    prompt: str, model_name: str = "gemini-2.0-flash-001"
) -> str:
    """
    Generates text using a Google Vertex AI Gemini model.
    """
    try:
        model = GenerativeModel(model_name)
        response = await model.generate_content_async(prompt)

        # Accessing the text response - this might vary slightly based on SDK version and model
        # Check the structure of `response.candidates[0].content.parts[0].text`
        if (
            response.candidates
            and response.candidates[0].content
            and response.candidates[0].content.parts
        ):
            generated_text = response.candidates[0].content.parts[0].text
            print(
                f"Gemini AI - Generated text: {generated_text[:100]}..."
            )  # Log snippet
            return generated_text.strip()
        else:
            print(
                f"Gemini AI - No content generated or unexpected response structure: {response}"
            )
            return ""
    except Exception as e:
        print(f"Error generating text with Vertex AI Gemini: {e}")
        return ""


async def get_ai_title(image_features: List[str], web_entities: List[str]) -> str:
    """
    Generates a product title using Vertex AI Gemini based on image analysis.
    Prioritizes web entities for more specific titles if available.
    """
    # Combine features, giving preference to web entities if they exist
    if web_entities:
        # Use a mix, but web entities are often more specific for titles
        context_features = list(
            set(web_entities[:3] + image_features[:5])
        )  # Limit length
    else:
        context_features = list(set(image_features[:7]))  # Limit length

    features_str = ", ".join(filter(None, context_features))  # Filter out empty strings
    if not features_str:
        features_str = "the item in the image"

    prompt = f"""Based on the following features observed in an image: '{features_str}'.
        Suggest a concise, marketable, and descriptive product title (max 7-10 words) for a used item listing.
        Focus on the primary subject. Avoid phrases like "Image of" or "Photo of".
        Dont use words like "used", "second hand" or include any condition.
        The title should be clear and informative, helping potential buyers understand what the item is.
        The title should be suitable for a marketplace listing and should not exceed 40 characters.
        Avoid using the word "item" in the title.
        Examples: "Blue Ceramic Vase", "Sony PlayStation 5 Console (Disc Version)", "Men's Nike Air Max Sneakers Size 10".
        Title:"""

    generated_title = await generate_text_with_gemini(prompt)

    if generated_title.startswith('"') and generated_title.endswith('"'):
        generated_title = generated_title[1:-1]

    return generated_title.strip()


async def get_ai_description(title: str, image_features: List[str]) -> str:
    """
    Generates a product description using Vertex AI Gemini.
    """
    features_str = ", ".join(list(set(image_features)))  # Unique features
    prompt = f"""You are an expert at writing compelling product descriptions for a used items marketplace.
      Item Title: '{title}'
      Visual Features from Image: {features_str if features_str else 'No specific visual features detected.'}
      Based on this, write a concise and appealing product description (2-3 sentences) suitable for a marketplace listing. Focus on key selling points a buyer would look for.
      If the visual features are not very descriptive, focus more on the item title.
      Description:"""
    return await generate_text_with_gemini(prompt)


async def get_ai_category(
    title: str, image_features: List[str], predefined_categories: List[Category]
) -> str:
    """
    Suggests a product category using Vertex AI Gemini from a predefined list.
    """
    newline = "\n"
    features_str = ", ".join(list(set(image_features)))
    prompt = f"""You are an expert product categorizer.
      Item Title: '{title}'
      Visual Features from Image: {features_str if features_str else 'No specific visual features detected.'}]
      Predefined Categories and their descriptions:
        {newline.join([f"- {cat.title}: [{cat.prompt}]" for cat in predefined_categories])}
      Based on the title and visual features, select the single most appropriate category from the predefined list.
      Respond with ONLY the category name from the list. If unsure, select 'Other'.
      Category:"""
    suggested_category = await generate_text_with_gemini(prompt)

    # Validate if the suggested category is in the predefined list
    category = find_category_by_title(predefined_categories, suggested_category)

    if category:
        return category.value

    print(
        f"Gemini suggested category '{suggested_category}' not in predefined list. Defaulting to 'Other'."
    )
    return "Other"


async def get_ai_assistance(
    title: str,
    image_uri: str,
    predefined_categories: List[Category] = CATEGORIES,
) -> Tuple[str, str]:
    """
    Main function to get AI-assisted product description and category.
    """
    labels, objects, web_entities = await analyze_image_with_vision_ai(image_uri)
    image_features = labels + objects + web_entities

    description = await get_ai_description(title, image_features)
    category = await get_ai_category(title, image_features, predefined_categories)

    return description, category
