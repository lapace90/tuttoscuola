import { View, Text, StyleSheet, ScrollView, Pressable, ActionSheetIOS, Alert, Platform, Share } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { hp, wp, getRelativeTime } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { supabase } from '../../../lib/supabase';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Avatar from '../../../components/common/Avatar';
import Icon from '../../../assets/icons/Icon';

const AUDIENCE_LABELS = {
  all: 'Tutti',
  students: 'Studenti',
  teachers: 'Professori',
};

const PRIORITY_CONFIG = {
  high: { color: theme.colors.error, label: 'Urgente', icon: 'alertCircle' },
  normal: { color: theme.colors.primary, label: 'Normale', icon: 'info' },
  low: { color: theme.colors.textLight, label: 'Info', icon: 'messageCircle' },
};

const AnnouncementDetail = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadAnnouncement();
  }, [id]);

  const loadAnnouncement = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        author:users!author_id(id, first_name, last_name, role, avatar_url),
        target_class:classes!target_class_id(id, name)
      `)
      .eq('id', id)
      .single();

    if (!error && data) {
      setAnnouncement(data);
    }
    setLoading(false);
  };

  const handleShare = async () => {
    const text = `${announcement.title}\n\n${announcement.content || ''}`;
    await Share.share({ message: text.trim() });
  };

  const showActionMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annulla', 'Condividi', 'Segnala contenuto'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 2,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) await handleShare();
          else if (buttonIndex === 2) router.push('/(main)/support/report');
        }
      );
    } else {
      Alert.alert('Opzioni', '', [
        { text: 'Condividi', onPress: handleShare },
        { text: 'Segnala contenuto', style: 'destructive', onPress: () => router.push('/(main)/support/report') },
        { text: 'Annulla', style: 'cancel' },
      ]);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <BackButton router={router} />
          <Text style={styles.headerTitle}>Comunicazione</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!announcement) {
    return (
      <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <BackButton router={router} />
          <Text style={styles.headerTitle}>Comunicazione</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Comunicazione non trovata</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const priority = PRIORITY_CONFIG[announcement.priority] || PRIORITY_CONFIG.normal;

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Comunicazione</Text>
        <Pressable style={styles.menuButton} onPress={showActionMenu}>
          <Icon name="moreVertical" size={22} color={theme.colors.text} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Priority & date */}
        <View style={styles.metaRow}>
          <View style={[styles.priorityBadge, { backgroundColor: priority.color + '20' }]}>
            <Icon name={priority.icon} size={14} color={priority.color} />
            <Text style={[styles.priorityText, { color: priority.color }]}>
              {priority.label}
            </Text>
          </View>
          <Text style={styles.dateText}>{getRelativeTime(announcement.created_at)}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{announcement.title}</Text>

        {/* Audience info */}
        <View style={styles.audienceRow}>
          <Icon name="users" size={14} color={theme.colors.textLight} />
          <Text style={styles.audienceText}>
            {announcement.target_class
              ? `Classe ${announcement.target_class.name}`
              : AUDIENCE_LABELS[announcement.target_audience] || 'Tutti'}
          </Text>
        </View>

        {/* Content */}
        {announcement.content ? (
          <Text style={styles.contentText}>{announcement.content}</Text>
        ) : (
          <Text style={styles.noContent}>Nessun contenuto aggiuntivo</Text>
        )}

        {/* Author */}
        <View style={styles.authorSection}>
          <View style={styles.authorRow}>
            <Avatar
              firstName={announcement.author?.first_name}
              lastName={announcement.author?.last_name}
              uri={announcement.author?.avatar_url}
              size={40}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                {announcement.author?.first_name} {announcement.author?.last_name}
              </Text>
              <Text style={styles.authorRole}>
                {announcement.author?.role === 'teacher' ? 'Professore' : 'Amministratore'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

    </ScreenWrapper>
  );
};

export default AnnouncementDetail;

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
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: theme.radius.full,
    gap: 6,
  },
  priorityText: {
    fontSize: hp(1.3),
    fontWeight: theme.fonts.semiBold,
  },
  dateText: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  title: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  audienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginBottom: hp(2.5),
    paddingBottom: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  audienceText: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  contentText: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    lineHeight: hp(2.6),
    marginBottom: hp(3),
  },
  noContent: {
    fontSize: hp(1.5),
    color: theme.colors.placeholder,
    fontStyle: 'italic',
    marginBottom: hp(3),
  },
  authorSection: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(2),
    ...theme.shadows.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  authorRole: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    marginTop: 2,
  },
});
