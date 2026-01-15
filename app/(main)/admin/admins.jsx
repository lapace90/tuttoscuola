import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { getAllSubjectsAdmin, createSubject, updateSubject, deleteSubject } from '../../../services/adminService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import Icon from '../../../assets/icons/Icon';

const AdminSubjects = () => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    const { data, error } = await getAllSubjectsAdmin();
    setLoading(false);

    if (error) Alert.alert('Errore', error.message);
    else setSubjects(data || []);
  };

  const openCreateModal = () => {
    setEditingSubject(null);
    setSubjectName('');
    setModalVisible(true);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!subjectName.trim()) {
      Alert.alert('Errore', 'Inserisci il nome della materia');
      return;
    }

    setSaving(true);

    if (editingSubject) {
      const { error } = await updateSubject(editingSubject.id, subjectName.trim());
      if (error) Alert.alert('Errore', error.message);
      else {
        setModalVisible(false);
        loadSubjects();
      }
    } else {
      const { error } = await createSubject(subjectName.trim());
      if (error) Alert.alert('Errore', error.message);
      else {
        setModalVisible(false);
        loadSubjects();
      }
    }
    setSaving(false);
  };

  const handleDelete = (subject) => {
    Alert.alert(
      'Elimina materia',
      `Sei sicuro di voler eliminare "${subject.name}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteSubject(subject.id);
            if (error) Alert.alert('Errore', error.message);
            else loadSubjects();
          },
        },
      ],
    );
  };

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Gestione Materie</Text>
        <Pressable style={styles.addButton} onPress={openCreateModal}>
          <Icon name="plus" size={22} color={theme.colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: hp(4) + bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.loadingText}>Caricamento...</Text>
        ) : subjects.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="book" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>Nessuna materia</Text>
            <Text style={styles.emptySubtext}>Crea la prima materia per iniziare</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{subjects.length} Materie</Text>
            {subjects.map((subject) => (
              <Pressable
                key={subject.id}
                style={styles.menuItem}
                onPress={() => openEditModal(subject)}
              >
                <View style={styles.menuIcon}>
                  <Icon name="book" size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.menuText}>{subject.name}</Text>
                <Pressable hitSlop={8} onPress={() => handleDelete(subject)}>
                  <Icon name="trash" size={18} color={theme.colors.error} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: hp(4) + bottom }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingSubject ? 'Modifica Materia' : 'Nuova Materia'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Icon name="x" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome materia *</Text>
                <TextInput
                  style={styles.input}
                  value={subjectName}
                  onChangeText={setSubjectName}
                  placeholder="es. Matematica, Italiano, Storia"
                  placeholderTextColor={theme.colors.placeholder}
                  autoCapitalize="words"
                />
              </View>

              <Button
                title={editingSubject ? 'Salva modifiche' : 'Crea materia'}
                onPress={handleSave}
                loading={saving}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default AdminSubjects;

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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(5),
  },
  loadingText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: hp(4),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: hp(6),
  },
  emptyText: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginTop: hp(2),
  },
  emptySubtext: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginTop: hp(0.5),
  },
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: hp(1.5),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: hp(2),
    borderRadius: theme.radius.lg,
    marginBottom: hp(1),
    ...theme.shadows.sm,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  menuText: {
    flex: 1,
    fontSize: hp(1.8),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    padding: wp(5),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  modalTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: hp(2),
  },
  inputGroup: {
    gap: hp(0.5),
  },
  label: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: wp(4),
    fontSize: hp(1.8),
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});