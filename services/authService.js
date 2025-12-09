import { supabase } from '../lib/supabase';

const ALLOWED_DOMAIN = 'cattaneodigitale.it';

/**
 * Validate email domain
 */
export const validateEmailDomain = (email) => {
  // DEV: disabilita validazione
  return { valid: true };
  
  // PROD: riabilita questo
  // if (!email) return { valid: false, error: 'Email richiesta' };
  // const domain = email.split('@')[1]?.toLowerCase();
  // if (domain !== ALLOWED_DOMAIN) {
  //   return { valid: false, error: `Usa la tua email scolastica (@${ALLOWED_DOMAIN})` };
  // }
  // return { valid: true };
};

/**
 * Sign up with email - sends magic link / confirmation email
 */
export const signUp = async (email, password) => {
  // Validate domain first
  const validation = validateEmailDomain(email);
  if (!validation.valid) {
    return { error: { message: validation.error } };
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      emailRedirectTo: 'tuttoscuola://auth/callback',
    }
  });

  return { data, error };
};

/**
 * Sign in with email and password
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });

  return { data, error };
};

/**
 * Sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email) => {
  const validation = validateEmailDomain(email);
  if (!validation.valid) {
    return { error: { message: validation.error } };
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email.toLowerCase().trim(),
    {
      redirectTo: 'tuttoscuola://auth/reset-password',
    }
  );

  return { data, error };
};

/**
 * Update password (after reset link clicked)
 */
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { data, error };
};

/**
 * Get current session
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};