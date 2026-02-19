import { supabase } from '../lib/supabase';

/**
 * Get user's chats - optimized: 3 queries instead of 2N+1
 */
export const getUserChats = async (userId) => {
  // 1. Get all chat memberships
  const { data: memberships, error } = await supabase
    .from('chat_members')
    .select(`
      chat:chats(
        id,
        type,
        name,
        updated_at,
        school_year,
        archived_at,
        class:classes(id, name)
      )
    `)
    .eq('user_id', userId);

  if (error) return { data: null, error };

  const validChats = memberships
    .filter(item => item.chat !== null)
    .map(item => item.chat);

  if (validChats.length === 0) return { data: [], error: null };

  const chatIds = validChats.map(c => c.id);

  // 2. Batch: get last message for all chats at once
  // Use RPC or fetch recent messages per chat via a single query
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('chat_id, content, created_at, sender:users!sender_id(first_name)')
    .in('chat_id', chatIds)
    .order('created_at', { ascending: false });

  // Build map: chat_id -> last message (first occurrence = most recent)
  const lastMessageByChat = {};
  if (recentMessages) {
    for (const msg of recentMessages) {
      if (!lastMessageByChat[msg.chat_id]) {
        lastMessageByChat[msg.chat_id] = msg;
      }
    }
  }

  // 3. Batch: get other members for private chats
  const privateChatIds = validChats
    .filter(c => c.type === 'private')
    .map(c => c.id);

  const otherMemberByChat = {};
  if (privateChatIds.length > 0) {
    const { data: allMembers } = await supabase
      .from('chat_members')
      .select('chat_id, user:users(id, first_name, last_name, avatar_url)')
      .in('chat_id', privateChatIds)
      .neq('user_id', userId);

    if (allMembers) {
      for (const m of allMembers) {
        otherMemberByChat[m.chat_id] = m.user;
      }
    }
  }

  // Assemble
  const chats = validChats
    .map(chat => ({
      ...chat,
      lastMessage: lastMessageByChat[chat.id] || null,
      otherMember: otherMemberByChat[chat.id] || null,
    }))
    .filter(chat => chat.lastMessage)
    .sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at));

  return { data: chats, error: null };
};

/**
 * Get chat by ID with full info
 */
export const getChatById = async (chatId, userId) => {
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

  if (error) return { data: null, error };

  let otherMember = null;
  if (chat.type === 'private') {
    const { data: members } = await supabase
      .from('chat_members')
      .select('user:users(id, first_name, last_name, avatar_url)')
      .eq('chat_id', chatId)
      .neq('user_id', userId)
      .maybeSingle();

    otherMember = members?.user;
  }

  return { data: { ...chat, otherMember }, error: null };
};

/**
 * Get or create private chat between two users
 */
export const getOrCreatePrivateChat = async (userId1, userId2) => {
  const { data: existingChats } = await supabase
    .from('chats')
    .select(`
      id,
      chat_members!inner(user_id)
    `)
    .eq('type', 'private');

  const existingChat = existingChats?.find(chat => {
    const memberIds = chat.chat_members.map(m => m.user_id);
    return memberIds.includes(userId1) && memberIds.includes(userId2) && memberIds.length === 2;
  });

  if (existingChat) {
    return { data: { id: existingChat.id }, error: null };
  }

  const { data: newChat, error: chatError } = await supabase
    .from('chats')
    .insert({
      type: 'private',
      created_by: userId1,
    })
    .select()
    .single();

  if (chatError) return { data: null, error: chatError };

  const { error: membersError } = await supabase
    .from('chat_members')
    .insert([
      { chat_id: newChat.id, user_id: userId1, role: 'admin' },
      { chat_id: newChat.id, user_id: userId2, role: 'member' },
    ]);

  if (membersError) return { data: null, error: membersError };

  return { data: newChat, error: null };
};

/**
 * Get or create class chat (filtra per anno scolastico)
 */
