// services/gradesService.js
import { supabase } from '../lib/supabase';

/**
 * Get grades for a student
 */
export const getStudentGrades = async (studentId, startDate, endDate) => {
  let query = supabase
    .from('grades')
    .select(`
      *,
      teacher:users!teacher_id(id, first_name, last_name)
    `)
    .eq('student_id', studentId)
    .order('date', { ascending: false });

  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);

  const { data, error } = await query;
  return { data, error };
};

/**
 * Get grades for a class (teacher view)
 */
export const getClassGrades = async (classId, subject, startDate, endDate) => {
  let query = supabase
    .from('grades')
    .select(`
      *,
      student:users!student_id(id, first_name, last_name)
    `)
    .eq('class_id', classId)
    .order('date', { ascending: false });

  if (subject) query = query.eq('subject', subject);
  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);

  const { data, error } = await query;
  return { data, error };
};

/**
 * Get student average by subject
 */
export const getStudentAverages = async (studentId) => {
  const { data, error } = await supabase
    .from('grades')
    .select('subject, value')
    .eq('student_id', studentId);

  if (error) return { data: null, error };

  // Calculate averages per subject
  const subjectMap = {};
  data.forEach(grade => {
    if (!subjectMap[grade.subject]) {
      subjectMap[grade.subject] = { total: 0, count: 0 };
    }
    subjectMap[grade.subject].total += parseFloat(grade.value);
    subjectMap[grade.subject].count += 1;
  });

  const averages = Object.entries(subjectMap).map(([subject, { total, count }]) => ({
    subject,
    average: (total / count).toFixed(2),
    count
  }));

  return { data: averages, error: null };
};

/**
 * Add a grade
 */
export const addGrade = async (gradeData) => {
  const { data, error } = await supabase
    .from('grades')
    .insert(gradeData)
    .select(`
      *,
      student:users!student_id(id, first_name, last_name)
    `)
    .single();

  return { data, error };
};

/**
 * Update a grade
 */
export const updateGrade = async (gradeId, updates) => {
  const { data, error } = await supabase
    .from('grades')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', gradeId)
    .select()
    .single();

  return { data, error };
};

/**
 * Delete a grade
 */
export const deleteGrade = async (gradeId) => {
  const { error } = await supabase
    .from('grades')
    .delete()
    .eq('id', gradeId);

  return { error };
};

/**
 * Get class students with their grades for a subject
 */
export const getClassStudentsWithGrades = async (classId, subject) => {
  // Get all students in class
  const { data: students, error: studentsError } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('class_id', classId)
    .eq('role', 'student')
    .eq('onboarding_completed', true)
    .order('last_name');

  if (studentsError) return { data: null, error: studentsError };

  // Get grades for this class/subject
  const { data: grades, error: gradesError } = await supabase
    .from('grades')
    .select('*')
    .eq('class_id', classId)
    .eq('subject', subject)
    .order('date', { ascending: false });

  if (gradesError) return { data: null, error: gradesError };

  // Map grades to students
  const studentsWithGrades = students.map(student => {
    const studentGrades = grades.filter(g => g.student_id === student.id);
    const average = studentGrades.length > 0
      ? (studentGrades.reduce((sum, g) => sum + parseFloat(g.value), 0) / studentGrades.length).toFixed(2)
      : null;

    return {
      ...student,
      grades: studentGrades,
      average
    };
  });

  return { data: studentsWithGrades, error: null };
};