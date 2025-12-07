// app/(main)/slot/create.jsx
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { hp, wp } from '../../../helpers/common';
import { theme, slotTypeColors } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { createSlot } from '../../../services/bookingService';
import { getClassesByInstitute } from '../../../services/userService';
import { getTeacherSubjects } from '../../../services/subjectService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Icon from '../../../assets/icons/Icon';

const SLOT_TYPES = [
  { value: 'interrogazione', label: 'Interrogazione', icon: 'mic' },
  { value: 'verifica', label: 'Verifica', icon: 'clipboard' },
  { value: 'altro', label: 'Altro', icon: 'calendar' },
];

const CreateSlot = () => {
  const router = useRouter();
  const { profile } = useAuth();
  
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [type, setType] = useState('interrogazione');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxStudents, setMaxStudents] = useState('1');
  const [description, setDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!profile?.institute_id) return;
    
    const [classesRes, subjectsRes] = await Promise.all([
      getClassesByInstitute(profile.institute_id),
      getTeacherSubjects(profile.id)
    ]);
    
    if (classesRes.data) setClasses(classesRes.data);
    if (subjectsRes.data) {
      const subs = subjectsRes.data.map(ts => ts.subject).filter(Boolean);
      setSubjects(subs);
      if (subs.length === 1) setSelectedSubject(subs[0]);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
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
    if (!startTime.trim() || !/^\d{2}:\d{2}$/.test(startTime)) {
      Alert.alert('Errore', 'Inserisci l\'ora di inizio nel formato HH:MM (es. 09:00)');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const { data, error } = await createSlot({
      teacher_id: profile.id,
      class_id: selectedClass,
      subject: selectedSubject.name,
      type,
      date: formatDateForDB(date),
      start_time: startTime,
      end_time: endTime || null,
      max_students: parseInt(maxStudents) || 1,
      description: description.trim() || null,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      Alert.alert('Successo', 'Slot creato con successo', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Nuovo Slot</Text>
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
              Nessuna materia configurata. Vai in Profilo per aggiungere le tue materie.
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
          <View style={styles.classesGrid}>
            {classes.map((c) => (
              <Pressable
                key={c.id}
                style={[
                  styles.classCard,
                  selectedClass === c.id && styles.classCardSelected
                ]}
                onPress={() => setSelectedClass(c.id)}
              >
                <Text style={[
                  styles.className,
                  selectedClass === c.id && styles.classNameSelected
                ]}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>
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
              onChangeText={setStartTime}
            />
          </View>
          <View style={{ width: wp(4) }} />
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>Ora fine</Text>
            <Input
              placeholder="HH:MM"
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>

        {/* Posti */}
        <View style={styles.section}>
          <Text style={styles.label}>Posti disponibili</Text>
          <Input
            placeholder="1"
            value={maxStudents}
            onChangeText={setMaxStudents}
            keyboardType="number-pad"
          />
        </View>

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
      <View style={styles.footer}>
        <Button
          title="Crea Slot"
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

export default CreateSlot;

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
  classesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  classCard: {
    width: (wp(90) - wp(8)) / 5,
    aspectRatio: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  classCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  className: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  classNameSelected: {
    color: 'white',
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