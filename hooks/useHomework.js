import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getStudentHomeworkStatus, 
  getHomeworkByTeacher, 
  createHomework,
  updateHomework,
  deleteHomework,
  markHomeworkDone 
} from '../services/schoolService';

export const useHomework = () => {
  const { profile } = useAuth();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isStudent = profile?.role === 'student';
  const isTeacher = profile?.role === 'teacher';

  const loadHomework = useCallback(async () => {
    if (!profile?.id) return;

    if (isStudent && profile?.class_id) {
      const { data } = await getStudentHomeworkStatus(profile.id, profile.class_id);
      if (data) setHomework(data);
    } else if (isTeacher) {
      const { data } = await getHomeworkByTeacher(profile.id);
      if (data) setHomework(data);
    }
    
    setLoading(false);
  }, [profile?.id, profile?.class_id, isStudent, isTeacher]);

  useEffect(() => {
    loadHomework();
  }, [loadHomework]);

  const refresh = async () => {
    setRefreshing(true);
    await loadHomework();
    setRefreshing(false);
  };

  const toggleComplete = async (homeworkId) => {
    if (!isStudent || !profile?.id) return;

    const item = homework.find(h => h.id === homeworkId);
    if (!item) return;

    const newStatus = !item.completed;

    // Optimistic update
    setHomework(prev => prev.map(h => 
      h.id === homeworkId ? { ...h, completed: newStatus } : h
    ));

    const { error } = await markHomeworkDone(homeworkId, profile.id, newStatus);
    
    if (error) {
      // Rollback on error
      setHomework(prev => prev.map(h => 
        h.id === homeworkId ? { ...h, completed: !newStatus } : h
      ));
    }
  };

  const create = async (homeworkData) => {
    if (!isTeacher || !profile?.id) return { error: 'Non autorizzato' };

    const { data, error } = await createHomework({
      ...homeworkData,
      teacher_id: profile.id
    });

    if (!error && data) {
      setHomework(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const update = async (homeworkId, updates) => {
    if (!isTeacher) return { error: 'Non autorizzato' };

    const { data, error } = await updateHomework(homeworkId, updates);

    if (!error && data) {
      setHomework(prev => prev.map(h => h.id === homeworkId ? { ...h, ...data } : h));
    }

    return { data, error };
  };

  const remove = async (homeworkId) => {
    if (!isTeacher) return { error: 'Non autorizzato' };

    const { error } = await deleteHomework(homeworkId);

    if (!error) {
      setHomework(prev => prev.filter(h => h.id !== homeworkId));
    }

    return { error };
  };

  // Computed values
  const pendingHomework = homework.filter(h => !h.completed);
  const completedHomework = homework.filter(h => h.completed);
  const pendingCount = pendingHomework.length;
  const completedCount = completedHomework.length;

  // Get due status helper
  const getDueStatus = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Scaduto', status: 'overdue', days: diffDays };
    if (diffDays === 0) return { label: 'Oggi', status: 'today', days: 0 };
    if (diffDays === 1) return { label: 'Domani', status: 'tomorrow', days: 1 };
    if (diffDays <= 3) return { label: `${diffDays} giorni`, status: 'soon', days: diffDays };
    return { label: formatDate(dueDate), status: 'normal', days: diffDays };
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  return {
    homework,
    pendingHomework,
    completedHomework,
    pendingCount,
    completedCount,
    loading,
    refreshing,
    refresh,
    toggleComplete,
    create,
    update,
    remove,
    getDueStatus,
    formatDate,
    isStudent,
    isTeacher
  };
};