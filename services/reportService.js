import { supabase } from '../lib/supabase';

/**
 * Report types configuration
 */
export const REPORT_TYPES = {
  technical: {
    label: 'Problema tecnico',
    description: 'Bug, errori, malfunzionamenti dell\'app',
    icon: 'settings',
    color: '#F59E0B',
    sendEmail: true, // Invia email allo sviluppatore
  },
  suggestion: {
    label: 'Suggerimento',
    description: 'Idee per migliorare l\'app',
    icon: 'messageSquare',
    color: '#10B981',
    sendEmail: true, // Invia email allo sviluppatore
  },
  content: {
    label: 'Contenuto inappropriato',
    description: 'Messaggi offensivi, spam, contenuti non adatti',
    icon: 'alertCircle',
    color: '#EF4444',
    sendEmail: false, // Va agli admin scuola
  },
  behavior: {
    label: 'Comportamento scorretto',
    description: 'Bullismo, molestie, comportamenti inappropriati',
    icon: 'users',
    color: '#DC2626',
    sendEmail: false, // Va agli admin scuola
  },
  other: {
    label: 'Altro',
    description: 'Altre segnalazioni',
    icon: 'info',
    color: '#6B7280',
    sendEmail: false, // Va agli admin scuola
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
 * Send report via email (for technical/suggestion)
 */
const sendReportEmail = async (reportData, profile) => {
  try {
    const { data, error } = await supabase.functions.invoke('resend-email', {
      body: {
        type: reportData.type,
        title: reportData.title,
        description: reportData.description,
        reporterName: `${profile.first_name} ${profile.last_name}`,
        reporterEmail: profile.email,
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error sending report email:', error);
    return { data: null, error };
  }
};

/**
 * Create a new report
 */
export const createReport = async (reportData, profile = null) => {
  const typeConfig = REPORT_TYPES[reportData.type];

  // Se è technical o suggestion, invia email
  if (typeConfig?.sendEmail && profile) {
    const emailResult = await sendReportEmail(reportData, profile);
    
    // Salva comunque nel DB per storico
    const { data, error } = await supabase
      .from('reports')
      .insert({
        ...reportData,
        sent_via_email: true,
      })
      .select()
      .single();

    return { 
      data, 
      error: error || emailResult.error,
      emailSent: !emailResult.error 
    };
  }

  // Altrimenti salva solo nel DB (per admin scuola)
  const { data, error } = await supabase
    .from('reports')
    .insert({
      ...reportData,
      sent_via_email: false,
    })
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
    .eq('sent_via_email', false) // Solo quelli per admin, non quelli inviati via email
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