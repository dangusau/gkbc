import { useQuery } from '@tanstack/react-query';
import { messagingService } from '../services/supabase/messaging';

export const useUserLastSeen = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userLastSeen', userId],
    queryFn: () => messagingService.getUserLastSeen(userId!),
    enabled: !!userId,
    refetchInterval: 30000, // refetch every 30 seconds to update status
    staleTime: 10000,        // consider data stale after 10 seconds
  });
};