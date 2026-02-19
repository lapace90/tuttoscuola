import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Dimensions, ActionSheetIOS, Share } from 'react-native';
import { Image } from 'expo-image';
import React, { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { hp, wp, getRelativeTime } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getListingById, deleteListing, markAsSold } from '../../../services/marketplaceService';
import { getOrCreatePrivateChat } from '../../../services/chatService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import Avatar from '../../../components/common/Avatar';
import Icon from '../../../assets/icons/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = {
  libri: 'Libri',
  appunti: 'Appunti',
  materiale: 'Materiale',
};

const CONDITIONS = {
  nuovo: 'Nuovo',
  come_nuovo: 'Come nuovo',
  buono: 'Buono',
  usato: 'Usato',
};

const ListingDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (id) loadListing();
  }, [id]);

  const loadListing = async () => {
    setLoading(true);
    const { data, error } = await getListingById(id);
    if (!error && data) {
      setListing(data);
    }
    setLoading(false);
  };

  const isOwner = listing?.seller_id === profile?.id;

  const showActionMenu = () => {
    const options = isOwner
      ? ['Annulla', 'Condividi', 'Invia in chat']
      : ['Annulla', 'Condividi', 'Invia in chat', 'Segnala contenuto'];

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: 0,
        destructiveButtonIndex: isOwner ? undefined : 3,
      },
      async (buttonIndex) => {
        if (buttonIndex === 1) {
          const text = `${listing.title}${listing.price ? ` - ${parseFloat(listing.price).toFixed(2)} €` : ''}\n\n${listing.description || ''}`;
          await Share.share({ message: text.trim() });
        } else if (buttonIndex === 2) {
          router.push({
            pathname: '/(main)/marketplace/share',
            params: { title: listing.title, price: listing.price || '', listingId: listing.id },
          });
        } else if (buttonIndex === 3 && !isOwner) {
          router.push('/(main)/support/report');
        }
      }
    );
  };

  const handleContact = async () => {
    setActionLoading(true);
    const { data, error } = await getOrCreatePrivateChat(profile.id, listing.seller_id);
    setActionLoading(false);

    if (error) {
      Alert.alert('Errore', 'Impossibile avviare la chat.');
    } else if (data) {
      router.push(`/(main)/chat/${data.id}`);
    }
  };

  const handleMarkSold = () => {
    Alert.alert(
      'Segna come venduto',
      'Confermi che l\'oggetto è stato venduto?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sì, venduto',
          onPress: async () => {
            setActionLoading(true);
            const { error } = await markAsSold(listing.id);
            setActionLoading(false);
            if (error) {
              Alert.alert('Errore', error.message);
            } else {
              loadListing();
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Elimina annuncio',
      'Sei sicuro di voler eliminare questo annuncio?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sì, elimina',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            const { error } = await deleteListing(listing.id);
            setActionLoading(false);
            if (error) {
              Alert.alert('Errore', error.message);
            } else {
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  };

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!listing) {
    return (
      <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <BackButton router={router} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Annuncio non trovato</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const hasImages = listing.images && listing.images.length > 0;

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton router={router} />
        <View style={styles.headerActions}>
          {isOwner && (
            <>
              <Pressable style={styles.headerBtn} onPress={() => router.push(`/(main)/marketplace/edit/${id}`)}>
                <Icon name="edit" size={20} color={theme.colors.primary} />
              </Pressable>
              <Pressable style={styles.headerBtn} onPress={handleDelete}>
                <Icon name="trash" size={20} color={theme.colors.error} />
              </Pressable>
            </>
          )}
          <Pressable style={styles.headerBtn} onPress={showActionMenu}>
            <Icon name="moreVertical" size={22} color={theme.colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        {hasImages ? (
          <View style={styles.galleryContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              {listing.images.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={styles.galleryImage}
                  contentFit="cover"
                  transition={200}
                />
              ))}
            </ScrollView>
            {listing.images.length > 1 && (
              <View style={styles.dotsContainer}>
                {listing.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      activeImageIndex === index && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            <Icon name={listing.listing_type === 'cerco' ? 'search' : 'image'} size={48} color={theme.colors.textLight} />
          </View>
        )}

        {/* Badges row */}
        <View style={styles.badgesRow}>
          {listing.listing_type === 'cerco' && (
            <View style={styles.cercoBadge}>
              <Icon name="search" size={14} color="white" />
              <Text style={styles.cercoBadgeText}>Cerco</Text>
            </View>
          )}
          {listing.status === 'sold' && (
            <View style={styles.soldBadge}>
              <Icon name="check" size={16} color="white" />
              <Text style={styles.soldBadgeText}>Venduto</Text>
            </View>
          )}
        </View>

        {/* Title & Price */}
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>
          {listing.listing_type === 'cerco'
            ? (listing.price ? `Budget: ${parseFloat(listing.price).toFixed(2)} €` : '')
            : (listing.price ? `${parseFloat(listing.price).toFixed(2)} €` : 'Gratis')
          }
        </Text>

        {/* Info chips */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{CATEGORIES[listing.category] || listing.category}</Text>
          </View>
          {listing.condition && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{CONDITIONS[listing.condition] || listing.condition}</Text>
            </View>
          )}
          <Text style={styles.timeText}>{getRelativeTime(listing.created_at)}</Text>
        </View>

        {/* Description */}
        {listing.description && (
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>Descrizione</Text>
            <Text style={styles.descriptionText}>{listing.description}</Text>
          </View>
        )}

        {/* Seller */}
        {listing.seller && (
          <View style={styles.sellerCard}>
            <Text style={styles.sellerLabel}>
              {listing.listing_type === 'cerco' ? 'Pubblicato da' : 'Venditore'}
            </Text>
            <View style={styles.sellerInfo}>
              <Avatar
                uri={listing.seller.avatar_url}
                firstName={listing.seller.first_name}
                lastName={listing.seller.last_name}
                size={44}
              />
              <Text style={styles.sellerName}>
                {listing.seller.first_name} {listing.seller.last_name}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      {!isOwner && listing.status === 'active' && (
        <View style={styles.footer}>
          <Button
            title={listing.listing_type === 'cerco' ? 'Contatta' : 'Contatta venditore'}
            loading={actionLoading}
            onPress={handleContact}
          />
        </View>
      )}
      {isOwner && listing.status === 'active' && (
        <View style={styles.footer}>
          <Button
            title="Segna come venduto"
            variant="secondary"
            loading={actionLoading}
            onPress={handleMarkSold}
          />
        </View>
      )}
    </ScreenWrapper>
  );
};

export default ListingDetail;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
  },
  headerActions: {
    flexDirection: 'row',
    gap: wp(2),
  },
  headerBtn: {
    padding: 8,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: hp(4),
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
  galleryContainer: {
    width: SCREEN_WIDTH,
    height: hp(35),
    position: 'relative',
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: hp(35),
  },
  dotsContainer: {
    position: 'absolute',
    bottom: hp(1.5),
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: 'white',
    width: 20,
  },
  noImageContainer: {
    width: SCREEN_WIDTH,
    height: hp(25),
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: wp(2),
    marginHorizontal: wp(5),
    marginTop: hp(2),
  },
  cercoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondary,
  },
  cercoBadgeText: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semiBold,
    color: 'white',
  },
  soldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.success,
  },
  soldBadgeText: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semiBold,
    color: 'white',
  },
  title: {
    fontSize: hp(2.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    paddingHorizontal: wp(5),
    marginTop: hp(2),
  },
  price: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
    paddingHorizontal: wp(5),
    marginTop: hp(0.5),
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    marginTop: hp(1.5),
    gap: wp(2),
  },
  chip: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondary + '20',
  },
  chipText: {
    fontSize: hp(1.3),
    fontWeight: theme.fonts.medium,
    color: theme.colors.secondary,
  },
  timeText: {
    fontSize: hp(1.3),
    color: theme.colors.textLight,
    marginLeft: 'auto',
  },
  descriptionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(2),
    marginHorizontal: wp(5),
    marginTop: hp(2),
    ...theme.shadows.sm,
  },
  descriptionTitle: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    marginBottom: hp(1),
  },
  descriptionText: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    lineHeight: hp(2.4),
  },
  sellerCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: hp(2),
    marginHorizontal: wp(5),
    marginTop: hp(2),
    ...theme.shadows.sm,
  },
  sellerLabel: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
    marginBottom: hp(1),
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  sellerName: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  footer: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
});
