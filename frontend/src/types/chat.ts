export type MessageSenderType = 'BUYER' | 'AI_ASSISTANT' | 'SELLER';

export interface ChatMessage {
  id: string;
  conversation_id: number;
  sender_id: string;
  sender_type: MessageSenderType;
  timestamp: string | Date;
  message_text: string;
}

// Payload for sending a new message
export interface ChatMessageCreatePayload {
  product_id: number | string;
  message_text: string;
}