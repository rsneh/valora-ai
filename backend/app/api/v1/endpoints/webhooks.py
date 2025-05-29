import json
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import PlainTextResponse
from app.lib.whatsapp_utils import download_media, get_media_url, send_whatsapp_message

router = APIRouter()

WHATSAPP_VERIFY_TOKEN = ""


def upload_product_image(image_path, sender_id, caption=""):
    print(
        f"Uploading product image from {image_path} for sender {sender_id} with caption: {caption}"
    )


# --- Webhook Endpoint (GET for Verification, POST for Messages) ---
@router.api_route("/whatsapp", methods=["GET", "POST"], status_code=status.HTTP_200_OK)
async def webhook(request: Request):
    """
    Handles both GET (verification) and POST (incoming messages) requests
    from the WhatsApp Cloud API.
    """
    if request.method == "GET":
        # --- Webhook Verification ---
        verify_token = request.query_params.get("hub.verify_token")
        mode = request.query_params.get("hub.mode")
        challenge = request.query_params.get("hub.challenge")

        if mode == "subscribe" and verify_token == WHATSAPP_VERIFY_TOKEN:
            print("Webhook verified successfully!")
            # Use PlainTextResponse for the challenge
            return PlainTextResponse(content=challenge, status_code=status.HTTP_200_OK)
        else:
            print(f"Webhook verification failed. Token received: {verify_token}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Verification token mismatch",
            )

    elif request.method == "POST":
        # --- Handle Incoming Messages ---
        data = await request.json()
        print("Received WhatsApp message:")
        print(json.dumps(data, indent=2))  # Log for debugging

        try:
            # Check for valid WhatsApp message structure (same as Flask version)
            if (
                data.get("entry")
                and data["entry"][0].get("changes")
                and data["entry"][0]["changes"][0].get("value")
                and data["entry"][0]["changes"][0]["value"].get("messages")
            ):

                message_data = data["entry"][0]["changes"][0]["value"]["messages"][0]
                sender_id = message_data["from"]
                message_type = message_data["type"]

                if message_type == "image":
                    image_id = message_data["image"]["id"]
                    caption = message_data["image"].get("caption", "")

                    print(f"Received image from {sender_id} with ID: {image_id}")
                    send_whatsapp_message(
                        sender_id, "Got your picture! Processing it now..."
                    )

                    media_url = get_media_url(image_id)
                    if media_url:
                        file_ext = "jpg"  # Assume jpg, improve if needed
                        file_name = f"{image_id}.{file_ext}"
                        local_image_path = download_media(media_url, file_name)

                        if local_image_path:
                            product_url = upload_product_image(
                                local_image_path, sender_id, caption
                            )

                            if product_url:
                                send_whatsapp_message(
                                    sender_id,
                                    f"Your product is listed! View it here: {product_url}",
                                )
                            else:
                                send_whatsapp_message(
                                    sender_id,
                                    "Sorry, I couldn't upload your image. Please try again.",
                                )
                        else:
                            send_whatsapp_message(
                                sender_id,
                                "Sorry, I couldn't download your image. Please try again.",
                            )
                    else:
                        send_whatsapp_message(
                            sender_id,
                            "Sorry, I couldn't process your image. Please try again.",
                        )

                elif message_type == "text":
                    send_whatsapp_message(
                        sender_id,
                        "Hi! Please send me a picture of the product you want to sell.",
                    )
                else:
                    send_whatsapp_message(
                        sender_id, "Sorry, I only understand text and images right now."
                    )

            # Always return 200 OK to WhatsApp
            return {"status": "ok"}

        except Exception as e:
            print(f"Error processing message: {e}")
            # Still return 200 OK, but log the error.
            # You might want more robust error reporting in production.
            return {"status": "error", "message": str(e)}

    else:
        # Should not happen with @app.api_route setup, but good practice
        raise HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail="Method Not Allowed"
        )
