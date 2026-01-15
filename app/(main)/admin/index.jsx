import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { isUserAdmin, arePromotionsOpen } from '../../../services/adminService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Icon from '../../../assets/icons/Icon';

const AdminDashboard = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const promotionsOpen = arePromotionsOpen();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    if (!profile?.id) return;
    
    const { isAdmin: adminStatus } = await isUserAdmin(profile.id);
    setIsAdmin(adminStatus);
    setLoading(false);

    if (!adminStatus) {
      Alert.alert(
        'Accesso negato',
        'Non hai i permessi per accedere a questa sezione.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Verifica permessi...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!isAdmin) return null;

  const menuItems = [
    {
      id: 'classes',
      title: 'Gestione Classi',
      subtitle: 'Aggiungi, modifica o rimuovi classi',
      icon: 'users',
      route: '/(main)/admin/classes',
    },
    {
      id: 'subjects',
      title: 'Gestione Materie',
      subtitle: 'Aggiungi o rimuovi materie',
      icon: 'book',
      route: '/(main)/admin/subjects',
    },
    {
      id: 'admins',
      title: 'Gestione Admin',
      subtitle: 'Assegna ruolo admin ai professori',
      icon: 'shield',
      route: '/(main)/admin/admins',
    },
    {
      id: 'promotions',
      title: 'Promozioni e Bocciature',
      subtitle: promotionsOpen 
        ? 'Gestisci passaggio anno scolastico' 
        : 'Disponibile da metà giugno',
      icon: 'award',
      route: '/(main)/admin/promotions',
      disabled: !promotionsOpen,
    },
  ];

  const handlePress = (item) => {
    if (item.disabled) {
      Alert.alert(
        'Non disponibile',
        'Le promozioni sono disponibili solo da metà giugno a fine settembre.',
      );
      return;
    }
    router.push(item.route);
  };

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Dashboard Admin</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestione Istituto</Text>
          
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.menuItem, item.disabled && styles.menuItemDisabled]}
              onPress={() => handlePress(item)}
            >
              <View style={[styles.menuIcon, item.disabled && styles.menuIconDisabled]}>
                <Icon 
                  name={item.icon} 
                  size={22} 
                  color={item.disabled ? theme.colors.textLight : theme.colors.text} 
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuText, item.disabled && styles.menuTextDisabled]}>
                  {item.title}
                </Text>
                <Text style={styles.menuSubtext}>{item.subtitle}</Text>
              </View>
              <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
            </Pressable>
          ))}
        </View>

        <View style={[
          styles.statusCard,
          promotionsOpen ? styles.statusOpen : styles.statusClosed
        ]}>
          <Icon 
            name={promotionsOpen ? 'checkCircle' : 'clock'} 
            size={20} 
            color={promotionsOpen ? theme.colors.success : theme.colors.textLight} 
          />
          <Text style={[styles.statusText, promotionsOpen && styles.statusTextOpen]}>
            {promotionsOpen 
              ? 'Periodo promozioni attivo' 
              : 'Promozioni disponibili da metà giugno'}
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AdminDashboard;

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
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
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
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: hp(1.5),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: hp(2),
    borderRadius: theme.radius.lg,
    marginBottom: hp(1),
    ...theme.shadows.sm,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  menuIconDisabled: {
    backgroundColor: theme.colors.gray,
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  menuTextDisabled: {
    color: theme.colors.textLight,
  },
  menuSubtext: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: hp(0.3),
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    borderRadius: theme.radius.lg,
    gap: wp(3),
  },
  statusOpen: {
    backgroundColor: theme.colors.success + '20',
  },
  statusClosed: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  statusTextOpen: {
    color: theme.colors.success,
    fontWeight: theme.fonts.medium,
  },
});