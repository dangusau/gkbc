import { useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingService } from '../services/supabase/messaging';
import { messagingKeys } from './queryKeys';
import { useAuth } from '../contexts/AuthContext';
import type { Message } from '../types/index';

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      content,
      type = 'text',
      listingId,
      mediaUrl,
    }: {
      content: string;
      type?: Message['type'];
      listingId?: string;
      mediaUrl?: string;
    }) => messagingService.sendMessage(conversationId, user!.id, content, type, listingId, mediaUrl),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: messagingKeys.messages(conversationId) });

      const previousMessages = queryClient.getQueryData(messagingKeys.messages(conversationId));

      // Optimistically add a temporary message
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user!.id,
        sender_name: user?.user_metadata?.full_name || 'You',
        sender_avatar: user?.user_metadata?.avatar_url,
        type: variables.type || 'text',  // Ensure type is never undefined
        content: variables.content,
        listing_id: variables.listingId,
        listing_title: null,
        media_url: variables.mediaUrl,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(messagingKeys.messages(conversationId), (old: any) => {
        if (!old) return { pages: [[tempMessage]], pageParams: [0] };
        return {
          ...old,
          pages: old.pages.map((page: Message[], index: number) =>
            index === 0 ? [tempMessage, ...page] : page
          ),
        };
      });

      return { previousMessages };
    },

    onError: (_err, _variables, context) => {
      queryClient.setQueryData(messagingKeys.messages(conversationId), context?.previousMessages);
    },

    onSettled: () => {
  queryClient.invalidateQueries({ queryKey: messagingKeys.messages(conversationId) });
  queryClient.invalidateQueries({ queryKey: messagingKeys.all }); // <-- changed
  queryClient.invalidateQueries({ queryKey: messagingKeys.unreadCounts() });
   },
  });
};