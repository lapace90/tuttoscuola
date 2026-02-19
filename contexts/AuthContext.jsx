import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import * as authService from '../services/authService';
import * as userService from '../services/userService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on registration,
    // then SIGNED_IN/SIGNED_OUT on subsequent changes.
    // No need for a separate checkSession — this handles everything.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await userService.getUserById(userId);
      if (!error && data) {
        setProfile(data);
      }
    } catch (e) {
      console.log('Profile fetch error:', e);
    }
  };

  const signUp = async (email, password) => {
    const { data, error } = await authService.signUp(email, password);
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await authService.signIn(email, password);
    let userProfile = null;
    if (!error && data.user) {
      const { data: profileData } = await userService.getUserById(data.user.id);
      if (profileData) {
        setProfile(profileData);
        userProfile = profileData;
      }
    }
    return { data, error, profile: userProfile };
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

export default AuthContext;