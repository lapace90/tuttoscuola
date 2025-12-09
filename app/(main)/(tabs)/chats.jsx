import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp, getRelativeTime } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserChats } from '../../../services/chatService';
import { useClassChats } from '../../../hooks/useClassChats';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import Icon from '../../../assets/icons/Icon';

const Chats = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { classChats, refresh: refreshClassChats } = useClassChats();

  useEffect(() => {
    if (profile?.id) {
      loadChats();
    }
  }, [profile]);

  const loadChats = async () => {
    setLoading(true);
    const { data, error } = await getUserChats(profile.id);
    if (!error && data) {
      // Filter out class chats from regular chats (they'll be shown separately)
      setChats(data.filter(c => c.type !== 'class'));
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadChats(), refreshClassChats()]);
    setRefreshing(false);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getChatName = (chat) => {
    if (chat.type === 'class') {
      return chat.name || `Classe ${chat.class?.name || ''}`;
    }
    if (chat.type === 'group') {
      return chat.name || 'Gruppo';
    }
    if (chat.otherMember) {
      return `${chat.otherMember.first_name} ${chat.otherMember.last_name}`;
    }
    return 'Chat';
  };

  const renderChatItem = ({ item }) => {
    const chatName = getChatName(item);
    const isGroup = item.type === 'class' || item.type === 'group';

    return (
      <Pressable
        style={styles.chatItem}
        onPress={() => router.push(`/(main)/chat/${item.id}`)}
      >
        <View style={[styles.avatar, isGroup && styles.avatarGroup]}>
          {isGroup ? (
            <Icon name="users" size={24} color={theme.colors.secondary} />
          ) : (
            <Text style={styles.avatarText}>
              {getInitials(chatName)}
            </Text>
          )}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {chatName}
            </Text>
            {item.lastMessage && (
              <Text style={styles.chatTime}>
                {getRelativeTime(item.lastMessage.created_at)}
              </Text>
            )}
          </View>
          
          {item.lastMessage ? (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage.sender?.first_name}: {item.lastMessage.content}
            </Text>
          ) : (
            <Text style={styles.noMessage}>Nessun messaggio</Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenWrapper bg={theme.colors.background}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        <Pressable 
          style={styles.newChatButton}
          onPress={() => router.push('/(main)/chat/new')}
        >
          <Icon name="edit" size={22} color={theme.colors.primary} />
        </Pressable>
      </View>

      {/* Class Chats Section */}
      {classChats.length > 0 && (
        <View style={styles.classChatSection}>
          <Text style={styles.sectionTitle}>Chat di classe</Text>
          {classChats.map((chat) => (
            <Pressable
              key={chat.id}
              style={styles.classChatItem}
              onPress={() => router.push(`/(main)/chat/${chat.id}`)}
            >
              <View style={styles.classChatAvatar}>
                <Icon name="users" size={24} color={theme.colors.secondary} />
              </View>
              <View style={styles.classChatInfo}>
                <Text style={styles.classChatName}>{chat.name}</Text>
                <Text style={styles.classChatSubtitle}>Chat di gruppo</Text>
              </View>
              <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Direct Chats */}
      {(chats.length > 0 || classChats.length > 0) && (
        <Text style={[styles.sectionTitle, { paddingHorizontal: wp(5) }]}>
          Messaggi diretti
        </Text>
      )}

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="messageCircle" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>
              {loading ? 'Caricamento...' : 'Nessuna chat'}
            </Text>
            {!loading && (
              <Pressable 
                style={styles.startChatBtn}
                onPress={() => router.push('/(main)/chat/new')}
              >
                <Text style={styles.startChatText}>Inizia una conversazione</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </ScreenWrapper>
  );
};

export default Chats;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
  },
  title: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
    flexGrow: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    marginBottom: hp(1),
    ...theme.shadows.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  avatarGroup: {
    backgroundColor: theme.colors.secondaryLight + '30',
  },
  avatarText: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.3),
  },
  chatName: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    flex: 1,
    marginRight: wp(2),
  },
  chatTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  lastMessage: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  noMessage: {
    fontSize: hp(1.5),
    color: theme.colors.placeholder,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(15),
    gap: hp(2),
  },
  emptyText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  startChatBtn: {
    marginTop: hp(1),
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
  },
  startChatText: {
    color: 'white',
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
  },
  sectionTitle: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: hp(1),
  },
  classChatSection: {
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  classChatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondaryLight + '20',
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    marginBottom: hp(1),
    borderWidth: 1,
    borderColor: theme.colors.secondary + '30',
  },
  classChatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.secondary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  classChatInfo: {
    flex: 1,
  },
  classChatName: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  classChatSubtitle: {
    fontSize: hp(1.4),
    color: theme.colors.secondary,
    marginTop: 2,
  },
});