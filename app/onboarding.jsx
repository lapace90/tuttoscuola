// app/onboarding.jsx
import { Alert, StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { hp, wp } from '../helpers/common';
import { theme, roleColors } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { getClassesByInstitute } from '../services/userService';
import ScreenWrapper from '../components/common/ScreenWrapper';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Icon from '../assets/icons/Icon';

const Onboarding = () => {
  const router = useRouter();
  const { profile, completeOnboarding } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedRole, setSelectedRole] = useState('student');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    loadClasses();
  }, [profile]);

  const loadClasses = async () => {
    if (!profile?.institute_id) return;
    
    setLoadingClasses(true);
    const { data, error } = await getClassesByInstitute(profile.institute_id);
    setLoadingClasses(false);
    
    if (!error && data) {
      setClasses(data);
    }
  };

  const onSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Errore', 'Inserisci nome e cognome');
      return;
    }

    if (selectedRole === 'student' && !selectedClass) {
      Alert.alert('Errore', 'Seleziona la tua classe');
      return;
    }

    setLoading(true);
    const { error } = await completeOnboarding({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      classId: selectedRole === 'student' ? selectedClass : null,
      role: selectedRole,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      router.replace('/(main)/calendar');
    }
  };

  const roles = [
    { id: 'student', label: 'Studente', icon: '🎒', description: 'Prenota interrogazioni e compiti' },
    { id: 'teacher', label: 'Professore', icon: '👨‍🏫', description: 'Crea slot per la tua materia' },
  ];

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Completa il profilo ✨</Text>
          <Text style={styles.subtitle}>
            Ancora pochi passi e sei pronto!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Come ti chiami?</Text>
          <View style={styles.nameRow}>
            <View style={styles.nameInput}>
              <Input
                placeholder="Nome"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={styles.nameInput}>
              <Input
                placeholder="Cognome"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sei uno studente o un professore?</Text>
          <View style={styles.rolesContainer}>
            {roles.map((role) => (
              <Pressable
                key={role.id}
                style={[
                  styles.roleCard,
                  selectedRole === role.id && styles.roleCardSelected,
                  selectedRole === role.id && { borderColor: roleColors[role.id] },
                ]}
                onPress={() => setSelectedRole(role.id)}
              >
                <Text style={styles.roleIcon}>{role.icon}</Text>
                <Text style={[
                  styles.roleLabel,
                  selectedRole === role.id && { color: roleColors[role.id] }
                ]}>
                  {role.label}
                </Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
                {selectedRole === role.id && (
                  <View style={[styles.checkBadge, { backgroundColor: roleColors[role.id] }]}>
                    <Icon name="check" size={14} color="white" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {selectedRole === 'student' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Qual è la tua classe?</Text>
            {loadingClasses ? (
              <Text style={styles.loadingText}>Caricamento classi...</Text>
            ) : (
              <View style={styles.classesGrid}>
                {classes.map((cls) => (
                  <Pressable
                    key={cls.id}
                    style={[
                      styles.classCard,
                      selectedClass === cls.id && styles.classCardSelected,
                    ]}
                    onPress={() => setSelectedClass(cls.id)}
                  >
                    <Text style={[
                      styles.className,
                      selectedClass === cls.id && styles.classNameSelected,
                    ]}>
                      {cls.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.submitSection}>
          <Button 
            title="Iniziamo! 🚀" 
            loading={loading} 
            onPress={onSubmit}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(6),
    paddingBottom: hp(4),
  },
  header: {
    marginTop: hp(4),
    marginBottom: hp(3),
  },
  title: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    marginTop: hp(0.5),
  },
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: hp(1.5),
  },
  nameRow: {
    flexDirection: 'row',
    gap: wp(3),
  },
  nameInput: {
    flex: 1,
  },
  rolesContainer: {
    flexDirection: 'row',
    gap: wp(3),
  },
  roleCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    padding: hp(2),
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },
  roleCardSelected: {
    borderWidth: 2,
  },
  roleIcon: {
    fontSize: hp(4),
    marginBottom: hp(1),
  },
  roleLabel: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: hp(0.5),
  },
  roleDescription: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: hp(1),
    right: wp(2),
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  classCard: {
    width: (wp(88) - wp(8)) / 5,
    aspectRatio: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },
  classCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + '20',
  },
  className: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  classNameSelected: {
    color: theme.colors.primary,
  },
  loadingText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingVertical: hp(2),
  },
  submitSection: {
    marginTop: hp(2),
  },
});