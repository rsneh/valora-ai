import json
import uuid
import vertexai
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi import UploadFile
from typing import Any, Dict, Optional, Tuple
from google.cloud import storage
from app.core.config import settings
from app.services import category_service
from app.db.models import ProductConditionEnum
from app.services.langchain.gemini import invoke_llm, invoke_gemini_with_image
from app.lib.image_optimizer import optimize_image


TEMP_UPLOAD_PREFIX = "temp-uploads/"
PRODUCT_IMAGE_PREFIX = "product-images/"


class AISuggestions(BaseModel):  # Pydantic model for clarity
    image_key: str
    image_url: str
    suggested_title: Optional[str] = None
    suggested_category_key: Optional[str] = None
    suggested_category_id: Optional[int] = None
    suggested_attributes: Optional[Dict[str, Any]] = None
    suggested_description: Optional[str] = None
    suggested_condition: Optional[ProductConditionEnum] = None


# Initialize Google Cloud clients
# These will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
try:
    storage_client = storage.Client()
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


async def upload_image_to_gcs_temp(
    file: UploadFile,
    filename: str,
) -> Tuple[Optional[str], Optional[str]]:
    """
    Uploads an optimized image, analyzes it, and returns (key, url).
    The image is automatically resized and compressed before upload.
    """
    if not storage_client:
        print("GCP clients not initialized.")
        return None, None

    unique_suffix = f"{uuid.uuid4()}-{filename}"
    gcs_object_name_key = f"{TEMP_UPLOAD_PREFIX}{unique_suffix}"

    blob = None
    try:
        # Optimize the image before uploading
        print(f"Optimizing image: {filename}")
        optimized_buffer, optimized_content_type = optimize_image(file)

        bucket_name = settings.GCS_BUCKET_NAME
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(gcs_object_name_key)

        # Upload the optimized image
        blob.upload_from_file(optimized_buffer, content_type=optimized_content_type)

        print(
            f"Optimized image uploaded to GCS temp: {gcs_object_name_key}, URL: {blob.public_url}"
        )

        return gcs_object_name_key, blob.public_url
    except Exception as e:
        print(f"Error in upload_image_to_gcs_temp: {e}")
        if blob is not None and blob.exists():
            try:
                blob.delete()
                print(f"Cleaned up GCS blob {gcs_object_name_key} due to error.")
            except Exception as cleanup_e:
                print(f"Error during GCS blob cleanup: {cleanup_e}")
        return None, None


async def move_gcs_image_to_permanent(temp_image_key: str, owner_id: int) -> str | None:
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
        permanent_object_name = f"{PRODUCT_IMAGE_PREFIX}{owner_id}/{filename_only}"

        destination_blob = bucket.copy_blob(source_blob, bucket, permanent_object_name)
        source_blob.delete()  # Delete the temporary file

        print(
            f"Image moved to permanent location: {permanent_object_name}, URL: {destination_blob.public_url}"
        )
        return destination_blob.public_url
    except Exception as e:
        print(f"Error moving GCS image: {e}")
        return None


def get_gcs_image_key(image_url: str) -> Optional[str]:
    """
    Extracts the GCS image key from a public URL.
    Assumes the URL is in the format: https://storage.googleapis.com/bucket_name/path/to/image.jpg
    Returns the key (path) part after the bucket name.
    """
    if not image_url.startswith("https://storage.googleapis.com/"):
        print(f"Invalid GCS image URL: {image_url}")
        return None

    parts = image_url.split("/", 3)  # Split into 4 parts
    if len(parts) < 4:
        print(f"Unexpected GCS image URL format: {image_url}")
        return None

    return parts[3]  # Return the path after bucket name


async def delete_gcs_image(image_key: str, current_user_id: int) -> bool:
    """
    Deletes an image from the GCS location.
    For enhanced security (post-PoC), one might also check if the current_user_id somehow matches
    an owner of the temp file if such metadata were stored, or if the temp_image_key incorporates user_id.
    For PoC, simply deleting from temp if key is valid is acceptable if endpoint is protected.
    """
    if not storage_client:
        print("Storage client not initialized.")
        return False

    try:
        bucket_name = settings.GCS_BUCKET_NAME
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(image_key)

        if blob.exists():
            blob.delete()
            print(f"Image deleted from GCS: {image_key}")
            return True
        else:
            print(f"Image not found for deletion: {image_key}")
            return True
    except Exception as e:
        print(f"Error deleting GCS image {image_key}: {e}")
        return False


