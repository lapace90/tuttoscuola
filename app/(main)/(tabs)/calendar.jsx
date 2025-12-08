// app/(main)/(tabs)/calendar.jsx
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, FlatList } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme, slotTypeColors } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getSlotsByClass, getSlotsByTeacher } from '../../../services/bookingService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import Icon from '../../../assets/icons/Icon';
import AttendanceCard from '../../../components/attendance/AttendanceCard';

const DAYS_PAST = 30;
const DAYS_FUTURE = 180;

// Festività italiane fisse (mese 0-indexed)
const HOLIDAYS = [
  { day: 1, month: 0 },   // Capodanno
  { day: 6, month: 0 },   // Epifania
  { day: 25, month: 3 },  // Liberazione
  { day: 1, month: 4 },   // Festa Lavoratori
  { day: 2, month: 5 },   // Festa Repubblica
  { day: 15, month: 7 },  // Ferragosto
  { day: 1, month: 10 },  // Ognissanti
  { day: 8, month: 11 },  // Immacolata
  { day: 25, month: 11 }, // Natale
  { day: 26, month: 11 }, // Santo Stefano
];

const isHoliday = (date) => {
  const day = date.getDate();
  const month = date.getMonth();
  return HOLIDAYS.some(h => h.day === day && h.month === month);
};

const isSunday = (date) => date.getDay() === 0;

const isNonWorkingDay = (date) => isSunday(date) || isHoliday(date);

