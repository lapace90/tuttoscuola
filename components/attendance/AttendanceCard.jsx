// components/common/AttendanceCard.jsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import { getStudentTodayAttendance, confirmPresence } from '../../services/attendanceService';
import Icon from '../../assets/icons/Icon';

const STATUS_CONFIG = {
  present: { label: 'Presente', color: theme.colors.success, icon: 'check' },
  absent: { label: 'Assente', color: theme.colors.error, icon: 'x' },
  late: { label: 'In ritardo', color: theme.colors.warning, icon: 'clock' },
  excused: { label: 'Giustificato', color: theme.colors.textLight, icon: 'file' },
};

const AttendanceCard = ({ studentId, classId }) => {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, [studentId, classId]);

  const loadAttendance = async () => {
    if (!studentId || !classId) return;
    
    const { data } = await getStudentTodayAttendance(studentId, classId);
    setRecord(data);
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!record?.id || record.confirmed) return;
    
    setConfirming(true);
    const { data, error } = await confirmPresence(record.id);
    if (!error && data) {
      setRecord(data);
    }
    setConfirming(false);
  };

  if (loading) return null;
  if (!record) return null;

  const config = STATUS_CONFIG[record.status] || STATUS_CONFIG.absent;
  const needsConfirmation = record.status === 'present' && !record.confirmed;

  return (
    <View style={[styles.container, { borderLeftColor: config.color }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
          <Icon name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>Presenza di oggi</Text>
          <Text style={[styles.status, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
      </View>

      {needsConfirmation && (
        <Pressable 
          style={styles.confirmButton}
          onPress={handleConfirm}
          disabled={confirming}
        >
          <Icon name="check" size={18} color="white" />
          <Text style={styles.confirmText}>
            {confirming ? 'Confermo...' : 'Conferma presenza'}
          </Text>
        </Pressable>
      )}

      {record.confirmed && (
        <View style={styles.confirmedContainer}>
          <Icon name="checkCircle" size={16} color={theme.colors.success} />
          <Text style={styles.confirmedText}>
            Confermato alle {new Date(record.confirmed_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      )}

      {record.status === 'absent' && (
        <Text style={styles.absentNote}>
          Risulti assente per oggi. Contatta la segreteria per giustificare.
        </Text>
      )}
    </View>
  );
};

export default AttendanceCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(2),
    marginBottom: hp(2),
    borderLeftWidth: 4,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginBottom: 2,
  },
  status: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.bold,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success,
    paddingVertical: hp(1.2),
    borderRadius: theme.radius.lg,
    marginTop: hp(1.5),
    gap: wp(2),
  },
  confirmText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: 'white',
  },
  confirmedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(1.5),
    gap: wp(1.5),
  },
  confirmedText: {
    fontSize: hp(1.4),
    color: theme.colors.success,
  },
  absentNote: {
    fontSize: hp(1.4),
    color: theme.colors.error,
    marginTop: hp(1.5),
    fontStyle: 'italic',
  },
});