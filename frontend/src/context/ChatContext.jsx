import { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

const MAX_MESSAGES = 100;

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((role, text) => {
    const msg = {
      id:        crypto.randomUUID(),
      role,      // 'user' | 'bot'
      text,
      timestamp: new Date(),
    };
    setMessages(prev => {
      const next = [...prev, msg];
      // Limite à 100 messages — supprimer les plus anciens
      return next.length > MAX_MESSAGES ? next.slice(next.length - MAX_MESSAGES) : next;
    });
    return msg;
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const toggleChat = useCallback(() => setIsOpen(v => !v), []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setIsOpen(false);
  }, []);

  return (
    <ChatContext.Provider value={{
      messages,
      isOpen,
      isLoading,
      setIsLoading,
      addMessage,
      toggleChat,
      clearHistory,
      clearMessages,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
