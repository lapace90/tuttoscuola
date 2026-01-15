import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../lib/supabase';

export const useMessages = (chatId, userId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (chatId && userId) {
      loadMessages();
      const unsubscribe = subscribeToNewMessages();
      return unsubscribe;
    }
  }, [chatId, userId]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        chat_id,
        sender_id,
        content,
        type,
        file_url,
        file_name,
        created_at,
        sender:users!sender_id(id, first_name, last_name, avatar_url)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const sendText = async (text) => {
    if (!text.trim()) return { success: false };

    setSending(true);
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: userId,
        content: text.trim(),
        type: 'text',
      })
      .select(`
        id,
        chat_id,
        sender_id,
        content,
        type,
        file_url,
        file_name,
        created_at,
        sender:users!sender_id(id, first_name, last_name, avatar_url)
      `)
      .single();

    setSending(false);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return { success: true, data };
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Serve il permesso per accedere alla galleria');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled) return null;

    return {
      uri: result.assets[0].uri,
      name: result.assets[0].name,
      mimeType: result.assets[0].mimeType,
    };
  };

  const uploadFile = async (uri, folder, fileName) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const fileExt = fileName.split('.').pop().toLowerCase();
      const filePath = `${chatId}/${folder}/${Date.now()}_${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, arrayBuffer, {
          contentType: folder === 'images' ? `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}` : 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const sendImage = async (imageUri) => {
    if (!imageUri) return { success: false };

    setSending(true);

    const fileUrl = await uploadFile(imageUri, 'images', 'image.jpg');
    if (!fileUrl) {
      setSending(false);
      Alert.alert('Errore', 'Impossibile caricare l\'immagine');
      return { success: false, error: 'Upload failed' };
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: userId,
        type: 'image',
        file_url: fileUrl,
        content: '',
      })
      .select(`
        id,
        chat_id,
        sender_id,
        content,
        type,
        file_url,
        file_name,
        created_at,
        sender:users!sender_id(id, first_name, last_name, avatar_url)
      `)
      .single();

    setSending(false);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return { success: true, data };
  };

  const sendDocument = async (doc) => {
    if (!doc) return { success: false };

    setSending(true);

    const fileUrl = await uploadFile(doc.uri, 'documents', doc.name);
    if (!fileUrl) {
      setSending(false);
      Alert.alert('Errore', 'Impossibile caricare il documento');
      return { success: false, error: 'Upload failed' };
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: userId,
        type: 'document',
        file_url: fileUrl,
        file_name: doc.name,
        content: '',
      })
      .select(`
        id,
        chat_id,
        sender_id,
        content,
        type,
        file_url,
        file_name,
        created_at,
        sender:users!sender_id(id, first_name, last_name, avatar_url)
      `)
      .single();

    setSending(false);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return { success: true, data };
  };

  const subscribeToNewMessages = () => {
    if (!chatId || !userId) return () => { };

    const channel = supabase
      .channel(`messages-${chatId}`)
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
              type,
              file_url,
              file_name,
              created_at,
              sender:users!sender_id(id, first_name, last_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => {
              if (prev.find(m => m.id === data.id)) return prev;
              return [...prev, data];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    messages,
    loading,
    sending,
    sendText,
    sendImage,
    sendDocument,
    pickImage,
    pickDocument,
    refresh: loadMessages,
  };
};