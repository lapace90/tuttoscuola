import { supabase } from '../lib/supabase';

// ==================== ADMIN CHECK ====================

export const isUserAdmin = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();

  return { isAdmin: data?.is_admin || false, error };
};

// ==================== PROMOTIONS PERIOD ====================

export const arePromotionsOpen = () => {
  // TODO: Remettre la restriction après les tests
  // const now = new Date();
  // const month = now.getMonth();
  // const day = now.getDate();
  // if (month === 5 && day >= 15) return true; // Mi-giugno
  // if (month >= 6 && month <= 8) return true; // Luglio, Agosto, Settembre
  // return false;
  
  return true; // Per test - rimuovere in produzione
};

// ==================== ADMIN MANAGEMENT ====================

export const getTeachersForAdmin = async (instituteId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, is_admin')
    .eq('institute_id', instituteId)
    .eq('role', 'teacher')
    .order('last_name');

  return { data, error };
};

export const setAdminStatus = async (userId, isAdmin) => {
  const { data, error } = await supabase
    .from('users')
    .update({ is_admin: isAdmin })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};

// ==================== CLASSES MANAGEMENT ====================

export const getAllClasses = async (instituteId) => {
  const { data, error } = await supabase
    .from('classes')
    .select(`
      *,
      students:users(count)
    `)
    .eq('institute_id', instituteId)
    .order('name');

  return { data, error };
};

export const createClass = async ({ name, year, instituteId }) => {
  const { data: existing } = await supabase
    .from('classes')
    .select('id')
    .eq('name', name)
    .eq('institute_id', instituteId)
    .single();

  if (existing) {
    return { data: null, error: { message: 'Questa classe esiste già' } };
  }

  const { data, error } = await supabase
    .from('classes')
    .insert({ name, year, institute_id: instituteId })
    .select()
    .single();

  return { data, error };
};

export const updateClass = async (classId, updates) => {
  const { data, error } = await supabase
    .from('classes')
    .update(updates)
    .eq('id', classId)
    .select()
    .single();

  return { data, error };
};

export const deleteClass = async (classId) => {
  const { data: students } = await supabase
    .from('users')
    .select('id')
    .eq('class_id', classId)
    .limit(1);

  if (students && students.length > 0) {
    return { error: { message: 'Non puoi eliminare una classe con studenti' } };
  }

  const { error } = await supabase
    .from('classes')
    .delete()
    .eq('id', classId);

  return { error };
};

// ==================== SUBJECTS MANAGEMENT ====================

export const getAllSubjectsAdmin = async () => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name');

  return { data, error };
};

export const createSubject = async (name) => {
  const { data: existing } = await supabase
    .from('subjects')
    .select('id')
    .eq('name', name)
    .single();

  if (existing) {
    return { data: null, error: { message: 'Questa materia esiste già' } };
  }

  const { data, error } = await supabase
    .from('subjects')
    .insert({ name })
    .select()
    .single();

  return { data, error };
};

export const updateSubject = async (subjectId, name) => {
  const { data, error } = await supabase
    .from('subjects')
    .update({ name })
    .eq('id', subjectId)
    .select()
    .single();

  return { data, error };
};

export const deleteSubject = async (subjectId) => {
  const { data: teachers } = await supabase
    .from('teacher_subjects')
    .select('id')
    .eq('subject_id', subjectId)
    .limit(1);

  if (teachers && teachers.length > 0) {
    return { error: { message: 'Non puoi eliminare una materia assegnata a dei professori' } };
  }

  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', subjectId);

  return { error };
};

// ==================== STUDENTS MANAGEMENT ====================

export const getStudentsByClass = async (classId) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, class_id')
    .eq('class_id', classId)
    .eq('role', 'student')
    .order('last_name');

  return { data, error };
};

// ==================== PROMOTIONS ====================

export const getNextClass = async (currentClassId, instituteId, autoCreate = false) => {
  const { data: currentClass } = await supabase
    .from('classes')
    .select('name, year')
    .eq('id', currentClassId)
    .single();

  if (!currentClass) return { data: null, error: { message: 'Classe non trovata' } };

  if (currentClass.year >= 5) {
    return { data: null, graduated: true };
  }

  const section = currentClass.name.replace(/[0-9]/g, '');
  const nextYear = currentClass.year + 1;
  const nextClassName = `${nextYear}${section}`;

  let { data: nextClass } = await supabase
    .from('classes')
    .select('id, name, year')
    .eq('name', nextClassName)
    .eq('institute_id', instituteId)
    .maybeSingle();

  // Crea automaticamente la classe se non esiste
  if (!nextClass && autoCreate) {
    const { data: newClass, error: createError } = await supabase
      .from('classes')
      .insert({ 
        name: nextClassName, 
        year: nextYear, 
        institute_id: instituteId 
      })
      .select()
      .single();

    if (createError) {
      return { data: null, error: { message: `Errore creazione classe ${nextClassName}` } };
    }
    
    nextClass = newClass;
  }

  if (!nextClass) {
    return { data: null, error: { message: `La classe ${nextClassName} non esiste.` } };
  }

  return { data: nextClass };
};

export const promoteStudent = async (studentId, newClassId) => {
  const { data, error } = await supabase
    .from('users')
    .update({ class_id: newClassId })
    .eq('id', studentId)
    .select()
    .single();

  return { data, error };
};

export const graduateStudent = async (studentId) => {
  const { data, error } = await supabase
    .from('users')
    .update({ class_id: null })
    .eq('id', studentId)
    .select()
    .single();

  return { data, error };
};

export const changeStudentSection = async (studentId, newClassId) => {
  const { data, error } = await supabase
    .from('users')
    .update({ class_id: newClassId })
    .eq('id', studentId)
    .select()
    .single();

  return { data, error };
};

export const promoteEntireClass = async (classId, instituteId) => {
  const { data: students, error: fetchError } = await getStudentsByClass(classId);
  if (fetchError) return { error: fetchError };

  const { data: currentClass } = await supabase
    .from('classes')
    .select('name, year')
    .eq('id', classId)
    .maybeSingle();

  const section = currentClass.name.replace(/[0-9]/g, '');
  const nextClassName = `${currentClass.year + 1}${section}`;

  // Verifica se la classe esiste già
  const { data: existingClass } = await supabase
    .from('classes')
    .select('id')
    .eq('name', nextClassName)
    .eq('institute_id', instituteId)
    .single();

  const willCreateClass = !existingClass && currentClass.year < 5;

  // autoCreate = true per creare automaticamente la classe successiva
  const { data: nextClass, graduated, error: nextError } = await getNextClass(classId, instituteId, true);
  
  if (nextError) return { error: nextError };

  const results = { promoted: 0, graduated: 0, errors: [], classCreated: willCreateClass ? nextClassName : null };

  for (const student of students) {
    if (graduated) {
      const { error } = await graduateStudent(student.id);
      if (error) {
        results.errors.push(`${student.last_name}: ${error.message}`);
      } else {
        results.graduated++;
      }
    } else {
      const { error } = await promoteStudent(student.id, nextClass.id);
      if (error) {
        results.errors.push(`${student.last_name}: ${error.message}`);
      } else {
        results.promoted++;
      }
    }
  }

  return { data: results, error: null };
};