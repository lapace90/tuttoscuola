// app/(main)/attendance/index.jsx
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getTeacherClasses } from '../../../services/userService';
import { 
  getOrCreateAttendance, 
  getAttendanceWithRecords, 
  getClassStudents,
  setAttendanceStatus 
} from '../../../services/attendanceService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import Icon from '../../../assets/icons/Icon';

const STATUS_CONFIG = {
  present: { label: 'Presente', color: theme.colors.success, icon: 'check' },
  absent: { label: 'Assente', color: theme.colors.error, icon: 'x' },
  late: { label: 'Ritardo', color: theme.colors.warning, icon: 'clock' },
  excused: { label: 'Giustificato', color: theme.colors.textLight, icon: 'file' },
};

const Attendance = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const { bottom } = useSafeAreaInsets();
  
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadAttendance();
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    const { data } = await getTeacherClasses(profile.id);
    if (data) {
      const teacherClasses = data.filter(tc => tc.class).map(tc => tc.class);
      setClasses(teacherClasses);
      if (teacherClasses.length === 1) {
        setSelectedClass(teacherClasses[0]);
      }
    }
    setLoading(false);
  };

  const loadAttendance = async () => {
    setLoading(true);
    
    // Get or create today's attendance
    const { data: att } = await getOrCreateAttendance(selectedClass.id, profile.id);
    if (att) {
      setAttendance(att);
      
      // Load attendance with records
      const today = new Date().toISOString().split('T')[0];
      const { data: attWithRecords } = await getAttendanceWithRecords(selectedClass.id, today);
      
      // Load all students
      const { data: classStudents } = await getClassStudents(selectedClass.id);
      if (classStudents) {
        setStudents(classStudents);
        
        // Map existing records
        const recordsMap = {};
        attWithRecords?.records?.forEach(r => {
          recordsMap[r.student_id] = r;
        });
        setRecords(recordsMap);
      }
    }
    
    setLoading(false);
  };

  const handleStatusChange = async (studentId, status) => {
    if (!attendance) return;
    
    // Optimistic update
    setRecords(prev => ({
      ...prev,
      [studentId]: { 
        ...prev[studentId], 
        status,
        confirmed: false 
      }
    }));

    const { error } = await setAttendanceStatus(attendance.id, studentId, status);
    if (error) {
      Alert.alert('Errore', error.message);
      loadAttendance(); // Reload on error
    }
  };

  const markAllPresent = async () => {
    setSaving(true);
    for (const student of students) {
      await setAttendanceStatus(attendance.id, student.id, 'present');
    }
    await loadAttendance();
    setSaving(false);
  };

  const getStudentStatus = (studentId) => {
    return records[studentId]?.status || null;
  };

  const isConfirmed = (studentId) => {
    return records[studentId]?.confirmed || false;
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const presentCount = Object.values(records).filter(r => r.status === 'present').length;
  const absentCount = Object.values(records).filter(r => r.status === 'absent').length;

  if (loading && classes.length === 0) {
    return (
      <ScreenWrapper bg={theme.colors.background}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Registro Presenze</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Class selector */}
      {classes.length > 1 && !selectedClass && (
        <View style={styles.classSelector}>
          <Text style={styles.selectorTitle}>Seleziona la classe</Text>
          <View style={styles.classGrid}>
            {classes.map((c) => (
              <Pressable
                key={c.id}
                style={styles.classCard}
                onPress={() => setSelectedClass(c)}
              >
                <Text style={styles.classCardText}>{c.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {selectedClass && (
        <>
          {/* Class info header */}
          <View style={styles.classHeader}>
            <View style={styles.classInfo}>
              <Text style={styles.className}>Classe {selectedClass.name}</Text>
              <Text style={styles.dateText}>{formatDate()}</Text>
            </View>
            {classes.length > 1 && (
              <Pressable 
                style={styles.changeClassBtn}
                onPress={() => setSelectedClass(null)}
              >
                <Text style={styles.changeClassText}>Cambia</Text>
              </Pressable>
            )}
          </View>

          {/* Summary */}
          <View style={styles.summary}>
            <View style={[styles.summaryItem, { backgroundColor: theme.colors.success + '20' }]}>
              <Text style={[styles.summaryNumber, { color: theme.colors.success }]}>
                {presentCount}
              </Text>
              <Text style={styles.summaryLabel}>Presenti</Text>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: theme.colors.error + '20' }]}>
              <Text style={[styles.summaryNumber, { color: theme.colors.error }]}>
                {absentCount}
              </Text>
              <Text style={styles.summaryLabel}>Assenti</Text>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.summaryNumber, { color: theme.colors.primary }]}>
                {students.length}
              </Text>
              <Text style={styles.summaryLabel}>Totale</Text>
            </View>
          </View>

          {/* Quick action */}
          <Pressable 
            style={styles.quickAction}
            onPress={markAllPresent}
            disabled={saving}
          >
            <Icon name="checkCircle" size={20} color={theme.colors.success} />
            <Text style={styles.quickActionText}>Segna tutti presenti</Text>
          </Pressable>

          {/* Students list */}
          <ScrollView 
            style={styles.container}
            contentContainerStyle={[styles.content, { paddingBottom: hp(2) + bottom }]}
            showsVerticalScrollIndicator={false}
          >
            {students.map((student) => {
              const status = getStudentStatus(student.id);
              const confirmed = isConfirmed(student.id);
              
              return (
                <View key={student.id} style={styles.studentCard}>
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
                      {confirmed && (
                        <View style={styles.confirmedBadge}>
                          <Icon name="check" size={12} color={theme.colors.success} />
                          <Text style={styles.confirmedText}>Confermato</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.statusButtons}>
                    {['present', 'absent', 'late'].map((s) => {
                      const config = STATUS_CONFIG[s];
                      const isActive = status === s;
                      
                      return (
                        <Pressable
                          key={s}
                          style={[
                            styles.statusBtn,
                            isActive && { backgroundColor: config.color }
                          ]}
                          onPress={() => handleStatusChange(student.id, s)}
                        >
                          <Icon 
                            name={config.icon} 
                            size={18} 
                            color={isActive ? 'white' : config.color} 
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {students.length === 0 && !loading && (
              <View style={styles.emptyContainer}>
                <Icon name="users" size={48} color={theme.colors.textLight} />
                <Text style={styles.emptyText}>Nessuno studente in questa classe</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}

      {classes.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Icon name="users" size={48} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>Nessuna classe configurata</Text>
          <Pressable 
            style={styles.linkButton}
            onPress={() => router.push('/(main)/classes')}
          >
            <Text style={styles.linkText}>Configura le tue classi →</Text>
          </Pressable>
        </View>
      )}
    </ScreenWrapper>
  );
};

export default Attendance;

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  classSelector: {
    padding: wp(5),
  },
  selectorTitle: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: hp(2),
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(3),
  },
  classCard: {
    paddingVertical: hp(2),
    paddingHorizontal: wp(6),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
  },
  classCardText: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1),
  },
  classInfo: {},
  className: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  dateText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    textTransform: 'capitalize',
  },
  changeClassBtn: {
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(3),
  },
  changeClassText: {
    fontSize: hp(1.6),
    color: theme.colors.primary,
    fontWeight: theme.fonts.medium,
  },
  summary: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    gap: wp(3),
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hp(1.5),
    borderRadius: theme.radius.lg,
  },
  summaryNumber: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
  },
  summaryLabel: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(5),
    marginBottom: hp(1.5),
    paddingVertical: hp(1.2),
    backgroundColor: theme.colors.success + '15',
    borderRadius: theme.radius.lg,
    gap: wp(2),
  },
  quickActionText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.success,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(5),
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    padding: hp(1.5),
    borderRadius: theme.radius.lg,
    marginBottom: hp(1),
    ...theme.shadows.sm,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  studentInitial: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
  studentName: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  confirmedText: {
    fontSize: hp(1.2),
    color: theme.colors.success,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: wp(2),
  },
  statusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  emptyText: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
    marginTop: hp(2),
  },
  linkButton: {
    marginTop: hp(2),
  },
  linkText: {
    fontSize: hp(1.6),
    color: theme.colors.primary,
    fontWeight: theme.fonts.semiBold,
  },
});