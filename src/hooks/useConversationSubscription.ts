import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { messagingKeys } from './queryKeys';
import type { Message } from '../types/index';

export const useConversationSubscription = (conversationId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          // Update messages cache
          queryClient.setQueryData(messagingKeys.messages(conversationId), (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: Message[], index: number) =>
                index === 0 ? [newMessage, ...page] : page
              ),
            };
          });

          // Invalidate conversations and unread counts to reflect changes
          queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
          queryClient.invalidateQueries({ queryKey: messagingKeys.unreadCounts() });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
};