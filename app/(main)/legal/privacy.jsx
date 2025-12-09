import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';

const Privacy = () => {
  const router = useRouter();

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdate}>Ultimo aggiornamento: Dicembre 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduzione</Text>
          <Text style={styles.paragraph}>
            La presente Privacy Policy descrive come TuttoScuola raccoglie, utilizza e 
            protegge i dati personali degli utenti in conformità con il Regolamento 
            Generale sulla Protezione dei Dati (GDPR - Regolamento UE 2016/679).
          </Text>
          <Text style={styles.paragraph}>
            Il Titolare del trattamento dei dati è l'istituto scolastico che ha attivato 
            il servizio TuttoScuola per i propri utenti.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Dati raccolti</Text>
          <Text style={styles.paragraph}>
            Raccogliamo le seguenti categorie di dati personali:
          </Text>
          <Text style={styles.subTitle}>Dati identificativi:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Nome e cognome</Text>
            <Text style={styles.bulletItem}>• Indirizzo email scolastico</Text>
            <Text style={styles.bulletItem}>• Classe di appartenenza (per gli studenti)</Text>
            <Text style={styles.bulletItem}>• Ruolo (studente, docente, personale)</Text>
          </View>
          <Text style={styles.subTitle}>Dati scolastici:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Voti e valutazioni</Text>
            <Text style={styles.bulletItem}>• Presenze e assenze</Text>
            <Text style={styles.bulletItem}>• Orario delle lezioni</Text>
            <Text style={styles.bulletItem}>• Compiti assegnati</Text>
          </View>
          <Text style={styles.subTitle}>Dati di utilizzo:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Messaggi inviati nelle chat</Text>
            <Text style={styles.bulletItem}>• Log di accesso all'applicazione</Text>
            <Text style={styles.bulletItem}>• Informazioni sul dispositivo</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Base giuridica del trattamento</Text>
          <Text style={styles.paragraph}>
            Il trattamento dei dati personali si basa su:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Esecuzione di un contratto (fornitura del servizio scolastico)</Text>
            <Text style={styles.bulletItem}>• Obbligo legale (tenuta del registro elettronico)</Text>
            <Text style={styles.bulletItem}>• Legittimo interesse (sicurezza e funzionamento del servizio)</Text>
            <Text style={styles.bulletItem}>• Consenso (per finalità specifiche, ove richiesto)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Finalità del trattamento</Text>
          <Text style={styles.paragraph}>
            I dati personali sono trattati per le seguenti finalità:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Gestione delle attività didattiche</Text>
            <Text style={styles.bulletItem}>• Comunicazione tra scuola, docenti e studenti</Text>
            <Text style={styles.bulletItem}>• Registrazione di voti e presenze</Text>
            <Text style={styles.bulletItem}>• Invio di comunicazioni scolastiche</Text>
            <Text style={styles.bulletItem}>• Gestione dei compiti e delle scadenze</Text>
            <Text style={styles.bulletItem}>• Sicurezza e prevenzione di abusi</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Conservazione dei dati</Text>
          <Text style={styles.paragraph}>
            I dati personali sono conservati per il tempo necessario al raggiungimento 
            delle finalità per cui sono stati raccolti e comunque non oltre:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Dati degli account: fino alla disattivazione dell'account o termine del rapporto con l'istituto</Text>
            <Text style={styles.bulletItem}>• Dati scolastici (voti, presenze): secondo gli obblighi di legge (minimo 10 anni)</Text>
            <Text style={styles.bulletItem}>• Messaggi nelle chat: 1 anno dalla creazione</Text>
            <Text style={styles.bulletItem}>• Log di accesso: 6 mesi</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Condivisione dei dati</Text>
          <Text style={styles.paragraph}>
            I dati personali possono essere condivisi con:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Personale scolastico autorizzato</Text>
            <Text style={styles.bulletItem}>• Fornitori di servizi tecnici (hosting, manutenzione)</Text>
            <Text style={styles.bulletItem}>• Autorità competenti, se richiesto dalla legge</Text>
          </View>
          <Text style={styles.paragraph}>
            I dati non vengono ceduti a terzi per finalità di marketing o venduti a soggetti esterni.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Sicurezza dei dati</Text>
          <Text style={styles.paragraph}>
            Adottiamo misure tecniche e organizzative appropriate per proteggere i dati 
            personali, tra cui:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Crittografia dei dati in transito e a riposo</Text>
            <Text style={styles.bulletItem}>• Autenticazione sicura degli utenti</Text>
            <Text style={styles.bulletItem}>• Controlli di accesso basati sui ruoli</Text>
            <Text style={styles.bulletItem}>• Backup regolari dei dati</Text>
            <Text style={styles.bulletItem}>• Monitoraggio della sicurezza</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Diritti degli interessati</Text>
          <Text style={styles.paragraph}>
            In conformità al GDPR, hai diritto di:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Accedere ai tuoi dati personali</Text>
            <Text style={styles.bulletItem}>• Rettificare dati inesatti</Text>
            <Text style={styles.bulletItem}>• Richiedere la cancellazione dei dati (ove applicabile)</Text>
            <Text style={styles.bulletItem}>• Limitare il trattamento</Text>
            <Text style={styles.bulletItem}>• Opporti al trattamento</Text>
            <Text style={styles.bulletItem}>• Richiedere la portabilità dei dati</Text>
            <Text style={styles.bulletItem}>• Revocare il consenso (ove il trattamento si basi sul consenso)</Text>
          </View>
          <Text style={styles.paragraph}>
            Per esercitare i tuoi diritti, contatta la segreteria del tuo istituto scolastico.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Dati dei minori</Text>
          <Text style={styles.paragraph}>
            TuttoScuola è utilizzato anche da minori nell'ambito delle attività scolastiche. 
            Il trattamento dei dati dei minori avviene sotto la responsabilità dell'istituto 
            scolastico e, ove necessario, con il consenso dei genitori o tutori legali.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Modifiche alla Privacy Policy</Text>
          <Text style={styles.paragraph}>
            Ci riserviamo il diritto di aggiornare questa Privacy Policy. Le modifiche 
            saranno comunicate tramite l'applicazione. Ti invitiamo a consultare 
            periodicamente questa pagina.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contatti</Text>
          <Text style={styles.paragraph}>
            Per domande relative al trattamento dei dati personali, contatta il 
            Responsabile della Protezione dei Dati (DPO) del tuo istituto scolastico 
            tramite la segreteria.
          </Text>
          <Text style={styles.paragraph}>
            Hai inoltre il diritto di proporre reclamo all'Autorità Garante per la 
            Protezione dei Dati Personali (www.garanteprivacy.it).
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

export default Privacy;

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
  subTitle: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginTop: hp(1),
    marginBottom: hp(0.5),
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