import json
from typing import List, Dict
from app.db.models import Product as ProductModel, MessageSenderType, MessageType
from app.services.agents.sales import sales_agent_content_gemini


async def generate_initial_ai_greeting(product: ProductModel, locale: str) -> str:
    """
    Generates an initial greeting message from the AI when a buyer starts a chat.
    """
    lang = "Hebrew" if locale == "he" else "English"
    prompt_parts = [
        # "You are Valora AI, a friendly and helpful assistant for a marketplace selling used goods. "
        # "A buyer has just started a chat to inquire about an item. "
        # "Your goal is to greet the buyer, introduce yourself, mention the item they are interested in, "
        # "and briefly explain what you can help with (answer questions, discuss price/terms for an in-person exchange). "
        # "Keep it welcoming, concise, and clear."
        f"Respond with the greeting message in language: {lang}."
        # f"{lang}. "
        # "Do not include any additional instructions or system prompts in your response."
    ]
    prompt_parts.append("\n--- Product Information ---")
    prompt_parts.append(f"Item: {product.title}")
    prompt_parts.append(f"Listed Price: ${product.price:.2f}")
    if product.location_text:
        prompt_parts.append(f"Item Location: {product.location_text}")

    prompt_parts.append("\n--- Your Greeting Task ---")
    prompt_parts.append(
        "Craft a greeting message to the buyer. Example: '👋 Hi there! I'm Valora AI, your assistant for the \"{Product Title}\". I can answer questions about it and help with price or meetup details in {Product Location}. How can I help you today?'"
    )
    prompt_parts.append("Your response should be just the greeting message itself.")
    prompt_parts.append("\nAI Greeting:")

    full_prompt = "\n".join(prompt_parts)

    print(
        f"DEBUG: AI Prompt for Initial Greeting:\n{full_prompt}\n--------------------"
    )

    ai_greeting_text = await sales_agent_content_gemini(prompt=full_prompt)

    if not ai_greeting_text:
        # Fallback greeting if Gemini fails
        return f'Hello! I\'m Valora AI, your assistant for the "{product.title}". Feel free to ask any questions about the item or discuss the price. How can I help?'

    return ai_greeting_text.strip()


