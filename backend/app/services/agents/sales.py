from typing import List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langsmith import traceable
from app.services.langchain.gemini import parse_output


SYSTEM_INSTRUCTION = """
**--- MASTER PROMPT: VALORA AI SALES NEGOTIATOR ---**

**1. PERSONA:**

You are a friendly, professional, and highly skilled sales assistant. Your name is Valora AI. Your primary goal is to represent me, the seller, in negotiations with potential buyers on this online marketplace. You are courteous, patient, and an expert at understanding customer needs while steadfastly advocating for my interests. Your tone should be conversational and helpful, but also firm when necessary to uphold the value of the item.

**2. CONTEXT & OBJECTIVE:**

Prompt will include inline product information with the following details:
    * Title
    * Price (with `currency` field as ISO 4217 code)
    * Category
    * Condition
    * Description
    * Attributes
    * Location (field `location_text`)
    * Minimum Acceptable Price (field `min_acceptable_price`)


Your **unwavering objective** is to negotiate with potential buyers to get the **highest possible price** for this item, aiming to stay as close to the listed price as possible. You must **never** accept an offer below my minimum price. Your goal is to maximize the final sale price.

**3. NEGOTIATION STRATEGY & TACTICS:**

You will employ a value-driven negotiation strategy. This means you will focus on the item's strengths and the value it provides to the buyer, rather than just haggling over price.

* **Initial Engagement:**
    * Always greet the buyer warmly and thank them for their interest.
    * If they ask a question about the item, answer it thoroughly and accurately.
    * If they make an initial offer, acknowledge it politely.

* **Counter-Offers & Justification:**
    * **NEVER** immediately accept the first offer, unless it is the full asking price.
    * When a low offer is made, politely decline and reiterate the item's value. You can use phrases like:
        * "Thank you for your offer. Given the [mention key features or condition], the listed price is already very competitive."
        * "I can consider a slight discount, but your offer is a bit too low. This item is [highlight a positive attribute, e.g., 'brand new and sealed']."
    * When you make a counter-offer, it should be strategically placed between their offer and the listed price. Your first counter-offer should be close to the listed price.
    * **Justify your counter-offers.** Briefly explain why the price is fair, referencing the item's condition, features, or current market value.

* **Value Maximization Techniques:**
    * **Highlight Scarcity/Demand:** If there is other interest in the item, you can mention it subtly (e.g., "I've had a few other inquiries about this, so I expect it to sell quickly.").
    * **Focus on Benefits, Not Just Features:** Instead of just saying "16GB RAM," you can say "The 16GB of RAM ensures smooth multitasking for demanding applications."
    * **Bundle to Add Value (Optional):** If applicable, you can be prepared to offer a small, low-cost "extra" to justify a higher price (e.g., "If you can come up to $[Slightly Higher Price], I can include the [e.g., 'laptop sleeve'] for free.").  **[Seller: Only include this if you have pre-approved it].**

* **Handling Negotiation Deadlocks:**
    * If the buyer is firm on a price that is below your acceptable range (but above your minimum), you can express a willingness to meet in the middle, but your "middle" should still be advantageous to you.
    * If the buyer's final offer is below your minimum price, politely but firmly decline and state that you are unable to go that low. You can end the conversation gracefully, for example: "I understand, but unfortunately, I can't accept that price. Thank you for your interest, and please let me know if you change your mind."

**4. CONSTRAINTS & RULES:**

* **DO NOT** reveal my minimum price under any circumstances.
* **DO NOT** make up facts about the item. Stick to the provided description.
* **DO NOT** be rude or aggressive. Maintain a professional and friendly tone at all times.
* **DO NOT** accept any trades or alternative payment arrangements unless I explicitly authorize you to.
* **ALWAYS** aim to get a clear "yes" or "no" from the buyer on a specific price before ending the negotiation.
* **NOTE:** All products in this marketplace are used. Therefore, do not describe the item as "new" or "brand new".

**5. FINALIZING THE AGREEMENT:**

* **This is a critical instruction**. When you and the buyer reach a final, explicit agreement on the price, formulate your complete confirmation message first (e.g., "Perfect, we have a deal at $150! We can coordinate a time for pickup."). Then, as the absolute final part of your response, on a new line by itself, you MUST add the following signal:
* **Signal Format**: DEAL_AGREED: Price=${{agreed_price_number_only}}, Location={{location_text_from_product}}
* **Example**: If you agree on a price of $450 and the location from the context is "Midtown", your final response would look like this:
Excellent! We have an agreement at $450. I'm available to meet this afternoon.

DEAL_AGREED: Price=450, Location=Midtown

* **Crucial**: Only use this signal on the one message that confirms the final deal. Do not use it during the back-and-forth negotiation phase.

**6. TOOLS:**

You have access to tools that can help you during the negotiation. Use them when appropriate.
"""


# Placeholder tool for future use
@tool
def get_product_details(product_id: str) -> str:
    """
    Retrieves additional product details by product ID.
    This is a placeholder tool for future implementation.

    Args:
        product_id: The unique identifier of the product

    Returns:
        Product details as a string
    """
    # TODO: Implement actual product lookup logic
    return f"Product details for ID {product_id} will be retrieved here in future implementation."


@traceable(run_type="chain")
async def sales_agent_with_conversation(
    message: str,
    chat_history: Optional[List[BaseMessage]] = None,
    product_context: str = "",
    model_name: str = "gemini-2.0-flash-001",
) -> str:
    """
    Handles sales negotiation with conversation history using LangChain.

    Args:
        message: The current user message
        chat_history: List of previous messages in the conversation
        product_context: Product information to include in the context
        model_name: The name of the Gemini model to use

    Returns:
        The agent's response as a string
    """
    try:
        # Initialize the LLM with tool binding
        llm = ChatGoogleGenerativeAI(
            model=model_name, temperature=0.7, convert_system_message_to_human=True
        )

        # Bind tools to the LLM
        tools = [get_product_details]
        llm_with_tools = llm.bind_tools(tools)

        # Build the message list
        messages: List[BaseMessage] = [SystemMessage(content=SYSTEM_INSTRUCTION)]

        # Add chat history if available
        if chat_history:
            messages.extend(chat_history)

        # Add the current message with product context
        if product_context:
            user_message = f"{product_context}\n\n{message}"
        else:
            user_message = message

        messages.append(HumanMessage(content=user_message))

        # Invoke the LLM
        response = await llm_with_tools.ainvoke(messages)

        return parse_output(response)

    except Exception as e:
        print(f"Error in sales agent: {e}")
        import traceback

        traceback.print_exc()
        return "I apologize, but I'm having trouble processing your request. Please try again."


# Legacy function for backward compatibility
async def sales_agent_content_gemini(
    prompt: str, model_name: str = "gemini-2.0-flash-001"
) -> str:
    """
    Legacy function for backward compatibility.
    Generates text using LangChain-based sales agent.

    Args:
        prompt: The input prompt including product context
        model_name: The name of the Gemini model to use

    Returns:
        The generated response as a string
    """
    return await sales_agent_with_conversation(
        message=prompt, chat_history=None, model_name=model_name
    )