async def generate_text_with_gemini(prompt: str) -> str:
    """
    Generates text using a Google Vertex AI Gemini model.
    """
    try:
        response = invoke_llm(prompt)

        # Accessing the text response - this might vary slightly based on SDK version and model
        # Check the structure of `response.content.parts[0].text`
        if response:
            generated_text = response
            print(
                f"Gemini AI - Generated text: {generated_text[:100]}..."
            )  # Log snippet
            return str(generated_text)
        else:
            print(
                f"Gemini AI - No content generated or unexpected response structure: {response}"
            )
            return ""
    except Exception as e:
        print(f"Error generating text with Vertex AI Gemini: {e}")
        return ""


async def translate_text_gemini(
    text_to_translate: str,
    target_language: str,
    source_language: str = "English",
) -> str:
    """
    Translates text from a source language to a target language using the Gemini API.

    Args:
        text_to_translate: The text you want to translate.
        target_language: The language to translate the text into (e.g., "Hebrew", "French", "Spanish").
        source_language: The language of the input text (defaults to "English").

    Returns:
        The translated text as a string, or None if translation fails.
    """
    # Construct the prompt for the Gemini model
    # It's crucial to be very specific in the prompt for best results.
    prompt = (
        f"Your sole task is to translate the following {source_language} text into {target_language}. "
        f"Provide *only* the translated {target_language} text and nothing else. "
        f"Do not include any explanations, introductions, or any text other than the translation itself.\n\n"
        f'Original {source_language} text: "{text_to_translate}"'
    )
    translate_result = await generate_text_with_gemini(prompt)
    if translate_result:
        # Clean up the result to ensure it's just the translated text
        translate_result = translate_result.strip()
        return translate_result
    else:
        print(f"Translation failed for text: {text_to_translate}")
        raise ValueError("Translation failed")


# async def get_ai_condition(
#     image_features: List[str],
#     web_entities: List[str],
#     category_key: Optional[str],
#     attributes: Optional[Dict[str, Any]],
# ) -> Optional[ProductConditionEnum]:
#     if not image_features and not web_entities:  # Not enough info from image
#         return None

#     context_features = list(set(web_entities[:3] + image_features[:7]))
#     features_str = ", ".join(filter(None, context_features))
#     if not features_str:
#         features_str = "the item in the image"

#     item_context = ""
#     if category_key:
#         item_context += f"The item is likely a '{category_key}'. "
#     if attributes:
#         attr_str = ", ".join(
#             [
#                 f"{k}: {v}"
#                 for k, v in attributes.items()
#                 if k in ["brand", "model", "material", "type"]
#             ]
#         )
#         if attr_str:
#             item_context += f"Key attributes: {attr_str}. "

#     condition_options = [e.value for e in ProductConditionEnum]
#     condition_options_str = ", ".join(f"'{e}'" for e in condition_options)

#     prompt = f"""Visually analyze an item based on its features: "{features_str}".
#         Context: {item_context}
#         The item is used, unless features strongly suggest it is new (e.g., "in box", "tags attached").
#         Based on the visual cues and context, assess its condition.
#         Choose ONE condition from the following options: {condition_options_str}.
#         Consider typical signs of wear for a used item (scratches, dents, fading, cleanliness, completeness).
#         If the image is unclear or provides insufficient detail to judge condition, respond with "Good" as a neutral default for a used item.
#         Condition:"""
#     suggested_condition_str = await generate_text_with_gemini(prompt)

