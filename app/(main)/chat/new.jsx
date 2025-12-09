// app/(main)/chat/new.jsx
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme, roleColors } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getUsersByClass, getTeachers, getTeacherClasses } from '../../../services/userService';
import { getOrCreatePrivateChat, getOrCreateClassChat } from '../../../services/chatService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Icon from '../../../assets/icons/Icon';

const NewChat = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const filtered = users.filter(u => 
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [search, users]);

  const loadUsers = async () => {
    setLoading(true);
    
    let allUsers = [];
    let allClasses = [];
    const instituteId = profile?.institute_id || profile?.class?.institute_id || profile?.institute?.id;
    
    if (profile?.role === 'teacher') {
      // Professore: carica le sue classi + studenti + altri prof
      const { data: teacherClasses } = await getTeacherClasses(profile.id);
      
      if (teacherClasses) {
        for (const tc of teacherClasses) {
          if (tc.class?.id) {
            // Aggiungi classe
            allClasses.push(tc.class);
            
            // Carica studenti della classe
            const { data: students } = await getUsersByClass(tc.class.id);
            if (students) {
              students.forEach(s => {
                if (s.id !== profile.id && !allUsers.find(u => u.id === s.id)) {
                  allUsers.push(s);
                }
              });
            }
          }
        }
      }
      
      // Aggiungi altri professori
      if (instituteId) {
        const { data: teachers } = await getTeachers(instituteId);
        if (teachers) {
          teachers.forEach(t => {
            if (t.id !== profile.id && !allUsers.find(u => u.id === t.id)) {
              allUsers.push(t);
            }
          });
        }
      }
    } else {
      // Studente: la sua classe + compagni + professori
      if (profile?.class_id) {
        allClasses.push({ 
          id: profile.class_id, 
          name: profile.class?.name || 'La mia classe' 
        });
        
        const { data: classmates } = await getUsersByClass(profile.class_id);
        if (classmates) {
          allUsers = [...classmates.filter(u => u.id !== profile.id)];
        }
      }
      
      if (instituteId) {
        const { data: teachers } = await getTeachers(instituteId);
        if (teachers) {
          teachers.forEach(t => {
            if (t.id !== profile.id && !allUsers.find(u => u.id === t.id)) {
              allUsers.push(t);
            }
          });
        }
      }
    }
    
    setClasses(allClasses);
    setUsers(allUsers);
    setFilteredUsers(allUsers);
    setLoading(false);
  };

  const handleSelectUser = async (user) => {
    if (creating) return;
    
    setCreating(true);
    const { data, error } = await getOrCreatePrivateChat(profile.id, user.id);
    setCreating(false);
    
    if (error) {
      Alert.alert('Errore', error.message);
    } else if (data) {
      router.replace(`/(main)/chat/${data.id}`);
    }
  };

  const handleSelectClass = async (classItem) => {
    if (creating) return;
    
    setCreating(true);
    const { data, error } = await getOrCreateClassChat(classItem.id, classItem.name, profile.id);
    setCreating(false);
    
    if (error) {
      Alert.alert('Errore', error.message);
    } else if (data) {
      router.replace(`/(main)/chat/${data.id}`);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'teacher': return 'Professore';
      case 'admin': return 'Admin';
      default: return 'Studente';
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <Text style={styles.sectionHeader}>{item.title}</Text>
      );
    }
    
    if (item.type === 'class') {
      return (
        <Pressable
          style={styles.userItem}
          onPress={() => handleSelectClass(item)}
          disabled={creating}
        >
          <View style={[styles.userAvatar, { backgroundColor: theme.colors.secondary + '30' }]}>
            <Icon name="users" size={22} color={theme.colors.secondary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Classe {item.name}</Text>
            <Text style={styles.userRole}>Chat di gruppo</Text>
          </View>
          <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
        </Pressable>
      );
    }
    
    // User item
    return (
      <Pressable
        style={styles.userItem}
        onPress={() => handleSelectUser(item)}
        disabled={creating}
      >
        <View style={[
          styles.userAvatar,
          { backgroundColor: (roleColors[item.role] || theme.colors.primary) + '30' }
        ]}>
          <Text style={[
            styles.userInitial,
            { color: roleColors[item.role] || theme.colors.primary }
          ]}>
            {getInitials(item.first_name, item.last_name)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.first_name} {item.last_name}
          </Text>
          <Text style={[styles.userRole, { color: roleColors[item.role] || theme.colors.textLight }]}>
            {getRoleLabel(item.role)}
          </Text>
        </View>
        <Icon name="messageCircle" size={20} color={theme.colors.textLight} />
      </Pressable>
    );
  };

  // Group users by role
  const teachers = filteredUsers.filter(u => u.role === 'teacher');
  const students = filteredUsers.filter(u => u.role === 'student');

  // Build list data
  const listData = [
    // Classi (solo se non c'è ricerca attiva)
    ...(classes.length > 0 && !search.trim() ? [
      { type: 'header', title: 'Chat di classe' },
      ...classes.map(c => ({ type: 'class', ...c }))
    ] : []),
    // Professori
    ...(teachers.length > 0 ? [
      { type: 'header', title: 'Professori' },
      ...teachers.map(t => ({ type: 'user', ...t }))
    ] : []),
    // Studenti
    ...(students.length > 0 ? [
      { type: 'header', title: 'Studenti' },
      ...students.map(s => ({ type: 'user', ...s }))
    ] : []),
  ];

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Nuova Chat</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={theme.colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cerca persona..."
          placeholderTextColor={theme.colors.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Icon name="x" size={20} color={theme.colors.textLight} />
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, index) => 
            item.type === 'header' ? `header-${index}` : 
            item.type === 'class' ? `class-${item.id}` : 
            `user-${item.id}`
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nessun risultato</Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
};

export default NewChat;

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
    fontWeight: '600',
    color: theme.colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray + '20',
    marginHorizontal: wp(4),
    marginBottom: hp(2),
    paddingHorizontal: wp(3),
    borderRadius: theme.radius.lg,
    height: hp(5.5),
  },
  searchInput: {
    flex: 1,
    marginLeft: wp(2),
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
  listContent: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
  },
  sectionHeader: {
    fontSize: hp(1.5),
    fontWeight: '600',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  userAvatar: {
    width: hp(5.5),
    height: hp(5.5),
    borderRadius: hp(2.75),
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    fontSize: hp(2),
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
    marginLeft: wp(3),
  },
  userName: {
    fontSize: hp(1.9),
    fontWeight: '500',
    color: theme.colors.text,
  },
  userRole: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  emptyContainer: {
    paddingTop: hp(10),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
});