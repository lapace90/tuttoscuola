import { supabase } from '../lib/supabase';

/**
 * Get user notifications
 */
export const getNotifications = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  return { count: count || 0, error };
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  return { error };
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  return { error };
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  return { error };
};

/**
 * Create notification (for internal use)
 */
export const createNotification = async ({ userId, type, title, body, data }) => {
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      body,
      data: data || {},
      read: false
    })
    .select()
    .single();

  return { data: notification, error };
};

/**
 * Send notification to multiple users
 */
export const sendBulkNotifications = async (userIds, { type, title, body, data }) => {
  const notifications = userIds.map(userId => ({
    user_id: userId,
    type,
    title,
    body,
    data: data || {},
    read: false
  }));

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  return { error };
};

/**
 * Get notification types config
 */
export const NOTIFICATION_TYPES = {
  announcement: {
    icon: 'bell',
    color: '#3B82F6', // blue
    route: '/(main)/announcements'
  },
  homework: {
    icon: 'book',
    color: '#F59E0B', // amber
    route: '/(main)/homework'
  },
  grade: {
    icon: 'fileText',
    color: '#10B981', // green
    route: '/(main)/grades'
  },
  message: {
    icon: 'messageCircle',
    color: '#8B5CF6', // purple
    route: '/(main)/chat'
  },
  attendance: {
    icon: 'checkCircle',
    color: '#EF4444', // red
    route: '/(main)/attendance'
  },
  general: {
    icon: 'info',
    color: '#6B7280', // gray
    route: null
  }
};