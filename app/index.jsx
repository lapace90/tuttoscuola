// app/index.jsx
import { View, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';

const Index = () => {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // Utente connesso
      if (profile?.onboarding_completed) {
        // Onboarding completato → vai all'app
        router.replace('/(main)/calendar');
      } else {
        // Onboarding non completato → vai all'onboarding
        router.replace('/onboarding');
      }
    } else {
      // Non connesso → vai al welcome
      router.replace('/welcome');
    }
  }, [user, profile, loading]);

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: theme.colors.background 
    }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

export default Index;