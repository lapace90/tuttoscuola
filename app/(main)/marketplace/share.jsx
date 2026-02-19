import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { hp, wp } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserChats, sendMessage } from '../../../services/chatService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Avatar from '../../../components/common/Avatar';
import Icon from '../../../assets/icons/Icon';

const ShareToChat = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const { title, price, listingId } = useLocalSearchParams();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    const { data, error } = await getUserChats(profile.id);
    if (!error && data) {
      setChats(data);
    }
    setLoading(false);
  };

  const getChatName = (chat) => {
    if (chat.type === 'class') {
      return chat.name || `Classe ${chat.class?.name || ''}`;
    }
    if (chat.otherMember) {
      return `${chat.otherMember.first_name} ${chat.otherMember.last_name}`;
    }
    return chat.name || 'Chat';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleShare = async (chat) => {
    setSending(chat.id);
    const priceText = price ? ` - ${parseFloat(price).toFixed(2)} \u20AC` : '';
    const message = `[listing:${listingId}]\uD83D\uDCE6 ${title}${priceText}`;

    const { error } = await sendMessage(chat.id, profile.id, message);
    setSending(null);

    if (error) {
      Alert.alert('Errore', 'Impossibile inviare il messaggio.');
    } else {
      Alert.alert('Inviato!', `Annuncio condiviso in "${getChatName(chat)}"`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const renderChatItem = ({ item }) => {
    const chatName = getChatName(item);
    const isPrivate = item.type === 'private';

    return (
      <Pressable
        style={styles.chatItem}
        onPress={() => handleShare(item)}
        disabled={sending !== null}
      >
        {isPrivate && item.otherMember ? (
          <Avatar
            uri={item.otherMember.avatar_url}
            firstName={item.otherMember.first_name}
            lastName={item.otherMember.last_name}
            size={46}
          />
        ) : (
          <View style={styles.avatar}>
            <Icon
              name={item.type === 'class' ? 'users' : 'messageCircle'}
              size={22}
              color={theme.colors.secondary}
            />
          </View>
        )}

        <View style={styles.chatInfo}>
          <Text style={styles.chatName} numberOfLines={1}>{chatName}</Text>
          {item.type === 'class' && (
            <Text style={styles.chatType}>Chat di classe</Text>
          )}
        </View>

        {sending === item.id ? (
          <Text style={styles.sendingText}>Invio...</Text>
        ) : (
          <Icon name="send" size={20} color={theme.colors.primary} />
        )}
      </Pressable>
    );
  };

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>Invia in chat</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.previewCard}>
        <Icon name="shoppingBag" size={20} color={theme.colors.primary} />
        <Text style={styles.previewTitle} numberOfLines={1}>{title}</Text>
        {price ? (
          <Text style={styles.previewPrice}>{parseFloat(price).toFixed(2)} &#8364;</Text>
        ) : null}
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="messageCircle" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>
              {loading ? 'Caricamento...' : 'Nessuna chat disponibile'}
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
};

export default ShareToChat;

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
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginHorizontal: wp(5),
    marginBottom: hp(2),
    padding: hp(1.5),
    backgroundColor: theme.colors.primaryLight + '15',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  previewTitle: {
    flex: 1,
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  previewPrice: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
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
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
    marginLeft: wp(3),
  },
  chatName: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  chatType: {
    fontSize: hp(1.3),
    color: theme.colors.secondary,
    marginTop: 2,
  },
  sendingText: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
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
