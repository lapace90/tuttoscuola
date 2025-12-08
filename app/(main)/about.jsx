// app/(main)/about.jsx
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Image } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import BackButton from '../../components/common/BackButton';
import Icon from '../../assets/icons/Icon';

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';
const BUILD_NUMBER = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';

const About = () => {
    const router = useRouter();

    const handleLink = (url) => {
        Linking.openURL(url).catch(() => {
            // Handle error silently
        });
    };

    const InfoRow = ({ icon, label, value, onPress }) => (
        <Pressable
            style={[styles.infoRow, onPress && styles.infoRowPressable]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.infoRowLeft}>
                <Icon name={icon} size={20} color={theme.colors.textLight} />
                <Text style={styles.infoLabel}>{label}</Text>
            </View>
            <Text style={[styles.infoValue, onPress && styles.infoValueLink]}>{value}</Text>
        </Pressable>
    );

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
                        <InfoRow icon="info" label="Versione app" value={APP_VERSION} />
                        <InfoRow icon="hash" label="Build" value={BUILD_NUMBER} />
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
                        <View style={styles.featureItem}>
                            <Icon name="checkCircle" size={20} color={theme.colors.primary} />
                            <Text style={styles.featureText}>Registro presenze</Text>
                        </View>
                    </View>
                </View>

                {/* Support */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Supporto</Text>
                    <View style={styles.card}>
                        <InfoRow
                            icon="mail"
                            label="Email supporto"
                            value="supporto@tuttoscuola.it"
                            onPress={() => handleLink('mailto:supporto@tuttoscuola.it')}
                        />
                        <InfoRow
                            icon="globe"
                            label="Sito web"
                            value="tuttoscuola.it"
                            onPress={() => handleLink('https://tuttoscuola.it')}
                        />
                    </View>
                </View>

                {/* Legal */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Legale</Text>
                    <View style={styles.card}>
                        <Pressable style={styles.legalItem}>
                            <Text style={styles.legalText}>Termini di servizio</Text>
                            <Icon name="chevronRight" size={18} color={theme.colors.textLight} />
                        </Pressable>
                        <Pressable style={styles.legalItem}>
                            <Text style={styles.legalText}>Privacy Policy</Text>
                            <Icon name="chevronRight" size={18} color={theme.colors.textLight} />
                        </Pressable>
                        <Pressable style={styles.legalItem}>
                            <Text style={styles.legalText}>Licenze open source</Text>
                            <Icon name="chevronRight" size={18} color={theme.colors.textLight} />
                        </Pressable>
                    </View>
                </View>

                {/* Credits */}
                <View style={styles.credits}>
                    <Text style={styles.creditsText}>
                    </Text>
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
        paddingBottom: hp(4),
    },
    logoSection: {
        alignItems: 'center',
        paddingVertical: hp(2),
    },
    logoContainer: {
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(1),
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 25,
    },
    appName: {
        fontSize: hp(3),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
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
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    infoRowPressable: {
        backgroundColor: 'transparent',
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
    infoValueLink: {
        color: theme.colors.primary,
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
    featureText: {
        fontSize: hp(1.5),
        color: theme.colors.text,
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
    legalText: {
        fontSize: hp(1.6),
        color: theme.colors.text,
    },
    credits: {
        alignItems: 'center',
        paddingVertical: hp(3),
    },
    creditsText: {
        fontSize: hp(1.5),
        color: theme.colors.textLight,
    },
    copyrightText: {
        fontSize: hp(1.3),
        color: theme.colors.textLight,
        marginTop: hp(0.5),
    },
});