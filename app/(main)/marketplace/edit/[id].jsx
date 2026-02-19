import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { hp, wp } from '../../../../helpers/common';
import { theme } from '../../../../constants/theme';
import { useAuth } from '../../../../contexts/AuthContext';
import { getListingById, updateListing, uploadListingImages } from '../../../../services/marketplaceService';
import ScreenWrapper from '../../../../components/common/ScreenWrapper';
import BackButton from '../../../../components/common/BackButton';
import Button from '../../../../components/common/Button';
import Input from '../../../../components/common/Input';
import Icon from '../../../../assets/icons/Icon';

const CATEGORIES = [
  { key: 'libri', label: 'Libri', icon: 'book' },
  { key: 'appunti', label: 'Appunti', icon: 'fileText' },
  { key: 'materiale', label: 'Materiale', icon: 'briefcase' },
];

const CONDITIONS = [
  { key: 'nuovo', label: 'Nuovo' },
  { key: 'come_nuovo', label: 'Come nuovo' },
  { key: 'buono', label: 'Buono' },
  { key: 'usato', label: 'Usato' },
];

const EditListing = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [listingType, setListingType] = useState('vendo');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(null);
  const [condition, setCondition] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const isCerco = listingType === 'cerco';

  useEffect(() => {
    if (id) loadListing();
  }, [id]);

  const loadListing = async () => {
    const { data, error } = await getListingById(id);
    if (!error && data) {
      setListingType(data.listing_type || 'vendo');
      setTitle(data.title || '');
      setDescription(data.description || '');
      setPrice(data.price ? String(data.price) : '');
      setCategory(data.category);
      setCondition(data.condition);
      setExistingImages(data.images || []);
    }
    setInitialLoading(false);
  };

  const pickImage = async () => {
    const total = existingImages.length + newImages.length;
    if (total >= 4) {
      Alert.alert('Limite raggiunto', 'Puoi avere massimo 4 immagini.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permesso negato', 'Serve il permesso per accedere alla galleria.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setNewImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Errore', 'Inserisci un titolo.');
      return;
    }
    if (!category) {
      Alert.alert('Errore', 'Seleziona una categoria.');
      return;
    }
    if (!isCerco && !condition) {
      Alert.alert('Errore', 'Seleziona la condizione.');
      return;
    }

    setLoading(true);

    let allImages = [...existingImages];
    if (newImages.length > 0) {
      const { data: urls, error: uploadError } = await uploadListingImages(profile.id, newImages);
      if (uploadError) {
        Alert.alert('Errore', 'Impossibile caricare le immagini.');
        setLoading(false);
        return;
      }
      allImages = [...allImages, ...urls];
    }

    const updates = {
      listing_type: listingType,
      title: title.trim(),
      description: description.trim() || null,
      price: price ? parseFloat(price) : null,
      category,
      condition: isCerco ? null : condition,
      images: allImages,
    };

    const { error } = await updateListing(id, updates);
    setLoading(false);

    if (error) {
      Alert.alert('Errore', error.message || 'Impossibile aggiornare.');
    } else {
      Alert.alert('Aggiornato!', 'L\'annuncio è stato aggiornato.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  if (initialLoading) {
    return (
      <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
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
        <Text style={styles.headerTitle}>Modifica annuncio</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Listing Type */}
          <View style={styles.segmentedControl}>
            <Pressable
              style={[styles.segmentTab, !isCerco && styles.segmentTabActive]}
              onPress={() => setListingType('vendo')}
            >
              <Text style={[styles.segmentTabText, !isCerco && styles.segmentTabTextActive]}>Vendo / Dono</Text>
            </Pressable>
            <Pressable
              style={[styles.segmentTab, isCerco && styles.segmentTabActive]}
              onPress={() => setListingType('cerco')}
            >
              <Text style={[styles.segmentTabText, isCerco && styles.segmentTabTextActive]}>Cerco</Text>
            </Pressable>
          </View>

          {/* Images */}
          <Text style={styles.label}>{isCerco ? 'Foto (opzionale)' : 'Foto (max 4)'}</Text>
          <View style={styles.imagesRow}>
            {existingImages.map((uri, index) => (
              <View key={`existing-${index}`} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} contentFit="cover" />
                <Pressable style={styles.removeImage} onPress={() => removeExistingImage(index)}>
                  <Icon name="x" size={14} color="white" />
                </Pressable>
              </View>
            ))}
            {newImages.map((uri, index) => (
              <View key={`new-${index}`} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} contentFit="cover" />
                <Pressable style={styles.removeImage} onPress={() => removeNewImage(index)}>
                  <Icon name="x" size={14} color="white" />
                </Pressable>
              </View>
            ))}
            {existingImages.length + newImages.length < 4 && (
              <Pressable style={styles.addImageBtn} onPress={pickImage}>
                <Icon name="camera" size={24} color={theme.colors.textLight} />
                <Text style={styles.addImageText}>Aggiungi</Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.label}>Titolo *</Text>
          <Input placeholder={isCerco ? 'es. Cerco libro di matematica' : 'Titolo'} value={title} onChangeText={setTitle} />

          <Text style={styles.label}>Descrizione</Text>
          <Input
            placeholder={isCerco ? 'Descrivi cosa stai cercando...' : "Descrivi l'oggetto..."}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            containerStyle={styles.textArea}
            inputStyle={styles.textAreaInput}
          />

          <Text style={styles.label}>{isCerco ? 'Budget (€)' : 'Prezzo (€)'}</Text>
          <Input
            placeholder="0.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Categoria *</Text>
          <View style={styles.optionsRow}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.key}
                style={[styles.optionChip, category === cat.key && styles.optionChipActive]}
                onPress={() => setCategory(cat.key)}
              >
                <Icon
                  name={cat.icon}
                  size={18}
                  color={category === cat.key ? 'white' : theme.colors.textLight}
                />
                <Text style={[styles.optionChipText, category === cat.key && styles.optionChipTextActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {!isCerco && (
            <>
              <Text style={styles.label}>Condizione *</Text>
              <View style={styles.optionsRow}>
                {CONDITIONS.map((cond) => (
                  <Pressable
                    key={cond.key}
                    style={[styles.optionChip, condition === cond.key && styles.optionChipActive]}
                    onPress={() => setCondition(cond.key)}
                  >
                    <Text style={[styles.optionChipText, condition === cond.key && styles.optionChipTextActive]}>
                      {cond.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button title="Salva modifiche" loading={loading} onPress={handleSave} />
      </View>
    </ScreenWrapper>
  );
};

export default EditListing;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
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
    gap: hp(1.5),
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: hp(1),
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  segmentTabActive: {
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  segmentTabText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
  },
  segmentTabTextActive: {
    color: theme.colors.text,
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
  label: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginTop: hp(0.5),
  },
  imagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(3),
  },
  imageWrapper: {
    width: wp(20),
    height: wp(20),
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImage: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageBtn: {
    width: wp(20),
    height: wp(20),
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: hp(0.5),
  },
  addImageText: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
  },
  textArea: {
    height: hp(12),
    alignItems: 'flex-start',
    paddingVertical: hp(1.5),
  },
  textAreaInput: {
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionChipText: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  optionChipTextActive: {
    color: 'white',
  },
  footer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
});
