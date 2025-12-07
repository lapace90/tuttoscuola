// app/(main)/(tabs)/chats.jsx
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp, getRelativeTime } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserChats } from '../../../services/chatService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import Icon from '../../../assets/icons/Icon';

const Chats = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      loadChats();
    }
  }, [profile]);

  const loadChats = async () => {
    setLoading(true);
    const { data, error } = await getUserChats(profile.id);
    if (!error && data) {
      setChats(data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getChatName = (chat) => {
    if (chat.type === 'class') {
      return `Classe ${chat.class?.name || ''}`;
    }
    if (chat.other_member) {
      return `${chat.other_member.first_name} ${chat.other_member.last_name}`;
    }
    return 'Chat';
  };

  const renderChatItem = ({ item }) => {
    const chatName = getChatName(item);
    const isClass = item.type === 'class';

    return (
      <Pressable
        style={styles.chatItem}
        onPress={() => router.push(`/(main)/chat/${item.id}`)}
      >
        <View style={[styles.avatar, isClass && styles.avatarClass]}>
          {isClass ? (
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
            {item.last_message && (
              <Text style={styles.chatTime}>
                {getRelativeTime(item.last_message.created_at)}
              </Text>
            )}
          </View>
          
          {item.last_message ? (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.last_message.content}
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
      </View>

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
  avatarClass: {
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
});