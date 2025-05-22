import json
import uuid
import vertexai
from pydantic import BaseModel
from requests import Session
from fastapi import UploadFile
from typing import Any, Dict, List, Optional, Tuple
from google.cloud import vision, storage
from vertexai.generative_models import GenerativeModel
from app.core.config import settings
from app.services import category_service
from app.db.models import ProductConditionEnum


TEMP_UPLOAD_PREFIX = "temp-uploads/"
PRODUCT_IMAGE_PREFIX = "product-images/"


class AISuggestions(BaseModel):  # Pydantic model for clarity
    image_key: str
    image_url: str
    suggested_title: str
    suggested_category_key: Optional[str] = None
    suggested_attributes: Optional[Dict[str, Any]] = None
    suggested_description: Optional[str] = None
    suggested_condition: Optional[ProductConditionEnum] = None


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


async def upload_image_to_gcs_temp(
    file: UploadFile, filename: str
) -> Tuple[Optional[str], Optional[str]]:
    """
    Uploads an image, analyzes it, and returns (key, url).
    """
    if not storage_client or not vision_client:
        print("GCP clients not initialized.")
        return None, None
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

        return gcs_object_name_key, blob.public_url
    except Exception as e:
        print(f"Error in upload_image_to_gcs_temp: {e}")
        if "blob" in locals() and blob.exists():
            try:
                blob.delete()
                print(f"Cleaned up GCS blob {gcs_object_name_key} due to error.")
            except Exception as cleanup_e:
                print(f"Error during GCS blob cleanup: {cleanup_e}")
        return None, None


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


async def get_ai_category_key(
    db: Session, image_features: List[str], web_entities: List[str]
) -> Optional[str]:
    if not image_features and not web_entities:
        return "other"  # Default if no features

    # Prioritize web entities for more specific categorization context
    context_features = list(set(web_entities[:3] + image_features[:7]))  # Limit length
    features_str = ", ".join(filter(None, context_features))
    if not features_str:
        features_str = "the item in the image"

    # Fetch categories from DB for the prompt
    db_categories = category_service.get_all_active_categories_for_ai(db)
    if not db_categories:
        print("No categories found in DB for AI prompt. Defaulting to 'other'.")
        return "other"

    category_options_str = "\n".join(
        [
            f"- {cat['category_key']}: {cat['description_for_ai']}"
            for cat in db_categories
        ]
    )
    available_category_keys = [cat["category_key"] for cat in db_categories]

    prompt = f"""Analyze the following item features: "{features_str}".
        Based on these features, select the single most appropriate category key from the list below.
        Respond with ONLY the category key (e.g., 'electronics_laptop').
        Available Category Keys and Descriptions:
        {category_options_str}
        Selected Category Key:"""

    suggested_key = await generate_text_with_gemini(prompt)

    if suggested_key and suggested_key in available_category_keys:
        return suggested_key
    print(
        f"AI suggested category key '{suggested_key}' not in predefined list {available_category_keys}. Defaulting to 'other'."
    )
    return "other"


async def get_ai_attributes(
    db: Session,
    category_key: Optional[str],
    image_features: List[str],
    web_entities: List[str],
) -> Optional[Dict[str, Any]]:  # ADDED db parameter
    if not category_key or category_key == "other":
        return None

    context_features = list(set(web_entities[:3] + image_features[:7]))
    features_str = ", ".join(filter(None, context_features))
    if not features_str:
        features_str = "the item in the image"

    # Get category description from DB to provide more context to AI for attributes
    category_obj = category_service.get_category_by_key(db, category_key)
    category_description_for_ai = (
        category_obj.description_for_ai if category_obj else category_key
    )

    attribute_examples_prompt = (
        ""  # This should be more dynamic or stored with categories
    )
    if category_key == "electronics_laptop":
        attribute_examples_prompt = "Example attributes for a laptop: brand (e.g., Apple, Dell), model (e.g., MacBook Pro, XPS 15), screen_size (e.g., 13-inch, 15.6-inch), processor (e.g., Intel Core i7, Apple M1), ram (e.g., 8GB, 16GB), storage (e.g., 256GB SSD, 1TB HDD), condition (e.g., New, Used - Good, Used - Fair)."
    elif category_key == "fashion_dress":
        attribute_examples_prompt = "Example attributes for a dress: type (e.g., Summer Dress, Evening Gown), material (e.g., Cotton, Silk), color (e.g., Blue, Red Floral), size (e.g., S, M, L, 10, 12), brand (e.g., Zara, ASOS), condition (e.g., New with tags, Used - Excellent)."
    # Consider storing attribute examples/schemas per category in the database for more dynamic prompting

    prompt = f"""The item is categorized as '{category_description_for_ai}' with observed features: "{features_str}".
        {attribute_examples_prompt}
        Extract relevant attributes for this item based on its category and features.
        Respond with a JSON object of key-value pairs. If an attribute is not determinable, omit it.
        Example JSON: {{"brand": "Apple", "model": "MacBook Pro", "condition": "Used - Good"}}
        Attributes JSON:"""

    json_string = await generate_text_with_gemini(prompt)
    try:
        if "```json" in json_string:
            json_string = json_string.split("```json")[1].split("```")[0].strip()
        elif json_string.startswith("```") and json_string.endswith("```"):
            json_string = json_string[3:-3].strip()

        attributes = json.loads(json_string)
        if isinstance(attributes, dict):
            return attributes
        print(f"AI attributes response was not a dict: {attributes}")
        return None
    except json.JSONDecodeError as e:
        print(f"Failed to decode AI attributes JSON: {json_string}. Error: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred parsing AI attributes: {e}")
        return None


