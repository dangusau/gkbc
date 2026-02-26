import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useState } from 'react';

export interface AdminUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  user_status: string;
  role: string | null;
  created_at: string;
  last_seen: string | null;
}

export interface UserDetails {
  posts_count: number;
  comments_count: number;
  likes_given: number;
  connections_count: number;
  marketplace_listings_count: number;
  marketplace_favorites_count: number;
  marketplace_reviews_given: number;
  marketplace_reviews_received: number;
  businesses_count: number;
  business_reviews_given: number;
  business_reviews_received: number;
  jobs_count: number;
  events_count: number;
  event_rsvps_count: number;
  support_tickets_count: number;
  conversations_count: number;
  messages_sent: number;
  messages_received: number;
}

interface UseAdminUsersProps {
  search?: string;
  userStatus?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export const useAdminUsers = ({ search = '', userStatus = '', role = '', page = 0, limit = 20 }: UseAdminUsersProps = {}) => {
  const queryClient = useQueryClient();
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Fetch users list
  const usersQuery = useQuery({
    queryKey: ['admin', 'users', search, userStatus, role, page, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_users_for_admin', {
        p_search: search || null,
        p_user_status: userStatus || null,
        p_role: role || null,
        p_limit: limit,
        p_offset: page * limit,
      });
      if (error) throw error;
      return data as { users: AdminUser[]; total_count: number };
    },
    placeholderData: (previousData) => previousData,
  });

  // Fetch user details when expanded
  const userDetailsQuery = useQuery({
    queryKey: ['admin', 'userDetails', expandedUserId],
    queryFn: async () => {
      if (!expandedUserId) return null;
      const { data, error } = await supabase.rpc('get_user_details', { p_user_id: expandedUserId });
      if (error) throw error;
      return data as UserDetails;
    },
    enabled: !!expandedUserId,
  });

  // Mutations
  const verifyUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('verify_user', { p_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const unverifyUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('unverify_user', { p_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('delete_user', { p_user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      if (expandedUserId) setExpandedUserId(null);
    },
  });

  return {
    users: usersQuery.data?.users ?? [],
    totalCount: usersQuery.data?.total_count ?? 0,
    isLoading: usersQuery.isLoading,
    isFetching: usersQuery.isFetching,
    error: usersQuery.error,
    expandedUserId,
    setExpandedUserId,
    userDetails: userDetailsQuery.data,
    isLoadingDetails: userDetailsQuery.isLoading,
    verifyUser,
    unverifyUser,
    deleteUser,
  };
};