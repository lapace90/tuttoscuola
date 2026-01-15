import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  getAllClasses, 
  getStudentsByClass, 
  arePromotionsOpen,
  getNextClass,
  promoteStudent,
  graduateStudent,
  changeStudentSection,
  promoteEntireClass
} from '../../../services/adminService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Icon from '../../../assets/icons/Icon';

const AdminPromotions = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);

  const promotionsOpen = arePromotionsOpen();

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) loadStudents(selectedClass.id);
  }, [selectedClass]);

  const loadClasses = async () => {
    if (!profile?.institute_id) return;
    setLoading(true);
    const { data, error } = await getAllClasses(profile.institute_id);
    setLoading(false);
    if (error) Alert.alert('Errore', error.message);
    else setClasses(data || []);
  };

  const loadStudents = async (classId) => {
    setLoadingStudents(true);
    const { data, error } = await getStudentsByClass(classId);
    setLoadingStudents(false);
    if (error) Alert.alert('Errore', error.message);
    else setStudents(data || []);
  };

  const handlePromoteStudent = async (student) => {
    const { data: nextClass, graduated, error } = await getNextClass(selectedClass.id, profile.institute_id, false);
    if (error) { Alert.alert('Errore', error.message); return; }

    const message = graduated 
      ? `${student.first_name} ${student.last_name} sarà diplomato/a.`
      : `${student.first_name} ${student.last_name} sarà promosso/a in ${nextClass.name}.`;

    Alert.alert(graduated ? 'Diploma' : 'Promozione', message, [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Conferma',
        onPress: async () => {
          setProcessing(true);
          const { error: promoteError } = graduated 
            ? await graduateStudent(student.id)
            : await promoteStudent(student.id, nextClass.id);
          setProcessing(false);
          if (promoteError) Alert.alert('Errore', promoteError.message);
          else {
            Alert.alert('Successo', graduated ? 'Studente diplomato!' : 'Studente promosso!');
            loadStudents(selectedClass.id);
          }
        },
      },
    ]);
  };

  const handleRetainStudent = (student) => {
    Alert.alert('Bocciatura', `${student.first_name} ${student.last_name} rimarrà in ${selectedClass.name}.`);
  };

  const handleChangeSection = (student) => {
    setSelectedStudent(student);
    setAvailableClasses(classes.filter(c => c.year === selectedClass.year && c.id !== selectedClass.id));
    setSectionModalVisible(true);
  };

  const confirmChangeSection = async (newClass) => {
    setProcessing(true);
    const { error } = await changeStudentSection(selectedStudent.id, newClass.id);
    setProcessing(false);
    if (error) Alert.alert('Errore', error.message);
    else {
      Alert.alert('Successo', `${selectedStudent.first_name} spostato in ${newClass.name}.`);
      setSectionModalVisible(false);
      loadStudents(selectedClass.id);
    }
  };

  const handlePromoteEntireClass = async () => {
    const { data: nextClass, graduated, error } = await getNextClass(selectedClass.id, profile.institute_id, false);
    
    const classWillBeCreated = error && !graduated;
    const section = selectedClass.name.replace(/[0-9]/g, '');
    const nextClassName = `${selectedClass.year + 1}${section}`;

    let message;
    if (graduated) {
      message = `Tutti gli studenti della ${selectedClass.name} saranno diplomati.`;
    } else if (classWillBeCreated) {
      message = `Tutti gli studenti della ${selectedClass.name} saranno promossi.\n\nLa classe ${nextClassName} verrà creata automaticamente.`;
    } else {
      message = `Tutti gli studenti della ${selectedClass.name} saranno promossi in ${nextClass.name}.`;
    }

    Alert.alert('Promozione di classe', `${message}\n\nContinuare?`, [
      { text: 'Annulla', style: 'cancel' },
      {
        text: 'Promuovi tutti',
        style: 'destructive',
        onPress: async () => {
          setProcessing(true);
          const { data: results, error: promoteError } = await promoteEntireClass(selectedClass.id, profile.institute_id);
          setProcessing(false);
          if (promoteError) Alert.alert('Errore', promoteError.message);
          else {
            let summary = graduated ? `${results.graduated} diplomati.` : `${results.promoted} promossi.`;
            if (results.classCreated) {
              summary += `\n\nClasse ${results.classCreated} creata.`;
            }
            Alert.alert('Successo', summary);
            loadStudents(selectedClass.id);
            loadClasses();
          }
        },
      },
    ]);
  };

  const classesByYear = classes.reduce((acc, cls) => {
    if (!acc[cls.year]) acc[cls.year] = [];
    acc[cls.year].push(cls);
    return acc;
  }, {});

  if (!promotionsOpen) {
    return (
      <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <BackButton router={router} />
          <Text style={styles.headerTitle}>Promozioni</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.closedContainer}>
          <Icon name="clock" size={64} color={theme.colors.textLight} />
          <Text style={styles.closedTitle}>Non disponibile</Text>
          <Text style={styles.closedText}>Le promozioni sono disponibili dal 15 giugno al 30 settembre.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Promozioni</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!selectedClass ? (
          <>
            {loading ? (
              <Text style={styles.loadingText}>Caricamento...</Text>
            ) : (
              Object.keys(classesByYear).sort((a, b) => a - b).map((year) => (
                <View key={year} style={styles.section}>
                  <Text style={styles.sectionTitle}>Anno {year}</Text>
                  {classesByYear[year].sort((a, b) => a.name.localeCompare(b.name)).map((classItem) => (
                    <Pressable key={classItem.id} style={styles.menuItem} onPress={() => setSelectedClass(classItem)}>
                      <View style={styles.menuIcon}>
                        <Text style={styles.classNameBig}>{classItem.name}</Text>
                      </View>
                      <View style={styles.menuContent}>
                        <Text style={styles.menuText}>Classe {classItem.name}</Text>
                        <Text style={styles.menuSubtext}>{classItem.students?.[0]?.count || 0} studenti</Text>
                      </View>
                      <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
                    </Pressable>
                  ))}
                </View>
              ))
            )}
          </>
        ) : (
          <>
            <Pressable style={styles.backLink} onPress={() => setSelectedClass(null)}>
              <Icon name="arrowLeft" size={18} color={theme.colors.primary} />
              <Text style={styles.backLinkText}>Torna alle classi</Text>
            </Pressable>

            <Text style={styles.classTitle}>Classe {selectedClass.name}</Text>

            <Pressable style={styles.promoteAllCard} onPress={handlePromoteEntireClass} disabled={processing}>
              <View style={styles.promoteAllIcon}>
                <Icon name="arrowUp" size={24} color={theme.colors.success} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.promoteAllTitle}>Promuovi tutta la classe</Text>
                <Text style={styles.menuSubtext}>
                  {selectedClass.year >= 5 ? 'Diploma tutti' : `Promuovi in anno ${selectedClass.year + 1}`}
                </Text>
              </View>
            </Pressable>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{students.length} Studenti</Text>
              {loadingStudents ? (
                <Text style={styles.loadingText}>Caricamento...</Text>
              ) : students.length === 0 ? (
                <Text style={styles.emptyText}>Nessuno studente</Text>
              ) : (
                students.map((student) => (
                  <View key={student.id} style={styles.studentCard}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{student.first_name?.[0]}{student.last_name?.[0]}</Text>
                    </View>
                    <Text style={styles.studentName}>{student.last_name} {student.first_name}</Text>
                    <View style={styles.actionButtons}>
                      <Pressable style={[styles.actionBtn, styles.promoteBtn]} onPress={() => handlePromoteStudent(student)} disabled={processing}>
                        <Icon name="arrowUp" size={16} color={theme.colors.success} />
                      </Pressable>
                      <Pressable style={[styles.actionBtn, styles.retainBtn]} onPress={() => handleRetainStudent(student)} disabled={processing}>
                        <Icon name="minus" size={16} color={theme.colors.warning} />
                      </Pressable>
                      <Pressable style={[styles.actionBtn, styles.sectionBtn]} onPress={() => handleChangeSection(student)} disabled={processing}>
                        <Icon name="repeat" size={16} color={theme.colors.secondary} />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.legendCard}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
                <Text style={styles.legendText}>Promuovi</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
                <Text style={styles.legendText}>Boccia</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.secondary }]} />
                <Text style={styles.legendText}>Cambia sezione</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={sectionModalVisible} animationType="slide" transparent onRequestClose={() => setSectionModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambia Sezione</Text>
              <Pressable onPress={() => setSectionModalVisible(false)}>
                <Icon name="x" size={24} color={theme.colors.text} />
              </Pressable>
            </View>
            {selectedStudent && <Text style={styles.modalSubtitle}>Sposta {selectedStudent.first_name} in:</Text>}
            {availableClasses.length === 0 ? (
              <Text style={styles.emptyText}>Nessuna altra sezione disponibile.</Text>
            ) : (
              availableClasses.map((cls) => (
                <Pressable key={cls.id} style={styles.menuItem} onPress={() => confirmChangeSection(cls)} disabled={processing}>
                  <View style={styles.menuIcon}>
                    <Text style={styles.classNameBig}>{cls.name}</Text>
                  </View>
                  <Text style={styles.menuText}>Classe {cls.name}</Text>
                  <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
                </Pressable>
              ))
            )}
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default AdminPromotions;

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
  container: { flex: 1 },
  content: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  closedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(8),
  },
  closedTitle: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginTop: hp(3),
  },
  closedText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: hp(1),
  },
  loadingText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: hp(2),
  },
  emptyText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: hp(2),
  },
  section: { marginBottom: hp(3) },
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  classNameBig: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
  menuContent: { flex: 1 },
  menuText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  menuSubtext: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: hp(0.3),
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    marginBottom: hp(2),
  },
  backLinkText: {
    fontSize: hp(1.6),
    color: theme.colors.primary,
    fontWeight: theme.fonts.medium,
  },
  classTitle: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(2),
  },
  promoteAllCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '15',
    padding: hp(2),
    borderRadius: theme.radius.lg,
    marginBottom: hp(3),
  },
  promoteAllIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  promoteAllTitle: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.success,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: hp(1.5),
    borderRadius: theme.radius.lg,
    marginBottom: hp(1),
    ...theme.shadows.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  avatarText: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.primary,
  },
  studentName: {
    flex: 1,
    fontSize: hp(1.6),
    color: theme.colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: wp(2),
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoteBtn: { backgroundColor: theme.colors.success + '20' },
  retainBtn: { backgroundColor: theme.colors.warning + '20' },
  sectionBtn: { backgroundColor: theme.colors.secondary + '20' },
  legendCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.card,
    padding: hp(2),
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    padding: wp(5),
    paddingBottom: hp(6),
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  modalTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginBottom: hp(2),
  },
});