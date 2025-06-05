'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HandshakeIcon, Loader, SendHorizonalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-context';
import { ChatMessage } from '@/types/chat';
import { getChatHistoryAPI, sendChatMessageAPI } from '@/services/api/chat';
import Message from '@/components/ui/message';
import { useChatContext } from './chat-context';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useI18nContext } from '@/components/locale-context';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { t } = useI18nContext();
  const { product } = useChatContext();
  const { currentUser, firebaseIdToken } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null); // For auto-scrolling
  const inputRef = useRef<HTMLInputElement>(null); // Reference to the input field

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]); // Scroll when messages change

  // Fetch chat history
  useEffect(() => {
    if (product && currentUser && firebaseIdToken) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        setError(null);
        try {
          const history = await getChatHistoryAPI(product!.id, firebaseIdToken);
          setMessages(history);
        } catch (err: any) {
          console.error("Failed to fetch chat history:", err);
          setError(err.message || t("chat.couldNotLoadHistory"));
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [product, currentUser, firebaseIdToken, t]);


  const handleSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !product || !currentUser || !firebaseIdToken || isSendingMessage) return;

    const optimisticUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`, // Temporary ID for optimistic update
      conversation_id: 0, // Will be set by backend if needed for display
      sender_id: currentUser.uid,
      sender_type: 'BUYER',
      message_text: newMessage,
      message_type: 'GENERAL',
      timestamp: new Date().toISOString(),
    };

    setMessages(prevMessages => [...prevMessages, optimisticUserMessage]);
    const messageToSend = newMessage;
    setNewMessage('');
    setIsSendingMessage(true);
    setError(null);

    try {
      const aiResponse = await sendChatMessageAPI({ product_id: product.id, message_text: messageToSend }, firebaseIdToken);
      setMessages(prevMessages => {
        // Replace optimistic message or just add AI response
        // For simplicity, just adding AI response. A more robust solution would replace.
        return [...prevMessages.filter(msg => msg.id !== optimisticUserMessage.id), optimisticUserMessage, aiResponse];
      });
    } catch (err: any) {
      console.error("Failed to send message or get AI response:", err);
      setError(err.message || t("chat.couldNotSendMessage"));
      // Optionally, add the user's message back to input or mark as failed
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== optimisticUserMessage.id)); // Remove optimistic
    } finally {
      setIsSendingMessage(false);
      // Focus the input field after sending the message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <>
      {/* Chat Header */}
      {product && (
        <div className="bg-white dark:bg-slate-800 p-4 shadow-md border-b border-slate-200 dark:border-slate-700 flex items-center space-x-3 rtl:space-x-reverse md:rounded-t-xl">
          <Avatar>
            <AvatarImage
              src="/images/valora-ai-avatar.webp"
              alt={t("chat.valoraAIAlt")}
              width={40}
              height={40}
              className="rounded-full"
            />
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t("chat.valoraAITitle")}</h2>
            <p className="text-xs text-green-500 dark:text-green-400">{t("chat.valoraAIOnline")}</p>
          </div>
        </div>
      )}

      {/* Message List Area */}
      <div className="chat-messages flex-grow overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-800 shadow-md">
        {isLoadingHistory && <p className="text-center text-gray-500">{t("chat.loadingHistory")}</p>}
        {error && !isLoadingHistory && <Message type="error" message={error} onClose={() => setError(null)} />}
        {!isLoadingHistory && messages.length === 0 && !error && (
          <p className="text-center text-gray-500">{t("chat.noMessagesYet")}</p>
        )}
        {messages.map((msg, index) => {
          const isBuyer = msg.sender_type === 'BUYER';
          const closeDeal = msg.message_type === 'CLOSED_DEAL';
          return (
            <div key={msg.id || index} className={cn("flex relative", isBuyer ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                "max-w-[70%] p-3 rounded-lg shadow",
                isBuyer
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none',
                {
                  "bg-green-100 text-green-800 border-e-4 border-green-500": closeDeal && !isBuyer,
                }
              )}>
                <p className="text-sm">{msg.message_text}</p>
                <p className={cn("text-xs mt-1 flex justify-between", isBuyer ? 'text-blue-200' : 'text-gray-500')}>
                  {closeDeal && !isBuyer && (
                    <HandshakeIcon className="w-5 h-5" strokeWidth={1} />
                  )}
                  <span className="ms-auto">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 shadow-md border-t border-slate-200 md:rounded-b-xl">
        <form onSubmit={handleSendMessage}>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t("chat.typeMessagePlaceholder")}
              className="flex-grow p-2 border-0"
              autoComplete="off"
            />
            <Button type="submit" className="rounded-full w-10 h-10" disabled={isSendingMessage || !newMessage.trim()}>
              {isSendingMessage && <Loader className="animate-spin" />}
              {!isSendingMessage && <SendHorizonalIcon className="rtl:rotate-180" />}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}