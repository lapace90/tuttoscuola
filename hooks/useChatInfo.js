import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export const useChatInfo = (chatId, userId) => {
  const [chatInfo, setChatInfo] = useState(null);
  const [otherMember, setOtherMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [othersLastRead, setOthersLastRead] = useState(null);

  useEffect(() => {
    if (chatId && userId) {
      loadChatInfo();
    }
  }, [chatId, userId]);

  // Sottoscrizione realtime per aggiornamenti last_read_at
  useEffect(() => {
    if (!chatId || !userId) return;

    const channel = supabase
      .channel(`read-status-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_members',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          loadOthersLastRead();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, userId]);

  const loadOthersLastRead = useCallback(async () => {
    if (!chatId || !userId) return;

    const { data } = await supabase
      .from('chat_members')
      .select('user_id, last_read_at')
      .eq('chat_id', chatId)
      .neq('user_id', userId);

    if (data && data.length > 0) {
      // Il timestamp minimo: se tutti hanno letto fino a quel momento,
      // tutti i messaggi prima di quel momento sono "letti da tutti"
      const readTimes = data
        .map(m => m.last_read_at)
        .filter(Boolean)
        .map(t => new Date(t).getTime());

      if (readTimes.length === data.length && readTimes.length > 0) {
        setOthersLastRead(new Date(Math.min(...readTimes)));
      } else {
        setOthersLastRead(null);
      }
    }
  }, [chatId, userId]);

  const loadChatInfo = async () => {
    // Get chat info
    const { data: chat, error } = await supabase
      .from('chats')
      .select(`
        id,
        type,
        name,
        class_id,
        school_year,
        archived_at,
        class:classes(id, name)
      `)
      .eq('id', chatId)
      .single();

    if (error || !chat) {
      setLoading(false);
      return;
    }

    setChatInfo(chat);

    // Auto-join: solo per chat di classe NON archiviate
    if (chat.type === 'class' && chat.class_id && !chat.archived_at) {
      // Controlla se è studente della classe o professore assegnato
      const { data: user } = await supabase
        .from('users')
        .select('class_id, role')
        .eq('id', userId)
        .single();

      let belongsToClass = false;

      if (user?.role === 'student' && user.class_id === chat.class_id) {
        belongsToClass = true;
      } else if (user?.role === 'teacher') {
        const { data: tc } = await supabase
          .from('teacher_classes')
          .select('id')
          .eq('teacher_id', userId)
          .eq('class_id', chat.class_id)
          .maybeSingle();
        belongsToClass = !!tc;
      }

      if (belongsToClass) {
        await supabase
          .from('chat_members')
          .upsert(
            { chat_id: chatId, user_id: userId },
            { onConflict: 'chat_id,user_id' }
          );
      }
    }

    // Get other member for private chats
    if (chat.type === 'private') {
      const { data: members } = await supabase
        .from('chat_members')
        .select('user:users(id, first_name, last_name, avatar_url)')
        .eq('chat_id', chatId)
        .neq('user_id', userId)
        .maybeSingle();

      setOtherMember(members?.user || null);
    }

    // Carica last_read_at degli altri membri
    await loadOthersLastRead();

    setLoading(false);
  };

  const isGroupChat = chatInfo?.type === 'class' || chatInfo?.type === 'group';
  const isArchived = !!chatInfo?.archived_at;

  const isReadByAll = useCallback((messageCreatedAt) => {
    if (!othersLastRead) return false;
    return new Date(messageCreatedAt) <= othersLastRead;
  }, [othersLastRead]);

  const getChatTitle = () => {
    if (!chatInfo) return 'Chat';

    if (chatInfo.type === 'private' && otherMember) {
      return `${otherMember.first_name} ${otherMember.last_name}`;
    }

    if (chatInfo.type === 'class') {
      const base = chatInfo.name || `Classe ${chatInfo.class?.name || ''}`;
      return isArchived ? `${base} (${chatInfo.school_year})` : base;
    }

    return chatInfo.name || 'Chat';
  };

  return {
    chatInfo,
    otherMember,
    loading,
    isGroupChat,
    isArchived,
    getChatTitle,
    isReadByAll,
  };
};
