import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';

const Terms = () => {
  const router = useRouter();

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Termini di Servizio</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdate}>Ultimo aggiornamento: Gennaio 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Accettazione dei termini</Text>
          <Text style={styles.paragraph}>
            Utilizzando l'applicazione TuttoScuola ("App", "Servizio"), accetti di essere 
            vincolato dai presenti Termini di Servizio. Se non accetti questi termini, 
            non utilizzare l'applicazione.
          </Text>
          <Text style={styles.paragraph}>
            L'accesso all'App è riservato agli utenti autorizzati dall'istituto scolastico 
            che ha attivato il servizio, identificati tramite email con dominio scolastico.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Descrizione del servizio</Text>
          <Text style={styles.paragraph}>
            TuttoScuola è un'applicazione per la gestione delle attività scolastiche che consente:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Comunicazione tra studenti e docenti tramite chat</Text>
            <Text style={styles.bulletItem}>• Consultazione e registrazione di voti</Text>
            <Text style={styles.bulletItem}>• Gestione delle presenze</Text>
            <Text style={styles.bulletItem}>• Prenotazione di interrogazioni ed esami</Text>
            <Text style={styles.bulletItem}>• Visualizzazione di compiti e comunicazioni</Text>
            <Text style={styles.bulletItem}>• Ricezione di notifiche scolastiche</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Registrazione e account</Text>
          <Text style={styles.paragraph}>
            Per utilizzare l'App devi:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Possedere un indirizzo email del dominio scolastico autorizzato</Text>
            <Text style={styles.bulletItem}>• Fornire informazioni accurate e complete</Text>
            <Text style={styles.bulletItem}>• Mantenere riservate le credenziali di accesso</Text>
            <Text style={styles.bulletItem}>• Notificare immediatamente eventuali accessi non autorizzati</Text>
          </View>
          <Text style={styles.paragraph}>
            Sei responsabile di tutte le attività effettuate con il tuo account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Regole di condotta</Text>
          <Text style={styles.paragraph}>
            Nell'utilizzo dell'App ti impegni a:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Rispettare le norme di comportamento scolastico</Text>
            <Text style={styles.bulletItem}>• Non inviare contenuti offensivi, volgari o discriminatori</Text>
            <Text style={styles.bulletItem}>• Non praticare bullismo, molestie o intimidazioni</Text>
            <Text style={styles.bulletItem}>• Non diffondere informazioni false o fuorvianti</Text>
            <Text style={styles.bulletItem}>• Non condividere materiale protetto da copyright senza autorizzazione</Text>
            <Text style={styles.bulletItem}>• Non tentare di accedere ad account o dati altrui</Text>
            <Text style={styles.bulletItem}>• Non utilizzare l'App per scopi illegali</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Contenuti degli utenti</Text>
          <Text style={styles.paragraph}>
            Sei responsabile dei contenuti che pubblichi (messaggi, immagini, file). 
            Pubblicando contenuti nell'App:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Dichiari di avere il diritto di condividerli</Text>
            <Text style={styles.bulletItem}>• Accetti che siano visibili agli altri utenti autorizzati</Text>
            <Text style={styles.bulletItem}>• Accetti che possano essere moderati o rimossi se inappropriati</Text>
          </View>
          <Text style={styles.paragraph}>
            Ci riserviamo il diritto di rimuovere contenuti che violano questi termini 
            o le norme scolastiche, senza preavviso.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Sistema di segnalazione</Text>
          <Text style={styles.paragraph}>
            L'App dispone di un sistema di segnalazione per:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Problemi tecnici e bug</Text>
            <Text style={styles.bulletItem}>• Contenuti inappropriati</Text>
            <Text style={styles.bulletItem}>• Comportamenti scorretti</Text>
            <Text style={styles.bulletItem}>• Suggerimenti di miglioramento</Text>
          </View>
          <Text style={styles.paragraph}>
            Le segnalazioni false o effettuate in malafede possono comportare 
            conseguenze disciplinari.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Proprietà intellettuale</Text>
          <Text style={styles.paragraph}>
            L'App, inclusi design, codice, loghi e contenuti originali, è protetta da 
            diritti di proprietà intellettuale. Non è consentito:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Copiare, modificare o distribuire l'App</Text>
            <Text style={styles.bulletItem}>• Decompilare o fare reverse engineering</Text>
            <Text style={styles.bulletItem}>• Rimuovere avvisi di copyright</Text>
            <Text style={styles.bulletItem}>• Utilizzare il marchio TuttoScuola senza autorizzazione</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Limitazione di responsabilità</Text>
          <Text style={styles.paragraph}>
            L'App è fornita "così com'è". Nei limiti consentiti dalla legge:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Non garantiamo che il servizio sia sempre disponibile o privo di errori</Text>
            <Text style={styles.bulletItem}>• Non siamo responsabili per danni derivanti dall'uso dell'App</Text>
            <Text style={styles.bulletItem}>• Non siamo responsabili per contenuti pubblicati dagli utenti</Text>
            <Text style={styles.bulletItem}>• Non siamo responsabili per perdita di dati dovuta a cause esterne</Text>
          </View>
          <Text style={styles.paragraph}>
            Ci impegniamo a garantire la sicurezza e l'affidabilità del servizio con 
            la massima diligenza.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Sospensione e terminazione</Text>
          <Text style={styles.paragraph}>
            Possiamo sospendere o terminare l'accesso all'App in caso di:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Violazione dei presenti termini</Text>
            <Text style={styles.bulletItem}>• Comportamento inappropriato o illegale</Text>
            <Text style={styles.bulletItem}>• Richiesta dell'istituto scolastico</Text>
            <Text style={styles.bulletItem}>• Fine del rapporto con l'istituto (es. trasferimento, diploma)</Text>
          </View>
          <Text style={styles.paragraph}>
            L'istituto scolastico può richiedere la disattivazione di account specifici.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Modifiche al servizio</Text>
          <Text style={styles.paragraph}>
            Ci riserviamo il diritto di:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Modificare o aggiornare l'App in qualsiasi momento</Text>
            <Text style={styles.bulletItem}>• Aggiungere o rimuovere funzionalità</Text>
            <Text style={styles.bulletItem}>• Interrompere il servizio con ragionevole preavviso</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Modifiche ai termini</Text>
          <Text style={styles.paragraph}>
            Possiamo aggiornare questi Termini di Servizio. Le modifiche significative 
            saranno comunicate tramite notifica nell'App. L'uso continuato dell'App 
            dopo le modifiche costituisce accettazione dei nuovi termini.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Legge applicabile</Text>
          <Text style={styles.paragraph}>
            I presenti termini sono regolati dalla legge italiana. Per qualsiasi 
            controversia sarà competente il Foro del luogo di residenza dell'utente 
            se consumatore, altrimenti il Foro di Milano.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Contatti</Text>
          <Text style={styles.paragraph}>
            Per domande sui presenti termini, contatta la segreteria del tuo istituto 
            scolastico o utilizza la funzione "Segnala un problema" nell'App per 
            questioni tecniche.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} TuttoScuola. Tutti i diritti riservati.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Terms;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  headerTitle: {
    fontSize: hp(2),
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
  lastUpdate: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    marginBottom: hp(2),
    fontStyle: 'italic',
  },
  section: {
    marginBottom: hp(2.5),
  },
  sectionTitle: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    marginBottom: hp(1),
  },
  paragraph: {
    fontSize: hp(1.5),
    color: theme.colors.text,
    lineHeight: hp(2.3),
    marginBottom: hp(1),
  },
  bulletList: {
    marginTop: hp(0.5),
    gap: hp(0.5),
  },
  bulletItem: {
    fontSize: hp(1.5),
    color: theme.colors.text,
    lineHeight: hp(2.2),
    paddingLeft: wp(2),
  },
  footer: {
    marginTop: hp(2),
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
  },
});