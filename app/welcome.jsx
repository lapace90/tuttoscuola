import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import ScreenWrapper from '../components/common/ScreenWrapper';
import Button from '../components/common/Button';

const Welcome = () => {
  const router = useRouter();

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Logo e titolo */}
        <View style={styles.header}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>TuttoScuola</Text>
          <Text style={styles.subtitle}>
            Organizza interrogazioni, compiti e resta connesso con la tua classe
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureText}>Prenota interrogazioni</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureText}>Chat con la classe</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📚</Text>
            <Text style={styles.featureText}>Calendario compiti</Text>
          </View>
        </View>

        {/* Footer con bottoni */}
        <View style={styles.footer}>
          <Button
            title="Inizia"
            onPress={() => router.push('/(auth)/signUp')}
            buttonStyle={styles.startButton}
          />
          
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Hai già un account? </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Accedi</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(6),
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: hp(8),
  },
  logo: {
    width: wp(40),
    height: wp(40),
  },
  title: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginTop: hp(2),
  },
  subtitle: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: hp(1),
    paddingHorizontal: wp(4),
    lineHeight: hp(2.6),
  },
  features: {
    gap: hp(2),
    paddingHorizontal: wp(4),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingVertical: hp(2),
    paddingHorizontal: wp(5),
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
  },
  featureIcon: {
    fontSize: hp(3),
    marginRight: wp(4),
  },
  featureText: {
    fontSize: hp(1.9),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  footer: {
    marginBottom: hp(6),
    gap: hp(2),
  },
  startButton: {
    backgroundColor: theme.colors.primary,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  loginLink: {
    fontSize: hp(1.8),
    color: theme.colors.primary,
    fontWeight: theme.fonts.semiBold,
  },
});