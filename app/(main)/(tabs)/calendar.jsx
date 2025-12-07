// app/(main)/(tabs)/calendar.jsx
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp, formatCalendarDate } from '../../../helpers/common';
import { theme, slotTypeColors } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getSlotsByClass, getSlotsByTeacher } from '../../../services/bookingService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import Icon from '../../../assets/icons/Icon';

const Calendar = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadSlots();
  }, [profile, selectedDate]);

  const loadSlots = async () => {
    if (!profile) return;

    setLoading(true);
    
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + 30);

    let result;
    if (profile.role === 'teacher') {
      result = await getSlotsByTeacher(
        profile.id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
    } else {
      result = await getSlotsByClass(
        profile.class_id,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
    }

    if (!result.error && result.data) {
      setSlots(result.data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSlots();
    setRefreshing(false);
  };

  const groupSlotsByDate = () => {
    const grouped = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const groupedSlots = groupSlotsByDate();
  const sortedDates = Object.keys(groupedSlots).sort();

  const renderSlotCard = (slot) => {
    const bookedCount = slot.bookings?.filter(b => b.status === 'confirmed').length || 0;
    const isFull = bookedCount >= slot.max_students;
    const isBooked = slot.bookings?.some(b => b.student_id === profile?.id && b.status === 'confirmed');

    return (
      <Pressable
        key={slot.id}
        style={[styles.slotCard, isBooked && styles.slotCardBooked]}
        onPress={() => router.push(`/(main)/slot/${slot.id}`)}
      >
        <View style={[styles.slotType, { backgroundColor: slotTypeColors[slot.type] || slotTypeColors.altro }]}>
          <Text style={styles.slotTypeText}>{slot.type}</Text>
        </View>
        
        <View style={styles.slotInfo}>
          <Text style={styles.slotSubject}>{slot.subject}</Text>
          <Text style={styles.slotTime}>
            <Icon name="clock" size={14} color={theme.colors.textLight} /> {slot.start_time?.slice(0, 5)}
            {slot.end_time && ` - ${slot.end_time.slice(0, 5)}`}
          </Text>
          {profile?.role === 'student' && slot.teacher && (
            <Text style={styles.slotTeacher}>
              Prof. {slot.teacher.last_name}
            </Text>
          )}
        </View>

        <View style={styles.slotStatus}>
          <Text style={[styles.slotCount, isFull && styles.slotCountFull]}>
            {bookedCount}/{slot.max_students}
          </Text>
          {isBooked && (
            <View style={styles.bookedBadge}>
              <Icon name="check" size={12} color="white" />
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendario</Text>
        {profile?.role === 'teacher' && (
          <Pressable 
            style={styles.addButton}
            onPress={() => router.push('/(main)/slot/create')}
          >
            <Icon name="plus" size={24} color="white" />
          </Pressable>
        )}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Caricamento...</Text>
          </View>
        ) : sortedDates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="calendar" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>Nessun evento in programma</Text>
          </View>
        ) : (
          sortedDates.map(date => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateHeader}>{formatCalendarDate(date)}</Text>
              {groupedSlots[date].map(renderSlotCard)}
            </View>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  title: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
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
    paddingTop: hp(10),
  },
  loadingText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(10),
    gap: hp(2),
  },
  emptyText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  dateSection: {
    marginBottom: hp(3),
  },
  dateHeader: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: hp(1.5),
    textTransform: 'capitalize',
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    marginBottom: hp(1),
    ...theme.shadows.sm,
  },
  slotCardBooked: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.success,
  },
  slotType: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: theme.radius.sm,
    marginRight: wp(3),
  },
  slotTypeText: {
    fontSize: hp(1.4),
    color: 'white',
    fontWeight: theme.fonts.medium,
    textTransform: 'capitalize',
  },
  slotInfo: {
    flex: 1,
  },
  slotSubject: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  slotTime: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginTop: hp(0.3),
  },
  slotTeacher: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: hp(0.3),
  },
  slotStatus: {
    alignItems: 'center',
  },
  slotCount: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
  },
  slotCountFull: {
    color: theme.colors.error,
  },
  bookedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(0.5),
  },
});