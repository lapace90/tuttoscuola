// app/(main)/announcements/create.jsx
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { useAnnouncements } from '../../../hooks/useAnnouncements';
import { getTeacherClasses } from '../../../services/userService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import Icon from '../../../assets/icons/Icon';

const PRIORITIES = [
  { value: 'high', label: 'Urgente', color: theme.colors.error, icon: 'alertCircle' },
  { value: 'normal', label: 'Normale', color: theme.colors.primary, icon: 'info' },
  { value: 'low', label: 'Info', color: theme.colors.textLight, icon: 'messageCircle' },
];

const AUDIENCES = [
  { value: 'all', label: 'Tutti', icon: 'users' },
  { value: 'students', label: 'Solo studenti', icon: 'user' },
  { value: 'teachers', label: 'Solo professori', icon: 'briefcase' },
];

const CreateAnnouncement = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const { create } = useAnnouncements();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [audience, setAudience] = useState('all');
  const [targetClass, setTargetClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showClassSelect, setShowClassSelect] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    if (profile?.role === 'teacher') {
      const { data } = await getTeacherClasses(profile.id);
      if (data) {
        const teacherClasses = data.filter(tc => tc.class).map(tc => tc.class);
        setClasses(teacherClasses);
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Errore', 'Il titolo è obbligatorio');
      return;
    }

    setSaving(true);
    
    const { error } = await create({
      title: title.trim(),
      content: content.trim() || null,
      priority,
      target_audience: targetClass ? 'all' : audience,
      target_class_id: targetClass?.id || null
    });

    setSaving(false);

    if (error) {
      Alert.alert('Errore', error.message || error);
    } else {
      router.back();
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Nuova Comunicazione</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Titolo *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Es. Riunione genitori-insegnanti"
            placeholderTextColor={theme.colors.placeholder}
          />
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.label}>Contenuto</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="Scrivi il contenuto della comunicazione..."
            placeholderTextColor={theme.colors.placeholder}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.label}>Priorità</Text>
          <View style={styles.optionsRow}>
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.value}
                style={[
                  styles.priorityChip,
                  priority === p.value && { backgroundColor: p.color + '20', borderColor: p.color }
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Icon 
                  name={p.icon} 
                  size={16} 
                  color={priority === p.value ? p.color : theme.colors.textLight} 
                />
                <Text style={[
                  styles.priorityText,
                  priority === p.value && { color: p.color }
                ]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Audience */}
        <View style={styles.section}>
          <Text style={styles.label}>Destinatari</Text>
          
          {/* Class specific toggle */}
          <Pressable 
            style={styles.classToggle}
            onPress={() => setShowClassSelect(!showClassSelect)}
          >
            <View style={styles.classToggleLeft}>
              <Icon name="users" size={20} color={theme.colors.textLight} />
              <Text style={styles.classToggleText}>Invia a una classe specifica</Text>
            </View>
            <Icon 
              name={showClassSelect ? 'chevronUp' : 'chevronDown'} 
              size={20} 
              color={theme.colors.textLight} 
            />
          </Pressable>

          {showClassSelect && classes.length > 0 && (
            <View style={styles.classSelect}>
              <Pressable
                style={[
                  styles.classChip,
                  !targetClass && styles.classChipSelected
                ]}
                onPress={() => setTargetClass(null)}
              >
                <Text style={[
                  styles.classChipText,
                  !targetClass && styles.classChipTextSelected
                ]}>
                  Nessuna (usa destinatari)
                </Text>
              </Pressable>
              {classes.map((c) => (
                <Pressable
                  key={c.id}
                  style={[
                    styles.classChip,
                    targetClass?.id === c.id && styles.classChipSelected
                  ]}
                  onPress={() => setTargetClass(c)}
                >
                  <Text style={[
                    styles.classChipText,
                    targetClass?.id === c.id && styles.classChipTextSelected
                  ]}>
                    Classe {c.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* General audience (only if no class selected) */}
          {!targetClass && (
            <View style={styles.audienceOptions}>
              {AUDIENCES.map((a) => (
                <Pressable
                  key={a.value}
                  style={[
                    styles.audienceChip,
                    audience === a.value && styles.audienceChipSelected
                  ]}
                  onPress={() => setAudience(a.value)}
                >
                  <Icon 
                    name={a.icon} 
                    size={18} 
                    color={audience === a.value ? 'white' : theme.colors.text} 
                  />
                  <Text style={[
                    styles.audienceText,
                    audience === a.value && styles.audienceTextSelected
                  ]}>
                    {a.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {targetClass && (
            <View style={styles.targetInfo}>
              <Icon name="info" size={16} color={theme.colors.secondary} />
              <Text style={styles.targetInfoText}>
                Verrà inviata solo agli studenti della classe {targetClass.name}
              </Text>
            </View>
          )}
        </View>

        <Button
          title="Pubblica comunicazione"
          onPress={handleSave}
          loading={saving}
          buttonStyle={{ marginTop: hp(2) }}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default CreateAnnouncement;

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
    minHeight: hp(15),
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: wp(2),
  },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(1.5),
    paddingVertical: hp(1.2),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  priorityText: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  classToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    marginBottom: hp(1),
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  classToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  classToggleText: {
    fontSize: hp(1.5),
    color: theme.colors.text,
  },
  classSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
    marginBottom: hp(1.5),
  },
  classChip: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  classChipSelected: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  classChipText: {
    fontSize: hp(1.4),
    color: theme.colors.text,
  },
  classChipTextSelected: {
    color: 'white',
  },
  audienceOptions: {
    gap: hp(1),
  },
  audienceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    paddingVertical: hp(1.3),
    paddingHorizontal: wp(4),
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  audienceChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  audienceText: {
    fontSize: hp(1.5),
    color: theme.colors.text,
  },
  audienceTextSelected: {
    color: 'white',
  },
  targetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    backgroundColor: theme.colors.secondary + '15',
    borderRadius: theme.radius.md,
    padding: hp(1.2),
  },
  targetInfoText: {
    fontSize: hp(1.4),
    color: theme.colors.secondary,
    flex: 1,
  },
});