import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useState } from 'react';

export interface AdminUser {
  id: string; // admins table id
  profile_id: string;
  created_at: string;
  created_by: string | null;
  permissions: any;
  profile: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
    user_status: string;
  };
  creator: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export interface NonAdminUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  user_status: string;
}

export const useAdminManagement = () => {
  const queryClient = useQueryClient();

  // Fetch current admins
  const adminsQuery = useQuery({
    queryKey: ['admin', 'admins'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admins');
      if (error) throw error;
      return data as AdminUser[];
    },
  });

  // Fetch non‑admin users (for promotion) – you can add pagination later
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const limit = 20;

  const nonAdminQuery = useQuery({
    queryKey: ['admin', 'nonAdminUsers', search, page, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_non_admin_users', {
        p_search: search || null,
        p_limit: limit,
        p_offset: page * limit,
      });
      if (error) throw error;
      return data as { users: NonAdminUser[]; total_count: number };
    },
    placeholderData: (previousData) => previousData,
  });

  // Mutations
  const addAdmin = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase.rpc('add_admin', { target_profile_id: profileId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'nonAdminUsers'] });
    },
  });

  const removeAdmin = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase.rpc('remove_admin', { target_profile_id: profileId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'nonAdminUsers'] });
    },
  });

  return {
    admins: adminsQuery.data ?? [],
    isLoadingAdmins: adminsQuery.isLoading,
    adminsError: adminsQuery.error,
    nonAdminUsers: nonAdminQuery.data?.users ?? [],
    nonAdminTotal: nonAdminQuery.data?.total_count ?? 0,
    isLoadingNonAdmin: nonAdminQuery.isLoading,
    nonAdminError: nonAdminQuery.error,
    searchNonAdmin: setSearch,
    pageNonAdmin: page,
    setPageNonAdmin: setPage,
    addAdmin,
    removeAdmin,
  };
};