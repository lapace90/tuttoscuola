import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const ALLOWED_DOMAIN = 'cattaneodigitale.it';

/**
 * Validate email domain
 */
export const validateEmailDomain = (email) => {
  if (!email) return { valid: false, error: 'Email richiesta' };
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain !== ALLOWED_DOMAIN) {
    return { valid: false, error: `Usa la tua email scolastica (@${ALLOWED_DOMAIN})` };
  }
  return { valid: true };
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

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    const redirectUrl = AuthSession.makeRedirectUri({
      scheme: 'tuttoscuola',
      path: 'auth/callback'
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          hd: ALLOWED_DOMAIN,
        },
      },
    });

    if (error) throw error;

    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === 'success') {
        const url = result.url;
        // Extract tokens from URL
        const params = new URLSearchParams(url.split('#')[1]);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;

          // Validate domain after Google sign-in
          const userEmail = sessionData?.user?.email;
          if (userEmail) {
            const validation = validateEmailDomain(userEmail);
            if (!validation.valid) {
              await supabase.auth.signOut();
              return { data: null, error: { message: validation.error } };
            }
          }

          return { data: sessionData, error: null };
        }
      }

      return { data: null, error: { message: 'Autenticazione annullata' } };
    }

    return { data: null, error: { message: 'Impossibile avviare autenticazione Google' } };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { data: null, error };
  }
};