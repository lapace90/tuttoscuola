import { View, Text, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, Image, Linking, ActivityIndicator, Modal, Share } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { hp, wp, formatTime } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { useMessages } from '../../../hooks/useMessages';
import { useChatInfo } from '../../../hooks/useChatInfo';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Avatar from '../../../components/common/Avatar';
import ImageCropper from '../../../components/common/ImageCropper';
import Icon from '../../../assets/icons/Icon';

const ChatDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { bottom } = useSafeAreaInsets();
  const [newMessage, setNewMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const flatListRef = useRef(null);

  // ImageCropper state
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUri, setTempImageUri] = useState(null);

  // Image viewer state
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [savingImage, setSavingImage] = useState(false);

  const { chatInfo, otherMember, loading: chatLoading, isGroupChat, getChatTitle } = useChatInfo(id, profile?.id);
  const { messages, loading, sending, sendText, sendImage, sendDocument, pickImage, pickDocument } = useMessages(id, profile?.id);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    const text = newMessage;
    setNewMessage('');
    await sendText(text);
  };

  const handlePickImage = async () => {
    setShowAttachMenu(false);
    const uri = await pickImage();
    if (uri) {
      setTempImageUri(uri);
      setShowCropper(true);
    }
  };

  const handleCrop = async (croppedUri) => {
    setShowCropper(false);
    setTempImageUri(null);
    await sendImage(croppedUri);
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setTempImageUri(null);
  };

  const handlePickDocument = async () => {
    setShowAttachMenu(false);
    const doc = await pickDocument();
    if (doc) {
      await sendDocument(doc);
    }
  };

  const openDocument = (url) => {
    Linking.openURL(url);
  };

  const openImageViewer = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageViewer(true);
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
    setSelectedImage(null);
  };

  const saveImage = async () => {
    if (!selectedImage) return;

    try {
      setSavingImage(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permesso negato per salvare nella galleria');
        return;
      }

      // Scarica immagine
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });

      // Salva in cache
      const fileUri = `${FileSystem.cacheDirectory}image_${Date.now()}.jpg`;
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Salva in galleria
      await MediaLibrary.saveToLibraryAsync(fileUri);
      alert('Immagine salvata nella galleria!');

    } catch (error) {
      console.error('Save error:', error);
      alert('Errore nel salvare l\'immagine');
    } finally {
      setSavingImage(false);
    }
  };

  const shareImage = async () => {
    if (!selectedImage) return;

    try {
      await Share.share({
        url: selectedImage,
        message: selectedImage,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
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
            {!isOwn && isGroupChat && item.sender && (
              <Text style={styles.senderName}>
                {item.sender.first_name}
              </Text>
            )}

            {/* Contenuto in base al tipo */}
            {item.type === 'image' && item.file_url ? (
              <Pressable onPress={() => openImageViewer(item.file_url)}>
                <Image
                  source={{ uri: item.file_url }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              </Pressable>
            ) : item.type === 'document' && item.file_url ? (
              <Pressable style={styles.documentContainer} onPress={() => openDocument(item.file_url)}>
                <Icon name="file" size={24} color={isOwn ? 'white' : theme.colors.secondary} />
                <Text style={[styles.documentName, isOwn && styles.documentNameOwn]} numberOfLines={2}>
                  {item.file_name || 'Documento'}
                </Text>
              </Pressable>
            ) : (
              <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>
                {item.content}
              </Text>
            )}

            <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton router={router} />
        <View style={styles.headerCenter}>
          {isGroupChat ? (
            <View style={styles.groupIcon}>
              <Icon name="users" size={20} color={theme.colors.secondary} />
            </View>
          ) : otherMember ? (
            <Avatar
              uri={otherMember.avatar_url}
              firstName={otherMember.first_name}
              lastName={otherMember.last_name}
              size={36}
            />
          ) : null}
          <Text style={styles.headerTitle} numberOfLines={1}>
            {getChatTitle()}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Caricamento...' : 'Nessun messaggio. Inizia la conversazione!'}
              </Text>
            </View>
          }
        />

        {/* Menu allegati */}
        {showAttachMenu && (
          <View style={styles.attachMenu}>
            <Pressable style={styles.attachOption} onPress={handlePickImage}>
              <View style={[styles.attachIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Icon name="image" size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.attachText}>Immagine</Text>
            </Pressable>
            <Pressable style={styles.attachOption} onPress={handlePickDocument}>
              <View style={[styles.attachIcon, { backgroundColor: theme.colors.secondary + '20' }]}>
                <Icon name="file" size={22} color={theme.colors.secondary} />
              </View>
              <Text style={styles.attachText}>Documento</Text>
            </Pressable>
          </View>
        )}

        <View style={[styles.inputContainer, { paddingBottom: bottom + hp(1) }]}>
          <Pressable
            style={styles.attachButton}
            onPress={() => setShowAttachMenu(!showAttachMenu)}
          >
            <Icon name={showAttachMenu ? "x" : "plus"} size={24} color={theme.colors.secondary} />
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="Scrivi un messaggio..."
            placeholderTextColor={theme.colors.placeholder}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
            onFocus={() => setShowAttachMenu(false)}
          />

          {sending ? (
            <View style={styles.sendButton}>
              <ActivityIndicator color="white" size="small" />
            </View>
          ) : (
            <Pressable
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!newMessage.trim() || sending}
            >
              <Icon name="send" size={22} color="white" />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Image Cropper */}
      <ImageCropper
        visible={showCropper}
        imageUri={tempImageUri}
        onCrop={handleCrop}
        onCancel={handleCancelCrop}
        cropShape="square"
      />

      {/* Image Viewer Modal */}
      <Modal
        visible={showImageViewer}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <View style={styles.imageViewerContainer}>
          {/* Header */}
          <View style={styles.imageViewerHeader}>
            <Pressable style={styles.imageViewerBtn} onPress={closeImageViewer}>
              <Icon name="x" size={24} color="white" />
            </Pressable>
            <View style={styles.imageViewerActions}>
              <Pressable style={styles.imageViewerBtn} onPress={shareImage}>
                <Icon name="share" size={22} color="white" />
              </Pressable>
              <Pressable style={styles.imageViewerBtn} onPress={saveImage} disabled={savingImage}>
                {savingImage ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Icon name="download" size={22} color="white" />
                )}
              </Pressable>
            </View>
          </View>

          {/* Image */}
          <Pressable style={styles.imageViewerContent} onPress={closeImageViewer}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </Pressable>
        </View>
      </Modal>
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
    borderBottomColor: theme.colors.accentLight,
    backgroundColor: theme.colors.card,
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
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
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
    borderWidth: 1,
    borderColor: theme.colors.accentLight,
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
  messageImage: {
    width: wp(50),
    height: wp(50),
    borderRadius: theme.radius.md,
    marginBottom: hp(0.5),
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    paddingVertical: hp(0.5),
  },
  documentName: {
    fontSize: hp(1.5),
    color: theme.colors.text,
    flex: 1,
  },
  documentNameOwn: {
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
  attachMenu: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.accentLight,
    gap: wp(4),
  },
  attachOption: {
    alignItems: 'center',
    gap: hp(0.5),
  },
  attachIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachText: {
    fontSize: hp(1.3),
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: theme.colors.accentLight,
    backgroundColor: theme.colors.card,
    gap: wp(2),
  },
  attachButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderWidth: 1,
    borderColor: theme.colors.accentLight,
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
  // Image Viewer
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  imageViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: hp(6),
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  imageViewerActions: {
    flexDirection: 'row',
    gap: wp(2),
  },
  imageViewerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
});