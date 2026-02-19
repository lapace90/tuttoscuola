import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getAllClasses, createClass, updateClass, deleteClass } from '../../../services/adminService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import Icon from '../../../assets/icons/Icon';

const AdminClasses = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({ year: '', section: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    if (!profile?.institute_id) return;
    
    setLoading(true);
    const { data, error } = await getAllClasses(profile.institute_id);
    setLoading(false);

    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      setClasses(data || []);
    }
  };

  const openCreateModal = () => {
    setEditingClass(null);
    setFormData({ year: '', section: '' });
    setModalVisible(true);
  };

  const openEditModal = (classItem) => {
    setEditingClass(classItem);
    const section = classItem.name.replace(/[0-9]/g, '');
    setFormData({ year: classItem.year.toString(), section });
    setModalVisible(true);
  };

  const handleSave = async () => {
    const year = parseInt(formData.year);
    if (isNaN(year) || year < 1 || year > 5) {
      Alert.alert('Errore', 'L\'anno deve essere un numero da 1 a 5');
      return;
    }

    const section = formData.section.trim().toUpperCase();
    if (!section || !/^[A-Z]+$/.test(section)) {
      Alert.alert('Errore', 'La sezione deve contenere solo lettere (es. A, B, C)');
      return;
    }

    const className = `${year}${section}`;
    setSaving(true);

    if (editingClass) {
      const { error } = await updateClass(editingClass.id, { name: className, year });
      if (error) Alert.alert('Errore', error.message);
      else {
        setModalVisible(false);
        loadClasses();
      }
    } else {
      const { error } = await createClass({
        name: className,
        year,
        instituteId: profile.institute_id,
        adminId: profile.id,
      });
      if (error) Alert.alert('Errore', error.message);
      else {
        setModalVisible(false);
        loadClasses();
      }
    }
    setSaving(false);
  };

  const handleDelete = (classItem) => {
    const studentCount = classItem.students?.[0]?.count || 0;
    
    if (studentCount > 0) {
      Alert.alert('Impossibile eliminare', `Questa classe ha ${studentCount} studenti.`);
      return;
    }

    Alert.alert(
      'Elimina classe',
      `Sei sicuro di voler eliminare la classe ${classItem.name}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteClass(classItem.id);
            if (error) Alert.alert('Errore', error.message);
            else loadClasses();
          },
        },
      ],
    );
  };

  const classesByYear = classes.reduce((acc, cls) => {
    const year = cls.year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(cls);
    return acc;
  }, {});

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Gestione Classi</Text>
        <Pressable style={styles.addButton} onPress={openCreateModal}>
          <Icon name="plus" size={22} color={theme.colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.loadingText}>Caricamento...</Text>
        ) : classes.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="users" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>Nessuna classe</Text>
            <Text style={styles.emptySubtext}>Crea la prima classe per iniziare</Text>
          </View>
        ) : (
          Object.keys(classesByYear)
            .sort((a, b) => a - b)
            .map((year) => (
              <View key={year} style={styles.section}>
                <Text style={styles.sectionTitle}>Anno {year}</Text>
                {classesByYear[year]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((classItem) => (
                    <Pressable
                      key={classItem.id}
                      style={styles.menuItem}
                      onPress={() => openEditModal(classItem)}
                    >
                      <View style={styles.menuIcon}>
                        <Text style={styles.classNameBig}>{classItem.name}</Text>
                      </View>
                      <View style={styles.menuContent}>
                        <Text style={styles.menuText}>Classe {classItem.name}</Text>
                        <Text style={styles.menuSubtext}>
                          {classItem.students?.[0]?.count || 0} studenti
                        </Text>
                      </View>
                      <Pressable hitSlop={8} onPress={() => handleDelete(classItem)}>
                        <Icon name="trash" size={18} color={theme.colors.error} />
                      </Pressable>
                    </Pressable>
                  ))}
              </View>
            ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingClass ? 'Modifica Classe' : 'Nuova Classe'}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Icon name="x" size={24} color={theme.colors.text} />
              </Pressable>
            </View>

            {formData.year && formData.section && (
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>Anteprima:</Text>
                <Text style={styles.previewName}>{formData.year}{formData.section.toUpperCase()}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.formRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Anno *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.year}
                    onChangeText={(text) => setFormData({ ...formData, year: text })}
                    placeholder="1-5"
                    placeholderTextColor={theme.colors.placeholder}
                    keyboardType="numeric"
                    maxLength={1}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Sezione *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.section}
                    onChangeText={(text) => setFormData({ ...formData, section: text })}
                    placeholder="A, B, C..."
                    placeholderTextColor={theme.colors.placeholder}
                    autoCapitalize="characters"
                    maxLength={3}
                  />
                </View>
              </View>

              <Button
                title={editingClass ? 'Salva modifiche' : 'Crea classe'}
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

export default AdminClasses;

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
    paddingBottom: hp(4),
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  classNameBig: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
  menuContent: {
    flex: 1,
  },
  menuText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  menuSubtext: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: hp(0.3),
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
    paddingBottom: hp(6),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  modalTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary + '15',
    padding: hp(2),
    borderRadius: theme.radius.lg,
    marginBottom: hp(2),
    gap: wp(2),
  },
  previewLabel: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  previewName: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
  form: {
    gap: hp(2),
  },
  formRow: {
    flexDirection: 'row',
    gap: wp(3),
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
    textAlign: 'center',
  },
});