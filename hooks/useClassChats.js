import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useClassChats = () => {
  const { profile } = useAuth();
  const [classChats, setClassChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClassChats = useCallback(async () => {
    if (!profile?.id) return;

    // Get existing class chats where user is a member
    const { data, error } = await supabase
      .from('chat_members')
      .select(`
        chat:chats!inner(
          id,
          type,
          name,
          class_id,
          class:classes(id, name)
        )
      `)
      .eq('user_id', profile.id);

    if (!error && data) {
      const chats = data
        .filter(item => item.chat?.type === 'class')
        .map(item => ({
          id: item.chat.id,
          name: item.chat.name || `Classe ${item.chat.class?.name || ''}`,
          type: 'class',
          class_id: item.chat.class_id
        }));
      
      setClassChats(chats);
    }
    
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    loadClassChats();
  }, [loadClassChats]);

  const refresh = async () => {
    setLoading(true);
    await loadClassChats();
  };

  return {
    classChats,
    loading,
    refresh,
    hasClassChats: classChats.length > 0
  };
};