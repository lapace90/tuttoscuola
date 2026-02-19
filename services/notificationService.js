import { supabase } from '../lib/supabase';

/**
 * Configurazione tipi notifica
 */
export const NOTIFICATION_TYPES = {
  message: { icon: 'messageCircle', color: '#8B5CF6', route: 'chat' },
  slot: { icon: 'calendar', color: '#3B82F6', route: 'slot' },
  booking: { icon: 'userCheck', color: '#10B981', route: 'slot' },
  grade: { icon: 'fileText', color: '#F59E0B', route: 'grades' },
  attendance: { icon: 'clipboard', color: '#EF4444', route: null },
  announcement: { icon: 'bell', color: '#6366F1', route: 'announcements' },
  reminder: { icon: 'clock', color: '#EC4899', route: null },
  admin_role: { icon: 'shield', color: '#14B8A6', route: 'profile' },
};

/**
 * Ottieni notifiche utente
 */
export const getNotifications = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .neq('type', 'message')
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data, error };
};

/**
 * Ottieni notifiche non lette
 */
export const getUnreadNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Conta notifiche non lette
 */
export const getUnreadCount = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)
    .neq('type', 'message');

  return { count: count || 0, error };
};

/**
 * Segna notifica come letta
 */
export const markAsRead = async (notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single();

  return { data, error };
};

/**
 * Segna tutte come lette
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
 * Elimina notifica
 */
export const deleteNotification = async (notificationId) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  return { error };
};

/**
 * Elimina tutte le notifiche
 */
export const clearAllNotifications = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);

  return { error };
};

/**
 * Subscribe a notifiche real-time
 */
export const subscribeToNotifications = (userId, onNotification) => {
  const subscription = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNotification(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

/**
 * Formatta tempo relativo
 */
export const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ora';
  if (diffMins < 60) return `${diffMins} min fa`;
  if (diffHours < 24) return `${diffHours}h fa`;
  if (diffDays < 7) return `${diffDays}g fa`;
  
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
};