const Calendar = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const dayListRef = useRef(null);

  useEffect(() => {
    generateDays();
  }, []);

  useEffect(() => {
    loadSlots();
  }, [profile]);

  const generateDays = () => {
    const today = new Date();
    const daysList = [];
    
    for (let i = -DAYS_PAST; i <= DAYS_FUTURE; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      daysList.push(date);
    }
    
    setDays(daysList);
  };

  // Scroll a oggi dopo il render
  useEffect(() => {
    if (days.length > 0 && dayListRef.current) {
      setTimeout(() => {
        dayListRef.current?.scrollToIndex({ index: DAYS_PAST, animated: false, viewPosition: 0 });
      }, 100);
    }
  }, [days]);

  const loadSlots = async () => {
    if (!profile) return;

    setLoading(true);
    
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - DAYS_PAST);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + DAYS_FUTURE);

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

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date) => {
    const today = new Date();
    return formatDateKey(date) === formatDateKey(today);
  };

  const isSelected = (date) => {
    return formatDateKey(date) === formatDateKey(selectedDate);
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('it-IT', { weekday: 'short' }).slice(0, 3);
  };

  const getMonthYear = () => {
    return selectedDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  };

  const getSlotsForDate = (date) => {
    const dateKey = formatDateKey(date);
    return slots.filter(slot => slot.date === dateKey);
  };

  const hasSlots = (date) => {
    return getSlotsForDate(date).length > 0;
  };

  const selectedSlots = getSlotsForDate(selectedDate);

  const renderDayItem = ({ item: date }) => {
    const selected = isSelected(date);
    const today = isToday(date);
    const hasSlotsOnDay = hasSlots(date);
    const nonWorking = isNonWorkingDay(date);

    return (
      <Pressable
        style={[
          styles.dayItem,
          nonWorking && styles.dayItemNonWorking,
          selected && styles.dayItemSelected,
          today && !selected && styles.dayItemToday,
        ]}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[
          styles.dayName,
          nonWorking && styles.dayNameNonWorking,
          selected && styles.dayNameSelected,
        ]}>
          {getDayName(date)}
        </Text>
        <Text style={[
          styles.dayNumber,
          nonWorking && styles.dayNumberNonWorking,
          selected && styles.dayNumberSelected,
          today && !selected && styles.dayNumberToday,
        ]}>
          {date.getDate()}
        </Text>
        {hasSlotsOnDay && !selected && (
          <View style={styles.dotIndicator} />
        )}
      </Pressable>
    );
  };

  const renderSlotCard = (slot) => {
    const bookedCount = slot.bookings?.filter(b => b.status === 'confirmed').length || 0;
    const isVerifica = slot.type === 'verifica';
    const isFull = !isVerifica && bookedCount >= slot.max_students;
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
          <View style={styles.slotTimeRow}>
            <Icon name="clock" size={14} color={theme.colors.textLight} />
            <Text style={styles.slotTime}>
              {slot.start_time?.slice(0, 5)}
              {slot.end_time && ` - ${slot.end_time.slice(0, 5)}`}
            </Text>
          </View>
          {profile?.role === 'student' && slot.teacher && (
            <Text style={styles.slotTeacher}>
              Prof. {slot.teacher.last_name}
            </Text>
          )}
          {profile?.role === 'teacher' && slot.class && (
            <Text style={styles.slotTeacher}>
              Classe {slot.class.name}
            </Text>
          )}
        </View>

        <View style={styles.slotStatus}>
          {isVerifica ? (
            <Icon name="users" size={18} color={theme.colors.textLight} />
          ) : (
            <Text style={[styles.slotCount, isFull && styles.slotCountFull]}>
              {bookedCount}/{slot.max_students}
            </Text>
          )}
          {isBooked && (
            <View style={styles.bookedBadge}>
              <Icon name="check" size={12} color="white" />
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    const todayIndex = days.findIndex(d => formatDateKey(d) === formatDateKey(today));
    if (todayIndex >= 0 && dayListRef.current) {
      dayListRef.current.scrollToIndex({ index: todayIndex, animated: true, viewPosition: 0.3 });
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Calendario</Text>
          <Pressable onPress={goToToday}>
            <Text style={styles.monthYear}>{getMonthYear()}</Text>
          </Pressable>
        </View>
        <View style={styles.headerActions}>
          {profile?.role === 'teacher' && (
            <>
              <Pressable 
                style={styles.secondaryButton}
                onPress={() => router.push('/(main)/grades/manage')}
              >
                <Icon name="fileText" size={22} color={theme.colors.primary} />
              </Pressable>
              <Pressable 
                style={styles.secondaryButton}
                onPress={() => router.push('/(main)/attendance')}
              >
                <Icon name="clipboard" size={22} color={theme.colors.primary} />
              </Pressable>
              <Pressable 
                style={styles.addButton}
                onPress={() => router.push('/(main)/slot/create')}
              >
                <Icon name="plus" size={24} color="white" />
              </Pressable>
            </>
          )}
          {profile?.role === 'student' && (
            <Pressable 
              style={styles.secondaryButton}
              onPress={() => router.push('/(main)/grades')}
            >
              <Icon name="fileText" size={22} color={theme.colors.primary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Day strip */}
      <View style={styles.dayStrip}>
        <FlatList
          ref={dayListRef}
          data={days}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderDayItem}
          keyExtractor={(item) => formatDateKey(item)}
          contentContainerStyle={styles.dayListContent}
          getItemLayout={(_, index) => ({
            length: wp(14),
            offset: wp(14) * index,
            index,
          })}
          onScrollToIndexFailed={() => {}}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Attendance card for students - only on today */}
        {profile?.role === 'student' && profile?.class_id && isToday(selectedDate) && (
          <AttendanceCard studentId={profile.id} classId={profile.class_id} />
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Caricamento...</Text>
          </View>
        ) : selectedSlots.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="calendar" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>Nessun evento per questo giorno</Text>
            {profile?.role === 'teacher' && (
              <Pressable 
                style={styles.emptyButton}
                onPress={() => router.push('/(main)/slot/create')}
              >
                <Text style={styles.emptyButtonText}>+ Crea slot</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.slotsContainer}>
            <Text style={styles.slotsHeader}>
              {selectedSlots.length} {selectedSlots.length === 1 ? 'evento' : 'eventi'}
            </Text>
            {selectedSlots
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map(renderSlotCard)}
          </View>
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
    alignItems: 'flex-start',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
  },
  title: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  monthYear: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.primary,
    marginTop: hp(0.3),
    textTransform: 'capitalize',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  secondaryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
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
  dayStrip: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: hp(1.5),
  },
  dayListContent: {
    paddingHorizontal: wp(3),
  },
  dayItem: {
    width: wp(12),
    paddingVertical: hp(1),
    marginHorizontal: wp(1),
    alignItems: 'center',
    borderRadius: theme.radius.md,
  },
  dayItemSelected: {
    backgroundColor: theme.colors.primary,
  },
  dayItemToday: {
    backgroundColor: theme.colors.primaryLight + '30',
  },
  dayItemNonWorking: {
    backgroundColor: theme.colors.gray + '30',
  },
  dayName: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    marginBottom: hp(0.5),
    textTransform: 'uppercase',
  },
  dayNameSelected: {
    color: 'white',
  },
  dayNameNonWorking: {
    color: theme.colors.gray,
  },
  dayNumber: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  dayNumberSelected: {
    color: 'white',
  },
  dayNumberToday: {
    color: theme.colors.primary,
  },
  dayNumberNonWorking: {
    color: theme.colors.gray,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.accent,
    marginTop: hp(0.5),
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    flexGrow: 1,
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
    paddingTop: hp(8),
    gap: hp(2),
  },
  emptyText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  emptyButton: {
    marginTop: hp(1),
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.2),
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
  },
  emptyButtonText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: 'white',
  },
  slotsContainer: {
    flex: 1,
  },
  slotsHeader: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginBottom: hp(1.5),
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
  slotTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    marginTop: hp(0.3),
  },
  slotTime: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
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