#     # Validate and map to Enum
#     try:
#         # Attempt to match case-insensitively and handle minor variations if Gemini doesn't return exact enum value
#         for enum_member in ProductConditionEnum:
#             if (
#                 enum_member.value.lower()
#                 == suggested_condition_str.lower().strip().replace("'", "")
#             ):
#                 return enum_member
#         print(
#             f"AI suggested condition '{suggested_condition_str}' not in Enum. Defaulting based on logic or to None."
#         )
#         # If no direct match, could add more logic here or default (e.g., to GOOD if it's clearly used)
#         if "new" in suggested_condition_str.lower():
#             return ProductConditionEnum.NEW
#         if "like_new" in suggested_condition_str.lower():
#             return ProductConditionEnum.LIKE_NEW
#         return ProductConditionEnum.GOOD
#     except ValueError:
#         print(
#             f"AI suggested condition '{suggested_condition_str}' is not a valid ProductConditionEnum value."
#         )
#         return ProductConditionEnum.GOOD
#     except Exception as e:
#         print(f"Error processing AI condition: {e}")
#         return ProductConditionEnum.GOOD


async def process_image_for_suggestions(
    db: Session,
    file: UploadFile,
    filename: str,
    locale: str = "en",
) -> AISuggestions:
    image_key, temp_image_url = await upload_image_to_gcs_temp(file, filename)
    if not image_key or not temp_image_url:
        return AISuggestions(
            image_key="error_upload", image_url="error_upload"
        )  # Indicate error
    data = generate_product_data_from_gcs(db, temp_image_url, locale=locale)
    print(f"Generated product data: {data}")

    suggested_condition = ProductConditionEnum.GOOD

    return AISuggestions(
        image_key=image_key,
        image_url=temp_image_url,
        suggested_category_key=data["suggested_category"],
        suggested_attributes=data["suggested_attributes"],
        suggested_title=data["suggested_title"],
        suggested_description=data["suggested_description"],
        suggested_condition=suggested_condition,
    )


def generate_product_data_from_gcs(
    db: Session,
    gcs_uri: str,
    locale: str = "en",
) -> dict:
    # Define the mime type based on the GCS URI file extension
    if gcs_uri.lower().endswith(".png"):
        mime_type = "image/png"
    elif gcs_uri.lower().endswith(".jpeg") or gcs_uri.lower().endswith(".jpg"):
        mime_type = "image/jpeg"
    else:
        # Add other mime types as needed
        raise ValueError("Unsupported image format. Please use PNG or JPEG.")

    # Fetch categories from DB for the prompt
    db_categories = category_service.get_all_active_categories_for_ai(db)
    category_options_str = "\n".join(
        [
            f"- {cat['category_key']}: {cat['description_for_ai']}"
            for cat in db_categories
        ]
    )

    lang = "Hebrew" if locale == "he" else "English"

    # This detailed prompt instructs the model to act as an expert and return a JSON object.
    prompt = f"""
    You are an expert e-commerce data creator. Your task is to analyze the provided product image and generate a complete set of product information.

    Carefully analyze the image for all details, including but not limited to:
    - The primary product type.
    - Audience or gender (Men's, Women's, Kids', Unisex).
    - Visible brand names or logos.
    - Material, texture, and pattern.
    - Key colors and style features.
    - For the category select from the available Category Keys and Descriptions: {category_options_str}
    - Respond with ONLY the title in language: {lang}.

    Respond ONLY with a single, valid JSON object. Do not include any text before or after the JSON object. The JSON object must conform to the following structure:
    {{
      "suggested_category": "product_category_key",
      "suggested_title": "A compelling, SEO-friendly product title that includes key attributes.",
      "suggested_attributes": {{
        "Color": "The primary color of the item.",
        "Brand": "The brand name if visible, otherwise 'Unbranded'.",
        "Material": "The apparent material (e.g., 'Cotton', 'Leather', 'Mesh')."
      }},
      "suggested_description": "A detailed and engaging product description of 2-3 sentences, written for a customer. Highlight key features and benefits."
    }}
    """

    print("Generating product data from image...")
    # Send the request to the model
    response = invoke_gemini_with_image(prompt, gcs_uri)

    # The response text is a JSON string, so we parse it into a Python dictionary
    response_text = str(response)
    product_data = json.loads(response_text)

    print("✅ Successfully generated product data!")
    return product_data
