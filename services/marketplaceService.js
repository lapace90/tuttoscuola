import { supabase } from '../lib/supabase';

/**
 * Get all active listings, optionally filtered
 */
export const getListings = async ({ category, search, listingType } = {}) => {
  let query = supabase
    .from('marketplace_listings')
    .select(`
      *,
      seller:users!seller_id(id, first_name, last_name, avatar_url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (listingType) {
    query = query.eq('listing_type', listingType);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;
  return { data, error };
};

/**
 * Get a single listing by ID
 */
export const getListingById = async (id) => {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select(`
      *,
      seller:users!seller_id(id, first_name, last_name, avatar_url)
    `)
    .eq('id', id)
    .single();

  return { data, error };
};

/**
 * Get listings by seller
 */
export const getMyListings = async (userId) => {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('seller_id', userId)
    .neq('status', 'removed')
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Create a new listing
 */
export const createListing = async (listingData) => {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert(listingData)
    .select(`
      *,
      seller:users!seller_id(id, first_name, last_name, avatar_url)
    `)
    .single();

  return { data, error };
};

/**
 * Update a listing
 */
export const updateListing = async (id, updates) => {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

/**
 * Delete a listing (soft delete)
 */
export const deleteListing = async (id) => {
  const { error } = await supabase
    .from('marketplace_listings')
    .update({ status: 'removed' })
    .eq('id', id);

  return { error };
};

/**
 * Mark listing as sold
 */
export const markAsSold = async (id) => {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .update({ status: 'sold', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

/**
 * Upload images for a listing
 */
export const uploadListingImages = async (userId, imageUris) => {
  const urls = [];

  for (const uri of imageUris) {
    try {
      const fileExt = uri.split('.').pop().toLowerCase();
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('marketplace')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('marketplace')
        .getPublicUrl(fileName);

      urls.push(urlData.publicUrl);
    } catch (error) {
      console.error('Upload listing image error:', error);
    }
  }

  return { data: urls, error: urls.length === 0 ? { message: 'Nessuna immagine caricata' } : null };
};
