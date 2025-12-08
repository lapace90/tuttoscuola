// hooks/useClassChats.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getOrCreateClassChat } from '../services/chatService';
import { getTeacherClasses } from '../services/userService';

export const useClassChats = () => {
  const { profile } = useAuth();
  const [classChats, setClassChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const isStudent = profile?.role === 'student';
  const isTeacher = profile?.role === 'teacher';

  const loadClassChats = useCallback(async () => {
    if (!profile?.id) return;

    const chatsData = [];

    if (isStudent && profile?.class_id) {
      // Students: get their single class chat
      const className = profile?.class?.name || '';
      const { data } = await getOrCreateClassChat(profile.class_id, className, profile.id);
      
      if (data) {
        chatsData.push({
          ...data,
          name: `Classe ${className}`,
          type: 'class'
        });
      }
    } else if (isTeacher) {
      // Teachers: get all their class chats
      const { data: teacherClasses } = await getTeacherClasses(profile.id);
      
      if (teacherClasses) {
        for (const tc of teacherClasses) {
          if (tc.class) {
            const { data } = await getOrCreateClassChat(tc.class.id, tc.class.name, profile.id);
            
            if (data) {
              chatsData.push({
                ...data,
                name: `Classe ${tc.class.name}`,
                type: 'class'
              });
            }
          }
        }
      }
    }

    setClassChats(chatsData);
    setLoading(false);
  }, [profile?.id, profile?.class_id, profile?.class?.name, isStudent, isTeacher]);

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