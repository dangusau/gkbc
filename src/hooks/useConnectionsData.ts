import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { connectionsService } from '../services/supabase/connections';
import { memberKeys, connectionKeys } from './queryKeys';

export const useConnectionsData = (search: string, businessType: string, marketArea: string) => {
  // Queries for connection data
  const receivedQuery = useQuery({
    queryKey: connectionKeys.received(),
    queryFn: () => connectionsService.getReceivedRequests(),
  });
  console.log('📥 receivedQuery:', { 
    isLoading: receivedQuery.isLoading, 
    isFetching: receivedQuery.isFetching, 
    dataLength: receivedQuery.data?.length ?? 0,
    error: receivedQuery.error 
  });

  const sentQuery = useQuery({
    queryKey: connectionKeys.sent(),
    queryFn: () => connectionsService.getSentRequests(),
  });
  console.log('📤 sentQuery:', { 
    isLoading: sentQuery.isLoading, 
    isFetching: sentQuery.isFetching, 
    dataLength: sentQuery.data?.length ?? 0,
    error: sentQuery.error 
  });

  const friendsQuery = useQuery({
    queryKey: connectionKeys.friends(),
    queryFn: () => connectionsService.getFriends(),
  });
  console.log('👥 friendsQuery:', { 
    isLoading: friendsQuery.isLoading, 
    isFetching: friendsQuery.isFetching, 
    dataLength: friendsQuery.data?.length ?? 0,
    error: friendsQuery.error 
  });

  // Infinite query for members
  const membersInfiniteQuery = useInfiniteQuery({
    queryKey: memberKeys.filtered(search, businessType, marketArea),
    queryFn: ({ pageParam = 0 }) =>
      connectionsService.getMembers(search, businessType, marketArea, pageParam, 20),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    // keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
  });

  console.log('👥 membersQuery:', {
    isLoading: membersInfiniteQuery.isLoading,
    isFetching: membersInfiniteQuery.isFetching,
    hasData: !!membersInfiniteQuery.data,
    pages: membersInfiniteQuery.data?.pages?.length,
    totalMembers: membersInfiniteQuery.data?.pages?.flat().length ?? 0,
    error: membersInfiniteQuery.error,
  });

  const isLoading = membersInfiniteQuery.isLoading ||
    receivedQuery.isLoading ||
    sentQuery.isLoading ||
    friendsQuery.isLoading;

  const isFetching = membersInfiniteQuery.isFetching;

  console.log('🔁 combined isLoading:', isLoading, '| isFetching:', isFetching);

  return {
    receivedRequests: receivedQuery.data ?? [],
    sentRequests: sentQuery.data ?? [],
    friends: friendsQuery.data ?? [],
    membersPages: membersInfiniteQuery.data?.pages ?? [],
    fetchNextPage: membersInfiniteQuery.fetchNextPage,
    hasNextPage: membersInfiniteQuery.hasNextPage,
    isFetchingNextPage: membersInfiniteQuery.isFetchingNextPage,
    isLoading,
    isFetching,
    refetchConnections: () => {
      receivedQuery.refetch();
      sentQuery.refetch();
      friendsQuery.refetch();
    },
  };
};