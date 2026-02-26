import { useInfiniteQuery } from '@tanstack/react-query';
import { feedService } from '../services/supabase/feed';
import { feedKeys } from './queryKeys';
import { useAuth } from '../contexts/AuthContext';

const POSTS_PER_PAGE = 10;

export const useFeed = () => {
  const { userProfile } = useAuth();

  return useInfiniteQuery({
    queryKey: feedKeys.lists(),
    queryFn: ({ pageParam = 0 }) =>
      feedService.getHomeFeed(userProfile!.id, POSTS_PER_PAGE, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === POSTS_PER_PAGE ? allPages.length * POSTS_PER_PAGE : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData, // keep previous data while fetching
    enabled: !!userProfile?.id,
  });
};