import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useUnreadMessages = () => {
  const { profile } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadByChat, setUnreadByChat] = useState({});
  const [loading, setLoading] = useState(true);
  const chatIdsRef = useRef(new Set());

  const loadUnreadCounts = useCallback(async () => {
    if (!profile?.id) return;

    try {
      // 1. Get all memberships with last_read_at
      const { data: memberships } = await supabase
        .from('chat_members')
        .select('chat_id, last_read_at')
        .eq('user_id', profile.id);

      if (!memberships || memberships.length === 0) {
        setLoading(false);
        return;
      }

      const chatIds = memberships.map(m => m.chat_id);
      chatIdsRef.current = new Set(chatIds);

      // 2. Single query: get all messages from others in all chats
      const { data: messages } = await supabase
        .from('messages')
        .select('chat_id, created_at')
        .in('chat_id', chatIds)
        .neq('sender_id', profile.id)
        .order('created_at', { ascending: false });

      if (!messages) {
        setLoading(false);
        return;
      }

      // 3. Build last_read_at map
      const lastReadMap = {};
      for (const m of memberships) {
        lastReadMap[m.chat_id] = m.last_read_at || '1970-01-01';
      }

      // 4. Count unread per chat client-side
      let total = 0;
      const byChat = {};
      for (const msg of messages) {
        if (msg.created_at > lastReadMap[msg.chat_id]) {
          byChat[msg.chat_id] = (byChat[msg.chat_id] || 0) + 1;
          total++;
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

  const markChatAsRead = useCallback(async (chatId) => {
    if (!profile?.id) return;

    const { error } = await supabase
      .from('chat_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .eq('user_id', profile.id);

    if (!error) {
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

  useEffect(() => {
    if (!profile?.id) return;

    loadUnreadCounts();

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

          if (newMessage.sender_id !== profile.id && chatIdsRef.current.has(newMessage.chat_id)) {
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
