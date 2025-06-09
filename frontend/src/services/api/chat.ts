import { ChatMessage, ChatMessageCreatePayload, Conversation } from "@/types/chat";
import apiClient from "./client";

/**
 * Fetches the chat history for a given product and the authenticated buyer.
 * @param productId - The ID of the product related to the chat.
 * @param token - The Firebase ID token for authentication.
 * @returns Promise<ChatMessage[]>
 */
export const getChatHistoryAPI = async (productId: string | number, token: string): Promise<Conversation> => {
  try {
    const response = await apiClient.get<Conversation>(`/chat/history/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: Error | any) {
    console.error(`Error fetching chat history for product ${productId}:`, error.message);
    throw error;
  }
};

/**
 * Sends a new chat message from the buyer to the AI assistant regarding a product.
 * @param payload - The message creation payload (productId, messageText).
 * @param token - The Firebase ID token for authentication.
 * @returns Promise<ChatMessage> - The AI's response message.
 */
export const sendChatMessageAPI = async (payload: ChatMessageCreatePayload, token: string): Promise<ChatMessage> => {
  try {
    const response = await apiClient.post<ChatMessage>('/chat/send_message', payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};