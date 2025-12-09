import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getStudentGrades, getStudentAverages } from '../../../services/gradesService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Icon from '../../../assets/icons/Icon';

const GRADE_COLORS = {
  excellent: theme.colors.success,    // >= 8
  good: '#4CAF50',                    // >= 7
  sufficient: theme.colors.warning,   // >= 6
  insufficient: theme.colors.error,   // < 6
};

const getGradeColor = (value) => {
  const v = parseFloat(value);
  if (v >= 8) return GRADE_COLORS.excellent;
  if (v >= 7) return GRADE_COLORS.good;
  if (v >= 6) return GRADE_COLORS.sufficient;
  return GRADE_COLORS.insufficient;
};

const TYPE_LABELS = {
  scritto: 'Scritto',
  orale: 'Orale',
  pratico: 'Pratico',
};

const StudentGrades = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [grades, setGrades] = useState([]);
  const [averages, setAverages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!profile?.id) return;

    const [gradesRes, avgRes] = await Promise.all([
      getStudentGrades(profile.id),
      getStudentAverages(profile.id)
    ]);

    if (gradesRes.data) setGrades(gradesRes.data);
    if (avgRes.data) setAverages(avgRes.data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const globalAverage = averages.length > 0
    ? (averages.reduce((sum, a) => sum + parseFloat(a.average), 0) / averages.length).toFixed(2)
    : null;

  const filteredGrades = selectedSubject
    ? grades.filter(g => g.subject === selectedSubject)
    : grades;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>I miei voti</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Media generale */}
        {globalAverage && (
          <View style={styles.globalAverageCard}>
            <Text style={styles.globalAverageLabel}>Media Generale</Text>
            <Text style={[styles.globalAverageValue, { color: getGradeColor(globalAverage) }]}>
              {globalAverage}
            </Text>
          </View>
        )}

        {/* Medie per materia */}
        {averages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medie per materia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.averagesRow}>
                <Pressable
                  style={[
                    styles.subjectChip,
                    !selectedSubject && styles.subjectChipSelected
                  ]}
                  onPress={() => setSelectedSubject(null)}
                >
                  <Text style={[
                    styles.subjectChipText,
                    !selectedSubject && styles.subjectChipTextSelected
                  ]}>
                    Tutti
                  </Text>
                </Pressable>
                {averages.map((avg) => (
                  <Pressable
                    key={avg.subject}
                    style={[
                      styles.subjectChip,
                      selectedSubject === avg.subject && styles.subjectChipSelected
                    ]}
                    onPress={() => setSelectedSubject(
                      selectedSubject === avg.subject ? null : avg.subject
                    )}
                  >
                    <Text style={[
                      styles.subjectChipText,
                      selectedSubject === avg.subject && styles.subjectChipTextSelected
                    ]}>
                      {avg.subject}
                    </Text>
                    <View style={[
                      styles.avgBadge,
                      { backgroundColor: getGradeColor(avg.average) }
                    ]}>
                      <Text style={styles.avgBadgeText}>{avg.average}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Lista voti */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedSubject ? `Voti ${selectedSubject}` : 'Tutti i voti'}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Caricamento...</Text>
            </View>
          ) : filteredGrades.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="book" size={48} color={theme.colors.textLight} />
              <Text style={styles.emptyText}>Nessun voto registrato</Text>
            </View>
          ) : (
            filteredGrades.map((grade) => (
              <View key={grade.id} style={styles.gradeCard}>
                <View style={[styles.gradeValue, { backgroundColor: getGradeColor(grade.value) }]}>
                  <Text style={styles.gradeValueText}>{grade.value}</Text>
                </View>
                <View style={styles.gradeInfo}>
                  <Text style={styles.gradeSubject}>{grade.subject}</Text>
                  <View style={styles.gradeDetails}>
                    <Text style={styles.gradeType}>{TYPE_LABELS[grade.type]}</Text>
                    <Text style={styles.gradeDot}>•</Text>
                    <Text style={styles.gradeDate}>{formatDate(grade.date)}</Text>
                  </View>
                  {grade.description && (
                    <Text style={styles.gradeDescription} numberOfLines={2}>
                      {grade.description}
                    </Text>
                  )}
                </View>
                {grade.teacher && (
                  <Text style={styles.gradeTeacher}>
                    {grade.teacher.last_name}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default StudentGrades;

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
  globalAverageCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    padding: hp(3),
    alignItems: 'center',
    marginBottom: hp(2),
    ...theme.shadows.md,
  },
  globalAverageLabel: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginBottom: hp(0.5),
  },
  globalAverageValue: {
    fontSize: hp(5),
    fontWeight: theme.fonts.bold,
  },
  section: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: hp(1.5),
  },
  averagesRow: {
    flexDirection: 'row',
    gap: wp(2),
    paddingRight: wp(5),
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: theme.radius.full,
    gap: wp(2),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  subjectChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  subjectChipText: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  subjectChipTextSelected: {
    color: 'white',
  },
  avgBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: theme.radius.sm,
  },
  avgBadgeText: {
    fontSize: hp(1.3),
    fontWeight: theme.fonts.bold,
    color: 'white',
  },
  loadingContainer: {
    paddingVertical: hp(4),
    alignItems: 'center',
  },
  loadingText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: hp(6),
  },
  emptyText: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
    marginTop: hp(2),
  },
  gradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    marginBottom: hp(1),
    ...theme.shadows.sm,
  },
  gradeValue: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  gradeValueText: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: 'white',
  },
  gradeInfo: {
    flex: 1,
  },
  gradeSubject: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  gradeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  gradeType: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  gradeDot: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginHorizontal: wp(1),
  },
  gradeDate: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  gradeDescription: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  gradeTeacher: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
  },
});