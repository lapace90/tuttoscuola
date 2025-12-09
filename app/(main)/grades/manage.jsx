import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Modal, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getTeacherClasses } from '../../../services/userService';
import { getTeacherSubjects } from '../../../services/subjectService';
import { getClassStudentsWithGrades, addGrade, deleteGrade } from '../../../services/gradesService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import Icon from '../../../assets/icons/Icon';

const GRADE_TYPES = [
  { value: 'orale', label: 'Orale' },
  { value: 'scritto', label: 'Scritto' },
  { value: 'pratico', label: 'Pratico' },
];

const getGradeColor = (value) => {
  const v = parseFloat(value);
  if (v >= 8) return theme.colors.success;
  if (v >= 7) return '#4CAF50';
  if (v >= 6) return theme.colors.warning;
  return theme.colors.error;
};

const ManageGrades = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const { bottom } = useSafeAreaInsets();

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeValue, setGradeValue] = useState('');
  const [gradeType, setGradeType] = useState('orale');
  const [gradeDescription, setGradeDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadStudents();
    }
  }, [selectedClass, selectedSubject]);

  const loadInitialData = async () => {
    const [classesRes, subjectsRes] = await Promise.all([
      getTeacherClasses(profile.id),
      getTeacherSubjects(profile.id)
    ]);

    if (classesRes.data) {
      const teacherClasses = classesRes.data.filter(tc => tc.class).map(tc => tc.class);
      setClasses(teacherClasses);
    }

    if (subjectsRes.data) {
      const subs = subjectsRes.data.map(ts => ts.subject).filter(Boolean);
      setSubjects(subs);
      if (subs.length === 1) setSelectedSubject(subs[0]);
    }

    setLoading(false);
  };

  const loadStudents = async () => {
    setLoading(true);
    const { data } = await getClassStudentsWithGrades(selectedClass.id, selectedSubject.name);
    if (data) setStudents(data);
    setLoading(false);
  };

  const openGradeModal = (student) => {
    setSelectedStudent(student);
    setGradeValue('');
    setGradeType('orale');
    setGradeDescription('');
    setModalVisible(true);
  };

  const handleSaveGrade = async () => {
    if (!gradeValue || isNaN(parseFloat(gradeValue))) {
      Alert.alert('Errore', 'Inserisci un voto valido');
      return;
    }

    const value = parseFloat(gradeValue);
    if (value < 0 || value > 10) {
      Alert.alert('Errore', 'Il voto deve essere tra 0 e 10');
      return;
    }

    setSaving(true);
    const { error } = await addGrade({
      student_id: selectedStudent.id,
      teacher_id: profile.id,
      class_id: selectedClass.id,
      subject: selectedSubject.name,
      value,
      type: gradeType,
      description: gradeDescription.trim() || null,
      date: new Date().toISOString().split('T')[0]
    });
    setSaving(false);

    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      setModalVisible(false);
      loadStudents();
    }
  };

  const handleDeleteGrade = (gradeId, studentName) => {
    Alert.alert(
      'Elimina voto',
      `Sei sicuro di voler eliminare questo voto di ${studentName}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteGrade(gradeId);
            if (error) {
              Alert.alert('Errore', error.message);
            } else {
              loadStudents();
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Step 1: Select class
  if (!selectedClass) {
    return (
      <ScreenWrapper bg={theme.colors.background}>
        <View style={styles.header}>
          <BackButton router={router} />
          <Text style={styles.headerTitle}>Registro Voti</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Seleziona la classe</Text>
          {classes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nessuna classe configurata</Text>
              <Pressable onPress={() => router.push('/(main)/classes')}>
                <Text style={styles.linkText}>Configura le tue classi →</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.optionsGrid}>
              {classes.map((c) => (
                <Pressable
                  key={c.id}
                  style={styles.optionCard}
                  onPress={() => setSelectedClass(c)}
                >
                  <Text style={styles.optionCardText}>{c.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScreenWrapper>
    );
  }

  // Step 2: Select subject
  if (!selectedSubject) {
    return (
      <ScreenWrapper bg={theme.colors.background}>
        <View style={styles.header}>
          <BackButton router={router} onPress={() => setSelectedClass(null)} />
          <Text style={styles.headerTitle}>Registro Voti</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.classIndicator}>
          <Text style={styles.classIndicatorText}>Classe {selectedClass.name}</Text>
        </View>

        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Seleziona la materia</Text>
          {subjects.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nessuna materia configurata</Text>
              <Pressable onPress={() => router.push('/(main)/subjects')}>
                <Text style={styles.linkText}>Configura le tue materie →</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.optionsGrid}>
              {subjects.map((s) => (
                <Pressable
                  key={s.id}
                  style={styles.optionCard}
                  onPress={() => setSelectedSubject(s)}
                >
                  <Text style={styles.optionCardText}>{s.name}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScreenWrapper>
    );
  }

  // Step 3: Show students with grades
  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} onPress={() => setSelectedSubject(null)} />
        <Text style={styles.headerTitle}>Registro Voti</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.classIndicator}>
        <Text style={styles.classIndicatorText}>
          {selectedClass.name} • {selectedSubject.name}
        </Text>
        <Pressable onPress={() => { setSelectedClass(null); setSelectedSubject(null); }}>
          <Text style={styles.changeText}>Cambia</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: hp(2) + bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Caricamento...</Text>
          </View>
        ) : students.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="users" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>Nessuno studente in questa classe</Text>
          </View>
        ) : (
          students.map((student) => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentHeader}>
                <View style={styles.studentInfo}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentInitial}>
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.studentName}>
                      {student.last_name} {student.first_name}
                    </Text>
                    {student.average && (
                      <Text style={[styles.studentAverage, { color: getGradeColor(student.average) }]}>
                        Media: {student.average}
                      </Text>
                    )}
                  </View>
                </View>
                <Pressable
                  style={styles.addGradeBtn}
                  onPress={() => openGradeModal(student)}
                >
                  <Icon name="plus" size={20} color="white" />
                </Pressable>
              </View>

              {student.grades && student.grades.length > 0 && (
                <View style={styles.gradesRow}>
                  {student.grades.slice(0, 5).map((grade) => (
                    <Pressable
                      key={grade.id}
                      style={[styles.gradeBadge, { backgroundColor: getGradeColor(grade.value) }]}
                      onLongPress={() => handleDeleteGrade(grade.id, student.first_name)}
                    >
                      <Text style={styles.gradeBadgeText}>{grade.value}</Text>
                      <Text style={styles.gradeBadgeDate}>{formatDate(grade.date)}</Text>
                    </Pressable>
                  ))}
                  {student.grades.length > 5 && (
                    <View style={styles.moreGrades}>
                      <Text style={styles.moreGradesText}>+{student.grades.length - 5}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Grade Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Nuovo voto per {selectedStudent?.first_name}
            </Text>

            {/* Grade value input */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Voto *</Text>
              <TextInput
                style={styles.gradeInput}
                value={gradeValue}
                onChangeText={setGradeValue}
                keyboardType="decimal-pad"
                placeholder="7.5"
                placeholderTextColor={theme.colors.placeholder}
                maxLength={4}
              />
            </View>

            {/* Grade type */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Tipo</Text>
              <View style={styles.typeRow}>
                {GRADE_TYPES.map((t) => (
                  <Pressable
                    key={t.value}
                    style={[
                      styles.typeBtn,
                      gradeType === t.value && styles.typeBtnSelected
                    ]}
                    onPress={() => setGradeType(t.value)}
                  >
                    <Text style={[
                      styles.typeBtnText,
                      gradeType === t.value && styles.typeBtnTextSelected
                    ]}>
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Argomento (opzionale)</Text>
              <TextInput
                style={styles.descriptionInput}
                value={gradeDescription}
                onChangeText={setGradeDescription}
                placeholder="Es. Verifica capitolo 5"
                placeholderTextColor={theme.colors.placeholder}
                multiline
              />
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Annulla</Text>
              </Pressable>
              <Button
                title="Salva"
                loading={saving}
                onPress={handleSaveGrade}
                buttonStyle={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default ManageGrades;

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
  classIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
    backgroundColor: theme.colors.primaryLight + '20',
  },
  classIndicatorText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.primary,
  },
  changeText: {
    fontSize: hp(1.5),
    color: theme.colors.primary,
  },
  stepContainer: {
    padding: wp(5),
  },
  stepTitle: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: hp(2),
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(3),
  },
  optionCard: {
    paddingVertical: hp(2),
    paddingHorizontal: wp(6),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
  },
  optionCardText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.primary,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(5),
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
  linkText: {
    fontSize: hp(1.6),
    color: theme.colors.primary,
    fontWeight: theme.fonts.semiBold,
    marginTop: hp(1),
  },
  studentCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    marginBottom: hp(1.5),
    ...theme.shadows.sm,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  studentInitial: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
  studentName: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  studentAverage: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.medium,
    marginTop: 2,
  },
  addGradeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: hp(1.5),
    gap: wp(2),
  },
  gradeBadge: {
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2.5),
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  gradeBadgeText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.bold,
    color: 'white',
  },
  gradeBadgeDate: {
    fontSize: hp(1.1),
    color: 'rgba(255,255,255,0.8)',
  },
  moreGrades: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(2.5),
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
  },
  moreGradesText: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: wp(5),
  },
  modalTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: hp(2.5),
  },
  modalSection: {
    marginBottom: hp(2),
  },
  modalLabel: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
    marginBottom: hp(0.8),
  },
  gradeInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeRow: {
    flexDirection: 'row',
    gap: wp(2),
  },
  typeBtn: {
    flex: 1,
    paddingVertical: hp(1.2),
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeBtnSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeBtnText: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  typeBtnTextSelected: {
    color: 'white',
  },
  descriptionInput: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    fontSize: hp(1.6),
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: hp(8),
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: wp(3),
    marginTop: hp(1),
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: hp(1.8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
});