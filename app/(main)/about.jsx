// app/(main)/about.jsx
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import BackButton from '../../components/common/BackButton';
import Icon from '../../assets/icons/Icon';

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

const About = () => {
  const router = useRouter();

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Informazioni</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Name */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appTagline}>La scuola a portata di mano</Text>
        </View>

        {/* Version Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Versione</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <View style={styles.infoRowLeft}>
                <Icon name="info" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoLabel}>Versione app</Text>
              </View>
              <Text style={styles.infoValue}>{APP_VERSION}</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Funzionalità</Text>
          <View style={styles.card}>
            <View style={styles.featureItem}>
              <Icon name="calendar" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Calendario lezioni e orario settimanale</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="fileText" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Registro voti e valutazioni</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="messageCircle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Chat di classe e messaggi diretti</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="bell" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Comunicazioni e circolari</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="book" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Gestione compiti e scadenze</Text>
            </View>
            <View style={[styles.featureItem, styles.featureItemLast]}>
              <Icon name="checkCircle" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Registro presenze</Text>
            </View>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assistenza</Text>
          <View style={styles.card}>
            <Pressable 
              style={styles.supportItem}
              onPress={() => router.push('/(main)/support/report')}
            >
              <View style={styles.supportItemLeft}>
                <Icon name="alertCircle" size={20} color={theme.colors.warning} />
                <View style={styles.supportItemContent}>
                  <Text style={styles.supportItemTitle}>Segnala un problema</Text>
                  <Text style={styles.supportItemDesc}>Problemi tecnici o malfunzionamenti</Text>
                </View>
              </View>
              <Icon name="chevronRight" size={18} color={theme.colors.textLight} />
            </Pressable>
            <View style={styles.supportNote}>
              <Icon name="info" size={16} color={theme.colors.textLight} />
              <Text style={styles.supportNoteText}>
                Per assistenza contatta la segreteria del tuo istituto
              </Text>
            </View>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legale</Text>
          <View style={styles.card}>
            <Pressable 
              style={styles.legalItem}
              onPress={() => router.push('/(main)/legal/terms')}
            >
              <Text style={styles.legalText}>Termini di servizio</Text>
              <Icon name="chevronRight" size={18} color={theme.colors.textLight} />
            </Pressable>
            <Pressable 
              style={[styles.legalItem, styles.legalItemLast]}
              onPress={() => router.push('/(main)/legal/privacy')}
            >
              <Text style={styles.legalText}>Privacy Policy</Text>
              <Icon name="chevronRight" size={18} color={theme.colors.textLight} />
            </Pressable>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()} TuttoScuola
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default About;

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
  logoSection: {
    alignItems: 'center',
    paddingVertical: hp(3),
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 25,
  },
  appTagline: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginTop: hp(0.5),
  },
  section: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: hp(1),
    marginLeft: wp(1),
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  infoLabel: {
    fontSize: hp(1.6),
    color: theme.colors.text,
  },
  infoValue: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    paddingVertical: hp(1.3),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  featureItemLast: {
    borderBottomWidth: 0,
  },
  featureText: {
    fontSize: hp(1.5),
    color: theme.colors.text,
    flex: 1,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  supportItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    flex: 1,
  },
  supportItemContent: {
    flex: 1,
  },
  supportItemTitle: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  supportItemDesc: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    marginTop: 2,
  },
  supportNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    backgroundColor: theme.colors.background,
  },
  supportNoteText: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    flex: 1,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  legalItemLast: {
    borderBottomWidth: 0,
  },
  legalText: {
    fontSize: hp(1.6),
    color: theme.colors.text,
  },
  credits: {
    alignItems: 'center',
    paddingVertical: hp(2),
    paddingBottom: hp(4),
  },
  copyrightText: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    marginTop: hp(0.5),
  },
});