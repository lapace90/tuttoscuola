import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp, getRelativeTime } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getMyListings } from '../../../services/marketplaceService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import BackButton from '../../../components/common/BackButton';
import Icon from '../../../assets/icons/Icon';

const STATUS_LABELS = {
  active: { label: 'Attivo', color: theme.colors.success },
  sold: { label: 'Venduto', color: theme.colors.secondary },
};

const MyListings = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (profile?.id) loadListings();
  }, [profile]);

  const loadListings = async () => {
    const { data, error } = await getMyListings(profile.id);
    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const renderItem = useCallback(({ item }) => {
    const hasImage = item.images && item.images.length > 0;
    const statusInfo = STATUS_LABELS[item.status] || STATUS_LABELS.active;

    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/(main)/marketplace/${item.id}`)}
      >
        <View style={styles.cardImageContainer}>
          {hasImage ? (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.cardImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Icon name="image" size={24} color={theme.colors.textLight} />
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardPrice}>
            {item.price ? `${parseFloat(item.price).toFixed(2)} €` : 'Gratis'}
          </Text>
          <View style={styles.cardFooter}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
            <Text style={styles.cardTime}>{getRelativeTime(item.created_at)}</Text>
          </View>
        </View>
      </Pressable>
    );
  }, [router]);

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <BackButton router={router} />
        <Text style={styles.headerTitle}>I miei annunci</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/(main)/marketplace/create')}
        >
          <Icon name="plus" size={22} color={theme.colors.primary} />
        </Pressable>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="shoppingBag" size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>
              {loading ? 'Caricamento...' : 'Nessun annuncio pubblicato'}
            </Text>
            {!loading && (
              <Pressable
                style={styles.createBtn}
                onPress={() => router.push('/(main)/marketplace/create')}
              >
                <Text style={styles.createBtnText}>Pubblica un annuncio</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </ScreenWrapper>
  );
};

export default MyListings;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    marginBottom: hp(1.5),
    ...theme.shadows.sm,
  },
  cardImageContainer: {
    width: wp(25),
    height: wp(25),
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: hp(1.5),
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: hp(0.5),
  },
  cardPrice: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
    marginBottom: hp(0.8),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: theme.radius.sm,
  },
  statusText: {
    fontSize: hp(1.2),
    fontWeight: theme.fonts.semiBold,
  },
  cardTime: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
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
  createBtn: {
    marginTop: hp(1),
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
  },
  createBtnText: {
    color: 'white',
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
  },
});
