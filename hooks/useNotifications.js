// hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getNotifications, 
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  NOTIFICATION_TYPES
} from '../services/notificationService';

export const useNotifications = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!profile?.id) return;

    const { data } = await getNotifications(profile.id);
    if (data) {
      setNotifications(data);
    }
    setLoading(false);
  }, [profile?.id]);

  const loadUnreadCount = useCallback(async () => {
    if (!profile?.id) return;

    const { count } = await getUnreadCount(profile.id);
    setUnreadCount(count);
  }, [profile?.id]);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [loadNotifications, loadUnreadCount]);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([loadNotifications(), loadUnreadCount()]);
    setRefreshing(false);
  };

  const markRead = async (notificationId) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));

    const { error } = await markAsRead(notificationId);
    
    if (error) {
      // Rollback on error
      await loadNotifications();
      await loadUnreadCount();
    }
  };

  const markAllRead = async () => {
    if (!profile?.id) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    const { error } = await markAllAsRead(profile.id);
    
    if (error) {
      await loadNotifications();
      await loadUnreadCount();
    }
  };

  const remove = async (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (!notification?.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    const { error } = await deleteNotification(notificationId);
    
    if (error) {
      await loadNotifications();
      await loadUnreadCount();
    }
  };

  const getTypeConfig = (type) => {
    return NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.general;
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return {
    notifications,
    unreadNotifications,
    readNotifications,
    unreadCount,
    loading,
    refreshing,
    refresh,
    markRead,
    markAllRead,
    remove,
    getTypeConfig
  };
};