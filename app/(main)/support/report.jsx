import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useReports } from '../../../hooks/useReports';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import Icon from '../../../assets/icons/Icon';

const Report = () => {
  const router = useRouter();
  const { submit, REPORT_TYPES } = useReports();

  const [step, setStep] = useState('info'); // 'info' | 'type' | 'form'
  const [selectedType, setSelectedType] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Errore', 'Inserisci un titolo per la segnalazione');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Errore', 'Descrivi il problema in modo dettagliato');
      return;
    }

    setSending(true);
    const { error } = await submit({
      type: selectedType,
      title: title.trim(),
      description: description.trim()
    });
    setSending(false);

    if (error) {
      Alert.alert('Errore', error.message || 'Impossibile inviare la segnalazione');
    } else {
      Alert.alert(
        'Segnalazione inviata',
        'La tua segnalazione è stata ricevuta. Verrà esaminata dal personale scolastico.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  };

  const renderInfoStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.infoHeader}>
        <View style={styles.infoIconContainer}>
          <Icon name="alertCircle" size={32} color={theme.colors.primary} />
        </View>
        <Text style={styles.infoTitle}>Sistema di segnalazione</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>A cosa serve?</Text>
        <Text style={styles.infoCardText}>
          Il sistema di segnalazione ti permette di comunicare problemi, 
          segnalare comportamenti inappropriati o suggerire miglioramenti 
          direttamente alla tua scuola.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Cosa puoi segnalare</Text>
        <View style={styles.infoList}>
          <View style={styles.infoListItem}>
            <Icon name="settings" size={18} color={theme.colors.warning} />
            <Text style={styles.infoListText}>Problemi tecnici dell'app</Text>
          </View>
          <View style={styles.infoListItem}>
            <Icon name="alertCircle" size={18} color={theme.colors.error} />
            <Text style={styles.infoListText}>Contenuti inappropriati nelle chat</Text>
          </View>
          <View style={styles.infoListItem}>
            <Icon name="users" size={18} color={theme.colors.error} />
            <Text style={styles.infoListText}>Comportamenti scorretti (bullismo, molestie)</Text>
          </View>
          <View style={styles.infoListItem}>
            <Icon name="messageSquare" size={18} color={theme.colors.success} />
            <Text style={styles.infoListText}>Suggerimenti per migliorare l'app</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Chi riceve le segnalazioni?</Text>
        <Text style={styles.infoCardText}>
          Le segnalazioni vengono inviate al personale scolastico del tuo istituto 
          (segreteria, referenti). Non vengono condivise con altri studenti o 
          persone esterne.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Riservatezza</Text>
        <Text style={styles.infoCardText}>
          Le tue segnalazioni sono riservate. Il tuo nome sarà visibile solo 
          al personale autorizzato che gestirà la segnalazione.
        </Text>
      </View>

      <View style={styles.warningBox}>
        <Icon name="info" size={20} color={theme.colors.secondary} />
        <Text style={styles.warningText}>
          Usa questo strumento in modo responsabile. Le segnalazioni false o 
          inappropriate potrebbero avere conseguenze disciplinari.
        </Text>
      </View>

      <Button
        title="Ho capito, procedi"
        onPress={() => setStep('type')}
        buttonStyle={{ marginTop: hp(2) }}
      />
    </View>
  );

  const renderTypeStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tipo di segnalazione</Text>
      <Text style={styles.stepSubtitle}>Seleziona la categoria più appropriata</Text>

      <View style={styles.typeList}>
        {Object.entries(REPORT_TYPES).map(([key, config]) => (
          <Pressable
            key={key}
            style={styles.typeCard}
            onPress={() => handleTypeSelect(key)}
          >
            <View style={[styles.typeIcon, { backgroundColor: config.color + '20' }]}>
              <Icon name={config.icon} size={24} color={config.color} />
            </View>
            <View style={styles.typeContent}>
              <Text style={styles.typeLabel}>{config.label}</Text>
              <Text style={styles.typeDescription}>{config.description}</Text>
            </View>
            <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.backLink} onPress={() => setStep('info')}>
        <Icon name="arrowLeft" size={16} color={theme.colors.textLight} />
        <Text style={styles.backLinkText}>Torna alle informazioni</Text>
      </Pressable>
    </View>
  );

  const renderFormStep = () => {
    const typeConfig = REPORT_TYPES[selectedType];

    return (
      <View style={styles.stepContainer}>
        <View style={styles.selectedType}>
          <View style={[styles.selectedTypeIcon, { backgroundColor: typeConfig.color + '20' }]}>
            <Icon name={typeConfig.icon} size={20} color={typeConfig.color} />
          </View>
          <Text style={styles.selectedTypeLabel}>{typeConfig.label}</Text>
          <Pressable onPress={() => setStep('type')}>
            <Text style={styles.changeTypeLink}>Cambia</Text>
          </Pressable>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Titolo *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Breve descrizione del problema"
            placeholderTextColor={theme.colors.placeholder}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrizione dettagliata *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descrivi il problema nel modo più dettagliato possibile. Includi quando è successo, chi era coinvolto, e qualsiasi altra informazione utile."
            placeholderTextColor={theme.colors.placeholder}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.charCount}>{description.length}/1000</Text>
        </View>

        <Button
          title="Invia segnalazione"
          onPress={handleSubmit}
          loading={sending}
          buttonStyle={{ marginTop: hp(2) }}
        />

        <Pressable style={styles.backLink} onPress={() => setStep('type')}>
          <Icon name="arrowLeft" size={16} color={theme.colors.textLight} />
          <Text style={styles.backLinkText}>Torna alla selezione</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Segnalazione</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {step === 'info' && renderInfoStep()}
        {step === 'type' && renderTypeStep()}
        {step === 'form' && renderFormStep()}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Report;

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
    paddingBottom: hp(8),
  },
  stepContainer: {
    flex: 1,
  },
  infoHeader: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  infoIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  infoTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(2),
    marginBottom: hp(1.5),
    ...theme.shadows.sm,
  },
  infoCardTitle: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: hp(0.8),
  },
  infoCardText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    lineHeight: hp(2.2),
  },
  infoList: {
    gap: hp(1),
  },
  infoListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  infoListText: {
    fontSize: hp(1.5),
    color: theme.colors.text,
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(3),
    backgroundColor: theme.colors.secondary + '15',
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    marginTop: hp(1),
  },
  warningText: {
    fontSize: hp(1.4),
    color: theme.colors.secondary,
    flex: 1,
    lineHeight: hp(2),
  },
  stepTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(0.5),
  },
  stepSubtitle: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginBottom: hp(2),
  },
  typeList: {
    gap: hp(1.2),
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    ...theme.shadows.sm,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeContent: {
    flex: 1,
    marginLeft: wp(3),
  },
  typeLabel: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  typeDescription: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    marginTop: 2,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    marginTop: hp(3),
    paddingVertical: hp(1),
  },
  backLinkText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  selectedType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.2),
    marginBottom: hp(2.5),
  },
  selectedTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTypeLabel: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    flex: 1,
    marginLeft: wp(3),
  },
  changeTypeLink: {
    fontSize: hp(1.4),
    color: theme.colors.primary,
    fontWeight: theme.fonts.medium,
  },
  formGroup: {
    marginBottom: hp(2),
  },
  label: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
    marginBottom: hp(0.8),
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
  charCount: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
    textAlign: 'right',
    marginTop: hp(0.5),
  },
});