async def get_ai_condition(
    image_features: List[str],
    web_entities: List[str],
    category_key: Optional[str],
    attributes: Optional[Dict[str, Any]],
) -> Optional[ProductConditionEnum]:
    if not image_features and not web_entities:  # Not enough info from image
        return None

    context_features = list(set(web_entities[:3] + image_features[:7]))
    features_str = ", ".join(filter(None, context_features))
    if not features_str:
        features_str = "the item in the image"

    item_context = ""
    if category_key:
        item_context += f"The item is likely a '{category_key}'. "
    if attributes:
        attr_str = ", ".join(
            [
                f"{k}: {v}"
                for k, v in attributes.items()
                if k in ["brand", "model", "material", "type"]
            ]
        )
        if attr_str:
            item_context += f"Key attributes: {attr_str}. "

    condition_options = [e.value for e in ProductConditionEnum]
    condition_options_str = ", ".join(f"'{e}'" for e in condition_options)

    prompt = f"""Visually analyze an item based on its features: "{features_str}".
        Context: {item_context}
        The item is used, unless features strongly suggest it is new (e.g., "in box", "tags attached").
        Based on the visual cues and context, assess its condition.
        Choose ONE condition from the following options: {condition_options_str}.
        Consider typical signs of wear for a used item (scratches, dents, fading, cleanliness, completeness).
        If the image is unclear or provides insufficient detail to judge condition, respond with "Good" as a neutral default for a used item.
        Condition:"""
    suggested_condition_str = await generate_text_with_gemini(prompt)

    # Validate and map to Enum
    try:
        # Attempt to match case-insensitively and handle minor variations if Gemini doesn't return exact enum value
        for enum_member in ProductConditionEnum:
            if (
                enum_member.value.lower()
                == suggested_condition_str.lower().strip().replace("'", "")
            ):
                return enum_member
        print(
            f"AI suggested condition '{suggested_condition_str}' not in Enum. Defaulting based on logic or to None."
        )
        # If no direct match, could add more logic here or default (e.g., to GOOD if it's clearly used)
        if "new" in suggested_condition_str.lower():
            return ProductConditionEnum.NEW
        if "like_new" in suggested_condition_str.lower():
            return ProductConditionEnum.LIKE_NEW
        return ProductConditionEnum.GOOD
    except ValueError:
        print(
            f"AI suggested condition '{suggested_condition_str}' is not a valid ProductConditionEnum value."
        )
        return ProductConditionEnum.GOOD
    except Exception as e:
        print(f"Error processing AI condition: {e}")
        return ProductConditionEnum.GOOD


