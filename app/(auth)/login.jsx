// app/login.jsx
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import ScreenWrapper from '../components/common/ScreenWrapper';
import BackButton from '../components/BackButton';
import Input from '../components/Input';
import Button from '../components/Button';
import Icon from '../components/Icon';

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
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Errore', error.message);
    }
    // Se login ok, il redirect avviene automaticamente via AuthContext
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bentornato! 👋</Text>
          <Text style={styles.subtitle}>Accedi con la tua email scolastica</Text>
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

          <Input
            icon={<Icon name="lock" size={22} color={theme.colors.textLight} />}
            placeholder="Password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />

          <Pressable onPress={() => router.push('/forgotPassword')}>
            <Text style={styles.forgotPassword}>Password dimenticata?</Text>
          </Pressable>

          <Button 
            title="Accedi" 
            loading={loading} 
            onPress={onSubmit} 
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Non hai un account? </Text>
          <Pressable onPress={() => router.push('/signUp')}>
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
    marginTop: hp(0.5),
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