// app/(main)/slot/[id].jsx
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { hp, wp, formatCalendarDate, formatTime } from '../../../helpers/common';
import { theme, slotTypeColors, roleColors } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getSlotById, bookSlot, cancelBooking, deleteSlot } from '../../../services/bookingService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import Icon from '../../../assets/icons/Icon';

const SlotDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadSlot();
    }
  }, [id]);

  const loadSlot = async () => {
    setLoading(true);
    const { data, error } = await getSlotById(id);
    if (!error && data) {
      setSlot(data);
    }
    setLoading(false);
  };

  const confirmedBookings = slot?.bookings?.filter(b => b.status === 'confirmed') || [];
  const isVerifica = slot?.type === 'verifica';
  const isBooked = confirmedBookings.some(b => b.student_id === profile?.id);
  const isFull = !isVerifica && confirmedBookings.length >= (slot?.max_students || 0);
  const isOwner = slot?.teacher_id === profile?.id;

  const handleBook = async () => {
    setActionLoading(true);
    const { error } = await bookSlot(slot.id, profile.id);
    setActionLoading(false);

    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      Alert.alert('Prenotato!', 'Ti sei prenotato con successo.');
      loadSlot();
    }
  };

  const handleCancelBooking = async () => {
    Alert.alert(
      'Annulla prenotazione',
      'Sei sicuro di voler annullare la tua prenotazione?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sì, annulla',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            const booking = confirmedBookings.find(b => b.student_id === profile.id);
            if (booking) {
              const { error } = await cancelBooking(booking.id);
              if (error) {
                Alert.alert('Errore', error.message);
              } else {
                loadSlot();
              }
            }
            setActionLoading(false);
          },
        },
      ]
    );
  };

  const handleDeleteSlot = async () => {
    Alert.alert(
      'Elimina slot',
      'Sei sicuro di voler eliminare questo slot? Tutte le prenotazioni saranno cancellate.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sì, elimina',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            const { error } = await deleteSlot(slot.id);
            setActionLoading(false);
            
            if (error) {
              Alert.alert('Errore', error.message);
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.background}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!slot) {
    return (
      <ScreenWrapper bg={theme.colors.background}>
        <View style={styles.header}>
          <BackButton router={router} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Slot non trovato</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        {isOwner && (
          <View style={styles.headerActions}>
            <Pressable style={styles.editButton} onPress={() => router.push(`/(main)/slot/edit/${id}`)}>
              <Icon name="edit" size={22} color={theme.colors.primary} />
            </Pressable>
            <Pressable style={styles.deleteButton} onPress={handleDeleteSlot}>
              <Icon name="trash" size={22} color={theme.colors.error} />
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.typeBadge, { backgroundColor: slotTypeColors[slot.type] || slotTypeColors.altro }]}>
          <Text style={styles.typeText}>{slot.type}</Text>
        </View>

        <Text style={styles.subject}>{slot.subject}</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color={theme.colors.textLight} />
            <Text style={styles.infoText}>{formatCalendarDate(slot.date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="clock" size={20} color={theme.colors.textLight} />
            <Text style={styles.infoText}>
              {slot.start_time?.slice(0, 5)}
              {slot.end_time && ` - ${slot.end_time.slice(0, 5)}`}
            </Text>
          </View>

          {slot.teacher && (
            <View style={styles.infoRow}>
              <Icon name="user" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>
                Prof. {slot.teacher.first_name} {slot.teacher.last_name}
              </Text>
            </View>
          )}

          {!isVerifica && (
            <View style={styles.infoRow}>
              <Icon name="users" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>
                {confirmedBookings.length}/{slot.max_students} posti occupati
              </Text>
            </View>
          )}
          {isVerifica && (
            <View style={styles.infoRow}>
              <Icon name="users" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>Tutta la classe</Text>
            </View>
          )}
        </View>

        {slot.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Note</Text>
            <Text style={styles.descriptionText}>{slot.description}</Text>
          </View>
        )}

        {confirmedBookings.length > 0 && (
          <View style={styles.bookingsSection}>
            <Text style={styles.bookingsTitle}>Studenti prenotati</Text>
            {confirmedBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingItem}>
                <View style={styles.bookingAvatar}>
                  <Text style={styles.bookingInitial}>
                    {booking.student?.first_name?.[0] || '?'}
                  </Text>
                </View>
                <Text style={styles.bookingName}>
                  {booking.student?.first_name} {booking.student?.last_name}
                </Text>
                {booking.student_id === profile?.id && (
                  <View style={styles.youBadge}>
                    <Text style={styles.youText}>Tu</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {profile?.role === 'student' && (
        <View style={styles.footer}>
          {isBooked ? (
            <Button
              title="Annulla prenotazione"
              variant="outline"
              loading={actionLoading}
              onPress={handleCancelBooking}
            />
          ) : (
            <Button
              title={isFull ? 'Posti esauriti' : 'Prenota'}
              loading={actionLoading}
              disabled={isFull}
              onPress={handleBook}
            />
          )}
        </View>
      )}
    </ScreenWrapper>
  );
};

export default SlotDetail;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
  },
  headerActions: {
    flexDirection: 'row',
    gap: wp(2),
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
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
  },
  loadingText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: hp(1.8),
    color: theme.colors.error,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    borderRadius: theme.radius.full,
    marginBottom: hp(2),
  },
  typeText: {
    fontSize: hp(1.6),
    color: 'white',
    fontWeight: theme.fonts.semiBold,
    textTransform: 'capitalize',
  },
  subject: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(3),
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(2),
    gap: hp(1.5),
    marginBottom: hp(2),
    ...theme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  infoText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
  descriptionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(2),
    marginBottom: hp(2),
    ...theme.shadows.sm,
  },
  descriptionTitle: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    marginBottom: hp(1),
  },
  descriptionText: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    lineHeight: hp(2.4),
  },
  bookingsSection: {
    marginTop: hp(2),
  },
  bookingsTitle: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: hp(1.5),
  },
  bookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: hp(1.5),
    borderRadius: theme.radius.md,
    marginBottom: hp(1),
    ...theme.shadows.sm,
  },
  bookingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  bookingInitial: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
  bookingName: {
    flex: 1,
    fontSize: hp(1.7),
    color: theme.colors.text,
  },
  youBadge: {
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: theme.radius.sm,
  },
  youText: {
    fontSize: hp(1.3),
    color: theme.colors.success,
    fontWeight: theme.fonts.semiBold,
  },
  footer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
});