async def get_ai_title(
    db: Session,
    category_key: Optional[str],
    attributes: Optional[Dict[str, Any]],
    image_features: List[str],
    web_entities: List[str],
) -> Optional[str]:

    context_parts = []
    if category_key:
        category_obj = category_service.get_category_by_key(db, category_key)
        if category_obj:
            context_parts.append(
                f"Category: {category_obj.name_en}"
            )  # Use English name for title context

    if attributes:
        # Prioritize key attributes for title generation
        brand = attributes.get("brand")
        model = attributes.get("model")
        item_type = attributes.get(
            "type"
        )  # e.g., "Laptop", "Smartphone", "Summer Dress"
        color = attributes.get("color")
        size = attributes.get("size")  # e.g. "256GB" for storage, or clothing size

        if item_type:
            context_parts.append(f"Type: {item_type}")
        if brand:
            context_parts.append(f"Brand: {brand}")
        if model:
            context_parts.append(f"Model: {model}")
        if color:
            context_parts.append(f"Color: {color}")
        if (
            size
            and category_key
            and ("electronics" in category_key or "phone" in category_key)
        ):  # Be specific for storage size
            context_parts.append(f"Storage/Capacity: {size}")
        elif size:  # For other sizes like clothing
            context_parts.append(f"Size: {size}")

    # Use web entities if more specific context is missing from attributes
    if not context_parts and web_entities:
        context_parts.extend(web_entities[:3])  # Top 3 web entities
    elif not context_parts and image_features:
        context_parts.extend(image_features[:3])  # Top 3 image features as last resort

    if not context_parts:
        context_str = "the item in the image"
    else:
        context_str = ", ".join(context_parts)

    prompt = f"""Based on the following information about an item: "{context_str}".
        Generate a short, clear, and marketable title for an item.
        The title should be concise (ideally 3-7 words).
        Include key identifying information like brand, model, and important specifications if applicable.
        Respond with ONLY the title.

        Examples:
        "iPhone 16 Pro 256GB"
        "Sony Noise Cancelling Headphones WH-1000XM5"
        "AirPods Max Silver"
        "Samsung Galaxy S25 Ultra 512GB"
        "Chicco NextFit Baby Stroller"
        "Wooden Dining Table with 6 Chairs"
        "Vintage Leather Armchair"
        "Dell XPS 15 Laptop i7 16GB RAM"
        Suggested Title:"""

    title = await generate_text_with_gemini(prompt)
    # Clean the title (remove quotes, extra whitespace)
    if title:
        title = title.strip().replace('"', "")
        # Capitalize main words (optional, can be complex to get perfect)
        # title = ' '.join(word.capitalize() if not word.islower() else word for word in title.split())
        return title
    return None


async def get_ai_description_from_structured_data(
    db: Session,
    title: Optional[str],
    category_key: Optional[str],
    attributes: Optional[Dict[str, Any]],
    condition: Optional[str],
    image_features: List[str],
) -> Optional[str]:

    prompt_context = f"Item Title: {title or 'Used Item'}\n"
    if category_key:
        category_obj = category_service.get_category_by_key(db, category_key)
        category_desc_for_prompt = (
            category_obj.description_for_ai if category_obj else category_key
        )
        prompt_context += f"Category: {category_desc_for_prompt}\n"
    if condition:
        prompt_context += f"Condition: {condition}\n"
    if attributes:
        attr_str = ", ".join([f"{k}: {v}" for k, v in attributes.items()])
        prompt_context += f"Key Attributes: {attr_str}\n"
    if image_features:
        features_str = ", ".join(image_features[:5])
        prompt_context += f"Observed Visual Features: {features_str}\n"

    prompt = f"""Based on the following item details:
        {prompt_context}
        Write a compelling and informative product description (2-4 sentences) suitable for a marketplace listing for a used item.
        Make sure to mention the condition if it's notable (e.g., "like new", "good with some wear").
        Highlight key selling points. Maintain a friendly and trustworthy tone.
        Description:"""

    return await generate_text_with_gemini(prompt)


async def process_image_for_suggestions(
    db: Session, file: UploadFile, filename: str
) -> AISuggestions:
    image_key, temp_image_url = await upload_image_to_gcs_temp(file, filename)
    if not image_key or not temp_image_url:
        return AISuggestions(
            image_key="error_upload", image_url="error_upload"
        )  # Indicate error

    labels, objects, web_entities = await analyze_image_with_vision_ai(temp_image_url)
    all_image_features = list(set(labels + objects))

    suggested_category_key = await get_ai_category_key(
        db, all_image_features, web_entities
    )
    suggested_attributes = await get_ai_attributes(
        db, suggested_category_key, all_image_features, web_entities
    )
    suggested_title = await get_ai_title(
        db,
        suggested_category_key,
        suggested_attributes,
        all_image_features,
        web_entities,
    )

    suggested_condition = await get_ai_condition(
        all_image_features, web_entities, suggested_category_key, suggested_attributes
    )

    suggested_description = await get_ai_description_from_structured_data(
        db=db,
        title=suggested_title,
        category_key=suggested_category_key,
        attributes=suggested_attributes,
        image_features=all_image_features,
        condition=suggested_condition,
    )

    return AISuggestions(
        image_key=image_key,
        image_url=temp_image_url,
        suggested_category_key=suggested_category_key,
        suggested_attributes=suggested_attributes,
        suggested_title=suggested_title,
        suggested_description=suggested_description,
        suggested_condition=suggested_condition,
    )
