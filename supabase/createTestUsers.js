/**
 * TuttoScuola - Script per creare utenti di test
 * 
 * Questo script crea automaticamente tutti gli utenti auth in Supabase
 * e poi inserisce i dati nelle tabelle.
 * 
 * SETUP:
 * 1. npm install @supabase/supabase-js
 * 2. Copia le credenziali dal tuo progetto Supabase
 * 3. Esegui: node createTestUsers.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; 

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const PASSWORD = 'Test1234!';
const INSTITUTE_ID = 'inst_001';

// Configurazione utenti
const teachers = [
  {
    email: 'mario.rossi@cattaneodigitale.it',
    first_name: 'Mario',
    last_name: 'Rossi',
    subjects: ['Matematica', 'Fisica'],
    classes: ['1A', '1B', '2A']
  },
  {
    email: 'giulia.bianchi@cattaneodigitale.it',
    first_name: 'Giulia',
    last_name: 'Bianchi',
    subjects: ['Italiano', 'Storia'],
    classes: ['1A', '2A', '3A']
  },
  {
    email: 'luca.verdi@cattaneodigitale.it',
    first_name: 'Luca',
    last_name: 'Verdi',
    subjects: ['Informatica'],
    classes: ['1A', '1B', '2A', '3A']
  },
  {
    email: 'anna.neri@cattaneodigitale.it',
    first_name: 'Anna',
    last_name: 'Neri',
    subjects: ['Inglese'],
    classes: ['1A', '1B', '2A', '3A']
  },
];

const students = [
  // Classe 1A
  { email: 'marco.ferrari@cattaneodigitale.it', first_name: 'Marco', last_name: 'Ferrari', class: '1A' },
  { email: 'sara.romano@cattaneodigitale.it', first_name: 'Sara', last_name: 'Romano', class: '1A' },
  { email: 'andrea.colombo@cattaneodigitale.it', first_name: 'Andrea', last_name: 'Colombo', class: '1A' },
  { email: 'giulia.ricci@cattaneodigitale.it', first_name: 'Giulia', last_name: 'Ricci', class: '1A' },
  { email: 'luca.moretti@cattaneodigitale.it', first_name: 'Luca', last_name: 'Moretti', class: '1A' },
  { email: 'chiara.barbieri@cattaneodigitale.it', first_name: 'Chiara', last_name: 'Barbieri', class: '1A' },
  
  // Classe 1B
  { email: 'matteo.galli@cattaneodigitale.it', first_name: 'Matteo', last_name: 'Galli', class: '1B' },
  { email: 'francesca.martini@cattaneodigitale.it', first_name: 'Francesca', last_name: 'Martini', class: '1B' },
  { email: 'davide.fontana@cattaneodigitale.it', first_name: 'Davide', last_name: 'Fontana', class: '1B' },
  { email: 'elena.santoro@cattaneodigitale.it', first_name: 'Elena', last_name: 'Santoro', class: '1B' },
  { email: 'alessandro.marini@cattaneodigitale.it', first_name: 'Alessandro', last_name: 'Marini', class: '1B' },
  
  // Classe 2A
  { email: 'lorenzo.bruno@cattaneodigitale.it', first_name: 'Lorenzo', last_name: 'Bruno', class: '2A' },
  { email: 'sofia.greco@cattaneodigitale.it', first_name: 'Sofia', last_name: 'Greco', class: '2A' },
  { email: 'federico.leone@cattaneodigitale.it', first_name: 'Federico', last_name: 'Leone', class: '2A' },
  { email: 'valentina.conti@cattaneodigitale.it', first_name: 'Valentina', last_name: 'Conti', class: '2A' },
  
  // Classe 3A
  { email: 'gabriele.costa@cattaneodigitale.it', first_name: 'Gabriele', last_name: 'Costa', class: '3A' },
  { email: 'alice.lombardi@cattaneodigitale.it', first_name: 'Alice', last_name: 'Lombardi', class: '3A' },
  { email: 'nicolo.rizzo@cattaneodigitale.it', first_name: 'Nicolò', last_name: 'Rizzo', class: '3A' },
];

const subjects = [
  'Italiano', 'Matematica', 'Storia', 'Inglese', 'Informatica',
  'Fisica', 'Chimica', 'Scienze', 'Disegno Tecnico', 
  'Economia', 'Diritto', 'Educazione Fisica', 'Religione'
];

const classes = [
  { name: '1A', year: 1 },
  { name: '1B', year: 1 },
  { name: '1C', year: 1 },
  { name: '2A', year: 2 },
  { name: '2B', year: 2 },
  { name: '3A', year: 3 },
  { name: '3B', year: 3 },
  { name: '4A', year: 4 },
  { name: '5A', year: 5 },
];

// Cache per gli ID
const classIdMap = {};
const subjectIdMap = {};
const userIdMap = {};

async function createAuthUser(email, firstName, lastName) {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName }
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        // Recupera l'utente esistente
        const { data: users } = await supabase.auth.admin.listUsers();
        const existing = users.users.find(u => u.email === email);
        if (existing) {
          console.log(`⚠️  ${email} - già esistente (${existing.id})`);
          return existing.id;
        }
      }
      throw error;
    }

    console.log(`✅ ${email} - creato (${data.user.id})`);
    return data.user.id;
  } catch (error) {
    console.error(`❌ ${email} - errore:`, error.message);
    return null;
  }
}

async function setupInstitute() {
  console.log('\n📍 Creazione istituto...');
  
  const { error } = await supabase
    .from('institutes')
    .upsert({
      id: INSTITUTE_ID,
      name: 'Istituto Tecnico Cattaneo',
      code: 'MITF01000P',
      address: 'Via Catania 35',
      city: 'Milano',
      province: 'MI'
    });

  if (error) console.error('Errore istituto:', error.message);
  else console.log('✅ Istituto creato');
}

async function setupSubjects() {
  console.log('\n📚 Creazione materie...');
  
  for (const name of subjects) {
    const { data, error } = await supabase
      .from('subjects')
      .upsert({ name }, { onConflict: 'name' })
      .select('id, name')
      .single();

    if (error) {
      // Prova a recuperare l'esistente
      const { data: existing } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', name)
        .single();
      if (existing) subjectIdMap[name] = existing.id;
    } else {
      subjectIdMap[name] = data.id;
    }
  }
  console.log(`✅ ${Object.keys(subjectIdMap).length} materie pronte`);
}

async function setupClasses() {
  console.log('\n🏫 Creazione classi...');
  
  for (const cls of classes) {
    const { data, error } = await supabase
      .from('classes')
      .upsert({ 
        name: cls.name, 
        year: cls.year, 
        institute_id: INSTITUTE_ID 
      }, { onConflict: 'name,institute_id' })
      .select('id, name')
      .single();

    if (error) {
      const { data: existing } = await supabase
        .from('classes')
        .select('id')
        .eq('name', cls.name)
        .eq('institute_id', INSTITUTE_ID)
        .single();
      if (existing) classIdMap[cls.name] = existing.id;
    } else {
      classIdMap[cls.name] = data.id;
    }
  }
  console.log(`✅ ${Object.keys(classIdMap).length} classi pronte`);
}

async function setupTeachers() {
  console.log('\n👨‍🏫 Creazione professori...');
  
  for (const teacher of teachers) {
    const userId = await createAuthUser(teacher.email, teacher.first_name, teacher.last_name);
    if (!userId) continue;
    
    userIdMap[teacher.email] = userId;
    
    // Aggiorna/crea profilo
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: teacher.email,
        first_name: teacher.first_name,
        last_name: teacher.last_name,
        role: 'teacher',
        institute_id: INSTITUTE_ID,
        onboarding_completed: true
      });

    if (error) console.error(`  Profilo ${teacher.email}:`, error.message);

    // Assegna materie
    for (const subjectName of teacher.subjects) {
      const subjectId = subjectIdMap[subjectName];
      if (subjectId) {
        await supabase
          .from('teacher_subjects')
          .upsert({ teacher_id: userId, subject_id: subjectId });
      }
    }

    // Assegna classi
    for (const className of teacher.classes) {
      const classId = classIdMap[className];
      if (classId) {
        await supabase
          .from('teacher_classes')
          .upsert({ teacher_id: userId, class_id: classId });
      }
    }
  }
}

async function setupStudents() {
  console.log('\n👨‍🎓 Creazione studenti...');
  
  for (const student of students) {
    const userId = await createAuthUser(student.email, student.first_name, student.last_name);
    if (!userId) continue;
    
    userIdMap[student.email] = userId;
    const classId = classIdMap[student.class];
    
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: student.email,
        first_name: student.first_name,
        last_name: student.last_name,
        role: 'student',
        class_id: classId,
        institute_id: INSTITUTE_ID,
        onboarding_completed: true
      });

    if (error) console.error(`  Profilo ${student.email}:`, error.message);
  }
}

async function setupSampleData() {
  console.log('\n📝 Creazione dati di esempio...');
  
  // Trova alcuni ID per i dati di esempio
  const profRossi = userIdMap['mario.rossi@cattaneodigitale.it'];
  const profBianchi = userIdMap['giulia.bianchi@cattaneodigitale.it'];
  const profVerdi = userIdMap['luca.verdi@cattaneodigitale.it'];
  const marco = userIdMap['marco.ferrari@cattaneodigitale.it'];
  const sara = userIdMap['sara.romano@cattaneodigitale.it'];
  const andrea = userIdMap['andrea.colombo@cattaneodigitale.it'];
  const class1a = classIdMap['1A'];
  
  if (!profRossi || !marco || !class1a) {
    console.log('⚠️  Dati di esempio saltati (mancano utenti)');
    return;
  }

  // Voti
  const grades = [
    { student_id: marco, teacher_id: profRossi, class_id: class1a, subject: 'Matematica', value: 7.5, type: 'scritto', description: 'Verifica equazioni', date: '2025-01-15' },
    { student_id: marco, teacher_id: profRossi, class_id: class1a, subject: 'Matematica', value: 8.0, type: 'orale', description: 'Interrogazione algebra', date: '2025-01-20' },
    { student_id: marco, teacher_id: profBianchi, class_id: class1a, subject: 'Italiano', value: 6.5, type: 'scritto', description: 'Tema argomentativo', date: '2025-01-18' },
    { student_id: sara, teacher_id: profRossi, class_id: class1a, subject: 'Matematica', value: 9.0, type: 'scritto', description: 'Verifica equazioni', date: '2025-01-15' },
    { student_id: sara, teacher_id: profBianchi, class_id: class1a, subject: 'Italiano', value: 8.5, type: 'orale', description: 'Analisi del testo', date: '2025-01-22' },
    { student_id: andrea, teacher_id: profRossi, class_id: class1a, subject: 'Matematica', value: 5.5, type: 'scritto', description: 'Verifica equazioni', date: '2025-01-15' },
    { student_id: andrea, teacher_id: profVerdi, class_id: class1a, subject: 'Informatica', value: 8.0, type: 'pratico', description: 'Progetto HTML', date: '2025-01-25' },
  ];

  for (const grade of grades) {
    await supabase.from('grades').upsert(grade);
  }
  console.log(`✅ ${grades.length} voti inseriti`);

  // Compiti
  const homework = [
    { class_id: class1a, teacher_id: profRossi, subject: 'Matematica', title: 'Esercizi equazioni', description: 'Pag. 145 es. 1-10', due_date: '2025-01-30' },
    { class_id: class1a, teacher_id: profBianchi, subject: 'Italiano', title: 'Lettura capitolo 5', description: 'I Promessi Sposi cap. 5, riassunto', due_date: '2025-01-28' },
    { class_id: class1a, teacher_id: profVerdi, subject: 'Informatica', title: 'Progetto CSS', description: 'Completare la pagina web con stili CSS', due_date: '2025-02-05' },
  ];

  for (const hw of homework) {
    await supabase.from('homework').upsert(hw);
  }
  console.log(`✅ ${homework.length} compiti inseriti`);

  // Comunicazioni
  const announcements = [
    { institute_id: INSTITUTE_ID, author_id: profRossi, title: 'Olimpiadi di Matematica', content: 'Le iscrizioni alle Olimpiadi di Matematica sono aperte. Scadenza 15 febbraio.', target_audience: 'students', priority: 'normal' },
    { institute_id: INSTITUTE_ID, author_id: profBianchi, title: 'Assemblea di Istituto', content: 'Giovedì 6 febbraio si terrà l\'assemblea di istituto. Lezioni sospese dalle 10:00.', target_audience: 'all', priority: 'high' },
  ];

  for (const ann of announcements) {
    await supabase.from('announcements').upsert(ann);
  }
  console.log(`✅ ${announcements.length} comunicazioni inserite`);
}

async function main() {
  console.log('═'.repeat(50));
  console.log('🚀 TuttoScuola - Setup Dati di Test');
  console.log('═'.repeat(50));
  console.log(`\n🔑 Password per tutti: ${PASSWORD}\n`);
  
  await setupInstitute();
  await setupSubjects();
  await setupClasses();
  await setupTeachers();
  await setupStudents();
  await setupSampleData();

  console.log('\n' + '═'.repeat(50));
  console.log('✅ Setup completato!');
  console.log('═'.repeat(50));
  console.log('\n📝 Prossimi passi:');
  console.log('   1. Apri l\'app TuttoScuola');
  console.log('   2. Login con una delle credenziali in CREDENZIALI.md');
  console.log('   3. Testa le funzionalità!\n');
}

main().catch(console.error);