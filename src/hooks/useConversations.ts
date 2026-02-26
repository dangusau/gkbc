import { useQuery } from '@tanstack/react-query';
import { messagingService } from '../services/supabase/messaging';
import { messagingKeys } from './queryKeys';
import { useAuth } from '../contexts/AuthContext';

export const useConversations = (context?: string) => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: messagingKeys.conversations(userId, context),
    queryFn: () => messagingService.getConversations(userId!, context),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};