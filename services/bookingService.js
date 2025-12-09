import { supabase } from '../lib/supabase';

/**
 * Get slots for a class within date range
 */
export const getSlotsByClass = async (classId, startDate, endDate) => {
  const { data, error } = await supabase
    .from('booking_slots')
    .select(`
      *,
      teacher:users!teacher_id(id, first_name, last_name),
      bookings(id, student_id, status)
    `)
    .eq('class_id', classId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('start_time');

  return { data, error };
};

/**
 * Get slots for a specific date
 */
export const getSlotsByDate = async (classId, date) => {
  const { data, error } = await supabase
    .from('booking_slots')
    .select(`
      *,
      teacher:users!teacher_id(id, first_name, last_name),
      bookings(id, student_id, status, student:users!student_id(id, first_name, last_name))
    `)
    .eq('class_id', classId)
    .eq('date', date)
    .order('start_time');

  return { data, error };
};

/**
 * Get slots created by a teacher
 */
export const getSlotsByTeacher = async (teacherId, startDate, endDate) => {
  const { data, error } = await supabase
    .from('booking_slots')
    .select(`
      *,
      class:classes(id, name),
      bookings(id, student_id, status, student:users!student_id(id, first_name, last_name))
    `)
    .eq('teacher_id', teacherId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('start_time');

  return { data, error };
};

/**
 * Get a single slot by ID
 */
export const getSlotById = async (slotId) => {
  const { data, error } = await supabase
    .from('booking_slots')
    .select(`
      *,
      teacher:users!teacher_id(id, first_name, last_name, email),
      class:classes(id, name),
      bookings(id, student_id, status, student:users!student_id(id, first_name, last_name))
    `)
    .eq('id', slotId)
    .single();

  return { data, error };
};

/**
 * Create a booking slot (teacher only)
 */
export const createSlot = async (slotData) => {
  const { data, error } = await supabase
    .from('booking_slots')
    .insert(slotData)
    .select(`
      *,
      teacher:users!teacher_id(id, first_name, last_name)
    `)
    .single();

  return { data, error };
};

/**
 * Update a booking slot
 */
export const updateSlot = async (slotId, updates) => {
  const { data, error } = await supabase
    .from('booking_slots')
    .update(updates)
    .eq('id', slotId)
    .select()
    .single();

  return { data, error };
};

/**
 * Delete a booking slot
 */
export const deleteSlot = async (slotId) => {
  const { error } = await supabase
    .from('booking_slots')
    .delete()
    .eq('id', slotId);

  return { error };
};

/**
 * Book a slot (student)
 */
export const bookSlot = async (slotId, studentId) => {
  // First check if slot is available
  const { data: slot, error: slotError } = await supabase
    .from('booking_slots')
    .select('*, bookings(id, status)')
    .eq('id', slotId)
    .single();

  if (slotError) return { error: slotError };

  const confirmedBookings = slot.bookings?.filter(b => b.status === 'confirmed').length || 0;
  
  if (confirmedBookings >= slot.max_students) {
    return { error: { message: 'Slot già pieno' } };
  }

  // Create booking
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      slot_id: slotId,
      student_id: studentId,
      status: 'confirmed'
    })
    .select()
    .single();

  return { data, error };
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .select()
    .single();

  return { data, error };
};

/**
 * Get student's bookings
 */
export const getStudentBookings = async (studentId, startDate, endDate) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      slot:booking_slots(
        *,
        teacher:users!teacher_id(id, first_name, last_name),
        class:classes(id, name)
      )
    `)
    .eq('student_id', studentId)
    .eq('status', 'confirmed')
    .gte('slot.date', startDate)
    .lte('slot.date', endDate);

  return { data, error };
};

/**
 * Check if student already booked a slot
 */
export const hasStudentBooked = async (slotId, studentId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('slot_id', slotId)
    .eq('student_id', studentId)
    .eq('status', 'confirmed')
    .single();

  return { hasBooked: !!data, error };
};