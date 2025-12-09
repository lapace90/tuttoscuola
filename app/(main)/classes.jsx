import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { getClassesByInstitute, getTeacherClasses, addTeacherClass, removeTeacherClass } from '../../services/userService';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import BackButton from '../../components/common/BackButton';
import Icon from '../../assets/icons/Icon';

const TeacherClasses = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [allClasses, setAllClasses] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!profile?.institute_id) return;
    
    setLoading(true);
    const [allRes, myRes] = await Promise.all([
      getClassesByInstitute(profile.institute_id),
      getTeacherClasses(profile.id)
    ]);
    
    if (allRes.data) setAllClasses(allRes.data);
    if (myRes.data) setMyClasses(myRes.data);
    setLoading(false);
  };

  const getYears = () => {
    const years = [...new Set(allClasses.map(c => c.name.charAt(0)))].sort();
    return years;
  };

  const getClassesForYear = (year) => {
    return allClasses.filter(c => c.name.charAt(0) === year);
  };

  const isClassSelected = (classId) => {
    return myClasses.some(mc => mc.class?.id === classId);
  };

  const getTeacherClassId = (classId) => {
    return myClasses.find(mc => mc.class?.id === classId)?.id;
  };

  const handleToggleClass = async (classItem) => {
    const isSelected = isClassSelected(classItem.id);
    
    if (isSelected) {
      const teacherClassId = getTeacherClassId(classItem.id);
      const { error } = await removeTeacherClass(teacherClassId);
      if (error) {
        Alert.alert('Errore', error.message);
      } else {
        setMyClasses(prev => prev.filter(mc => mc.id !== teacherClassId));
      }
    } else {
      const { data, error } = await addTeacherClass(profile.id, classItem.id);
      if (error) {
        Alert.alert('Errore', error.message);
      } else if (data) {
        setMyClasses(prev => [...prev, data]);
      }
    }
  };

  const myClassesSorted = myClasses
    .filter(mc => mc.class)
    .sort((a, b) => a.class.name.localeCompare(b.class.name));

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Le mie classi</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Classi selezionate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Classi assegnate</Text>
          {myClassesSorted.length === 0 ? (
            <Text style={styles.emptyText}>
              Nessuna classe selezionata. Seleziona le classi in cui insegni.
            </Text>
          ) : (
            <View style={styles.selectedGrid}>
              {myClassesSorted.map((mc) => (
                <View key={mc.id} style={styles.selectedChip}>
                  <Text style={styles.selectedChipText}>{mc.class.name}</Text>
                  <Pressable 
                    onPress={() => handleToggleClass(mc.class)}
                    hitSlop={8}
                  >
                    <Icon name="x" size={16} color={theme.colors.primary} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Seleziona anno */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seleziona anno</Text>
          <View style={styles.yearRow}>
            {getYears().map((year) => (
              <Pressable
                key={year}
                style={[
                  styles.yearCard,
                  selectedYear === year && styles.yearCardSelected
                ]}
                onPress={() => setSelectedYear(year === selectedYear ? null : year)}
              >
                <Text style={[
                  styles.yearText,
                  selectedYear === year && styles.yearTextSelected
                ]}>
                  {year}°
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Classi dell'anno selezionato */}
        {selectedYear && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Classi {selectedYear}° anno</Text>
            <View style={styles.classGrid}>
              {getClassesForYear(selectedYear).map((c) => {
                const selected = isClassSelected(c.id);
                return (
                  <Pressable
                    key={c.id}
                    style={[
                      styles.classCard,
                      selected && styles.classCardSelected
                    ]}
                    onPress={() => handleToggleClass(c)}
                  >
                    <Text style={[
                      styles.classText,
                      selected && styles.classTextSelected
                    ]}>
                      {c.name}
                    </Text>
                    {selected && (
                      <Icon name="check" size={18} color="white" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Caricamento...</Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default TeacherClasses;

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
  emptyText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  selectedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight + '30',
    paddingVertical: hp(1),
    paddingLeft: wp(4),
    paddingRight: wp(2),
    borderRadius: theme.radius.full,
    gap: wp(2),
  },
  selectedChipText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.primary,
  },
  yearRow: {
    flexDirection: 'row',
    gap: wp(2),
  },
  yearCard: {
    width: wp(14),
    height: wp(14),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  yearCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  yearText: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  yearTextSelected: {
    color: 'white',
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    gap: wp(2),
  },
  classCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  classText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  classTextSelected: {
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
});