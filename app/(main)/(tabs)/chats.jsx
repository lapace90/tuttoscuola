import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp, getRelativeTime } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserChats } from '../../../services/chatService';
import { useClassChats } from '../../../hooks/useClassChats';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import Icon from '../../../assets/icons/Icon';
import { useUnreadMessagesContext } from '../../../contexts/UnreadMessagesContext';

const TABS = [
  { key: 'direct', label: 'Singole' },
  { key: 'group', label: 'Di gruppo' },
];

const Chats = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('direct');
  const [showArchived, setShowArchived] = useState(false);

  const { classChats, archivedClassChats, refresh: refreshClassChats } = useClassChats();
  const { getUnreadCount } = useUnreadMessagesContext();

  useEffect(() => {
    if (profile?.id) {
      loadChats();
    }
  }, [profile]);

  const loadChats = async () => {
    setLoading(true);
    const { data, error } = await getUserChats(profile.id);
    if (!error && data) {
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

  const renderDirectChatItem = useCallback(({ item }) => {
    const chatName = getChatName(item);

    return (
      <Pressable
        style={styles.chatItem}
        onPress={() => router.push(`/(main)/chat/${item.id}`)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(chatName)}
          </Text>
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
        {getUnreadCount(item.id) > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{getUnreadCount(item.id)}</Text>
          </View>
        )}
      </Pressable>
    );
  }, [router, getUnreadCount]);

  const renderGroupContent = () => (
    <View style={styles.groupContent}>
      {/* Active class chats */}
      {classChats.length > 0 && (
        <View style={styles.groupSection}>
          <Text style={styles.sectionTitle}>Chat attive</Text>
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
                <Text style={styles.classChatSubtitle}>Chat di classe</Text>
              </View>
              {getUnreadCount(chat.id) > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{getUnreadCount(chat.id)}</Text>
                </View>
              )}
              <Icon name="chevronRight" size={20} color={theme.colors.textLight} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Archived class chats */}
      {archivedClassChats.length > 0 && (
        <View style={styles.groupSection}>
          <Pressable
            style={styles.archivedToggle}
            onPress={() => setShowArchived(!showArchived)}
          >
            <Icon name="clock" size={18} color={theme.colors.textLight} />
            <Text style={styles.archivedToggleText}>
              Archiviate ({archivedClassChats.length})
            </Text>
            <Icon
              name={showArchived ? 'chevronUp' : 'chevronDown'}
              size={18}
              color={theme.colors.textLight}
            />
          </Pressable>
          {showArchived && archivedClassChats.map((chat) => (
            <Pressable
              key={chat.id}
              style={styles.archivedChatItem}
              onPress={() => router.push(`/(main)/chat/${chat.id}`)}
            >
              <View style={styles.archivedChatAvatar}>
                <Icon name="users" size={20} color={theme.colors.textLight} />
              </View>
              <View style={styles.classChatInfo}>
                <Text style={styles.archivedChatName}>{chat.name}</Text>
                <Text style={styles.archivedChatYear}>{chat.school_year}</Text>
              </View>
              <Icon name="chevronRight" size={18} color={theme.colors.textLight} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Empty state */}
      {classChats.length === 0 && archivedClassChats.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Icon name="users" size={48} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>Nessuna chat di gruppo</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        <Pressable
          style={styles.newChatButton}
          onPress={() => router.push('/(main)/chat/new')}
        >
          <Icon name="edit" size={22} color={theme.colors.primary} />
        </Pressable>
      </View>

      {/* Tab selector */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === 'direct' ? (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderDirectChatItem}
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
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={renderGroupContent}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: wp(5),
    marginBottom: hp(2),
    backgroundColor: theme.colors.border + '40',
    borderRadius: theme.radius.lg,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: hp(1),
    alignItems: 'center',
    borderRadius: theme.radius.lg - 2,
  },
  tabActive: {
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  tabText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  tabTextActive: {
    color: theme.colors.text,
    fontWeight: theme.fonts.semiBold,
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
    marginRight: wp(3),
    marginTop: hp(2),
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
  groupContent: {
    gap: hp(2),
  },
  groupSection: {
    gap: hp(0.5),
  },
  sectionTitle: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: hp(0.5),
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
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: wp(2),
  },
  unreadText: {
    color: 'white',
    fontSize: hp(1.3),
    fontWeight: 'bold',
  },
  archivedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1),
    gap: wp(2),
  },
  archivedToggleText: {
    flex: 1,
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  archivedChatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(1.2),
    marginBottom: hp(0.8),
    opacity: 0.7,
  },
  archivedChatAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.border + '50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  archivedChatName: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  archivedChatYear: {
    fontSize: hp(1.3),
    color: theme.colors.placeholder,
    marginTop: 1,
  },
});
