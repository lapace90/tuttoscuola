import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, Alert } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { hp, wp, getRelativeTime } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useNotifications } from '../../../hooks/useNotifications';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Icon from '../../../assets/icons/Icon';

const Notifications = () => {
  const router = useRouter();
  const { 
    notifications, 
    unreadCount,
    loading, 
    refreshing, 
    refresh,
    markRead,
    markAllRead,
    remove,
    getTypeConfig
  } = useNotifications();

  const handlePress = async (notification) => {
    if (!notification.read) {
      await markRead(notification.id);
    }

    const config = getTypeConfig(notification.type);
    if (config.route) {
      // If notification has specific data, append to route
      if (notification.data?.id) {
        router.push(`${config.route}/${notification.data.id}`);
      } else {
        router.push(config.route);
      }
    }
  };

  const handleDelete = (notification) => {
    Alert.alert(
      'Elimina notifica',
      'Vuoi eliminare questa notifica?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => remove(notification.id)
        }
      ]
    );
  };

  const handleMarkAllRead = () => {
    if (unreadCount === 0) return;
    
    Alert.alert(
      'Segna tutte come lette',
      'Vuoi segnare tutte le notifiche come lette?',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Conferma', onPress: markAllRead }
      ]
    );
  };

  const renderNotification = ({ item }) => {
    const config = getTypeConfig(item.type);

    return (
      <Pressable
        style={[styles.card, !item.read && styles.cardUnread]}
        onPress={() => handlePress(item)}
        onLongPress={() => handleDelete(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
          <Icon name={config.icon} size={20} color={config.color} />
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          
          {item.body && (
            <Text style={styles.cardBody} numberOfLines={2}>
              {item.body}
            </Text>
          )}
          
          <Text style={styles.cardTime}>{getRelativeTime(item.created_at)}</Text>
        </View>
      </Pressable>
    );
  };

  const renderSectionHeader = (title, count) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
    </View>
  );

  // Separate unread and read
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const sections = [];
  if (unreadNotifications.length > 0) {
    sections.push({ title: 'Nuove', data: unreadNotifications, count: unreadNotifications.length });
  }
  if (readNotifications.length > 0) {
    sections.push({ title: 'Precedenti', data: readNotifications, count: 0 });
  }

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Notifiche</Text>
        {unreadCount > 0 ? (
          <Pressable style={styles.markAllButton} onPress={handleMarkAllRead}>
            <Icon name="checkCircle" size={22} color={theme.colors.primary} />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="bell" size={64} color={theme.colors.border} />
          <Text style={styles.emptyTitle}>
            {loading ? 'Caricamento...' : 'Nessuna notifica'}
          </Text>
          <Text style={styles.emptySubtitle}>
            Le tue notifiche appariranno qui
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          ListHeaderComponent={
            unreadNotifications.length > 0 && readNotifications.length > 0 ? (
              renderSectionHeader('Nuove', unreadNotifications.length)
            ) : null
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
  markAllButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginBottom: hp(1.5),
    marginTop: hp(1),
  },
  sectionTitle: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: wp(2),
    paddingVertical: 2,
  },
  countText: {
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
    color: 'white',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    gap: wp(3),
    ...theme.shadows.sm,
  },
  cardUnread: {
    backgroundColor: theme.colors.primary + '08',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  cardTitle: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    flex: 1,
  },
  cardTitleUnread: {
    fontWeight: theme.fonts.bold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  cardBody: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: hp(0.3),
    lineHeight: hp(2),
  },
  cardTime: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
    marginTop: hp(0.5),
  },
  separator: {
    height: hp(1),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(10),
  },
  emptyTitle: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginTop: hp(2),
  },
  emptySubtitle: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginTop: hp(0.5),
  },
});