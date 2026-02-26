import { useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceService } from '../services/supabase/marketplace';
import { marketplaceKeys } from './queryKeys';
import { useAuth } from '../contexts/AuthContext';
import type{ MarketplaceListing } from '../types/index';

export const useMarketplaceMutations = () => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  // Helper to update listing in infinite query pages
  const updateInfinitePages = (
    oldData: any,
    listingId: string,
    updater: (listing: MarketplaceListing) => MarketplaceListing
  ) => {
    if (!oldData?.pages) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map((page: MarketplaceListing[]) =>
        page.map((listing) =>
          listing.id === listingId ? updater(listing) : listing
        )
      ),
    };
  };

  // Helper to add a listing to the top of the first page
  const addToInfinitePages = (oldData: any, newListing: MarketplaceListing) => {
    if (!oldData?.pages) return oldData;
    return {
      ...oldData,
      pages: [
        [newListing, ...oldData.pages[0]], // add to top of first page
        ...oldData.pages.slice(1),
      ],
    };
  };

  // Helper to remove listing from infinite pages
  const removeFromInfinitePages = (oldData: any, listingId: string) => {
    if (!oldData?.pages) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map((page: MarketplaceListing[]) =>
        page.filter((listing) => listing.id !== listingId)
      ),
    };
  };

  // Create listing (verified only)
  const createListing = useMutation({
    mutationFn: (listingData: Parameters<typeof marketplaceService.createListing>[0]) =>
      marketplaceService.createListing(listingData),
    onMutate: async (listingData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: marketplaceKeys.all });

      // Snapshot previous states
      const previousBrowse = queryClient.getQueryData(marketplaceKeys.listings());
      const previousMyListings = queryClient.getQueryData(marketplaceKeys.myListings(user?.id || ''));

      // Create optimistic listing object
      const optimisticListing: MarketplaceListing = {
        id: 'temp-' + Date.now(),
        seller_id: user?.id || '',
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        category: listingData.category,
        condition: listingData.condition as 'new' | 'used' | 'refurbished', // Cast to union type
        location: listingData.location,
        images: listingData.images,
        views_count: 0,
        is_sold: false,
        created_at: new Date().toISOString(),
        seller_name: profile?.first_name && profile?.last_name 
          ? `${profile.first_name} ${profile.last_name}` 
          : 'You',
        seller_avatar: profile?.avatar_url || '',
        seller_verified: profile?.user_status === 'verified',
        is_favorited: false,
        favorite_count: 0,
      };

      // Update browse cache (infinite query)
      queryClient.setQueryData(marketplaceKeys.listings(), (old: any) => 
        addToInfinitePages(old, optimisticListing)
      );

      // Update my listings cache (if exists)
      if (previousMyListings) {
        queryClient.setQueryData(
          marketplaceKeys.myListings(user?.id || ''),
          (old: MarketplaceListing[]) => [optimisticListing, ...(old || [])]
        );
      }

      return { previousBrowse, previousMyListings };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      queryClient.setQueryData(marketplaceKeys.listings(), context?.previousBrowse);
      if (context?.previousMyListings) {
        queryClient.setQueryData(marketplaceKeys.myListings(user?.id || ''), context.previousMyListings);
      }
    },
    onSettled: () => {
      // Invalidate all marketplace queries to refetch with real data
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
    },
  });

 // Update listing (owner only)
