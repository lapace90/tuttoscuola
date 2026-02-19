import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { hp, wp, getRelativeTime } from '../../../helpers/common';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { getListings } from '../../../services/marketplaceService';
import ScreenWrapper from '../../../components/common/ScreenWrapper';
import Input from '../../../components/common/Input';
import Icon from '../../../assets/icons/Icon';

const LISTING_TYPES = [
  { key: 'vendo', label: 'Vendo' },
  { key: 'cerco', label: 'Cerco' },
];

const CATEGORIES = [
  { key: null, label: 'Tutti' },
  { key: 'libri', label: 'Libri' },
  { key: 'appunti', label: 'Appunti' },
  { key: 'materiale', label: 'Materiale' },
];

const Marketplace = () => {
  const router = useRouter();
  const { profile } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [listingType, setListingType] = useState('vendo');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadListings = useCallback(async () => {
    const filters = { listingType };
    if (selectedCategory) filters.category = selectedCategory;
    if (searchQuery) filters.search = searchQuery;

    const { data, error } = await getListings(filters);
    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  }, [listingType, selectedCategory, searchQuery]);

  useEffect(() => {
    setLoading(true);
    loadListings();
  }, [loadListings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const handleSearch = () => {
    setSearchQuery(searchText.trim());
  };

  const renderListingCard = useCallback(({ item }) => {
    const hasImage = item.images && item.images.length > 0;

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
              <Icon name={item.listing_type === 'cerco' ? 'search' : 'image'} size={32} color={theme.colors.textLight} />
            </View>
          )}
          {item.status === 'sold' && (
            <View style={styles.soldOverlay}>
              <Text style={styles.soldText}>Venduto</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardPrice}>
            {item.listing_type === 'cerco'
              ? (item.price ? `Budget: ${parseFloat(item.price).toFixed(2)} €` : '')
              : (item.price ? `${parseFloat(item.price).toFixed(2)} €` : 'Gratis')
            }
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardCategory}>
              {CATEGORIES.find(c => c.key === item.category)?.label || item.category}
            </Text>
            <Text style={styles.cardTime}>{getRelativeTime(item.created_at)}</Text>
          </View>
        </View>
      </Pressable>
    );
  }, [router]);

  return (
    <ScreenWrapper bg={theme.colors.background} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mercatino</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.myListingsButton}
            onPress={() => router.push('/(main)/marketplace/my-listings')}
          >
            <Icon name="user" size={20} color={theme.colors.primary} />
          </Pressable>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/(main)/marketplace/create')}
          >
            <Icon name="plus" size={22} color={theme.colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Segmented control Vendo / Cerco */}
      <View style={styles.segmentedControl}>
        {LISTING_TYPES.map((type) => (
          <Pressable
            key={type.key}
            style={[
              styles.segmentTab,
              listingType === type.key && styles.segmentTabActive,
            ]}
            onPress={() => setListingType(type.key)}
          >
            <Text
              style={[
                styles.segmentTabText,
                listingType === type.key && styles.segmentTabTextActive,
              ]}
            >
              {type.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Cerca annunci..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          icon={<Icon name="search" size={20} color={theme.colors.textLight} />}
          containerStyle={styles.searchInput}
        />
      </View>

      <View style={styles.categoriesContainer}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key || 'all'}
            style={[
              styles.categoryChip,
              selectedCategory === cat.key && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat.key && styles.categoryChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderListingCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name={listingType === 'cerco' ? 'search' : 'shoppingBag'} size={48} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>
              {loading ? 'Caricamento...' : (listingType === 'cerco' ? 'Nessuna ricerca' : 'Nessun annuncio')}
            </Text>
            {!loading && (
              <Pressable
                style={styles.createBtn}
                onPress={() => router.push('/(main)/marketplace/create')}
              >
                <Text style={styles.createBtnText}>
                  {listingType === 'cerco' ? 'Pubblica una ricerca' : 'Pubblica un annuncio'}
                </Text>
              </Pressable>
            )}
          </View>
        }
      />
    </ScreenWrapper>
  );
};

export default Marketplace;

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
  headerActions: {
    flexDirection: 'row',
    gap: wp(2),
  },
  myListingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: wp(5),
    marginBottom: hp(1.5),
    backgroundColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: hp(1),
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  segmentTabActive: {
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  segmentTabText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.textLight,
  },
  segmentTabTextActive: {
    color: theme.colors.text,
  },
  searchContainer: {
    paddingHorizontal: wp(5),
    marginBottom: hp(1.5),
  },
  searchInput: {
    height: hp(5.5),
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
    gap: wp(2),
  },
  categoryChip: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.8),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  categoryChipTextActive: {
    color: 'white',
  },
  listContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: hp(1.5),
  },
  card: {
    width: (wp(90) - wp(3)) / 2,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  cardImageContainer: {
    width: '100%',
    height: hp(14),
    position: 'relative',
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
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldText: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: theme.fonts.bold,
  },
  cardContent: {
    padding: hp(1.2),
  },
  cardTitle: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    marginBottom: hp(0.5),
  },
  cardPrice: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
    marginBottom: hp(0.5),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategory: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
    textTransform: 'uppercase',
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
