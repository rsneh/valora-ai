from typing import List, Dict
from app.db.models import Product as ProductModel, MessageSenderType
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
    conversation_history: List[
        Dict
    ],  # List of {"sender_type": "buyer/ai_assistant", "text": "message"}
    buyer_message_text: str,
    locale: str,
    # seller_negotiation_params: Optional[Dict] = None # For future use
) -> str:
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
    # prompt_parts.append("\n--- Seller's Guidelines ---")
    # if product.min_acceptable_price is not None:
    #     prompt_parts.append(
    #         f"The seller might consider offers, but the absolute minimum price is ${product.min_acceptable_price:.2f}."
    #     )
    #     prompt_parts.append(
    #         "If the buyer offers below this, politely decline or steer them towards a higher offer."
    #     )
    # else:
    #     prompt_parts.append(
    #         "The seller is generally looking for the listed price but might be open to reasonable discussion."
    #     )

    # if product.negotiation_notes_for_ai:
    #     prompt_parts.append(
    #         f"Additional notes from seller for you (the AI): {product.negotiation_notes_for_ai}"
    #     )

    # prompt_parts.append(
    #     "When discussing price, if you make a counter-offer, state it clearly."
    # )
    # prompt_parts.append("If a price is agreed, confirm the agreed price and item.")
    # prompt_parts.append(
    #     f"For meetups, suggest a safe public place within '{product.location_text}'. Do not arrange specific times, just general availability like 'weekdays' or 'weekends' if mentioned in seller notes."
    # )
    # prompt_parts.append(
    #     "If you cannot answer a specific question or if the buyer asks something beyond your capability (e.g., to see more photos not in the listing, or very specific personal seller details), politely state that you'll need to ask the seller or that some details are best discussed directly if they proceed with the purchase."
    # )
    # prompt_parts.append("Keep your responses relatively short and to the point.")

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
    prompt_parts.append("You (Valora AI):")  # AI will complete this

    full_prompt = "\n".join(prompt_parts)

    print(
        f"DEBUG: AI Prompt for Gemini:\n{full_prompt}\n--------------------"
    )  # For debugging

    # 2. Call Gemini API (using the existing gcp_services function)
    ai_generated_text = await sales_agent_content_gemini(prompt=full_prompt)

    if not ai_generated_text:
        # Fallback response if Gemini fails or returns empty
        return "I'm having a little trouble connecting right now. Could you please try asking that again in a moment?"

    return ai_generated_text.strip()
