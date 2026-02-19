// app/(auth)/login.jsx
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import BackButton from '../../components/common/BackButton';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import GoogleSignInButton from '../../components/common/GoogleSignInButton';
import Icon from '../../assets/icons/Icon';

const Login = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const emailRef = useRef('');
  const passwordRef = useRef('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Accesso', 'Compila tutti i campi');
      return;
    }

    const email = emailRef.current.trim();
    const password = passwordRef.current.trim();

    setLoading(true);
    const { data, error, profile: userProfile } = await signIn(email, password);
    setLoading(false);

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        Alert.alert(
          'Email non confermata',
          'Controlla la tua casella di posta e clicca sul link di conferma.',
        );
      } else {
        Alert.alert('Errore', error.message);
      }
    } else if (data?.session) {
      if (!userProfile?.onboarding_completed) {
        router.replace('/onboarding');
      } else {
        router.replace('/(main)/(tabs)/calendar');
      }
    } else {
      Alert.alert(
        'Email non confermata',
        'Controlla la tua casella di posta e clicca sul link di conferma.',
      );
    }
  };

  const handleGoogleSuccess = () => {
    // Auth state change will handle navigation
  };

  const handleGoogleError = (message) => {
    Alert.alert('Errore', message);
  };

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />

        <View style={styles.header}>
          <Text style={styles.title}>Bentornato! 👋</Text>
          <Text style={styles.subtitle}>Accedi con la tua email scolastica</Text>
        </View>

        {/* Google Sign In */}
        <GoogleSignInButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>oppure</Text>
          <View style={styles.dividerLine} />
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
            textContentType="oneTimeCode"
            onChangeText={(value) => (passwordRef.current = value)}
          />

          <Pressable onPress={() => router.push('/(auth)/forgotPassword')}>
            <Text style={styles.forgotPassword}>Password dimenticata?</Text>
          </Pressable>

          <Button
            title="Accedi"
            loading={loading}
            onPress={onSubmit}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Non hai un account? </Text>
          <Pressable onPress={() => router.push('/(auth)/signUp')}>
            <Text style={styles.footerLink}>Registrati</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(6),
  },
  header: {
    marginTop: hp(4),
    marginBottom: hp(3),
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(2.5),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: wp(3),
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  form: {
    gap: hp(2),
  },
  forgotPassword: {
    fontSize: hp(1.7),
    color: theme.colors.primary,
    fontWeight: theme.fonts.semiBold,
    textAlign: 'right',
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