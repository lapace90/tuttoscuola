import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useClassChats = () => {
  const { profile } = useAuth();
  const [classChats, setClassChats] = useState([]);
  const [archivedClassChats, setArchivedClassChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClassChats = useCallback(async () => {
    if (!profile?.id) return;

    // Query class chats directly — RLS (chats_select) handles access
    // via chat_members, teacher_classes, or users.class_id
    const { data, error } = await supabase
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
      .eq('type', 'class');

    if (error || !data) {
      setLoading(false);
      return;
    }

    if (data.length === 0) {
      setClassChats([]);
      setArchivedClassChats([]);
      setLoading(false);
      return;
    }

    // Separate active and archived
    const active = [];
    const archived = [];

    for (const chat of data) {
      const chatData = {
        id: chat.id,
        name: chat.name || `Classe ${chat.class?.name || ''}`,
        type: 'class',
        class_id: chat.class_id,
        school_year: chat.school_year,
        archived_at: chat.archived_at,
      };

      if (chat.archived_at) {
        archived.push(chatData);
      } else {
        active.push(chatData);
      }
    }

    setClassChats(active);
    setArchivedClassChats(archived);
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
    archivedClassChats,
    loading,
    refresh,
    hasClassChats: classChats.length > 0,
  };
};
