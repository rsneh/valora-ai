import uuid
from typing import List, Tuple, Dict, Any
from google.cloud import vision, storage, aiplatform
from google.protobuf.json_format import MessageToDict
from app.core.config import settings

# Initialize Google Cloud clients
# These will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
try:
    storage_client = storage.Client()
    vision_client = vision.ImageAnnotatorClient()
    # Initialize Vertex AI (aiplatform) client
    # You need to specify the project and location for Vertex AI client initialization
    # The project can be inferred if GOOGLE_CLOUD_PROJECT is set,
    # or you can get it from settings.FIREBASE_PROJECT_ID if they are linked
    # and settings.FIREBASE_PROJECT_ID is your GCP project ID.
    # Location (region) is also important for Vertex AI.
    gcp_project_id = (
        settings.FIREBASE_PROJECT_ID
    )  # Assuming Firebase project ID is also GCP project ID
    gcp_location = "us-central1"  # Choose a region for Vertex AI, e.g., us-central1
    aiplatform.init(project=gcp_project_id, location=gcp_location)
    print(
        f"GCP Clients (Storage, Vision, Vertex AI for project {gcp_project_id} in {gcp_location}) initialized."
    )
except Exception as e:
    print(f"Error initializing GCP clients: {e}")
    # Handle initialization errors as appropriate for your application
    storage_client = None
    vision_client = None


async def upload_image_to_gcs(file, filename: str) -> str | None:
    """
    Uploads an image file to Google Cloud Storage.
    Returns the public URL of the uploaded image.
    """
    if not storage_client:
        print("Storage client not initialized.")
        return None
    try:
        bucket_name = settings.GCS_BUCKET_NAME
        bucket = storage_client.bucket(bucket_name)

        # Generate a unique filename to avoid collisions
        unique_filename = f"products/{uuid.uuid4()}-{filename}"
        blob = bucket.blob(unique_filename)

        blob.upload_from_file(file.file, content_type=file.content_type)

        # Make the blob publicly readable (for PoC simplicity)
        # For production, consider using signed URLs.
        blob.make_public()

        return blob.public_url
    except Exception as e:
        print(f"Error uploading image to GCS: {e}")
        return None


async def analyze_image_with_vision_ai(image_uri: str) -> Tuple[List[str], List[str]]:
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
        ]
        request = vision.AnnotateImageRequest(image=image, features=features)
        response = vision_client.annotate_image(request=request)

        if response.error.message:
            raise Exception(f"Vision API Error: {response.error.message}")

        labels = [label.description for label in response.label_annotations]
        objects = [obj.name for obj in response.localized_object_annotations]

        print(f"Vision AI - Labels: {labels}, Objects: {objects}")
        return labels, objects
    except Exception as e:
        print(f"Error analyzing image with Vision AI: {e}")
        return [], []


async def generate_text_with_gemini(
    prompt: str, model_name: str = "gemini-1.0-pro-001"
) -> str:
    """
    Generates text using a Google Vertex AI Gemini model.
    """
    try:
        # Ensure aiplatform is initialized (done globally, but good to be aware)
        # model_name for Gemini 1.0 Pro. Check for latest recommended model versions.
        model = aiplatform.GenerativeModel(model_name)
        response = await model.generate_content_async(
            prompt
        )  # Use async version if available and suitable

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
    title: str, image_features: List[str], predefined_categories: List[str]
) -> str:
    """
    Suggests a product category using Vertex AI Gemini from a predefined list.
    """
    features_str = ", ".join(list(set(image_features)))
    categories_str = ", ".join(predefined_categories)
    prompt = f"""You are an expert product categorizer.
      Item Title: '{title}'
      Visual Features from Image: {features_str if features_str else 'No specific visual features detected.'}
      Predefined Categories: [{categories_str}]
      Based on the title and visual features, select the single most appropriate category from the predefined list.
      Respond with ONLY the category name from the list. If unsure, select 'Other'.
      Category:"""
    suggested_category = await generate_text_with_gemini(prompt)

    # Validate if the suggested category is in the predefined list
    if suggested_category in predefined_categories:
        return suggested_category
    print(
        f"Gemini suggested category '{suggested_category}' not in predefined list. Defaulting to 'Other'."
    )
    return "Other"  # Default if Gemini hallucinates or provides an invalid category


# Predefined categories for the PoC - should match your plan
# This could also be loaded from config or a database in a real app
POC_CATEGORIES = [
    "Electronics",
    "Furniture",
    "Clothing",
    "Books",
    "Sports Equipment",
    "Home & Garden",
    "Toys & Games",
    "Collectibles",
    "Other",
]
