// app/(main)/legal/licenses.jsx
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Icon from '../../../assets/icons/Icon';

const LICENSES = [
  {
    name: 'React Native',
    version: '0.81.x',
    license: 'MIT',
    url: 'https://github.com/facebook/react-native'
  },
  {
    name: 'Expo',
    version: '52.x',
    license: 'MIT',
    url: 'https://github.com/expo/expo'
  },
  {
    name: 'React',
    version: '19.x',
    license: 'MIT',
    url: 'https://github.com/facebook/react'
  },
  {
    name: 'Expo Router',
    version: '4.x',
    license: 'MIT',
    url: 'https://github.com/expo/router'
  },
  {
    name: '@supabase/supabase-js',
    version: '2.x',
    license: 'MIT',
    url: 'https://github.com/supabase/supabase-js'
  },
  {
    name: 'Expo Image',
    version: '2.x',
    license: 'MIT',
    url: 'https://github.com/expo/expo/tree/main/packages/expo-image'
  },
  {
    name: 'Expo Image Picker',
    version: '16.x',
    license: 'MIT',
    url: 'https://github.com/expo/expo/tree/main/packages/expo-image-picker'
  },
  {
    name: '@expo/vector-icons',
    version: '14.x',
    license: 'MIT',
    url: 'https://github.com/expo/vector-icons'
  },
  {
    name: '@react-native-async-storage/async-storage',
    version: '2.x',
    license: 'MIT',
    url: 'https://github.com/react-native-async-storage/async-storage'
  },
  {
    name: 'date-fns',
    version: '4.x',
    license: 'MIT',
    url: 'https://github.com/date-fns/date-fns'
  }
];

const Licenses = () => {
  const router = useRouter();

  const handleOpenUrl = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Licenze open source</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.introText}>
            TuttoScuola utilizza le seguenti librerie open source. 
            Siamo grati agli sviluppatori che hanno reso disponibili 
            questi progetti.
          </Text>
        </View>

        <View style={styles.licenseList}>
          {LICENSES.map((lib, index) => (
            <Pressable 
              key={index}
              style={styles.licenseItem}
              onPress={() => handleOpenUrl(lib.url)}
            >
              <View style={styles.licenseInfo}>
                <Text style={styles.licenseName}>{lib.name}</Text>
                <View style={styles.licenseMeta}>
                  <Text style={styles.licenseVersion}>v{lib.version}</Text>
                  <View style={styles.licenseBadge}>
                    <Text style={styles.licenseBadgeText}>{lib.license}</Text>
                  </View>
                </View>
              </View>
              <Icon name="arrowRight" size={16} color={theme.colors.textLight} />
            </Pressable>
          ))}
        </View>

        <View style={styles.mitLicense}>
          <Text style={styles.mitTitle}>Licenza MIT</Text>
          <Text style={styles.mitText}>
            La maggior parte delle librerie utilizzate sono distribuite 
            sotto licenza MIT, che permette l'uso, la copia, la modifica 
            e la distribuzione del software, a condizione che venga inclusa 
            la nota di copyright originale.
          </Text>
          <Text style={styles.mitText}>
            Per i termini completi della licenza MIT, visita:{'\n'}
            <Text 
              style={styles.link}
              onPress={() => handleOpenUrl('https://opensource.org/licenses/MIT')}
            >
              opensource.org/licenses/MIT
            </Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} TuttoScuola
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Licenses;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  headerTitle: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(6),
  },
  intro: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(2),
    marginBottom: hp(2),
    ...theme.shadows.sm,
  },
  introText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    lineHeight: hp(2.2),
  },
  licenseList: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  licenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  licenseInfo: {
    flex: 1,
  },
  licenseName: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  licenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginTop: hp(0.3),
  },
  licenseVersion: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
  },
  licenseBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: wp(2),
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  licenseBadgeText: {
    fontSize: hp(1.1),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.primary,
  },
  mitLicense: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(2),
    marginTop: hp(2),
    ...theme.shadows.sm,
  },
  mitTitle: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  mitText: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    lineHeight: hp(2.1),
    marginBottom: hp(1),
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: hp(3),
    alignItems: 'center',
  },
  footerText: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
  },
});