export const getOrCreateClassChat = async (classId, className, userId, schoolYear) => {
  const { data: existingChat } = await supabase
    .from('chats')
    .select('id')
    .eq('type', 'class')
    .eq('class_id', classId)
    .eq('school_year', schoolYear)
    .is('archived_at', null)
    .maybeSingle();

  if (existingChat) {
    await supabase
      .from('chat_members')
      .upsert({
        chat_id: existingChat.id,
        user_id: userId,
      }, { onConflict: 'chat_id,user_id' });

    return { data: existingChat, error: null };
  }

  const { data: newChat, error: chatError } = await supabase
    .from('chats')
    .insert({
      type: 'class',
      name: `Chat ${className}`,
      class_id: classId,
      school_year: schoolYear,
      created_by: userId,
    })
    .select()
    .single();

  if (chatError) return { data: null, error: chatError };

  await supabase
    .from('chat_members')
    .insert({
      chat_id: newChat.id,
      user_id: userId,
      role: 'admin',
    });

  return { data: newChat, error: null };
};

/**
 * Crea chat di classe (chiamata dall'admin alla creazione classe)
 */
export const createClassChatForAdmin = async (classId, className, adminId, schoolYear) => {
  // Verifica che non esista già
  const { data: existing } = await supabase
    .from('chats')
    .select('id')
    .eq('type', 'class')
    .eq('class_id', classId)
    .eq('school_year', schoolYear)
    .is('archived_at', null)
    .maybeSingle();

  if (existing) return { data: existing, error: null };

  const { data: newChat, error } = await supabase
    .from('chats')
    .insert({
      type: 'class',
      name: `Chat ${className}`,
      class_id: classId,
      school_year: schoolYear,
      created_by: adminId,
    })
    .select()
    .single();

  return { data: newChat, error };
};

/**
 * Archivia la chat di classe (durante promozioni)
 */
export const archiveClassChat = async (classId, schoolYear) => {
  const { data, error } = await supabase
    .from('chats')
    .update({ archived_at: new Date().toISOString() })
    .eq('type', 'class')
    .eq('class_id', classId)
    .eq('school_year', schoolYear)
    .is('archived_at', null)
    .select()
    .maybeSingle();

  return { data, error };
};

/**
 * Get messages for a chat
 */
export const getChatMessages = async (chatId, limit = 50) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      chat_id,
      sender_id,
      content,
      created_at,
      sender:users!sender_id(id, first_name, last_name, avatar_url)
    `)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
    .limit(limit);

  return { data, error };
};

/**
 * Send a message
 */
export const sendMessage = async (chatId, senderId, content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      content,
    })
    .select(`
      id,
      chat_id,
      sender_id,
      content,
      created_at,
      sender:users!sender_id(id, first_name, last_name, avatar_url)
    `)
    .single();

  if (!error) {
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);
  }

  return { data, error };
};

/**
 * Subscribe to new messages in a chat
 */
export const subscribeToMessages = (chatId, callback) => {
  const channel = supabase
    .channel(`messages:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      async (payload) => {
        const { data } = await supabase
          .from('messages')
          .select(`
            id,
            chat_id,
            sender_id,
            content,
            created_at,
            sender:users!sender_id(id, first_name, last_name, avatar_url)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) callback(data);
      }
    )
    .subscribe();

  return channel;
};

/**
 * Update last read timestamp
 */
export const updateLastRead = async (chatId, userId) => {
  const { error } = await supabase
    .from('chat_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('chat_id', chatId)
    .eq('user_id', userId);

  return { error };
};

/**
 * Get chat members
 */
export const getChatMembers = async (chatId) => {
  const { data, error } = await supabase
    .from('chat_members')
    .select(`
      role,
      user:users(id, first_name, last_name, avatar_url, role)
    `)
    .eq('chat_id', chatId);

  return { data, error };
};
