"use client";

import { Product } from '@/types/product';
import { createContext, useContext } from 'react';

interface ChatContextType {
  product: Product | null;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChatContext(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within an ChatContextProvider');
  }
  return context;
}

export function ChatContextProvider({ children, product }: { children: React.ReactNode; product: Product }) {
  return (
    <ChatContext.Provider value={{ product }}>
      {children}
    </ChatContext.Provider>
  );
}
