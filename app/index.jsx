import { View, ActivityIndicator } from 'react-native';
import React from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';

const Index = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
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
  }

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  if (!profile?.onboarding_completed) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(main)/(tabs)/calendar" />;
};

export default Index;