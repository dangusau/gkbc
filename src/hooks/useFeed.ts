import { useInfiniteQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { feedService } from '../services/supabase/feed';
import { feedKeys } from './queryKeys';
import { useAuth } from '../contexts/AuthContext';
import type { Post } from '../types';

const POSTS_PER_PAGE = 10;

export const useFeed = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  const feedQuery = useInfiniteQuery({
    queryKey: feedKeys.lists(),
    queryFn: ({ pageParam = 0 }) =>
      feedService.getHomeFeed(userProfile!.id, POSTS_PER_PAGE, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === POSTS_PER_PAGE ? allPages.length * POSTS_PER_PAGE : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    enabled: !!userProfile?.id,
  });

  // ✅ NEW: Shadow cache mutation for likes (prevents post re-sorting)
  const updatePostLikeShadow = useMutation({
    mutationFn: ({ postId, userId }: { postId: string; userId: string }) =>
      feedService.toggleLike(postId, userId),
    onMutate: async ({ postId, userId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: feedKeys.lists() });

      // Get previous data
      const previousData = queryClient.getQueryData(feedKeys.lists());

      // Update shadow cache - modify in place, don't reorder
      queryClient.setQueryData(feedKeys.lists(), (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: Post[]) =>
            page.map((post) => {
              if (post.id === postId) {
                const isLiking = !post.has_liked;
                return {
                  ...post,
                  has_liked: isLiking,
                  likes_count: isLiking ? post.likes_count + 1 : post.likes_count - 1,
                };
              }
              return post;
            })
          ),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Revert to previous data on error
      if (context?.previousData) {
        queryClient.setQueryData(feedKeys.lists(), context.previousData);
      }
    },
    onSettled: () => {
      // ✅ KEY: Silently refetch in background without showing loading state
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
    },
  });

  // ✅ NEW: Shadow cache mutation for new posts (appears at top immediately)
  const addNewPostShadow = useMutation({
    mutationFn: ({
      userId,
      content,
      mediaUrls,
      mediaType,
      tags,
      author,
    }: {
      userId: string;
      content: string;
      mediaUrls: string[];
      mediaType: 'text' | 'image' | 'video' | 'gallery';
      tags: string[];
      author: any;
    }) => feedService.createPost(userId, content, mediaUrls, mediaType, tags),
    onMutate: async ({ userId, content, mediaUrls, mediaType, tags, author }) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.lists() });
      const previousData = queryClient.getQueryData(feedKeys.lists());

      // Create shadow post immediately
      const shadowPost: Post = {
        id: `shadow-${Date.now()}`,
        author_id: userId,
        author_name: author.name,
        author_avatar: author.avatar || '',
        author_first_name: author.first_name,
        author_last_name: author.last_name,
        author_verified: author.verified || false,
        content,
        media_urls: mediaUrls,
        media_type: mediaType,
        location: null,
        tags,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        has_liked: false,
        has_shared: false,
        first_liker_name: null,
        first_liker_avatar: null,
      };

      // Add shadow post to the top of first page
      queryClient.setQueryData(feedKeys.lists(), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: [
            [shadowPost, ...old.pages[0]],
            ...old.pages.slice(1),
          ],
        };
      });

      return { previousData, shadowPostId: shadowPost.id };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(feedKeys.lists(), context.previousData);
      }
    },
    onSettled: () => {
      // ✅ Refetch to replace shadow post with real post
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
    },
  });

  return {
    ...feedQuery,
    // ✅ NEW: Export the mutation for PostCard to use
    updatePostLikeShadow: (postId: string, userId: string) =>
      updatePostLikeShadow.mutateAsync({ postId, userId }),
    // ✅ NEW: Export the mutation for CreatePostModal to use
    addNewPostShadow: (userId: string, content: string, mediaUrls: string[], mediaType: 'text' | 'image' | 'video' | 'gallery', tags: string[], author: any) =>
      addNewPostShadow.mutateAsync({ userId, content, mediaUrls, mediaType, tags, author }),
    // ✅ NEW: Export mutation states
    isAddingPost: addNewPostShadow.isPending,
  };
};
