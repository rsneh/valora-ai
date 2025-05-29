# whatsapp_utils.py
import requests
import os

WHATSAPP_ACCESS_TOKEN = ""
GRAPH_API_URL = "https://graph.facebook.com/v22.0"
WHATSAPP_API_URL = ""

headers = {
    "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
    "Content-Type": "application/json",
}


def send_whatsapp_message(to_number, message_text):
    """Sends a text message to a WhatsApp number."""
    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {"body": message_text},
    }
    try:
        response = requests.post(WHATSAPP_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        print(f"Message sent to {to_number}: {response.json()}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error sending message: {e}")
        return False


def get_media_url(media_id):
    """Retrieves the media URL from a media ID."""
    url = f"{GRAPH_API_URL}/{media_id}/"
    auth_headers = {"Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}"}
    try:
        response = requests.get(url, headers=auth_headers)
        response.raise_for_status()
        return response.json().get("url")
    except requests.exceptions.RequestException as e:
        print(f"Error getting media URL: {e}")
        return None


def download_media(media_url, file_name):
    """Downloads media from a URL and saves it."""
    auth_headers = {"Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}"}
    try:
        response = requests.get(media_url, headers=auth_headers, stream=True)
        response.raise_for_status()

        # Ensure the 'downloads' directory exists
        if not os.path.exists("downloads"):
            os.makedirs("downloads")

        file_path = os.path.join("downloads", file_name)

        with open(file_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Media downloaded successfully as {file_path}")
        return file_path
    except requests.exceptions.RequestException as e:
        print(f"Error downloading media: {e}")
        return None
