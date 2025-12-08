// services/schoolService.js
import { supabase } from '../lib/supabase';

// ==================== COMUNICAZIONI ====================

/**
 * Get announcements for user's institute/class
 */
export const getAnnouncements = async (instituteId, classId, role) => {
  let query = supabase
    .from('announcements')
    .select(`
      *,
      author:users!author_id(id, first_name, last_name, role)
    `)
    .eq('institute_id', instituteId)
    .order('created_at', { ascending: false });

  // Filter by target audience
  if (role === 'student') {
    query = query.or(`target_audience.eq.all,target_audience.eq.students,target_class_id.eq.${classId}`);
  } else if (role === 'teacher') {
    query = query.or('target_audience.eq.all,target_audience.eq.teachers');
  }

  const { data, error } = await query;
  return { data, error };
};

/**
 * Create announcement (admin/teacher only)
 */
export const createAnnouncement = async (announcementData) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert(announcementData)
    .select(`
      *,
      author:users!author_id(id, first_name, last_name, role)
    `)
    .single();

  return { data, error };
};

/**
 * Mark announcement as read
 */
export const markAnnouncementRead = async (announcementId, userId) => {
  const { error } = await supabase
    .from('announcement_reads')
    .upsert({
      announcement_id: announcementId,
      user_id: userId,
      read_at: new Date().toISOString()
    }, { onConflict: 'announcement_id,user_id' });

  return { error };
};

/**
 * Get unread announcements count
 */
export const getUnreadAnnouncementsCount = async (userId, instituteId, classId, role) => {
  // First get all relevant announcements
  const { data: announcements } = await getAnnouncements(instituteId, classId, role);
  if (!announcements) return { count: 0 };

  // Get read announcements
  const { data: reads } = await supabase
    .from('announcement_reads')
    .select('announcement_id')
    .eq('user_id', userId);

  const readIds = reads?.map(r => r.announcement_id) || [];
  const unreadCount = announcements.filter(a => !readIds.includes(a.id)).length;

  return { count: unreadCount };
};

// ==================== COMPITI ====================

/**
 * Get homework for a class
 */
export const getHomeworkByClass = async (classId, includeCompleted = false) => {
  let query = supabase
    .from('homework')
    .select(`
      *,
      teacher:users!teacher_id(id, first_name, last_name)
    `)
    .eq('class_id', classId)
    .order('due_date', { ascending: true });

  if (!includeCompleted) {
    query = query.gte('due_date', new Date().toISOString().split('T')[0]);
  }

  const { data, error } = await query;
  return { data, error };
};

/**
 * Get homework assigned by teacher
 */
export const getHomeworkByTeacher = async (teacherId) => {
  const { data, error } = await supabase
    .from('homework')
    .select(`
      *,
      class:classes(id, name)
    `)
    .eq('teacher_id', teacherId)
    .order('due_date', { ascending: true });

  return { data, error };
};

/**
 * Create homework
 */
export const createHomework = async (homeworkData) => {
  const { data, error } = await supabase
    .from('homework')
    .insert(homeworkData)
    .select(`
      *,
      class:classes(id, name)
    `)
    .single();

  return { data, error };
};

/**
 * Update homework
 */
export const updateHomework = async (homeworkId, updates) => {
  const { data, error } = await supabase
    .from('homework')
    .update(updates)
    .eq('id', homeworkId)
    .select()
    .single();

  return { data, error };
};

/**
 * Delete homework
 */
export const deleteHomework = async (homeworkId) => {
  const { error } = await supabase
    .from('homework')
    .delete()
    .eq('id', homeworkId);

  return { error };
};

/**
 * Mark homework as done (student)
 */
export const markHomeworkDone = async (homeworkId, studentId, done = true) => {
  const { error } = await supabase
    .from('homework_completions')
    .upsert({
      homework_id: homeworkId,
      student_id: studentId,
      completed: done,
      completed_at: done ? new Date().toISOString() : null
    }, { onConflict: 'homework_id,student_id' });

  return { error };
};

/**
 * Get student's homework completion status
 */
export const getStudentHomeworkStatus = async (studentId, classId) => {
  const { data: homework } = await getHomeworkByClass(classId, false);
  if (!homework) return { data: [] };

  const { data: completions } = await supabase
    .from('homework_completions')
    .select('homework_id, completed')
    .eq('student_id', studentId);

  const completionMap = {};
  completions?.forEach(c => {
    completionMap[c.homework_id] = c.completed;
  });

  const homeworkWithStatus = homework.map(h => ({
    ...h,
    completed: completionMap[h.id] || false
  }));

  return { data: homeworkWithStatus };
};