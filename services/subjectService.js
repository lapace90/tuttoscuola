import { supabase } from '../lib/supabase';

/**
 * Get all available subjects
 */
export const getAllSubjects = async () => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name');

  return { data, error };
};

/**
 * Get subjects for a specific teacher
 */
export const getTeacherSubjects = async (teacherId) => {
  const { data, error } = await supabase
    .from('teacher_subjects')
    .select(`
      id,
      subject:subjects(id, name)
    `)
    .eq('teacher_id', teacherId);

  return { data, error };
};

/**
 * Add subject to teacher
 */
export const addTeacherSubject = async (teacherId, subjectId) => {
  const { data, error } = await supabase
    .from('teacher_subjects')
    .insert({ teacher_id: teacherId, subject_id: subjectId })
    .select()
    .single();

  return { data, error };
};

/**
 * Remove subject from teacher
 */
export const removeTeacherSubject = async (teacherId, subjectId) => {
  const { error } = await supabase
    .from('teacher_subjects')
    .delete()
    .eq('teacher_id', teacherId)
    .eq('subject_id', subjectId);

  return { error };
};

/**
 * Set teacher subjects (replace all)
 */
export const setTeacherSubjects = async (teacherId, subjectIds) => {
  // Remove existing
  await supabase
    .from('teacher_subjects')
    .delete()
    .eq('teacher_id', teacherId);

  // Add new
  if (subjectIds.length > 0) {
    const { error } = await supabase
      .from('teacher_subjects')
      .insert(subjectIds.map(subjectId => ({
        teacher_id: teacherId,
        subject_id: subjectId
      })));

    return { error };
  }

  return { error: null };
};