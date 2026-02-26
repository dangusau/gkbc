import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useState } from 'react';

export interface Business {
  id: string;
  name: string;
  description: string;
  business_type: string;
  category: string;
  location_axis: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  banner_url: string | null;
  is_registered: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  average_rating: number;
  review_count: number;
  created_at: string;
  rejection_reason: string | null;
  owner: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export interface BusinessDetails {
  reviews_count: number;
  average_rating: number;
}

interface UseAdminBusinessesProps {
  search?: string;
  verificationStatus?: string;
  businessType?: string;
  page?: number;
  limit?: number;
}

export const useAdminBusinesses = ({
  search = '',
  verificationStatus = '',
  businessType = '',
  page = 0,
  limit = 20,
}: UseAdminBusinessesProps = {}) => {
  const queryClient = useQueryClient();
  const [expandedBusinessId, setExpandedBusinessId] = useState<string | null>(null);

  // Fetch businesses list
  const businessesQuery = useQuery({
    queryKey: ['admin', 'businesses', search, verificationStatus, businessType, page, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_businesses_for_admin', {
        p_search: search || null,
        p_verification_status: verificationStatus || null,
        p_business_type: businessType || null,
        p_limit: limit,
        p_offset: page * limit,
      });
      if (error) throw error;
      return data as { businesses: Business[]; total_count: number };
    },
    placeholderData: (previousData) => previousData,
  });

  // Fetch business details when expanded
  const businessDetailsQuery = useQuery({
    queryKey: ['admin', 'businessDetails', expandedBusinessId],
    queryFn: async () => {
      if (!expandedBusinessId) return null;
      const { data, error } = await supabase.rpc('get_business_details', { p_business_id: expandedBusinessId });
      if (error) throw error;
      return data as BusinessDetails;
    },
    enabled: !!expandedBusinessId,
  });

  // Mutations – fixed: add await
  const approveBusiness = useMutation({
    mutationFn: async (businessId: string) => {
      const { error } = await supabase.rpc('approve_business', { p_business_id: businessId });
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'businesses'] });
    },
  });

  const rejectBusiness = useMutation({
    mutationFn: async ({ businessId, reason }: { businessId: string; reason?: string }) => {
      const { error } = await supabase.rpc('reject_business', { p_business_id: businessId, p_rejection_reason: reason });
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'businesses'] });
    },
  });

  const deleteBusiness = useMutation({
    mutationFn: async (businessId: string) => {
      const { error } = await supabase.rpc('delete_business', { p_business_id: businessId });
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'businesses'] });
      if (expandedBusinessId) setExpandedBusinessId(null);
    },
  });

  return {
    businesses: businessesQuery.data?.businesses ?? [],
    totalCount: businessesQuery.data?.total_count ?? 0,
    isLoading: businessesQuery.isLoading,
    isFetching: businessesQuery.isFetching,
    error: businessesQuery.error,
    expandedBusinessId,
    setExpandedBusinessId,
    businessDetails: businessDetailsQuery.data,
    isLoadingDetails: businessDetailsQuery.isLoading,
    approveBusiness,
    rejectBusiness,
    deleteBusiness,
  };
};