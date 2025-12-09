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
    if (!profile?.id) {
      console.log('❌ No profile id');
      return;
    }

    console.log('🔍 Loading class chats for:', profile.id, 'role:', profile.role);
    const chatsData = [];

    if (isStudent && profile?.class_id) {
      const className = profile?.class?.name || '';
      const { data, error } = await getOrCreateClassChat(profile.class_id, className, profile.id);
      console.log('📚 Student chat:', data, 'Error:', error);
      
      if (data) {
        chatsData.push({
          ...data,
          name: `Classe ${className}`,
          type: 'class'
        });
      }
    } else if (isTeacher) {
      const { data: teacherClasses, error: tcError } = await getTeacherClasses(profile.id);
      console.log('📚 Teacher classes:', teacherClasses, 'Error:', tcError);
      
      if (teacherClasses) {
        for (const tc of teacherClasses) {
          if (tc.class) {
            console.log('🏫 Getting chat for class:', tc.class.id, tc.class.name);
            const { data, error } = await getOrCreateClassChat(tc.class.id, tc.class.name, profile.id);
            console.log('💬 Chat result:', data, 'Error:', error);
            
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
    } else {
      console.log('❌ Not student or teacher:', profile.role);
    }

    console.log('✅ Final chats:', chatsData.length);
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