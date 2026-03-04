import json
from typing import List, Dict
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from app.db.models import Product as ProductModel, MessageSenderType, MessageType
from app.services.agents.sales import sales_agent_with_conversation


def _build_product_context(product: ProductModel, locale: str = "en") -> str:
    """
    Builds a comprehensive product context string for the AI agent.

    Args:
        product: The product model instance
        locale: The language locale (default: "en")

    Returns:
        Formatted product context string
    """
    lang = "Hebrew" if locale == "he" else "English"
    context_parts = [f"Respond in language: {lang}"]
    context_parts.append("\n--- Product Information ---")
    context_parts.append(f"Title: {product.title}")
    context_parts.append(f"Listed Price: {product.price:.2f} {product.currency}")

    if product.category and product.category.name_en:
        context_parts.append(f"Category: {product.category.name_en}")

    if product.condition:
        context_parts.append(f"Condition: {product.condition}")

    if product.description:
        context_parts.append(f"Description: {product.description}")

    if product.location_text:
        context_parts.append(f"Location: {product.location_text}")

    # Add seller's negotiation guidelines
    context_parts.append("\n--- Seller's Guidelines ---")
    if product.min_acceptable_price is not None:
        context_parts.append(
            f"Minimum Acceptable Price: {product.min_acceptable_price:.2f} {product.currency}"
        )

    if product.negotiation_notes_for_ai:
        context_parts.append(f"Seller's Notes: {product.negotiation_notes_for_ai}")

    return "\n".join(context_parts)


def _convert_history_to_messages(conversation_history: List[Dict]) -> List[BaseMessage]:
    """
    Converts conversation history from dict format to LangChain message objects.

    Args:
        conversation_history: List of message dictionaries

    Returns:
        List of LangChain BaseMessage objects
    """
    messages: List[BaseMessage] = []

    for msg_data in conversation_history:
        if msg_data["sender_type"] == MessageSenderType.BUYER:
            messages.append(HumanMessage(content=msg_data["text"]))
        else:  # AI or SELLER
            messages.append(AIMessage(content=msg_data["text"]))

    return messages


async def generate_initial_ai_greeting(product: ProductModel, locale: str) -> str:
    """
    Generates an initial greeting message from the AI when a buyer starts a chat.
    """
    lang = "Hebrew" if locale == "he" else "English"

    # Build product context
    product_context = _build_product_context(product, locale)

    # Build the greeting request message
    message = f"""A buyer has just started a chat about this item. Generate a welcoming greeting message in {lang}.

Your greeting should:
- Welcome the buyer warmly
- Introduce yourself as Valora AI
- Mention the item they're interested in
- Offer to help with questions and price discussion
- Keep it concise and friendly

Example format: "👋 Hi there! I'm Valora AI, your assistant for the \"{product.title}\". I can answer questions about it and help with price or meetup details in {product.location_text}. How can I help you today?"

Provide ONLY the greeting message, nothing else."""

    print(f"DEBUG: Generating initial greeting for product: {product.title}")

    # Use the new LangChain agent with conversation
    ai_greeting_text = await sales_agent_with_conversation(
        message=message,
        chat_history=None,
        product_context=product_context,
        model_name="gemini-2.0-flash-001",
    )

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
    Generates an AI response for the chat using the LangChain sales agent.
    """
    lang = "Hebrew" if locale == "he" else "English"

    # Build product context
    product_context = _build_product_context(product, locale)

    # Convert conversation history to LangChain messages
    # Take only the last 10 messages to avoid context overflow
    recent_history = (
        conversation_history[-10:]
        if len(conversation_history) > 10
        else conversation_history
    )
    chat_history = _convert_history_to_messages(recent_history)

    # Build the current buyer message with instructions for structured output
    message_types = [e.value for e in MessageType]
    buyer_message = f"""{buyer_message_text}

--- IMPORTANT INSTRUCTIONS ---
You must respond with VALID JSON containing exactly two keys: 'message_text' and 'message_type'.

The 'message_type' must be one of: {', '.join(message_types)}

Guidelines for message_type selection:
- GREETING: For initial messages or re-greetings
- CONDITION_QUESTION: When buyer asks about item condition
- LOCATION_QUESTION: When buyer asks about location or meetup
- OFFER_PROPOSED: When buyer makes a price offer
- OFFER_ACCEPTED: When you accept their offer
- OFFER_REJECTED: When you decline their offer
- CLOSED_DEAL: When a deal is finalized (include "DEAL_AGREED: Price=X, Location=Y" in message_text)
- GENERAL: For other questions or conversation
- UNAVAILABLE_PRODUCT: If product is no longer available

Response format:
{{
    "message_text": "your response here",
    "message_type": "one of the types above"
}}

Respond ONLY with the JSON object, nothing else."""

    print(f"DEBUG: Generating AI response for product: {product.title}")
    print(f"DEBUG: Buyer message: {buyer_message_text}")
    print(f"DEBUG: History length: {len(chat_history)} messages")

    # Use the new LangChain agent with conversation history
    ai_generated_text = await sales_agent_with_conversation(
        message=buyer_message,
        chat_history=chat_history,
        product_context=product_context,
        model_name="gemini-2.0-flash-001",
    )

    print(f"DEBUG: AI Generated Text:\n{ai_generated_text}\n--------------------")

    if not ai_generated_text:
        # Fallback response if generation fails
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