const updateListing = useMutation({
  mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof marketplaceService.updateListing>[1] }) =>
    marketplaceService.updateListing(id, updates),
  onMutate: async ({ id, updates }) => {
    await queryClient.cancelQueries({ queryKey: marketplaceKeys.all });

    const previousBrowse = queryClient.getQueryData(marketplaceKeys.listings());
    const previousMyListings = queryClient.getQueryData(marketplaceKeys.myListings(user?.id || ''));

    // Update infinite browse cache
    queryClient.setQueryData(marketplaceKeys.listings(), (old: any) =>
      updateInfinitePages(old, id, (listing: MarketplaceListing) => ({
        ...listing,
        ...updates,
        // Explicitly cast condition to the union type (safe because form restricts values)
        condition: updates.condition as 'new' | 'used' | 'refurbished',
        images: updates.images || listing.images,
      }))
    );

    // Update my listings cache
    queryClient.setQueryData(
      marketplaceKeys.myListings(user?.id || ''),
      (old: MarketplaceListing[]) =>
        old?.map((listing) =>
          listing.id === id
            ? {
                ...listing,
                ...updates,
                condition: updates.condition as 'new' | 'used' | 'refurbished',
                images: updates.images || listing.images,
              }
            : listing
        ) ?? []
    );

    return { previousBrowse, previousMyListings };
  },
  onError: (_err, _variables, context) => {
    queryClient.setQueryData(marketplaceKeys.listings(), context?.previousBrowse);
    queryClient.setQueryData(marketplaceKeys.myListings(user?.id || ''), context?.previousMyListings);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
  },
});

  // Delete listing (owner only)
  const deleteListing = useMutation({
    mutationFn: (listingId: string) => marketplaceService.deleteListing(listingId),
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: marketplaceKeys.all });

      const previousBrowse = queryClient.getQueryData(marketplaceKeys.listings());
      const previousMyListings = queryClient.getQueryData(marketplaceKeys.myListings(user?.id || ''));

      // Remove from browse cache
      queryClient.setQueryData(marketplaceKeys.listings(), (old: any) =>
        removeFromInfinitePages(old, listingId)
      );

      // Remove from my listings cache
      queryClient.setQueryData(
        marketplaceKeys.myListings(user?.id || ''),
        (old: MarketplaceListing[]) => old?.filter((l) => l.id !== listingId) ?? []
      );

      return { previousBrowse, previousMyListings };
    },
    onError: (_err, _listingId, context) => {
      queryClient.setQueryData(marketplaceKeys.listings(), context?.previousBrowse);
      queryClient.setQueryData(marketplaceKeys.myListings(user?.id || ''), context?.previousMyListings);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
    },
  });

  // Toggle favorite (any authenticated user)
  const toggleFavorite = useMutation({
    mutationFn: (listingId: string) => marketplaceService.toggleFavorite(listingId),
    onMutate: async (listingId) => {
      await queryClient.cancelQueries({ queryKey: marketplaceKeys.all });

      const previousBrowse = queryClient.getQueryData(marketplaceKeys.listings());
      const previousMyListings = queryClient.getQueryData(marketplaceKeys.myListings(user?.id || ''));

      // Update favorite status optimistically in all caches
      // For infinite browse
      queryClient.setQueriesData(
        { queryKey: marketplaceKeys.listings() },
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: MarketplaceListing[]) =>
              page.map((listing) =>
                listing.id === listingId
                  ? {
                      ...listing,
                      is_favorited: !listing.is_favorited,
                      favorite_count: listing.favorite_count + (listing.is_favorited ? -1 : 1),
                    }
                  : listing
              )
            ),
          };
        }
      );

      // For my listings (if present)
      queryClient.setQueryData(
        marketplaceKeys.myListings(user?.id || ''),
        (old: MarketplaceListing[]) =>
          old?.map((listing) =>
            listing.id === listingId
              ? {
                  ...listing,
                  is_favorited: !listing.is_favorited,
                  favorite_count: listing.favorite_count + (listing.is_favorited ? -1 : 1),
                }
              : listing
          ) ?? []
      );

      return { previousBrowse, previousMyListings };
    },
    onError: (_err, _listingId, context) => {
      queryClient.setQueryData(marketplaceKeys.listings(), context?.previousBrowse);
      queryClient.setQueryData(marketplaceKeys.myListings(user?.id || ''), context?.previousMyListings);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.all });
    },
  });

  // Add review (any authenticated user)
  const addReview = useMutation({
    mutationFn: ({ listingId, rating, comment }: { listingId: string; rating: number; comment: string }) =>
      marketplaceService.addReview(listingId, rating, comment),
    onSuccess: (_, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.reviews(listingId) });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.listing(listingId) });
    },
  });

  return {
    createListing,
    updateListing,
    deleteListing,
    toggleFavorite,
    addReview,
  };
};