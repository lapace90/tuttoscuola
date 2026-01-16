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
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
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
        <Text style={styles.lastUpdate}>Ultimo aggiornamento: Gennaio 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduzione</Text>
          <Text style={styles.paragraph}>
            La presente Privacy Policy descrive come TuttoScuola ("noi", "nostro" o "l'App") 
            raccoglie, utilizza e protegge i dati personali degli utenti in conformità con 
            il Regolamento Generale sulla Protezione dei Dati (GDPR - Regolamento UE 2016/679) 
            e la normativa italiana in materia di protezione dei dati personali.
          </Text>
          <Text style={styles.paragraph}>
            Il Titolare del trattamento dei dati è l'istituto scolastico che ha attivato 
            il servizio TuttoScuola per i propri utenti. Lo sviluppatore dell'applicazione 
            agisce in qualità di Responsabile del trattamento.
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
            <Text style={styles.bulletItem}>• Ruolo (studente, docente)</Text>
            <Text style={styles.bulletItem}>• Foto profilo (facoltativa)</Text>
          </View>
          <Text style={styles.subTitle}>Dati scolastici:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Voti e valutazioni</Text>
            <Text style={styles.bulletItem}>• Presenze e assenze</Text>
            <Text style={styles.bulletItem}>• Prenotazioni interrogazioni</Text>
            <Text style={styles.bulletItem}>• Compiti assegnati</Text>
          </View>
          <Text style={styles.subTitle}>Dati di utilizzo:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Messaggi inviati nelle chat</Text>
            <Text style={styles.bulletItem}>• File e immagini condivisi</Text>
            <Text style={styles.bulletItem}>• Token per notifiche push (se autorizzate)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Base giuridica del trattamento</Text>
          <Text style={styles.paragraph}>
            Il trattamento dei dati personali si basa su:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Esecuzione di un contratto: fornitura del servizio scolastico digitale</Text>
            <Text style={styles.bulletItem}>• Obbligo legale: tenuta del registro elettronico secondo la normativa scolastica</Text>
            <Text style={styles.bulletItem}>• Legittimo interesse: sicurezza e corretto funzionamento del servizio</Text>
            <Text style={styles.bulletItem}>• Consenso: per funzionalità opzionali come le notifiche push</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Finalità del trattamento</Text>
          <Text style={styles.paragraph}>
            I dati personali sono trattati esclusivamente per:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Gestione delle attività didattiche e scolastiche</Text>
            <Text style={styles.bulletItem}>• Comunicazione tra scuola, docenti e studenti</Text>
            <Text style={styles.bulletItem}>• Registrazione e consultazione di voti e presenze</Text>
            <Text style={styles.bulletItem}>• Gestione delle prenotazioni per interrogazioni</Text>
            <Text style={styles.bulletItem}>• Invio di comunicazioni scolastiche</Text>
            <Text style={styles.bulletItem}>• Gestione dei compiti e delle scadenze</Text>
            <Text style={styles.bulletItem}>• Sicurezza e prevenzione di abusi</Text>
          </View>
          <Text style={styles.paragraph}>
            I dati NON vengono utilizzati per profilazione, marketing o finalità commerciali.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Conservazione dei dati</Text>
          <Text style={styles.paragraph}>
            I dati personali sono conservati per il tempo strettamente necessario:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Dati account: fino alla disattivazione o termine del rapporto con l'istituto</Text>
            <Text style={styles.bulletItem}>• Dati scolastici (voti, presenze): secondo obblighi di legge (minimo 10 anni)</Text>
            <Text style={styles.bulletItem}>• Messaggi nelle chat: 2 anni dalla creazione</Text>
            <Text style={styles.bulletItem}>• Segnalazioni: 5 anni dalla risoluzione</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Condivisione dei dati</Text>
          <Text style={styles.paragraph}>
            I dati personali possono essere condivisi esclusivamente con:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Personale scolastico autorizzato (docenti, segreteria)</Text>
            <Text style={styles.bulletItem}>• Supabase Inc. (provider infrastruttura cloud - server UE)</Text>
            <Text style={styles.bulletItem}>• Autorità competenti, se richiesto dalla legge</Text>
          </View>
          <Text style={styles.paragraph}>
            I dati NON vengono venduti, ceduti a terzi per marketing, né trasferiti 
            fuori dall'Unione Europea.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Sicurezza dei dati</Text>
          <Text style={styles.paragraph}>
            Adottiamo misure tecniche e organizzative adeguate:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Crittografia dei dati in transito (HTTPS/TLS)</Text>
            <Text style={styles.bulletItem}>• Crittografia dei dati a riposo (AES-256)</Text>
            <Text style={styles.bulletItem}>• Autenticazione sicura con verifica email</Text>
            <Text style={styles.bulletItem}>• Controlli di accesso basati sui ruoli (RLS)</Text>
            <Text style={styles.bulletItem}>• Backup giornalieri automatici</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Diritti degli interessati</Text>
          <Text style={styles.paragraph}>
            In conformità al GDPR (artt. 15-22), hai diritto di:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Accesso: ottenere copia dei tuoi dati personali</Text>
            <Text style={styles.bulletItem}>• Rettifica: correggere dati inesatti o incompleti</Text>
            <Text style={styles.bulletItem}>• Cancellazione: richiedere la cancellazione (ove applicabile)</Text>
            <Text style={styles.bulletItem}>• Limitazione: limitare il trattamento in determinati casi</Text>
            <Text style={styles.bulletItem}>• Portabilità: ricevere i dati in formato strutturato</Text>
            <Text style={styles.bulletItem}>• Opposizione: opporti al trattamento</Text>
            <Text style={styles.bulletItem}>• Revoca consenso: ritirare il consenso in qualsiasi momento</Text>
          </View>
          <Text style={styles.paragraph}>
            Per esercitare i tuoi diritti, contatta la segreteria del tuo istituto scolastico.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Dati dei minori</Text>
          <Text style={styles.paragraph}>
            TuttoScuola è utilizzato anche da minori nell'ambito delle attività scolastiche. 
            Il trattamento dei dati dei minori di 14 anni avviene sotto la responsabilità 
            dell'istituto scolastico e con il consenso dei genitori o tutori legali, 
            in conformità all'art. 8 del GDPR e all'art. 2-quinquies del Codice Privacy italiano.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Cookie e tecnologie simili</Text>
          <Text style={styles.paragraph}>
            L'applicazione mobile non utilizza cookie. Vengono memorizzati localmente 
            sul dispositivo solo i dati necessari per l'autenticazione (token di sessione) 
            e le preferenze utente.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Modifiche alla Privacy Policy</Text>
          <Text style={styles.paragraph}>
            Ci riserviamo il diritto di aggiornare questa Privacy Policy. Le modifiche 
            significative saranno comunicate tramite notifica nell'applicazione. 
            Ti invitiamo a consultare periodicamente questa pagina.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Contatti e reclami</Text>
          <Text style={styles.paragraph}>
            Per domande sul trattamento dei dati personali, contatta il Responsabile 
            della Protezione dei Dati (DPO) del tuo istituto scolastico tramite la segreteria.
          </Text>
          <Text style={styles.paragraph}>
            Per segnalazioni tecniche relative all'app, usa la funzione "Segnala un problema" 
            nelle impostazioni.
          </Text>
          <Text style={styles.paragraph}>
            Hai diritto di proporre reclamo all'Autorità Garante per la Protezione dei 
            Dati Personali: www.garanteprivacy.it
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