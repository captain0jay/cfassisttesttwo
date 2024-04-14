import React, { createContext, useContext, ReactNode } from "react";

const ChatContext = createContext<any[]>([]);

interface ConvoItem {
  index: number;
  you: string;
  cfassist: string;
}

interface ChatContextProviderProps {
  value: ConvoItem[];
  children: ReactNode; // Define children prop as ReactNode
}

export const ChatContextProvider: React.FC<ChatContextProviderProps> = ({
  children,
  value,
}) => {
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  return useContext(ChatContext);
};
