import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getUnreadCount, 
  getNotifications, 
  markAsRead, 
  markAllAsRead,
  subscribeToNotifications 
} from '../services/notificationService';

const NotificationsContext = createContext({});

export const NotificationsProvider = ({ children }) => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Carica notifiche
  const loadNotifications = useCallback(async () => {
    if (!profile?.id) return;

    const [notifResult, countResult] = await Promise.all([
      getNotifications(profile.id, 50),
      getUnreadCount(profile.id)
    ]);

    if (notifResult.data) {
      setNotifications(notifResult.data);
    }
    if (countResult.count !== undefined) {
      setUnreadCount(countResult.count);
    }
    setLoading(false);
  }, [profile?.id]);

  // Carica al mount e quando cambia profile
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Subscribe a real-time
  useEffect(() => {
    if (!profile?.id) return;

    const subscription = subscribeToNotifications(profile.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.id]);

  // Segna come letta
  const markNotificationAsRead = async (notificationId) => {
    const { error } = await markAsRead(notificationId);
    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return { error };
  };

  // Segna tutte come lette
  const markAllNotificationsAsRead = async () => {
    if (!profile?.id) return;
    
    const { error } = await markAllAsRead(profile.id);
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
    return { error };
  };

  // Refresh manuale
  const refresh = async () => {
    setLoading(true);
    await loadNotifications();
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refresh,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);