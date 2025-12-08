// app/(main)/slot/edit/[id].jsx
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { hp, wp } from '../../../../helpers/common';
import { theme, slotTypeColors } from '../../../../constants/theme';
import { useAuth } from '../../../../contexts/AuthContext';
import { getSlotById, updateSlot } from '../../../../services/bookingService';
import { getTeacherClasses } from '../../../../services/userService';
import { getTeacherSubjects } from '../../../../services/subjectService';
import ScreenWrapper from '../../../../components/common/ScreenWrapper';
import BackButton from '../../../../components/common/BackButton';
import Input from '../../../../components/common/Input';
import Button from '../../../../components/common/Button';
import Icon from '../../../../assets/icons/Icon';

// Formatta automaticamente l'orario con ":"
const formatTimeInput = (text) => {
  const numbers = text.replace(/[^\d]/g, '');
  const limited = numbers.slice(0, 4);
  if (limited.length > 2) {
    return `${limited.slice(0, 2)}:${limited.slice(2)}`;
  }
  return limited;
};

// Festività italiane fisse
const HOLIDAYS = [
  { day: 1, month: 0 }, { day: 6, month: 0 }, { day: 25, month: 3 },
  { day: 1, month: 4 }, { day: 2, month: 5 }, { day: 15, month: 7 },
  { day: 1, month: 10 }, { day: 8, month: 11 }, { day: 25, month: 11 }, { day: 26, month: 11 },
];

const isHoliday = (date) => {
  const day = date.getDate();
  const month = date.getMonth();
  return HOLIDAYS.some(h => h.day === day && h.month === month);
};

const isSunday = (date) => date.getDay() === 0;
const isNonWorkingDay = (date) => isSunday(date) || isHoliday(date);

const SLOT_TYPES = [
  { value: 'interrogazione', label: 'Interrogazione', icon: 'mic' },
  { value: 'verifica', label: 'Verifica', icon: 'clipboard' },
  { value: 'altro', label: 'Altro', icon: 'calendar' },
];

