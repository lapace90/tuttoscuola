import React, { createContext, useContext } from 'react';
import { useUnreadMessages } from '../hooks/useUnreadMessages';

const UnreadMessagesContext = createContext({
  totalUnread: 0,
  unreadByChat: {},
  loading: true,
  markChatAsRead: async () => {},
  refresh: async () => {},
  getUnreadCount: () => 0,
});

export const UnreadMessagesProvider = ({ children }) => {
  const unreadMessages = useUnreadMessages();

  return (
    <UnreadMessagesContext.Provider value={unreadMessages}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessagesContext = () => useContext(UnreadMessagesContext);