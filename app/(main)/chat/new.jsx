// app/(main)/chat/new.jsx
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme, roleColors } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getUsersByClass, getTeachers } from '../../../services/userService';
import { getOrCreatePrivateChat } from '../../../services/chatService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Icon from '../../../assets/icons/Icon';

const NewChat = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
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
    
    // Get classmates (for students)
    if (profile?.class_id) {
      const { data: classmates } = await getUsersByClass(profile.class_id);
      if (classmates) {
        allUsers = [...classmates.filter(u => u.id !== profile.id)];
      }
    }
    
    // Get teachers - derive institute from class or profile
    const instituteId = profile?.institute_id || profile?.class?.institute_id || profile?.institute?.id;
    if (instituteId) {
      const { data: teachers } = await getTeachers(instituteId);
      if (teachers) {
        // Add teachers that aren't already in the list
        teachers.forEach(t => {
          if (t.id !== profile.id && !allUsers.find(u => u.id === t.id)) {
            allUsers.push(t);
          }
        });
      }
    }
    
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

  const renderUserItem = ({ item }) => (
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

  // Group users by role
  const teachers = filteredUsers.filter(u => u.role === 'teacher');
  const students = filteredUsers.filter(u => u.role === 'student');

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
          data={[
            ...(teachers.length > 0 ? [{ type: 'header', title: 'Professori' }] : []),
            ...teachers.map(t => ({ type: 'user', ...t })),
            ...(students.length > 0 ? [{ type: 'header', title: 'Studenti' }] : []),
            ...students.map(s => ({ type: 'user', ...s })),
          ]}
          keyExtractor={(item, index) => item.type === 'header' ? `header-${index}` : item.id}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <Text style={styles.sectionHeader}>{item.title}</Text>
              );
            }
            return renderUserItem({ item });
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="users" size={48} color={theme.colors.textLight} />
              <Text style={styles.emptyText}>
                {search ? 'Nessun risultato' : 'Nessun utente disponibile'}
              </Text>
            </View>
          }
        />
      )}

      {creating && (
        <View style={styles.creatingOverlay}>
          <Text style={styles.creatingText}>Apertura chat...</Text>
        </View>
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
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    marginHorizontal: wp(5),
    marginBottom: hp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    borderRadius: theme.radius.xl,
    gap: wp(2),
  },
  searchInput: {
    flex: 1,
    fontSize: hp(1.6),
    color: theme.colors.text,
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
    flexGrow: 1,
  },
  sectionHeader: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: hp(1.5),
    borderRadius: theme.radius.lg,
    marginBottom: hp(1),
    ...theme.shadows.sm,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  userInitial: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  userRole: {
    fontSize: hp(1.4),
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(10),
    gap: hp(2),
  },
  emptyText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  creatingOverlay: {
    position: 'absolute',
    bottom: hp(10),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  creatingText: {
    backgroundColor: theme.colors.text,
    color: 'white',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: theme.radius.full,
    fontSize: hp(1.5),
    fontWeight: theme.fonts.medium,
  },
});