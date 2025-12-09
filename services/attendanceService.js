import { supabase } from '../lib/supabase';

/**
 * Get or create today's attendance for a class
 */
export const getOrCreateAttendance = async (classId, teacherId) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Try to get existing
  let { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('class_id', classId)
    .eq('date', today)
    .single();
  
  // If not exists, create it
  if (error?.code === 'PGRST116') {
    const result = await supabase
      .from('attendance')
      .insert({ class_id: classId, teacher_id: teacherId, date: today })
      .select()
      .single();
    data = result.data;
    error = result.error;
  }
  
  return { data, error };
};

/**
 * Get attendance with all student records for a class/date
 */
export const getAttendanceWithRecords = async (classId, date) => {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      *,
      records:attendance_records(
        id,
        student_id,
        status,
        confirmed,
        confirmed_at,
        student:users!student_id(id, first_name, last_name)
      )
    `)
    .eq('class_id', classId)
    .eq('date', date)
    .single();

  return { data, error };
};

/**
 * Get all students in a class
 */
export const getClassStudents = async (classId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('class_id', classId)
    .eq('role', 'student')
    .eq('onboarding_completed', true)
    .order('last_name');

  return { data, error };
};

/**
 * Set student attendance status
 */
export const setAttendanceStatus = async (attendanceId, studentId, status) => {
  // Upsert: insert or update
  const { data, error } = await supabase
    .from('attendance_records')
    .upsert({
      attendance_id: attendanceId,
      student_id: studentId,
      status,
      confirmed: false,
      confirmed_at: null,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'attendance_id,student_id'
    })
    .select()
    .single();

  return { data, error };
};

/**
 * Confirm student presence (student action)
 */
export const confirmPresence = async (recordId) => {
  const { data, error } = await supabase
    .from('attendance_records')
    .update({
      confirmed: true,
      confirmed_at: new Date().toISOString()
    })
    .eq('id', recordId)
    .select()
    .single();

  return { data, error };
};

/**
 * Get student's attendance record for today
 */
export const getStudentTodayAttendance = async (studentId, classId) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('attendance_records')
    .select(`
      *,
      attendance:attendance!inner(id, date, class_id)
    `)
    .eq('student_id', studentId)
    .eq('attendance.class_id', classId)
    .eq('attendance.date', today)
    .single();

  return { data, error };
};

/**
 * Get student's attendance history
 */
export const getStudentAttendanceHistory = async (studentId, startDate, endDate) => {
  const { data, error } = await supabase
    .from('attendance_records')
    .select(`
      *,
      attendance:attendance!inner(id, date, class_id)
    `)
    .eq('student_id', studentId)
    .gte('attendance.date', startDate)
    .lte('attendance.date', endDate)
    .order('attendance(date)', { ascending: false });

  return { data, error };
};

/**
 * Get class attendance summary for a date range
 */
export const getClassAttendanceSummary = async (classId, startDate, endDate) => {
  const { data, error } = await supabase
    .from('attendance')
    .select(`
      *,
      records:attendance_records(
        id,
        student_id,
        status,
        confirmed
      )
    `)
    .eq('class_id', classId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  return { data, error };
};