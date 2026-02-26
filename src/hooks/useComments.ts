import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedService } from '../services/supabase/feed';
import { feedKeys } from './queryKeys';
import { useAuth } from '../contexts/AuthContext';

export const useComments = (
  postId: string,
  commentsQueryKey = feedKeys.comments(postId),
  postsQueryKey = feedKeys.lists()
) => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  const commentsQuery = useQuery({
    queryKey: commentsQueryKey,
    queryFn: () => feedService.getComments(postId),
    staleTime: 2 * 60 * 1000,
    enabled: !!postId,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) =>
      feedService.addComment(postId, userProfile!.id, content),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: commentsQueryKey });
      await queryClient.cancelQueries({ queryKey: postsQueryKey });

      const previousComments = queryClient.getQueryData(commentsQueryKey);
      const previousPosts = queryClient.getQueryData(postsQueryKey);

      // Optimistic comment
      const newComment = {
        id: `temp-${Date.now()}`,
        author_id: userProfile!.id,
        author_name: `${userProfile!.first_name || ''} ${userProfile!.last_name || ''}`.trim() || 'You',
        author_avatar: userProfile!.avatar_url || '',
        author_verified: userProfile?.user_status === 'verified',
        content,
        likes_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        has_liked: false,
      };

      queryClient.setQueryData(commentsQueryKey, (old: any[] = []) => [
        newComment,
        ...old,
      ]);

      // Optimistically increment comment count in posts – handle both infinite and regular queries
      queryClient.setQueryData(postsQueryKey, (old: any) => {
        if (!old) return old;

        // Handle infinite query structure (feed)
        if (old.pages && Array.isArray(old.pages)) {
          return {
            ...old,
            pages: old.pages.map((page: any[]) =>
              page.map((post) =>
                post.id === postId
                  ? { ...post, comments_count: post.comments_count + 1 }
                  : post
              )
            ),
          };
        }

        // Handle regular array (profile)
        if (Array.isArray(old)) {
          return old.map((post) =>
            post.id === postId
              ? { ...post, comments_count: post.comments_count + 1 }
              : post
          );
        }

        return old;
      });

      return { previousComments, previousPosts };
    },
    onError: (err, content, context) => {
      queryClient.setQueryData(commentsQueryKey, context?.previousComments);
      queryClient.setQueryData(postsQueryKey, context?.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
      queryClient.invalidateQueries({ queryKey: postsQueryKey });
    },
  });

  return {
    comments: commentsQuery.data ?? [],
    isLoading: commentsQuery.isLoading,
    addComment: addCommentMutation.mutateAsync,
  };
};