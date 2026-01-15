import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useChatInfo = (chatId, userId) => {
  const [chatInfo, setChatInfo] = useState(null);
  const [otherMember, setOtherMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatId && userId) {
      loadChatInfo();
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
        class:classes(id, name)
      `)
      .eq('id', chatId)
      .single();

    if (error || !chat) {
      setLoading(false);
      return;
    }

    setChatInfo(chat);

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

    setLoading(false);
  };

  const isGroupChat = chatInfo?.type === 'class' || chatInfo?.type === 'group';

  const getChatTitle = () => {
    if (!chatInfo) return 'Chat';
    
    if (chatInfo.type === 'private' && otherMember) {
      return `${otherMember.first_name} ${otherMember.last_name}`;
    }
    
    if (chatInfo.type === 'class') {
      return chatInfo.name || `Classe ${chatInfo.class?.name || ''}`;
    }
    
    return chatInfo.name || 'Chat';
  };

  return {
    chatInfo,
    otherMember,
    loading,
    isGroupChat,
    getChatTitle,
  };
};