const EditSlot = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { bottom } = useSafeAreaInsets();
  
  const [originalSlot, setOriginalSlot] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [type, setType] = useState('interrogazione');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxStudents, setMaxStudents] = useState('1');
  const [description, setDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const getYears = () => {
    const years = [...new Set(classes.map(c => c.name.charAt(0)))].sort();
    return years;
  };

  const getSectionsForYear = (year) => {
    return classes.filter(c => c.name.charAt(0) === year);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!profile?.id || !id) return;
    
    setLoadingData(true);
    
    const [slotRes, classesRes, subjectsRes] = await Promise.all([
      getSlotById(id),
      getTeacherClasses(profile.id),
      getTeacherSubjects(profile.id)
    ]);
    
    // Estrai le classi dalla relazione teacher_classes
    let teacherClasses = [];
    if (classesRes.data) {
      teacherClasses = classesRes.data
        .filter(tc => tc.class)
        .map(tc => tc.class);
      setClasses(teacherClasses);
    }
    
    if (subjectsRes.data) {
      const subs = subjectsRes.data.map(ts => ts.subject).filter(Boolean);
      setSubjects(subs);
    }
    
    if (slotRes.data) {
      const slot = slotRes.data;
      setOriginalSlot(slot);
      setType(slot.type);
      setDate(new Date(slot.date));
      setStartTime(slot.start_time?.slice(0, 5) || '');
      setEndTime(slot.end_time?.slice(0, 5) || '');
      setMaxStudents(String(slot.max_students || 1));
      setDescription(slot.description || '');
      setSelectedClass(slot.class_id);
      
      // Set year from class
      const slotClass = teacherClasses.find(c => c.id === slot.class_id);
      if (slotClass) {
        setSelectedYear(slotClass.name.charAt(0));
      }
      
      // Find subject in teacher subjects
      if (subjectsRes.data) {
        const subs = subjectsRes.data.map(ts => ts.subject).filter(Boolean);
        const matchingSubject = subs.find(s => s.name === slot.subject);
        if (matchingSubject) {
          setSelectedSubject(matchingSubject);
        }
      }
    }
    
    setLoadingData(false);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (isNonWorkingDay(selectedDate)) {
        Alert.alert(
          'Data non valida', 
          'Non puoi selezionare domeniche o giorni festivi',
          [{ text: 'OK' }]
        );
        return;
      }
      setDate(selectedDate);
    }
  };

  const formatDate = (d) => {
    return d.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateForDB = (d) => {
    return d.toISOString().split('T')[0];
  };

  const validateForm = () => {
    if (!selectedSubject) {
      Alert.alert('Errore', 'Seleziona la materia');
      return false;
    }
    if (!selectedClass) {
      Alert.alert('Errore', 'Seleziona una classe');
      return false;
    }
    if (isNonWorkingDay(date)) {
      Alert.alert('Errore', 'Non puoi creare eventi in giorni festivi o domeniche');
      return false;
    }
    if (!startTime.trim() || !/^\d{2}:\d{2}$/.test(startTime)) {
      Alert.alert('Errore', 'Inserisci l\'ora di inizio nel formato HH:MM (es. 09:00)');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { data, error } = await updateSlot(id, {
      class_id: selectedClass,
      subject: selectedSubject.name,
      type,
      date: formatDateForDB(date),
      start_time: startTime,
      end_time: endTime || null,
      max_students: type === 'verifica' ? 99 : (parseInt(maxStudents) || 1),
      description: description.trim() || null,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      Alert.alert('Successo', 'Slot aggiornato', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  if (loadingData) {
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
        <Text style={styles.headerTitle}>Modifica Slot</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Materia */}
        <View style={styles.section}>
          <Text style={styles.label}>Materia *</Text>
          {subjects.length === 0 ? (
            <Text style={styles.noSubjects}>
              Nessuna materia configurata.
            </Text>
          ) : subjects.length === 1 ? (
            <View style={styles.singleSubject}>
              <Text style={styles.singleSubjectText}>{subjects[0].name}</Text>
            </View>
          ) : (
            <Pressable 
              style={styles.dropdown}
              onPress={() => setShowSubjectPicker(true)}
            >
              <Text style={selectedSubject ? styles.dropdownText : styles.dropdownPlaceholder}>
                {selectedSubject?.name || 'Seleziona materia'}
              </Text>
              <Icon name="chevronDown" size={20} color={theme.colors.textLight} />
            </Pressable>
          )}
        </View>

        {/* Tipo */}
        <View style={styles.section}>
          <Text style={styles.label}>Tipo *</Text>
          <View style={styles.typeGrid}>
            {SLOT_TYPES.map((t) => (
              <Pressable
                key={t.value}
                style={[
                  styles.typeCard,
                  type === t.value && { 
                    backgroundColor: slotTypeColors[t.value],
                    borderColor: slotTypeColors[t.value],
                  }
                ]}
                onPress={() => setType(t.value)}
              >
                <Icon 
                  name={t.icon} 
                  size={20} 
                  color={type === t.value ? 'white' : theme.colors.text} 
                />
                <Text style={[
                  styles.typeLabel,
                  type === t.value && { color: 'white' }
                ]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Classe */}
        <View style={styles.section}>
          <Text style={styles.label}>Classe *</Text>
          
          <View style={styles.yearRow}>
            {getYears().map((year) => (
              <Pressable
                key={year}
                style={[
                  styles.yearCard,
                  selectedYear === year && styles.yearCardSelected
                ]}
                onPress={() => {
                  setSelectedYear(year === selectedYear ? null : year);
                  if (year !== selectedYear) setSelectedClass(null);
                }}
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

          {selectedYear && (
            <View style={styles.sectionRow}>
              {getSectionsForYear(selectedYear).map((c) => (
                <Pressable
                  key={c.id}
                  style={[
                    styles.sectionCard,
                    selectedClass === c.id && styles.sectionCardSelected
                  ]}
                  onPress={() => setSelectedClass(c.id)}
                >
                  <Text style={[
                    styles.sectionText,
                    selectedClass === c.id && styles.sectionTextSelected
                  ]}>
                    {c.name.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {selectedClass && (
            <Text style={styles.selectedClassText}>
              Classe selezionata: {classes.find(c => c.id === selectedClass)?.name}
            </Text>
          )}
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.label}>Data *</Text>
          <Pressable 
            style={styles.dropdown}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={20} color={theme.colors.textLight} />
            <Text style={styles.dropdownText}>{formatDate(date)}</Text>
          </Pressable>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Orari */}
        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>Ora inizio *</Text>
            <Input
              placeholder="HH:MM"
              value={startTime}
              onChangeText={(text) => setStartTime(formatTimeInput(text))}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
          <View style={{ width: wp(4) }} />
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>Ora fine</Text>
            <Input
              placeholder="HH:MM"
              value={endTime}
              onChangeText={(text) => setEndTime(formatTimeInput(text))}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
        </View>

        {/* Posti - solo per non-verifica */}
        {type !== 'verifica' && (
          <View style={styles.section}>
            <Text style={styles.label}>Posti disponibili</Text>
            <Input
              placeholder="1"
              value={maxStudents}
              onChangeText={setMaxStudents}
              keyboardType="number-pad"
            />
          </View>
        )}

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.label}>Note (opzionale)</Text>
          <Input
            placeholder="Istruzioni o dettagli..."
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>
      </ScrollView>

      {/* Footer fisso */}
      <View style={[styles.footer, { paddingBottom: hp(2) + bottom }]}>
        <Button
          title="Salva Modifiche"
          loading={loading}
          onPress={handleSubmit}
        />
      </View>

      {/* Modal selezione materia */}
      <Modal
        visible={showSubjectPicker}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleziona Materia</Text>
            {subjects.map((s) => (
              <Pressable
                key={s.id}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedSubject(s);
                  setShowSubjectPicker(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedSubject?.id === s.id && styles.modalOptionSelected
                ]}>
                  {s.name}
                </Text>
                {selectedSubject?.id === s.id && (
                  <Icon name="check" size={20} color={theme.colors.primary} />
                )}
              </Pressable>
            ))}
            <Pressable
              style={styles.modalCancel}
              onPress={() => setShowSubjectPicker(false)}
            >
              <Text style={styles.modalCancelText}>Annulla</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default EditSlot;

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
    paddingBottom: hp(2),
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
  section: {
    marginBottom: hp(2.5),
  },
  label: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  noSubjects: {
    fontSize: hp(1.5),
    color: theme.colors.error,
    fontStyle: 'italic',
  },
  singleSubject: {
    backgroundColor: theme.colors.card,
    padding: hp(1.5),
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  singleSubjectText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    padding: hp(1.5),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: wp(2),
  },
  dropdownText: {
    flex: 1,
    fontSize: hp(1.8),
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  dropdownPlaceholder: {
    flex: 1,
    fontSize: hp(1.8),
    color: theme.colors.placeholder,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: wp(2),
  },
  typeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    gap: wp(1),
  },
  typeLabel: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  yearRow: {
    flexDirection: 'row',
    gap: wp(2),
    marginBottom: hp(1.5),
  },
  yearCard: {
    width: wp(12),
    height: wp(12),
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
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  yearTextSelected: {
    color: 'white',
  },
  sectionRow: {
    flexDirection: 'row',
    gap: wp(2),
    marginBottom: hp(1),
  },
  sectionCard: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  sectionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  sectionText: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  sectionTextSelected: {
    color: 'white',
  },
  selectedClassText: {
    fontSize: hp(1.5),
    color: theme.colors.success,
    fontWeight: theme.fonts.medium,
  },
  row: {
    flexDirection: 'row',
  },
  footer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
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
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(2),
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalOptionText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
  modalOptionSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.semiBold,
  },
  modalCancel: {
    marginTop: hp(2),
    paddingVertical: hp(1.5),
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
});