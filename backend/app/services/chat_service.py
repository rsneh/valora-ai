import re
from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db import models
from app.lib.brevo import send_email_template
from app.services import ai_negotiation_service, gcp_services
from app.schemas.chat import SellerContactInfo
from app.security.firebase_auth import auth as firebase_auth_admin


def send_seller_deal_notification_email(
    seller_email: str,
    seller_name: str,
    product_title: str,
    # buyer_id: str,
    agreed_price: str,
):
    email_context = {
        "customer_name": seller_name,
        "product_name": product_title,
        "deal_value": agreed_price,
    }

    send_email_template(
        template_name="close_deal.html",
        to_email=seller_email,
        subject=f"Deal Agreed for your item: {product_title} on Valora!",
        context=email_context,
    )


async def finalize_deal_from_ai(
    db: Session,
    product_id: int,
    conversation_id: int,
    buyer_id: str,  # Authenticated buyer
    agreed_price: float,  # Extracted from AI signal
) -> Optional[SellerContactInfo]:
    """
    Updates product and conversation status, notifies seller, returns contact info.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    conversation = (
        db.query(models.Conversation)
        .filter(models.Conversation.id == conversation_id)
        .first()
    )

    if not product or not conversation:
        print(
            f"Error finalizing deal: Product {product_id} or Conversation {conversation_id} not found."
        )
        return None  # Or raise error

    if product.status != models.ProductStatusEnum.ACTIVE:
        print(
            f"Product {product_id} is no longer available for a new deal. Current status: {product.status}"
        )
        # Potentially inform the AI/buyer, though the AI should ideally know this from context.
        # For now, we proceed but this is a race condition to consider.
        # A better approach might be to lock the product when negotiation starts.
        # For PoC, we'll allow override if it was pending with same buyer.
        if not (
            product.status == models.ProductStatusEnum.PENDING_SALE
            and conversation.buyer_id == buyer_id
        ):
            return (
                None  # Cannot close deal if already sold or pending with another buyer
            )

    conversation.status = models.ConversationStatus.CLOSED_DEAL

    # Fetch seller's Firebase user details (email)
    # In a real app, you might have a User table with more details or use Firebase Admin SDK to get user
    seller_firebase_user = None
    seller_phone = None
    seller_email = None
    seller_name = "Seller"

    if product.seller_allowed_to_contact:
        # If seller allowed to contact, we can fetch their phone number
        seller_phone = product.seller_phone if product.seller_phone else None
        seller_name = product.seller_name if product.seller_name else "Seller"

    try:
        seller_firebase_user = firebase_auth_admin.get_user(product.seller_id)
        seller_email = seller_firebase_user.email
    except Exception as e:
        print(f"Could not fetch seller email for notification: {e}")

    if seller_email:
        formated_agreed_price = f"{agreed_price} {product.currency}"
        send_seller_deal_notification_email(
            seller_email=seller_email,
            product_title=product.title,
            seller_name=seller_name,
            # buyer_id=buyer_id,
            agreed_price=formated_agreed_price,
        )

    db.add(product)
    db.add(conversation)
    db.commit()
    print(
        f"Deal finalized for product {product_id}, conversation {conversation_id}. Statuses updated."
    )

    if seller_name and seller_phone:
        return SellerContactInfo(name=seller_name, phone=seller_phone)
    return None


async def get_or_create_conversation_with_greeting(
    db: Session,
    product_id: int,
    buyer_id: str,
    seller_id: str,
    locale: str = "en",
) -> models.Conversation:
    """
    Retrieves an existing conversation or creates a new one if it doesn't exist.
    """
    conversation = (
        db.query(models.Conversation)
        .filter(
            models.Conversation.product_id == product_id,
            models.Conversation.buyer_id == buyer_id,
            models.Conversation.seller_id == seller_id,  # Ensure seller_id also matches
        )
        .first()
    )

    if not conversation:
        product = (
            db.query(models.Product).filter(models.Product.id == product_id).first()
        )
        if not product:
            raise ValueError("Product not found for creating conversation")

        conversation = models.Conversation(
            product_id=product_id,
            buyer_id=buyer_id,
            seller_id=seller_id,
            status=models.ConversationStatus.ACTIVE,
        )
        db.add(conversation)
        db.commit()  # Commit to get conversation.id
        db.refresh(conversation)

        # Add initial AI greeting message
        ai_greeting_text = await ai_negotiation_service.generate_initial_ai_greeting(
            product,
            locale,
        )
        add_message_to_conversation(
            db=db,
            conversation_id=conversation.id,
            sender_id="VALORA_AI_ASSISTANT",
            sender_type=models.MessageSenderType.AI_ASSISTANT,
            message_text=ai_greeting_text,
            update_last_message_at=False,
            message_type=models.MessageType.GREETING,  # Assign GREETING type
        )
        db.refresh(conversation)
    return conversation


def add_message_to_conversation(
    db: Session,
    conversation_id: int,
    sender_id: str,
    sender_type: models.MessageSenderType,
    message_text: str,
    update_last_message_at: bool = True,  # Added flag
    message_type: Optional[models.MessageType] = None,  # Added message_type parameter
) -> models.ChatMessage:
    db_message = models.ChatMessage(
        conversation_id=conversation_id,
        sender_id=sender_id,
        sender_type=sender_type,
        message_text=message_text,
        message_type=message_type,  # Save the message type
    )
    db.add(db_message)

    if update_last_message_at:
        conversation = (
            db.query(models.Conversation)
            .filter(models.Conversation.id == conversation_id)
            .first()
        )
        if conversation:
            conversation.last_message_at = func.now()
            db.add(conversation)

    db.commit()
    db.refresh(db_message)
    return db_message


async def process_buyer_message_and_get_ai_response(
    db: Session,
    product_id: int,
    buyer_id: str,
    buyer_message_text: str,
    locale: str = "en",
) -> models.ChatMessage:
    """
    Processes a buyer's message, gets an AI response, and saves both.
    """
    lang = "Hebrew" if locale == "he" else "English"
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise ValueError("Product not found")  # Or a specific HTTPException

    conversation = await get_or_create_conversation_with_greeting(
        db=db,
        product_id=product_id,
        buyer_id=buyer_id,
        seller_id=product.seller_id,
        locale=locale,
    )
    print(product.status)
    if product.status != models.ProductStatusEnum.ACTIVE:
        # If product is not available, AI should ideally know this or be informed.
        # For now, let's have AI give a polite message.
        # This could be a specific AI response or a hardcoded one.
        unavailable_msg = f"I apologize, but it seems '{product.title}' is currently no available for new offers through this chat. You can browse other items!"
        ai_message_db = add_message_to_conversation(
            db=db,
            conversation_id=conversation.id,
            sender_id="VALORA_AI_ASSISTANT",
            sender_type=models.MessageSenderType.AI_ASSISTANT,
            message_text=unavailable_msg,
            message_type=models.MessageType.UNAVAILABLE_PRODUCT,  # Assign UNAVAILABLE type
        )
        return ai_message_db, None, False

    # Save buyer's message
    add_message_to_conversation(
        db=db,
        conversation_id=conversation.id,
        sender_id=buyer_id,
        sender_type=models.MessageSenderType.BUYER,
        message_text=buyer_message_text,
        message_type=models.MessageType.GENERAL,  # Default buyer message type to GENERAL, could add AI classification later
    )

    recent_messages_db = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.conversation_id == conversation.id)
        .order_by(models.ChatMessage.timestamp.desc())
        .limit(10)
        .all()
    )

    conversation_history_for_ai = [
        {"sender_type": msg.sender_type.value, "text": msg.message_text}
        for msg in reversed(recent_messages_db)  # Ensure chronological for prompt
    ]

    # Call AI service to get both text and type
    ai_response_data = await ai_negotiation_service.generate_ai_response(
        product=product,
        conversation_history=conversation_history_for_ai,
        buyer_message_text=buyer_message_text,
        locale=locale,
    )
    print(f"DEBUG: AI Response Data: {ai_response_data}")
    ai_message_for_buyer = ai_response_data.get("message_text", "")
    ai_message_type = ai_response_data.get(
        "message_type",
        models.MessageType.GENERAL.value,
    )  # Default to GENERAL if AI doesn't provide type

    # Ensure message_type is a valid enum member
    try:
        ai_message_type_enum = models.MessageType(ai_message_type)
    except ValueError:
        print(
            f"AI returned invalid message type: {ai_message_type}. Defaulting to GENERAL."
        )
        ai_message_type_enum = models.MessageType.GENERAL

    seller_contact_info_to_return: Optional[SellerContactInfo] = None
    deal_closed_flag = False

    # Parse AI response for DEAL_AGREED signal
    deal_signal_match = re.search(
        r"DEAL_AGREED: Price=(\d+\.?\d*), Location=([^\"]+)", ai_message_for_buyer
    )
    print("DEBUG: AI Response Text:", ai_message_for_buyer)
    print("DEBUG: Deal Signal Match:", deal_signal_match)

    # Trigger deal finalization if AI suggests CLOSED_DEAL type AND signal is present
    if (
        ai_message_type_enum == models.MessageType.CLOSED_DEAL
        and deal_signal_match
        and product.status == models.ProductStatusEnum.ACTIVE
    ):
        try:
            agreed_price = float(deal_signal_match.group(1))
            # agreed_location = deal_signal_match.group(2) # Location context, not strictly needed for DB update

            # Finalize the deal (update DB, send email)
            seller_contact_info_to_return = await finalize_deal_from_ai(
                db=db,
                product_id=product.id,
                conversation_id=conversation.id,
                buyer_id=buyer_id,
                agreed_price=agreed_price,
            )
            deal_closed_flag = True
            # Append contact info to the AI's message if available
            # The AI's text should ideally confirm the deal, we just add contact info
            close_deal_message_for_buyer = ""
            if (
                not ai_message_for_buyer.strip()
            ):  # If AI returned empty text but CLOSED_DEAL type
                close_deal_message_for_buyer = (
                    f"Great! We've agreed on ${agreed_price:.2f}. "
                )
            elif "DEAL_AGREED:" in ai_message_for_buyer:
                # Remove the signal from the final message shown to the user
                close_deal_message_for_buyer = ai_message_for_buyer.split(
                    "DEAL_AGREED:"
                )[0].strip()
                close_deal_message_for_buyer += (
                    f"\n\nDeal agreed at ${agreed_price:.2f}. "
                )
            else:
                # If AI didn't include the signal but returned CLOSED_DEAL type, just add confirmation
                close_deal_message_for_buyer += (
                    f"\n\nDeal agreed at ${agreed_price:.2f}. "
                )

            if seller_contact_info_to_return and seller_contact_info_to_return.phone:
                close_deal_message_for_buyer += f"The seller has agreed to share their contact information. You can reach them at: {seller_contact_info_to_return.phone}. Please coordinate your meetup."
            else:
                close_deal_message_for_buyer += "Please wait for the seller to contact you via Valora to arrange the meetup."

            # Translate the final message if needed
            if locale != "en":
                close_deal_message_for_buyer = await gcp_services.translate_text_gemini(
                    text_to_translate=close_deal_message_for_buyer, target_language=lang
                )

            ai_message_for_buyer = close_deal_message_for_buyer

            print(
                f"DEAL AGREED and processed for product {product_id}. Price: {agreed_price}"
            )

        except ValueError:
            print(
                f"Error parsing agreed price from AI signal: {deal_signal_match.group(1)}"
            )
            # Proceed without finalizing deal if parsing fails
        except Exception as e:
            print(f"Error during deal finalization: {e}")
            # Proceed without finalizing deal

    # Save AI's (potentially modified) message
    ai_message_db = add_message_to_conversation(
        db=db,
        conversation_id=conversation.id,
        sender_id="VALORA_AI_ASSISTANT",
        sender_type=models.MessageSenderType.AI_ASSISTANT,
        message_text=ai_message_for_buyer,
        message_type=ai_message_type_enum,  # Use the AI's message type
    )
    return ai_message_db, seller_contact_info_to_return, deal_closed_flag


async def get_chat_history_with_greeting(  # Renamed for clarity
    db: Session,
    product_id: int,
    buyer_id: str,
    seller_id: str,
    locale: str,
) -> List[models.ChatMessage]:
    """
    Retrieves chat history. If conversation is new, it creates it with an AI greeting.
    """
    # This function ensures the conversation (and greeting) exists
    conversation = await get_or_create_conversation_with_greeting(
        db=db,
        product_id=product_id,
        buyer_id=buyer_id,
        seller_id=seller_id,
        locale=locale,
    )

    # Fetch all messages for the conversation, ordered
    # The relationship in Conversation model already orders by timestamp
    # For explicit ordering here:
    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.conversation_id == conversation.id)
        .order_by(models.ChatMessage.timestamp.asc())
        .all()
    )
    return messages
