import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getNotificationSettings, updateNotificationSettings } from '../../../services/pushService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Icon from '../../../assets/icons/Icon';

// Opzioni per studenti
const STUDENT_OPTIONS = [
  {
    key: 'messages',
    title: 'Messaggi',
    description: 'Nuovi messaggi nelle chat',
    icon: 'messageCircle',
    color: '#8B5CF6',
  },
  {
    key: 'announcements',
    title: 'Comunicazioni',
    description: 'Avvisi e comunicazioni scolastiche',
    icon: 'bell',
    color: '#3B82F6',
  },
  {
    key: 'bookings',
    title: 'Prenotazioni',
    description: 'Conferme e promemoria prenotazioni',
    icon: 'calendar',
    color: '#10B981',
  },
  {
    key: 'grades',
    title: 'Voti',
    description: 'Nuovi voti e valutazioni',
    icon: 'fileText',
    color: '#F59E0B',
  },
];

// Opzioni per professori
const TEACHER_OPTIONS = [
  {
    key: 'messages',
    title: 'Messaggi',
    description: 'Nuovi messaggi nelle chat',
    icon: 'messageCircle',
    color: '#8B5CF6',
  },
  {
    key: 'announcements',
    title: 'Comunicazioni',
    description: 'Avvisi e comunicazioni scolastiche',
    icon: 'bell',
    color: '#3B82F6',
  },
  {
    key: 'bookings',
    title: 'Nuove prenotazioni',
    description: 'Studenti che prenotano i tuoi slot',
    icon: 'calendar',
    color: '#10B981',
  },
  {
    key: 'roles',
    title: 'Assegnazioni ruoli',
    description: 'Nuovi ruoli admin assegnati',
    icon: 'shield',
    color: '#EF4444',
  },
];

const NotificationSettings = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [settings, setSettings] = useState({
    messages: true,
    announcements: true,
    bookings: true,
    grades: true,
    roles: true,
  });
  const [loading, setLoading] = useState(true);

  const options = profile?.role === 'teacher' ? TEACHER_OPTIONS : STUDENT_OPTIONS;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (!profile?.id) return;

    const { data } = await getNotificationSettings(profile.id);
    if (data) {
      setSettings(data);
    }
    setLoading(false);
  };

  const handleToggle = async (key) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(newSettings);
    await updateNotificationSettings(profile.id, newSettings);
  };

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <BackButton router={router} />
          <Text style={styles.headerTitle}>Notifiche</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Notifiche</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Scegli quali notifiche ricevere</Text>

        {options.map((option) => (
          <View key={option.key} style={styles.optionCard}>
            <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
              <Icon name={option.icon} size={22} color={option.color} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <Switch
              value={settings[option.key]}
              onValueChange={() => handleToggle(option.key)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + '60' }}
              thumbColor={settings[option.key] ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
        ))}

        <Text style={styles.infoText}>
          Puoi modificare queste impostazioni in qualsiasi momento. 
          Le notifiche push richiedono che l'app sia installata sul dispositivo.
        </Text>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default NotificationSettings;

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
  container: {
    flex: 1,
  },
  content: {
    padding: wp(5),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  sectionTitle: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: hp(2),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: hp(2),
    borderRadius: theme.radius.lg,
    marginBottom: hp(1.5),
    ...theme.shadows.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
    marginLeft: wp(3),
  },
  optionTitle: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  optionDescription: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: hp(0.3),
  },
  infoText: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: hp(2),
    lineHeight: hp(2),
  },
});