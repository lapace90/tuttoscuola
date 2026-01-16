import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useUnreadMessages = () => {
  const { profile } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadByChat, setUnreadByChat] = useState({});
  const [loading, setLoading] = useState(true);

  const loadUnreadCounts = useCallback(async () => {
    if (!profile?.id) return;

    try {
      // Récupérer tous les chats de l'utilisateur avec last_read_at
      const { data: memberships } = await supabase
        .from('chat_members')
        .select('chat_id, last_read_at')
        .eq('user_id', profile.id);

      if (!memberships) {
        setLoading(false);
        return;
      }

      let total = 0;
      const byChat = {};

      // Pour chaque chat, compter les messages non lus
      for (const membership of memberships) {
        const lastRead = membership.last_read_at || '1970-01-01';

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', membership.chat_id)
          .neq('sender_id', profile.id)
          .gt('created_at', lastRead);

        const unreadCount = count || 0;
        if (unreadCount > 0) {
          byChat[membership.chat_id] = unreadCount;
          total += unreadCount;
        }
      }

      setUnreadByChat(byChat);
      setTotalUnread(total);
    } catch (error) {
      console.error('Error loading unread counts:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  // Marquer un chat comme lu
  const markChatAsRead = useCallback(async (chatId) => {
    if (!profile?.id) return;

    const { error } = await supabase
      .from('chat_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .eq('user_id', profile.id);

    if (!error) {
      // Mise à jour optimiste
      setUnreadByChat(prev => {
        const newByChat = { ...prev };
        const chatUnread = newByChat[chatId] || 0;
        delete newByChat[chatId];
        setTotalUnread(t => Math.max(0, t - chatUnread));
        return newByChat;
      });
    }

    return { error };
  }, [profile?.id]);

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    if (!profile?.id) return;

    loadUnreadCounts();

    // Subscribe aux nouveaux messages
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new;
          
          // Si ce n'est pas mon message, incrémenter
          if (newMessage.sender_id !== profile.id) {
            setUnreadByChat(prev => ({
              ...prev,
              [newMessage.chat_id]: (prev[newMessage.chat_id] || 0) + 1,
            }));
            setTotalUnread(t => t + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, loadUnreadCounts]);

  return {
    totalUnread,
    unreadByChat,
    loading,
    markChatAsRead,
    refresh: loadUnreadCounts,
    getUnreadCount: (chatId) => unreadByChat[chatId] || 0,
  };
};