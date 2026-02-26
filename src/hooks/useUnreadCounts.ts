import { useQuery } from '@tanstack/react-query';
import { messagingService } from '../services/supabase/messaging';
import { messagingKeys } from './queryKeys';
import { useAuth } from '../contexts/AuthContext';

export const useUnreadCounts = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: messagingKeys.unreadCounts(userId),
    queryFn: () => messagingService.getUnreadCounts(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
};