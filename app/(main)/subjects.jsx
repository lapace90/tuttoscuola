import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { getAllSubjects, getTeacherSubjects, addTeacherSubject, removeTeacherSubject } from '../../services/subjectService';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import BackButton from '../../components/common/BackButton';
import Icon from '../../assets/icons/Icon';

const Subjects = () => {
  const router = useRouter();
  const { profile } = useAuth();
  
  const [allSubjects, setAllSubjects] = useState([]);
  const [mySubjectIds, setMySubjectIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const [allRes, myRes] = await Promise.all([
      getAllSubjects(),
      getTeacherSubjects(profile.id)
    ]);
    
    if (allRes.data) setAllSubjects(allRes.data);
    if (myRes.data) {
      setMySubjectIds(myRes.data.map(ts => ts.subject?.id).filter(Boolean));
    }
    
    setLoading(false);
  };

  const toggleSubject = async (subjectId) => {
    const isSelected = mySubjectIds.includes(subjectId);
    
    if (isSelected) {
      // Rimuovi
      const { error } = await removeTeacherSubject(profile.id, subjectId);
      if (!error) {
        setMySubjectIds(prev => prev.filter(id => id !== subjectId));
      } else {
        Alert.alert('Errore', error.message);
      }
    } else {
      // Aggiungi
      const { error } = await addTeacherSubject(profile.id, subjectId);
      if (!error) {
        setMySubjectIds(prev => [...prev, subjectId]);
      } else {
        Alert.alert('Errore', error.message);
      }
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Le mie materie</Text>
        <View style={{ width: 36 }} />
      </View>

      <Text style={styles.subtitle}>
        Seleziona le materie che insegni. Potrai usarle per creare slot nel calendario.
      </Text>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.loadingText}>Caricamento...</Text>
        ) : (
          allSubjects.map((subject) => {
            const isSelected = mySubjectIds.includes(subject.id);
            return (
              <Pressable
                key={subject.id}
                style={[styles.subjectCard, isSelected && styles.subjectCardSelected]}
                onPress={() => toggleSubject(subject.id)}
              >
                <Text style={[styles.subjectName, isSelected && styles.subjectNameSelected]}>
                  {subject.name}
                </Text>
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <Icon name="check" size={18} color="white" />
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {mySubjectIds.length} {mySubjectIds.length === 1 ? 'materia selezionata' : 'materie selezionate'}
        </Text>
      </View>
    </ScreenWrapper>
  );
};

export default Subjects;

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
  subtitle: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  loadingText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingTop: hp(4),
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    padding: hp(2),
    borderRadius: theme.radius.md,
    marginBottom: hp(1),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  subjectCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + '20',
  },
  subjectName: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  subjectNameSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.semiBold,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  footerText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});