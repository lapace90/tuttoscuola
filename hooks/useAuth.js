// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import * as authService from '../services/authService';
import * as userService from '../services/userService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    checkSession();

    // Listen to auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { session } = await authService.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId) => {
    const { data, error } = await userService.getUserById(userId);
    if (!error && data) {
      setProfile(data);
    }
  };

  const signUp = async (email, password) => {
    const { data, error } = await authService.signUp(email, password);
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await authService.signIn(email, password);
    if (!error && data.user) {
      await fetchProfile(data.user.id);
    }
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await authService.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
    }
    return { error };
  };

  const sendPasswordReset = async (email) => {
    return await authService.sendPasswordReset(email);
  };

  const updatePassword = async (newPassword) => {
    return await authService.updatePassword(newPassword);
  };

  const completeOnboarding = async (onboardingData) => {
    if (!user) return { error: { message: 'Non autenticato' } };
    
    const { data, error } = await userService.completeOnboarding(user.id, onboardingData);
    if (!error && data) {
      setProfile(data);
    }
    return { data, error };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    needsOnboarding: profile && !profile.onboarding_completed,
    signUp,
    signIn,
    signOut,
    sendPasswordReset,
    updatePassword,
    completeOnboarding,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};