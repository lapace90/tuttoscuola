// app/(auth)/signUp.jsx
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmailDomain } from '../../services/authService';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import BackButton from '../../components/common/BackButton';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Icon from '../../assets/icons/Icon';

const SignUp = () => {
  const router = useRouter();
  const { signUp } = useAuth();
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const confirmPasswordRef = useRef('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const email = emailRef.current.trim();
    const password = passwordRef.current.trim();
    const confirmPassword = confirmPasswordRef.current.trim();

    if (!email || !password || !confirmPassword) {
      Alert.alert('Registrazione', 'Compila tutti i campi');
      return;
    }

    const domainValidation = validateEmailDomain(email);
    if (!domainValidation.valid) {
      Alert.alert('Email non valida', domainValidation.error);
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password debole', 'La password deve avere almeno 6 caratteri');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Errore', 'Le password non coincidono');
      return;
    }

    setLoading(true);
    const { data, error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Errore', error.message);
    } else {
      router.replace('/onboarding');
      // Alert.alert(
      //   'Controlla la tua email! 📧',
      //   'Ti abbiamo inviato un link di conferma. Clicca sul link per attivare il tuo account.',
      //   [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      // );
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />

        <View style={styles.header}>
          <Text style={styles.title}>Crea account 🎓</Text>
          <Text style={styles.subtitle}>
            Usa la tua email scolastica per registrarti
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Icon name="info" size={18} color={theme.colors.secondary} />
          <Text style={styles.infoText}>
            Solo email @cattaneodigitale.it sono accettate
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            icon={<Icon name="mail" size={22} color={theme.colors.textLight} />}
            placeholder="nome.cognome@cattaneodigitale.it"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={(value) => (emailRef.current = value)}
          />

          <Input
            icon={<Icon name="lock" size={22} color={theme.colors.textLight} />}
            placeholder="Password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />

          <Input
            icon={<Icon name="lock" size={22} color={theme.colors.textLight} />}
            placeholder="Conferma password"
            secureTextEntry
            onChangeText={(value) => (confirmPasswordRef.current = value)}
          />

          <Button 
            title="Registrati" 
            loading={loading} 
            onPress={onSubmit}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hai già un account? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Accedi</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(6),
  },
  header: {
    marginTop: hp(4),
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    marginTop: hp(0.5),
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: theme.radius.md,
    marginBottom: hp(3),
    gap: wp(2),
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.secondary,
  },
  infoText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    flex: 1,
  },
  form: {
    gap: hp(2),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(4),
  },
  footerText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  footerLink: {
    fontSize: hp(1.8),
    color: theme.colors.primary,
    fontWeight: theme.fonts.semiBold,
  },
});