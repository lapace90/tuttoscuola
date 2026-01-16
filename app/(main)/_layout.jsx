import React from 'react';
import { Stack } from 'expo-router';
import { UnreadMessagesProvider } from '../../contexts/UnreadMessagesContext';
import { NotificationsProvider } from '../../contexts/NotificationsContext';

const MainLayout = () => {
  return (
    <UnreadMessagesProvider>
      <NotificationsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </NotificationsProvider>
    </UnreadMessagesProvider>
  );
};

export default MainLayout;