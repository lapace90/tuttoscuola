import { supabase } from '../lib/supabase';

/**
 * Report types configuration
 */
export const REPORT_TYPES = {
  technical: {
    label: 'Problema tecnico',
    description: 'Bug, errori, malfunzionamenti dell\'app',
    icon: 'settings',
    color: '#F59E0B'
  },
  content: {
    label: 'Contenuto inappropriato',
    description: 'Messaggi offensivi, spam, contenuti non adatti',
    icon: 'alertCircle',
    color: '#EF4444'
  },
  behavior: {
    label: 'Comportamento scorretto',
    description: 'Bullismo, molestie, comportamenti inappropriati',
    icon: 'users',
    color: '#DC2626'
  },
  suggestion: {
    label: 'Suggerimento',
    description: 'Idee per migliorare l\'app',
    icon: 'messageSquare',
    color: '#10B981'
  },
  other: {
    label: 'Altro',
    description: 'Altre segnalazioni',
    icon: 'info',
    color: '#6B7280'
  }
};

/**
 * Report status configuration
 */
export const REPORT_STATUS = {
  pending: { label: 'In attesa', color: '#F59E0B' },
  reviewing: { label: 'In revisione', color: '#3B82F6' },
  resolved: { label: 'Risolto', color: '#10B981' },
  dismissed: { label: 'Archiviato', color: '#6B7280' }
};

/**
 * Create a new report
 */
export const createReport = async (reportData) => {
  const { data, error } = await supabase
    .from('reports')
    .insert(reportData)
    .select()
    .single();

  return { data, error };
};

/**
 * Get user's reports
 */
export const getUserReports = async (userId) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Get reports for institute (admin only)
 */
export const getInstituteReports = async (instituteId) => {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:users!reporter_id(id, first_name, last_name, role)
    `)
    .eq('institute_id', instituteId)
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Update report status (admin only)
 */
export const updateReportStatus = async (reportId, status, adminNotes = null) => {
  const updates = { 
    status,
    updated_at: new Date().toISOString()
  };
  
  if (adminNotes) {
    updates.admin_notes = adminNotes;
  }

  const { data, error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', reportId)
    .select()
    .single();

  return { data, error };
};