async def generate_ai_response(
    product: ProductModel,
    conversation_history: List[Dict],
    buyer_message_text: str,
    locale: str,
) -> Dict[str, str]:  # Return a dictionary with text and type
    """
    Generates an AI response for the chat using Gemini.
    """
    lang = "Hebrew" if locale == "he" else "English"
    # 1. Construct the prompt for Gemini
    # System Message / Role
    prompt_parts = [
        #     "You are Valora AI, a helpful, polite, and efficient assistant representing the seller of a used item. "
        #     "Your goal is to answer buyer questions accurately based on the product information and engage in "
        #     "fair negotiation if the buyer discusses price or terms for an in-person exchange. "
        f"Respond with the greeting message in language: {lang}"
        #     f"{lang}. "
        #     "Be concise and friendly."
    ]

    # Product Context
    prompt_parts.append("\n--- Product Information ---")
    prompt_parts.append(f"Item: {product.title}")
    prompt_parts.append(f"Listed Price: {product.price:.2f} {product.currency}")
    if product.category.name_en:
        prompt_parts.append(f"Category: {product.category.name_en}")
    if product.description:
        prompt_parts.append(f"Description: {product.description}")
    if product.location_text:
        prompt_parts.append(f"Item Location: {product.location_text}")

    # Seller's Negotiation Guidelines (from Product model)
    prompt_parts.append("\n--- Seller's Guidelines ---")
    if product.min_acceptable_price is not None:
        prompt_parts.append(
            f"The seller might consider offers, but the absolute minimum price is ${product.min_acceptable_price:.2f}."
        )
        prompt_parts.append(
            "If the buyer offers below this, politely decline or steer them towards the minimum price."
        )
    else:
        prompt_parts.append(
            "The seller is generally looking for the listed price but might be open to reasonable discussion."
        )

    if product.negotiation_notes_for_ai:
        prompt_parts.append(
            f"Additional notes from seller for you (the AI): {product.negotiation_notes_for_ai}"
        )

    prompt_parts.append(
        "When discussing price, if you make a counter-offer, state it clearly."
    )
    prompt_parts.append("If a price is agreed, confirm the agreed price and item.")
    prompt_parts.append(
        f"For meetups, suggest a safe public place within '{product.location_text}'. Do not arrange specific times, just general availability like 'weekdays' or 'weekends' if mentioned in seller notes."
    )
    prompt_parts.append(
        "If you cannot answer a specific question or if the buyer asks something beyond your capability (e.g., to see more photos not in the listing, or very specific personal seller details), politely state that you'll need to ask the seller or that some details are best discussed directly if they proceed with the purchase."
    )
    prompt_parts.append("Keep your responses relatively short and to the point.")

    # Conversation History
    if conversation_history:
        prompt_parts.append("\n--- Conversation History (Last 5 exchanges) ---")
        for msg_data in conversation_history[-10:]:  # Max 5 buyer + 5 AI messages
            role = (
                "Buyer"
                if msg_data["sender_type"] == MessageSenderType.BUYER
                else "You (Valora AI)"
            )
            prompt_parts.append(f"{role}: {msg_data['text']}")

    # Buyer's Current Message
    prompt_parts.append("\n--- Current Interaction ---")
    prompt_parts.append(f"Buyer: {buyer_message_text}")

    # Instruction for structured output and message type classification
    message_types = [e.value for e in MessageType]
    prompt_parts.append("\n--- Response Format ---")
    prompt_parts.append(
        f"Respond ONLY with a JSON object containing two keys: 'message_text' (string) and 'message_type' (string)."
    )
    prompt_parts.append(
        f"The 'message_type' must be one of the following values: {', '.join(message_types)}."
    )
    prompt_parts.append(
        "Analyze the buyer's message and the conversation history to determine the most appropriate message type for your response."
    )
    prompt_parts.append(
        "Crucially, If a deal is agreed upon, include the signal 'DEAL_AGREED: Price=X.XX, Location=...' within the 'message_text' and set 'message_type' to 'CLOSED_DEAL'."
    )
    prompt_parts.append(
        "If the buyer asks about condition, use 'CONDITION_QUESTION'. If about location, use 'LOCATION_QUESTION'. If they propose an offer, use 'OFFER_PROPOSED'. If you accept an offer, use 'OFFER_ACCEPTED'. If you reject, use 'OFFER_REJECTED'. For general conversation, use 'GENERAL'. For the initial AI message, use 'GREETING'. If the product is unavailable, use 'UNAVAILABLE_PRODUCT'."
    )
    prompt_parts.append("Ensure the JSON is valid and contains only these two keys.")
    prompt_parts.append("\nAI Response (JSON):")

    full_prompt = "\n".join(prompt_parts)

    print(
        f"DEBUG: AI Prompt for Gemini:\n{full_prompt}\n--------------------"
    )  # For debugging

    # 2. Call Gemini API (using the existing gcp_services function)
    ai_generated_text = await sales_agent_content_gemini(prompt=full_prompt)
    print(f"DEBUG: AI Generated Text:\n{ai_generated_text}\n--------------------")
    # 3. Parse the JSON response
    if not ai_generated_text:
        # Fallback response if Gemini fails or returns empty
        return {
            "message_text": "I'm having a little trouble connecting right now. Could you please try asking that again in a moment?",
            "message_type": MessageType.GENERAL.value,
        }

    try:
        # Clean the response to ensure it's just the JSON block
        json_string = ai_generated_text.strip()
        if json_string.startswith("```json"):
            json_string = json_string[len("```json") :].strip()
        if json_string.endswith("```"):
            json_string = json_string[: -len("```")].strip()

        response_data = json.loads(json_string)

        # Validate the structure and types
        if (
            isinstance(response_data, dict)
            and "message_text" in response_data
            and "message_type" in response_data
        ):
            # Ensure message_type is one of the valid enum values
            if response_data["message_type"] in message_types:
                return response_data
            else:
                print(
                    f"AI returned invalid message_type: {response_data['message_type']}. Defaulting type to GENERAL."
                )
                response_data["message_type"] = MessageType.GENERAL.value
                return response_data
        else:
            print(
                f"AI response is not a valid JSON object with 'message_text' and 'message_type': {ai_generated_text}"
            )
            # Fallback if JSON structure is wrong
            return {
                "message_text": ai_generated_text.strip(),
                "message_type": MessageType.GENERAL.value,
            }

    except json.JSONDecodeError as e:
        print(f"Failed to decode AI response JSON: {ai_generated_text}. Error: {e}")
        # Fallback if JSON is invalid
        return {
            "message_text": ai_generated_text.strip(),
            "message_type": MessageType.GENERAL.value,
        }
    except Exception as e:
        print(f"An unexpected error occurred processing AI response: {e}")
        # Fallback for any other error
        return {
            "message_text": ai_generated_text.strip(),
            "message_type": MessageType.GENERAL.value,
        }
