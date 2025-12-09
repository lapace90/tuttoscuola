import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getTeacherClasses } from '../../../services/userService';
import { getTeacherSubjects } from '../../../services/subjectService';
import { useHomework } from '../../../hooks/useHomework';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';

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
  const [dueDate, setDueDate] = useState('');
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

  const handleSave = async () => {
    if (!selectedClass || !selectedSubject || !title.trim() || !dueDate) {
      Alert.alert('Errore', 'Compila tutti i campi obbligatori');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      Alert.alert('Errore', 'Formato data non valido. Usa AAAA-MM-GG');
      return;
    }

    setSaving(true);
    const { error } = await create({
      class_id: selectedClass.id,
      subject: selectedSubject.name,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate
    });
    setSaving(false);

    if (error) {
      Alert.alert('Errore', error.message || error);
    } else {
      router.back();
    }
  };

  // Generate quick date options
  const getQuickDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        label: i === 1 ? 'Domani' : date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }),
        value: date.toISOString().split('T')[0]
      });
    }
    
    return dates;
  };

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.background}>
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
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Nuovo Compito</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Class selection */}
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

        {/* Subject selection */}
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

        {/* Title */}
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

        {/* Description */}
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

        {/* Due date */}
        <View style={styles.section}>
          <Text style={styles.label}>Scadenza *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.optionsRow}>
              {getQuickDates().map((d) => (
                <Pressable
                  key={d.value}
                  style={[
                    styles.dateChip,
                    dueDate === d.value && styles.dateChipSelected
                  ]}
                  onPress={() => setDueDate(d.value)}
                >
                  <Text style={[
                    styles.dateChipText,
                    dueDate === d.value && styles.dateChipTextSelected
                  ]}>
                    {d.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <TextInput
            style={[styles.input, { marginTop: hp(1) }]}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="AAAA-MM-GG"
            placeholderTextColor={theme.colors.placeholder}
          />
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
  dateChip: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateChipSelected: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  dateChipText: {
    fontSize: hp(1.4),
    color: theme.colors.text,
  },
  dateChipTextSelected: {
    color: 'white',
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