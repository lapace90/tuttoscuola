// app/(main)/profile/edit.jsx
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { updateUserProfile, uploadAvatar } from '../../../services/userService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import Icon from '../../../assets/icons/Icon';

const EditProfile = () => {
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [avatar, setAvatar] = useState(profile?.avatar_url || null);
  const [newAvatarUri, setNewAvatarUri] = useState(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Serve il permesso per accedere alla galleria');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setNewAvatarUri(result.assets[0].uri);
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Errore', 'Nome e cognome sono obbligatori');
      return;
    }

    setSaving(true);

    try {
      let avatarUrl = profile?.avatar_url;

      // Upload new avatar if selected
      if (newAvatarUri) {
        const { data: uploadData, error: uploadError } = await uploadAvatar(profile.id, newAvatarUri);
        if (uploadError) throw uploadError;
        avatarUrl = uploadData;
      }

      // Update profile
      const { error } = await updateUserProfile(profile.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || null,
        avatar_url: avatarUrl
      });

      if (error) throw error;

      await refreshProfile();
      router.back();
    } catch (error) {
      Alert.alert('Errore', error.message || 'Impossibile salvare il profilo');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const f = firstName?.charAt(0) || '';
    const l = lastName?.charAt(0) || '';
    return (f + l).toUpperCase() || '?';
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Modifica Profilo</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Pressable style={styles.avatarContainer} onPress={pickImage}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Icon name="camera" size={16} color="white" />
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>Tocca per cambiare foto</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Il tuo nome"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cognome *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Il tuo cognome"
              placeholderTextColor={theme.colors.placeholder}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefono</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+39 123 456 7890"
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="phone-pad"
            />
          </View>

          {/* Read-only fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>{profile?.email || '-'}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ruolo</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>
                {profile?.role === 'student' ? 'Studente' : 
                 profile?.role === 'teacher' ? 'Professore' : 
                 profile?.role || '-'}
              </Text>
            </View>
          </View>

          {profile?.role === 'student' && profile?.class && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Classe</Text>
              <View style={[styles.input, styles.inputDisabled]}>
                <Text style={styles.inputDisabledText}>{profile.class.name}</Text>
              </View>
            </View>
          )}
        </View>

        <Button
          title="Salva modifiche"
          onPress={handleSave}
          loading={saving}
          buttonStyle={{ marginTop: hp(3) }}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default EditProfile;

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
  avatarSection: {
    alignItems: 'center',
    marginVertical: hp(3),
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: 'white',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  avatarHint: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: hp(1),
  },
  form: {
    gap: hp(2),
  },
  inputGroup: {
    gap: hp(0.5),
  },
  label: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    fontSize: hp(1.7),
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputDisabled: {
    backgroundColor: theme.colors.border + '50',
  },
  inputDisabledText: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
  },
});