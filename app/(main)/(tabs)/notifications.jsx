import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useNotifications } from '../../../contexts/NotificationsContext';
import { NOTIFICATION_TYPES, formatNotificationTime, deleteNotification, clearAllNotifications } from '../../../services/notificationService';
import { useAuth } from '../../../contexts/AuthContext';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Icon from '../../../assets/icons/Icon';

const Notifications = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const {
    notifications,
    loading,
    refresh,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadCount
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    // Segna come letta
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    // Naviga in base al tipo
    const typeConfig = NOTIFICATION_TYPES[notification.type];
    const data = notification.data || {};

    switch (notification.type) {
      case 'message':
        if (data.chat_id) {
          router.push(`/(main)/chat/${data.chat_id}`);
        }
        break;
      case 'slot':
      case 'booking':
        if (data.slot_id) {
          router.push(`/(main)/slot/${data.slot_id}`);
        }
        break;
      case 'grade':
        router.push('/(main)/grades');
        break;
      case 'announcement':
        router.push('/(main)/announcements');
        break;
      case 'admin_role':
        router.push('/(main)/profile');
        break;
      default:
        // Nessuna navigazione
        break;
    }
  };

  const handleMarkAllRead = () => {
    Alert.alert(
      'Segna tutte come lette',
      'Vuoi segnare tutte le notifiche come lette?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Conferma',
          onPress: async () => {
            await markAllNotificationsAsRead();
          }
        }
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Elimina tutte',
      'Vuoi eliminare tutte le notifiche? Questa azione non può essere annullata.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            await clearAllNotifications(profile.id);
            refresh();
          }
        }
      ]
    );
  };

  const renderNotification = useCallback(({ item }) => {
    const typeConfig = NOTIFICATION_TYPES[item.type] || NOTIFICATION_TYPES.announcement;

    return (
      <Pressable
        style={[styles.notificationItem, !item.read && styles.notificationUnread]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: typeConfig.color + '20' }]}>
          <Icon name={typeConfig.icon} size={20} color={typeConfig.color} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          {item.body && (
            <Text style={styles.body} numberOfLines={2}>
              {item.body}
            </Text>
          )}
          <Text style={styles.time}>
            {formatNotificationTime(item.created_at)}
          </Text>
        </View>

        {!item.read && <View style={styles.unreadDot} />}
      </Pressable>
    );
  }, []);

  const renderHeader = () => {
    if (notifications.length === 0) return null;

    return (
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>
          {unreadCount > 0 ? `${unreadCount} non lette` : 'Tutte lette'}
        </Text>
        <View style={styles.listHeaderActions}>
          {unreadCount > 0 && (
            <Pressable onPress={handleMarkAllRead} style={styles.headerAction}>
              <Icon name="checkCircle" size={16} color={theme.colors.primary} />
              <Text style={styles.headerActionText}>Leggi tutte</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Icon name="bell" size={48} color={theme.colors.textLight} />
      </View>
      <Text style={styles.emptyTitle}>Nessuna notifica</Text>
      <Text style={styles.emptyText}>
        Le tue notifiche appariranno qui
      </Text>
    </View>
  );

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Notifiche</Text>
        {notifications.length > 0 ? (
          <Pressable onPress={handleClearAll} style={styles.clearButton}>
            <Icon name="trash" size={20} color={theme.colors.textLight} />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={notifications.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  clearButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
  },
  emptyList: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1),
    marginBottom: hp(1),
  },
  listHeaderText: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  listHeaderActions: {
    flexDirection: 'row',
    gap: wp(3),
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  headerActionText: {
    fontSize: hp(1.4),
    color: theme.colors.primary,
    fontWeight: theme.fonts.medium,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    marginBottom: hp(1),
    ...theme.shadows.sm,
  },
  notificationUnread: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: wp(3),
    
  },
  title: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  titleUnread: {
    fontWeight: theme.fonts.bold,
  },
  body: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: hp(0.3),
    lineHeight: hp(2),
  },
  time: {
    fontSize: hp(1.2),
    color: theme.colors.placeholder,
    marginTop: hp(0.5),
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: wp(2),
    marginTop: hp(0.5),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10),
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
    ...theme.shadows.sm,
  },
  emptyTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  emptyText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});