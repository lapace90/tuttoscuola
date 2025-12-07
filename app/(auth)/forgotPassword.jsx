// app/forgotPassword.jsx
import { Alert, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { validateEmailDomain } from '../services/authService';
import ScreenWrapper from '../components/common/ScreenWrapper';
import BackButton from '../components/common/BackButton';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Icon from '../assets/icons';

const ForgotPassword = () => {
  const router = useRouter();
  const { sendPasswordReset } = useAuth();
  const emailRef = useRef('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit = async () => {
    const email = emailRef.current.trim();

    if (!email) {
      Alert.alert('Errore', 'Inserisci la tua email');
      return;
    }

    // Valida dominio email
    const domainValidation = validateEmailDomain(email);
    if (!domainValidation.valid) {
      Alert.alert('Email non valida', domainValidation.error);
      return;
    }

    setLoading(true);
    const { error } = await sendPasswordReset(email);
    setLoading(false);

    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <ScreenWrapper bg={theme.colors.background}>
        <StatusBar style="dark" />
        <View style={styles.container}>
          <BackButton router={router} />

          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Icon name="mail" size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.successTitle}>Email inviata! 📧</Text>
            <Text style={styles.successText}>
              Controlla la tua casella di posta. Ti abbiamo inviato un link per reimpostare la password.
            </Text>
            <Text style={styles.successNote}>
              Non trovi l'email? Controlla nella cartella spam.
            </Text>

            <Button
              title="Torna al login"
              onPress={() => router.replace('/login')}
              buttonStyle={styles.backButton}
            />
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Password dimenticata? 🔑</Text>
          <Text style={styles.subtitle}>
            Nessun problema! Inserisci la tua email e ti invieremo un link per reimpostarla.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            icon={<Icon name="mail" size={22} color={theme.colors.textLight} />}
            placeholder="nome.cognome@cattaneodigitale.it"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(value) => (emailRef.current = value)}
          />

          <Button 
            title="Invia link" 
            loading={loading} 
            onPress={onSubmit}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(6),
  },
  header: {
    marginTop: hp(4),
    marginBottom: hp(4),
  },
  title: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    marginTop: hp(1),
    lineHeight: hp(2.6),
  },
  form: {
    gap: hp(2),
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(10),
  },
  successIcon: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(3),
    ...theme.shadows.md,
  },
  successTitle: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(1.5),
  },
  successText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: hp(2.6),
    paddingHorizontal: wp(4),
  },
  successNote: {
    fontSize: hp(1.5),
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginTop: hp(2),
  },
  backButton: {
    marginTop: hp(4),
    width: '100%',
  },
});