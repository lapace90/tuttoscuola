import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  createReport, 
  getUserReports,
  REPORT_TYPES,
  REPORT_STATUS
} from '../services/reportService';

export const useReports = () => {
  const { profile } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(async () => {
    if (!profile?.id) return;

    const { data } = await getUserReports(profile.id);
    if (data) {
      setReports(data);
    }
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const refresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const submit = async ({ type, title, description, relatedId = null, relatedType = null }) => {
    if (!profile?.id) {
      return { error: 'Non autenticato' };
    }

    const instituteId = profile?.institute_id || profile?.class?.institute_id || profile?.institute?.id;

    const { data, error } = await createReport({
      reporter_id: profile.id,
      institute_id: instituteId,
      type,
      title,
      description,
      related_id: relatedId,
      related_type: relatedType,
      status: 'pending'
    });

    if (!error && data) {
      setReports(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const getTypeConfig = (type) => {
    return REPORT_TYPES[type] || REPORT_TYPES.other;
  };

  const getStatusConfig = (status) => {
    return REPORT_STATUS[status] || REPORT_STATUS.pending;
  };

  return {
    reports,
    loading,
    refreshing,
    refresh,
    submit,
    getTypeConfig,
    getStatusConfig,
    REPORT_TYPES,
    REPORT_STATUS
  };
};