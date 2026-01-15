import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getTeacherClasses } from '../../../services/userService';
import { getTeacherSubjects } from '../../../services/subjectService';
import { useHomework } from '../../../hooks/useHomework';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import Icon from '../../../assets/icons/Icon';

const CreateHomework = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const { create } = useHomework();
  
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Default: +7 giorni
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
    }

    setLoading(false);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatApiDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedSubject || !title.trim()) {
      Alert.alert('Errore', 'Compila tutti i campi obbligatori');
      return;
    }

    // Verifica che la data non sia nel passato
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      Alert.alert('Errore', 'La scadenza non può essere nel passato');
      return;
    }

    setSaving(true);
    const { error } = await create({
      class_id: selectedClass.id,
      subject: selectedSubject.name,
      title: title.trim(),
      description: description.trim() || null,
      due_date: formatApiDate(dueDate)
    });
    setSaving(false);

    if (error) {
      Alert.alert('Errore', error.message || error);
    } else {
      router.back();
    }
  };

  // Quick date options
  const quickDates = [
    { label: 'Domani', days: 1 },
    { label: 'Tra 3 giorni', days: 3 },
    { label: 'Tra 1 settimana', days: 7 },
    { label: 'Tra 2 settimane', days: 14 },
  ];

  const setQuickDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setDueDate(date);
  };

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <BackButton router={router} />
          <Text style={styles.headerTitle}>Nuovo Compito</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Nuovo Compito</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Classe */}
        <View style={styles.section}>
          <Text style={styles.label}>Classe *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsRow}>
              {classes.map((c) => (
                <Pressable
                  key={c.id}
                  style={[
                    styles.optionChip,
                    selectedClass?.id === c.id && styles.optionChipSelected
                  ]}
                  onPress={() => setSelectedClass(c)}
                >
                  <Text style={[
                    styles.optionChipText,
                    selectedClass?.id === c.id && styles.optionChipTextSelected
                  ]}>
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Materia */}
        <View style={styles.section}>
          <Text style={styles.label}>Materia *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsRow}>
              {subjects.map((s) => (
                <Pressable
                  key={s.id}
                  style={[
                    styles.optionChip,
                    selectedSubject?.id === s.id && styles.optionChipSelected
                  ]}
                  onPress={() => setSelectedSubject(s)}
                >
                  <Text style={[
                    styles.optionChipText,
                    selectedSubject?.id === s.id && styles.optionChipTextSelected
                  ]}>
                    {s.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Titolo */}
        <View style={styles.section}>
          <Text style={styles.label}>Titolo *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Es. Esercizi pag. 45"
            placeholderTextColor={theme.colors.placeholder}
          />
        </View>

        {/* Descrizione */}
        <View style={styles.section}>
          <Text style={styles.label}>Descrizione</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Dettagli aggiuntivi..."
            placeholderTextColor={theme.colors.placeholder}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Scadenza */}
        <View style={styles.section}>
          <Text style={styles.label}>Scadenza *</Text>
          
          {/* Quick dates */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: hp(1.5) }}>
            <View style={styles.optionsRow}>
              {quickDates.map((qd) => (
                <Pressable
                  key={qd.days}
                  style={styles.quickDateChip}
                  onPress={() => setQuickDate(qd.days)}
                >
                  <Text style={styles.quickDateText}>{qd.label}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Date picker button */}
          <Pressable 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="calendar" size={20} color={theme.colors.primary} />
            <Text style={styles.dateButtonText}>{formatDisplayDate(dueDate)}</Text>
            <Icon name="chevronDown" size={20} color={theme.colors.textLight} />
          </Pressable>

          {/* Date picker */}
          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
              locale="it-IT"
            />
          )}
        </View>

        <Button
          title="Assegna compito"
          onPress={handleSave}
          loading={saving}
          buttonStyle={{ marginTop: hp(2) }}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default CreateHomework;

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
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  section: {
    marginBottom: hp(2.5),
  },
  label: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    marginBottom: hp(1),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: wp(2),
  },
  optionChip: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionChipText: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  optionChipTextSelected: {
    color: 'white',
  },
  quickDateChip: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    backgroundColor: theme.colors.secondary + '20',
    borderRadius: theme.radius.md,
  },
  quickDateText: {
    fontSize: hp(1.4),
    color: theme.colors.secondary,
    fontWeight: theme.fonts.medium,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: wp(3),
  },
  dateButtonText: {
    flex: 1,
    fontSize: hp(1.7),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    fontSize: hp(1.6),
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: hp(12),
    textAlignVertical: 'top',
  },
});