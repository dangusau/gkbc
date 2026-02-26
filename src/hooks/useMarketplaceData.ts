import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { marketplaceService } from '../services/supabase/marketplace';
import { marketplaceKeys } from './queryKeys';
import { useAuth } from '../contexts/AuthContext';

export const useMarketplaceData = (filters?: any) => {
  const { user, profile } = useAuth();

  // Infinite query for browsing listings
  const browseQuery = useInfiniteQuery({
    queryKey: marketplaceKeys.listings(filters),
    queryFn: ({ pageParam = 0 }) =>
      marketplaceService.getListings({ ...filters, offset: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length * 20 : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  // Query for user's own listings (only if user is verified)
  const myListingsQuery = useQuery({
    queryKey: marketplaceKeys.myListings(user?.id || ''),
    queryFn: () => marketplaceService.getMyListings(),
    enabled: !!user && profile?.user_status === 'verified',
    staleTime: 2 * 60 * 1000,
  });

  // Query for a single listing
  const useListing = (listingId: string) => {
    return useQuery({
      queryKey: marketplaceKeys.listing(listingId),
      queryFn: () => marketplaceService.getListingById(listingId),
      staleTime: 5 * 60 * 1000,
    });
  };

  // Query for reviews of a listing
  const useReviews = (listingId: string) => {
    return useQuery({
      queryKey: marketplaceKeys.reviews(listingId),
      queryFn: () => marketplaceService.getReviews(listingId),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    browseQuery,
    myListings: myListingsQuery.data ?? [],
    isLoadingMyListings: myListingsQuery.isLoading,
    useListing,
    useReviews,
  };
};