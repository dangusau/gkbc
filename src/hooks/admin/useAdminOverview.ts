import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';

export type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';
export type UserType = 'all' | 'verified' | 'members';

export interface OverviewStats {
  overall: {
    users: { current: number; previous: number | null };
    verified_users: { current: number; previous: number | null };
    connections: { current: number; previous: number | null };
    posts: { current: number; previous: number | null };
    comments: { current: number; previous: number | null };
    likes: { current: number; previous: number | null };
    marketplace_listings: { current: number; previous: number | null };
    marketplace_favorites: { current: number; previous: number | null };
    marketplace_reviews: { current: number; previous: number | null; average_rating: number };
    businesses: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
      current: number;
      previous: number | null;
    };
    business_reviews: { current: number; previous: number | null; average_rating: number };
    jobs: { current: number; previous: number | null; verified: number };
    events: { current: number; previous: number | null };
    event_rsvps: { current: number; previous: number | null };
    support_tickets: { total: number; open: number; closed: number; current: number; previous: number | null };
    announcements: { current: number; previous: number | null };
    conversations: { current: number; previous: number | null };
    messages: { current: number; previous: number | null };
  };
  trends: Array<{
    period: string;
    new_users: number;
    new_posts: number;
    new_marketplace_listings: number;
  }>;
}

export const useAdminOverview = (userType: UserType, timeRange: TimeRange) => {
  return useQuery({
    queryKey: ['admin', 'overview', userType, timeRange],
    queryFn: async (): Promise<OverviewStats> => {
      const { data, error } = await supabase.rpc('get_admin_overview', {
        p_user_type: userType,
        p_time_range: timeRange,
      });
      if (error) throw error;
      return data as OverviewStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
};