// app/(main)/chat/[id].jsx
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hp, wp, formatTime } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getChatMessages, sendMessage, subscribeToMessages, getChatMembers } from '../../../services/chatService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Avatar from '../../../components/common/Avatar';
import Icon from '../../../assets/icons/Icon';

const ChatDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { bottom } = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatInfo, setChatInfo] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (id && profile?.id) {
      loadMessages();
      loadChatInfo();
      
      const subscription = subscribeToMessages(id, (newMsg) => {
        setMessages(prev => [...prev, newMsg]);
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [id, profile]);

  const loadMessages = async () => {
    setLoading(true);
    const { data, error } = await getChatMessages(id);
    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const loadChatInfo = async () => {
    const { data } = await getChatMembers(id);
    if (data) {
      const otherMember = data.find(m => m.user?.id !== profile.id);
      setChatInfo({ members: data, otherMember: otherMember?.user });
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const { error } = await sendMessage(id, profile.id, newMessage.trim());
    setSending(false);

    if (!error) {
      setNewMessage('');
    }
  };

  const getChatTitle = () => {
    if (chatInfo?.otherMember) {
      return `${chatInfo.otherMember.first_name} ${chatInfo.otherMember.last_name}`;
    }
    return 'Chat';
  };

  const renderMessage = ({ item, index }) => {
    const isOwn = item.sender_id === profile?.id;
    const showDate = index === 0 || 
      new Date(item.created_at).toDateString() !== new Date(messages[index - 1]?.created_at).toDateString();

    return (
      <View>
        {showDate && (
          <Text style={styles.dateHeader}>
            {new Date(item.created_at).toLocaleDateString('it-IT', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
        )}
        <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
          <View style={[styles.messageBubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
            {!isOwn && item.sender && (
              <Text style={styles.senderName}>
                {item.sender.first_name}
              </Text>
            )}
            <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
              {item.content}
            </Text>
            <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper bg={theme.colors.background} noBottomPadding>
      <View style={styles.header}>
        <BackButton router={router} />
        <View style={styles.headerCenter}>
          {chatInfo?.otherMember && (
            <Avatar
              uri={chatInfo.otherMember.avatar_url}
              firstName={chatInfo.otherMember.first_name}
              lastName={chatInfo.otherMember.last_name}
              size={36}
            />
          )}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {getChatTitle()}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Caricamento...' : 'Nessun messaggio. Inizia la conversazione!'}
              </Text>
            </View>
          }
        />

        <View style={[styles.inputContainer, { paddingBottom: Platform.OS === 'android' ? Math.max(bottom, 48) + hp(1) : bottom + hp(1) }]}>
          <TextInput
            style={styles.input}
            placeholder="Scrivi un messaggio..."
            placeholderTextColor={theme.colors.placeholder}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <Pressable 
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            <Icon name="send" size={22} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default ChatDetail;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    marginHorizontal: wp(2),
  },
  headerTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  headerRight: {
    width: 36,
  },
  container: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    flexGrow: 1,
  },
  dateHeader: {
    textAlign: 'center',
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginVertical: hp(2),
    textTransform: 'capitalize',
  },
  messageRow: {
    marginBottom: hp(1),
    alignItems: 'flex-start',
  },
  messageRowOwn: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: hp(1.5),
    borderRadius: theme.radius.lg,
  },
  bubbleOwn: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: 4,
    ...theme.shadows.sm,
  },
  senderName: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.secondary,
    marginBottom: hp(0.3),
  },
  messageText: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    lineHeight: hp(2.4),
  },
  messageTextOwn: {
    color: 'white',
  },
  messageTime: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
    alignSelf: 'flex-end',
    marginTop: hp(0.5),
  },
  messageTimeOwn: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.xl,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    fontSize: hp(1.7),
    color: theme.colors.text,
    maxHeight: hp(12),
    marginRight: wp(2),
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(20),
  },
  emptyText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});