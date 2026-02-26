import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useState } from 'react';

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  location: string;
  views_count: number;
  is_sold: boolean;
  created_at: string;
  seller: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export interface MarketplaceListingDetails {
  favorites_count: number;
  reviews_count: number;
  average_rating: number;
  views_count: number;
}

interface UseAdminMarketplaceProps {
  search?: string;
  category?: string;
  condition?: string;
  isSold?: boolean;
  page?: number;
  limit?: number;
}

export const useAdminMarketplace = ({
  search = '',
  category = '',
  condition = '',
  isSold,
  page = 0,
  limit = 20,
}: UseAdminMarketplaceProps = {}) => {
  const queryClient = useQueryClient();
  const [expandedListingId, setExpandedListingId] = useState<string | null>(null);

  // Fetch listings list
  const listingsQuery = useQuery({
    queryKey: ['admin', 'marketplace', search, category, condition, isSold, page, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_marketplace_listings_for_admin', {
        p_search: search || null,
        p_category: category || null,
        p_condition: condition || null,
        p_is_sold: isSold ?? null,
        p_limit: limit,
        p_offset: page * limit,
      });
      if (error) throw error;
      return data as { listings: MarketplaceListing[]; total_count: number };
    },
    placeholderData: (previousData) => previousData,
  });

  // Fetch listing details when expanded
  const listingDetailsQuery = useQuery({
    queryKey: ['admin', 'marketplaceDetails', expandedListingId],
    queryFn: async () => {
      if (!expandedListingId) return null;
      const { data, error } = await supabase.rpc('get_marketplace_listing_details', { p_listing_id: expandedListingId });
      if (error) throw error;
      return data as MarketplaceListingDetails;
    },
    enabled: !!expandedListingId,
  });

  // Delete mutation – fixed with async/await
  const deleteListing = useMutation({
    mutationFn: async (listingId: string) => {
      const { error } = await supabase.rpc('delete_marketplace_listing', { p_listing_id: listingId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'marketplace'] });
      if (expandedListingId) setExpandedListingId(null);
    },
  });

  return {
    listings: listingsQuery.data?.listings ?? [],
    totalCount: listingsQuery.data?.total_count ?? 0,
    isLoading: listingsQuery.isLoading,
    isFetching: listingsQuery.isFetching,
    error: listingsQuery.error,
    expandedListingId,
    setExpandedListingId,
    listingDetails: listingDetailsQuery.data,
    isLoadingDetails: listingDetailsQuery.isLoading,
    deleteListing,
  };
};