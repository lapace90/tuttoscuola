// hooks/useAnnouncements.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAnnouncements, 
  createAnnouncement, 
  markAnnouncementRead,
  getUnreadAnnouncementsCount 
} from '../services/schoolService';

export const useAnnouncements = () => {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readIds, setReadIds] = useState([]);

  const instituteId = profile?.institute_id || profile?.class?.institute_id || profile?.institute?.id;

  const loadAnnouncements = useCallback(async () => {
    if (!instituteId) return;

    const { data } = await getAnnouncements(instituteId, profile?.class_id, profile?.role);
    if (data) {
      setAnnouncements(data);
    }
    setLoading(false);
  }, [instituteId, profile?.class_id, profile?.role]);

  const loadUnreadCount = useCallback(async () => {
    if (!instituteId || !profile?.id) return;

    const { count } = await getUnreadAnnouncementsCount(
      profile.id, 
      instituteId, 
      profile?.class_id, 
      profile?.role
    );
    setUnreadCount(count);
  }, [instituteId, profile?.id, profile?.class_id, profile?.role]);

  useEffect(() => {
    loadAnnouncements();
    loadUnreadCount();
  }, [loadAnnouncements, loadUnreadCount]);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAnnouncements(), loadUnreadCount()]);
    setRefreshing(false);
  };

  const markAsRead = async (announcementId) => {
    if (!profile?.id || readIds.includes(announcementId)) return;

    setReadIds(prev => [...prev, announcementId]);
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    await markAnnouncementRead(announcementId, profile.id);
  };

  const create = async (announcementData) => {
    if (!profile?.id || !instituteId) return { error: 'Non autenticato' };

    const { data, error } = await createAnnouncement({
      ...announcementData,
      author_id: profile.id,
      institute_id: instituteId
    });

    if (!error && data) {
      setAnnouncements(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const isRead = (announcementId) => readIds.includes(announcementId);

  return {
    announcements,
    unreadCount,
    loading,
    refreshing,
    refresh,
    markAsRead,
    create,
    isRead
  };
};