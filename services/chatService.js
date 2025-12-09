// services/chatService.js
import { supabase } from '../lib/supabase';

/**
 * Get user's chats
 */
export const getUserChats = async (userId) => {
  const { data, error } = await supabase
    .from('chat_members')
    .select(`
      chat:chats(
        id,
        type,
        name,
        updated_at,
        class:classes(id, name)
      )
    `)
    .eq('user_id', userId)
    .order('chat(updated_at)', { ascending: false });

  if (error) return { data: null, error };

  // Flatten and enrich with last message and other members
  const chats = await Promise.all(
    data.map(async (item) => {
      const chat = item.chat;

      // Get last message
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('content, created_at, sender:users!sender_id(first_name)')
        .eq('chat_id', chat.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get other members for private chats
      let otherMember = null;
      if (chat.type === 'private') {
        const { data: members } = await supabase
          .from('chat_members')
          .select('user:users(id, first_name, last_name, avatar_url)')
          .eq('chat_id', chat.id)
          .neq('user_id', userId)
          .single();

        otherMember = members?.user;
      }

      return {
        ...chat,
        lastMessage,
        otherMember,
      };
    })
  );

  return { data: chats, error: null };
};

/**
 * Get or create private chat between two users
 */
export const getOrCreatePrivateChat = async (userId1, userId2) => {
  // Check if chat already exists - partendo da chat_members (funziona con la policy)
  const { data: myChats } = await supabase
    .from('chat_members')
    .select('chat_id')
    .eq('user_id', userId1);

  if (myChats && myChats.length > 0) {
    // Cerca se l'altro utente è in una di queste chat private
    const chatIds = myChats.map(c => c.chat_id);

    const { data: sharedChat } = await supabase
      .from('chat_members')
      .select(`
        chat_id,
        chat:chats!inner(id, type)
      `)
      .eq('user_id', userId2)
      .eq('chat.type', 'private')
      .in('chat_id', chatIds)
      .limit(1)
      .single();

    if (sharedChat) {
      return { data: { id: sharedChat.chat_id }, error: null };
    }
  }

  // Create new chat
  const { data: newChat, error: chatError } = await supabase
    .from('chats')
    .insert({
      type: 'private',
      created_by: userId1,
    })
    .select()
    .single();

  if (chatError) return { data: null, error: chatError };

  // Add both members
  const { error: membersError } = await supabase
    .from('chat_members')
    .insert([
      { chat_id: newChat.id, user_id: userId1, role: 'admin' },
      { chat_id: newChat.id, user_id: userId2, role: 'member' },
    ]);

  if (membersError) return { data: null, error: membersError };

  return { data: newChat, error: null };
};

export const getOrCreateClassChat = async (classId, className, userId) => {
  // Check if class chat exists - partendo da chats direttamente (la policy lo permette per type=class)
  const { data: existingChat, error: findError } = await supabase
    .from('chats')
    .select('id')
    .eq('type', 'class')
    .eq('class_id', classId)
    .maybeSingle();

  if (findError) {
    console.log('Error finding class chat:', findError);
    return { data: null, error: findError };
  }

  if (existingChat) {
    // Assicurati che l'utente sia membro
    const { error: upsertError } = await supabase
      .from('chat_members')
      .upsert({
        chat_id: existingChat.id,
        user_id: userId,
        role: 'member'
      }, { onConflict: 'chat_id,user_id' });

    if (upsertError) {
      console.log('Error adding member:', upsertError);
    }

    return { data: existingChat, error: null };
  }

  // Create class chat
  const { data: newChat, error: chatError } = await supabase
    .from('chats')
    .insert({
      type: 'class',
      name: `Classe ${className}`,
      class_id: classId,
      created_by: userId,
    })
    .select()
    .single();

  if (chatError) {
    console.log('Error creating class chat:', chatError);
    return { data: null, error: chatError };
  }

  // Add creator as member
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
 * Get messages for a chat
 */
export const getChatMessages = async (chatId, limit = 50, before = null) => {
  let query = supabase
    .from('messages')
    .select(`
      *,
      sender:users!sender_id(id, first_name, last_name, avatar_url)
    `)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data, error } = await query;

  return { data: data?.reverse(), error };
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
      *,
      sender:users!sender_id(id, first_name, last_name, avatar_url)
    `)
    .single();

  // Update chat's updated_at
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
  return supabase
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
        // Fetch full message with sender info
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users!sender_id(id, first_name, last_name, avatar_url)
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) callback(data);
      }
    )
    .subscribe();
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