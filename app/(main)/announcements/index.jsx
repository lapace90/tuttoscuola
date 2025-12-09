import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { hp, wp, getRelativeTime } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { useAnnouncements } from '../../../hooks/useAnnouncements';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Icon from '../../../assets/icons/Icon';

const AUDIENCE_LABELS = {
  all: 'Tutti',
  students: 'Studenti',
  teachers: 'Professori',
};

const PRIORITY_CONFIG = {
  high: { color: theme.colors.error, label: 'Urgente' },
  normal: { color: theme.colors.primary, label: 'Normale' },
  low: { color: theme.colors.textLight, label: 'Info' },
};

const Announcements = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const { 
    announcements, 
    loading, 
    refreshing, 
    refresh, 
    markAsRead, 
    isRead 
  } = useAnnouncements();

  const handlePress = async (announcement) => {
    await markAsRead(announcement.id);
    router.push(`/(main)/announcements/${announcement.id}`);
  };

  const renderAnnouncement = ({ item }) => {
    const priority = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.normal;
    const read = isRead(item.id);

    return (
      <Pressable
        style={[styles.card, !read && styles.cardUnread]}
        onPress={() => handlePress(item)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.priorityBadge, { backgroundColor: priority.color + '20' }]}>
            <View style={[styles.priorityDot, { backgroundColor: priority.color }]} />
            <Text style={[styles.priorityText, { color: priority.color }]}>
              {priority.label}
            </Text>
          </View>
          <Text style={styles.cardDate}>{getRelativeTime(item.created_at)}</Text>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        
        {item.content && (
          <Text style={styles.cardContent} numberOfLines={2}>
            {item.content}
          </Text>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.authorText}>
            {item.author?.first_name} {item.author?.last_name}
          </Text>
          {item.target_audience !== 'all' && (
            <Text style={styles.audienceText}>
              • {AUDIENCE_LABELS[item.target_audience]}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Comunicazioni</Text>
        {profile?.role === 'teacher' && (
          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/(main)/announcements/create')}
          >
            <Icon name="plus" size={22} color="white" />
          </Pressable>
        )}
        {profile?.role !== 'teacher' && <View style={{ width: 36 }} />}
      </View>

      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id}
        renderItem={renderAnnouncement}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bell" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>
              {loading ? 'Caricamento...' : 'Nessuna comunicazione'}
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
};

export default Announcements;

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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
    flexGrow: 1,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(2),
    marginBottom: hp(1.5),
    ...theme.shadows.sm,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: theme.radius.full,
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: hp(1.2),
    fontWeight: theme.fonts.semiBold,
  },
  cardDate: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
  },
  cardTitle: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: hp(0.5),
  },
  cardContent: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    lineHeight: hp(2.1),
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1),
  },
  authorText: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
  },
  audienceText: {
    fontSize: hp(1.3),
    color: theme.colors.secondary,
    marginLeft: wp(1),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(15),
    gap: hp(2),
  },
  emptyText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
});