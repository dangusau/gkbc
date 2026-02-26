import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedService } from '../services/supabase/feed';
import { feedKeys } from './queryKeys';
import { useAuth } from '../contexts/AuthContext';

export const useLikeShare = (postsQueryKey = feedKeys.lists()) => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  const likeMutation = useMutation({
    mutationFn: (postId: string) => feedService.toggleLike(postId, userProfile!.id),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: postsQueryKey });

      const previousData = queryClient.getQueryData(postsQueryKey);

      // Optimistic update – handle both infinite and regular queries
      queryClient.setQueryData(postsQueryKey, (old: any) => {
        if (!old) return old;

        if (old.pages && Array.isArray(old.pages)) {
          return {
            ...old,
            pages: old.pages.map((page: any[]) =>
              page.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      has_liked: !post.has_liked,
                      likes_count: post.has_liked
                        ? post.likes_count - 1
                        : post.likes_count + 1,
                    }
                  : post
              )
            ),
          };
        }

        if (Array.isArray(old)) {
          return old.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  has_liked: !post.has_liked,
                  likes_count: post.has_liked
                    ? post.likes_count - 1
                    : post.likes_count + 1,
                }
              : post
          );
        }

        return old;
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(postsQueryKey, context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postsQueryKey });
    },
  });

  const shareMutation = useMutation({
    mutationFn: (postId: string) => feedService.sharePost(postId, userProfile!.id),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: postsQueryKey });

      const previousData = queryClient.getQueryData(postsQueryKey);

      queryClient.setQueryData(postsQueryKey, (old: any) => {
        if (!old) return old;

        if (old.pages && Array.isArray(old.pages)) {
          return {
            ...old,
            pages: old.pages.map((page: any[]) =>
              page.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      has_shared: !post.has_shared,
                      shares_count: post.has_shared
                        ? post.shares_count - 1
                        : post.shares_count + 1,
                    }
                  : post
              )
            ),
          };
        }

        if (Array.isArray(old)) {
          return old.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  has_shared: !post.has_shared,
                  shares_count: post.has_shared
                    ? post.shares_count - 1
                    : post.shares_count + 1,
                }
              : post
          );
        }

        return old;
      });

      return { previousData };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(postsQueryKey, context?.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postsQueryKey });
    },
  });

  return {
    toggleLike: likeMutation.mutateAsync,
    toggleShare: shareMutation.mutateAsync,
  };
};