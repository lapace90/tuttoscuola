// app/(main)/(tabs)/profile.jsx
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme, roleColors } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import Icon from '../../../assets/icons/Icon';

const Profile = () => {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Esci',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Esci', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/welcome');
          }
        },
      ]
    );
  };

  const getInitials = () => {
    if (!profile?.first_name) return '?';
    return `${profile.first_name[0]}${profile.last_name?.[0] || ''}`.toUpperCase();
  };

  const getRoleLabel = () => {
    switch (profile?.role) {
      case 'teacher': return 'Professore';
      case 'admin': return 'Admin';
      default: return 'Studente';
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { borderColor: roleColors[profile?.role] || theme.colors.primary }]}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: roleColors[profile?.role] || theme.colors.primary }]}>
              <Text style={styles.roleText}>{getRoleLabel()}</Text>
            </View>
          </View>

          <Text style={styles.name}>
            {profile?.first_name} {profile?.last_name}
          </Text>
          <Text style={styles.email}>{profile?.email}</Text>
          
          {profile?.role === 'student' && profile?.class && (
            <View style={styles.classInfo}>
              <Icon name="users" size={16} color={theme.colors.textLight} />
              <Text style={styles.classText}>Classe {profile.class.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <Pressable 
            style={styles.menuItem}
            onPress={() => router.push('/(main)/profile/edit')}
          >
            <View style={styles.menuIcon}>
              <Icon name="user" size={22} color={theme.colors.text} />
            </View>
            <Text style={styles.menuText}>Modifica profilo</Text>
            <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
          </Pressable>

          {profile?.role === 'teacher' && (
            <Pressable 
              style={styles.menuItem}
              onPress={() => router.push('/(main)/subjects')}
            >
              <View style={styles.menuIcon}>
                <Icon name="book" size={22} color={theme.colors.text} />
              </View>
              <Text style={styles.menuText}>Le mie materie</Text>
              <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
            </Pressable>
          )}

          {profile?.role === 'teacher' && (
            <Pressable 
              style={styles.menuItem}
              onPress={() => router.push('/(main)/classes')}
            >
              <View style={styles.menuIcon}>
                <Icon name="users" size={22} color={theme.colors.text} />
              </View>
              <Text style={styles.menuText}>Le mie classi</Text>
              <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
            </Pressable>
          )}

          {profile?.role === 'teacher' && (
            <Pressable 
              style={styles.menuItem}
              onPress={() => router.push('/(main)/grades/manage')}
            >
              <View style={styles.menuIcon}>
                <Icon name="fileText" size={22} color={theme.colors.text} />
              </View>
              <Text style={styles.menuText}>Registro voti</Text>
              <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
            </Pressable>
          )}

          {profile?.role === 'student' && (
            <Pressable 
              style={styles.menuItem}
              onPress={() => router.push('/(main)/grades')}
            >
              <View style={styles.menuIcon}>
                <Icon name="fileText" size={22} color={theme.colors.text} />
              </View>
              <Text style={styles.menuText}>I miei voti</Text>
              <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
            </Pressable>
          )}

          <Pressable 
            style={styles.menuItem}
            onPress={() => router.push('/(main)/homework')}
          >
            <View style={styles.menuIcon}>
              <Icon name="book" size={22} color={theme.colors.text} />
            </View>
            <Text style={styles.menuText}>Compiti</Text>
            <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
          </Pressable>

          <Pressable 
            style={styles.menuItem}
            onPress={() => router.push('/(main)/announcements')}
          >
            <View style={styles.menuIcon}>
              <Icon name="bell" size={22} color={theme.colors.text} />
            </View>
            <Text style={styles.menuText}>Comunicazioni</Text>
            <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supporto</Text>
          
          <Pressable 
            style={styles.menuItem}
            onPress={() => router.push('/(main)/about')}
          >
            <View style={styles.menuIcon}>
              <Icon name="info" size={22} color={theme.colors.text} />
            </View>
            <Text style={styles.menuText}>Informazioni app</Text>
            <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
          </Pressable>
        </View>

        <Pressable style={styles.logoutButton} onPress={handleSignOut}>
          <Icon name="logout" size={22} color={theme.colors.error} />
          <Text style={styles.logoutText}>Esci</Text>
        </Pressable>

        <Text style={styles.version}>TuttoScuola v1.0.0</Text>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  header: {
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: hp(2),
  },
  avatar: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    ...theme.shadows.md,
  },
  avatarText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: theme.radius.full,
  },
  roleText: {
    fontSize: hp(1.3),
    fontWeight: theme.fonts.semiBold,
    color: 'white',
  },
  name: {
    fontSize: hp(2.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(0.5),
  },
  email: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1),
    gap: wp(1),
  },
  classText: {
    fontSize: hp(1.6),
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
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  menuText: {
    flex: 1,
    fontSize: hp(1.8),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.errorLight + '20',
    padding: hp(2),
    borderRadius: theme.radius.lg,
    marginTop: hp(2),
    gap: wp(2),
  },
  logoutText: {
    fontSize: hp(1.8),
    color: theme.colors.error,
    fontWeight: theme.fonts.semiBold,
  },
  version: {
    textAlign: 'center',
    fontSize: hp(1.4),
    color: theme.colors.placeholder,
    marginTop: hp(3),
  },
});