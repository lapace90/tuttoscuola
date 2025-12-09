// services/userService.js
import { supabase } from '../lib/supabase';

/**
 * Get user profile by ID
 */
export const getUserById = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      class:classes(id, name, year, institute_id),
      institute:institutes(id, name)
    `)
    .eq('id', userId)
    .single();

  return { data, error };
};

/**
 * Update user profile
 */
export const updateUser = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};

/**
 * Complete onboarding - set name, class, role
 */
export const completeOnboarding = async (userId, { firstName, lastName, classId, role = 'student' }) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      first_name: firstName,
      last_name: lastName,
      class_id: classId,
      role,
      onboarding_completed: true,
    })
    .eq('id', userId)
    .select(`
      *,
      class:classes(id, name, year),
      institute:institutes(id, name)
    `)
    .single();

  return { data, error };
};

/**
 * Get all classes for an institute
 */
export const getClassesByInstitute = async (instituteId) => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('institute_id', instituteId)
    .order('name');

  return { data, error };
};

/**
 * Get users by class (classmates)
 */
export const getUsersByClass = async (classId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, role, avatar_url')
    .eq('class_id', classId)
    .eq('onboarding_completed', true)
    .order('last_name');

  return { data, error };
};

/**
 * Get all teachers from same institute
 */
export const getTeachers = async (instituteId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, role, avatar_url')
    .eq('institute_id', instituteId)
    .eq('role', 'teacher')
    .eq('onboarding_completed', true)
    .order('last_name');

  return { data, error };
};

/**
 * Search users by name
 */
export const searchUsers = async (query, instituteId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, role, avatar_url, class:classes(name)')
    .eq('institute_id', instituteId)
    .eq('onboarding_completed', true)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .limit(20);

  return { data, error };
};

/**
 * Get teacher's classes
 */
export const getTeacherClasses = async (teacherId) => {
  const { data, error } = await supabase
    .from('teacher_classes')
    .select(`
      id,
      class:classes(id, name)
    `)
    .eq('teacher_id', teacherId)
    .order('class(name)');

  return { data, error };
};

/**
 * Add class to teacher
 */
export const addTeacherClass = async (teacherId, classId) => {
  const { data, error } = await supabase
    .from('teacher_classes')
    .insert({ teacher_id: teacherId, class_id: classId })
    .select(`
      id,
      class:classes(id, name)
    `)
    .single();

  return { data, error };
};

/**
 * Remove class from teacher
 */
export const removeTeacherClass = async (teacherClassId) => {
  const { error } = await supabase
    .from('teacher_classes')
    .delete()
    .eq('id', teacherClassId);

  return { error };
};

/**
 * Update user profile (alias for updateUser)
 */
export const updateUserProfile = updateUser;

/**
 * Upload avatar to Supabase Storage
 */
export const uploadAvatar = async (userId, imageUri) => {
  try {
    const fileExt = imageUri.split('.').pop().toLowerCase();
    const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    // Delete old avatar first
    const { data: oldUser } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (oldUser?.avatar_url) {
      try {
        const oldPath = oldUser.avatar_url.split('/avatars/')[1];
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      } catch (e) {
        console.log('Old avatar deletion failed (non-critical):', e);
      }
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, arrayBuffer, {
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return { data: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Upload avatar error:', error);
    return { data: null, error };
  }
};