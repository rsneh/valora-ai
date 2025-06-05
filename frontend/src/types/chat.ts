export type MessageSenderType = 'BUYER' | 'AI_ASSISTANT' | 'SELLER';

export type MessageType = "GREETING" | "GENERAL" | "QUESTION" | "OFFER_PROPOSED" | "OFFER_ACCEPTED" | "OFFER_REJECTED"
  | "CONDITION_QUESTION"
  | "LOCATION_QUESTION"
  | "QUESTION_TO_SELLER"
  | "CLOSED_DEAL"
  | "UNAVAILABLE_PRODUCT";

export type ConversationStatus = 'ACTIVE' | 'CLOSED_DEAL' | 'ARCHIVED';

export interface ChatMessage {
  id: string;
  conversation_id: number;
  sender_id: string;
  sender_type: MessageSenderType;
  timestamp: string | Date;
  message_text: string;
  message_type: MessageType;
}

// Payload for sending a new message
export interface ChatMessageCreatePayload {
  product_id: number | string;
  message_text: string;
}

export interface Conversation {
  id: number;
  product_id: number;
  buyer_id: string;
  seller_id: string;
  status: ConversationStatus;
  messages: ChatMessage[];
}