import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../constants/theme';
import { useUnreadMessagesContext } from '../../../contexts/UnreadMessagesContext';
import { useNotifications } from '../../../contexts/NotificationsContext';
import Icon from '../../../assets/icons/Icon';

// Composant Badge
const TabBarBadge = ({ count }) => {
  if (!count || count <= 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

// Icône avec badge
const TabBarIconWithBadge = ({ name, color, size, badgeCount }) => (
  <View style={styles.iconContainer}>
    <Icon name={name} size={size} color={color} />
    <TabBarBadge count={badgeCount} />
  </View>
);

const TabsLayout = () => {
  const { bottom } = useSafeAreaInsets();
  const { totalUnread: unreadMessages } = useUnreadMessagesContext();
  const { unreadCount: unreadNotifications } = useNotifications();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          height: 60 + bottom,
          paddingBottom: bottom + 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: theme.fonts.medium,
        },
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <TabBarIconWithBadge
              name="messageCircle"
              size={size}
              color={color}
              badgeCount={unreadMessages}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profilo',
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifiche',
          tabBarIcon: ({ color, size }) => (
            <TabBarIconWithBadge
              name="bell"
              size={size}
              color={color}
              badgeCount={unreadNotifications}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});