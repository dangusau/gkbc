import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';

export interface VerificationRequest {
  id: string;
  user_id: string;
  receipt_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_notes: string | null;
  user_email: string;
  user_first_name: string | null;
  user_last_name: string | null;
  user_phone: string | null;
}

interface UseAdminVerificationRequestsProps {
  page?: number;
  limit?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'all';
}

export const useAdminVerificationRequests = ({
  page = 0,
  limit = 20,
  status = 'pending',
}: UseAdminVerificationRequestsProps = {}) => {
  const queryClient = useQueryClient();

  // Fetch requests using the RPC
  const requestsQuery = useQuery({
    queryKey: ['admin', 'verification-requests', page, limit, status],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_verification_requests', {
        p_limit: limit,
        p_offset: page * limit,
        p_status: status,
      });
      if (error) throw error;
      // data is an array of VerificationRequest with total_count
      const totalCount = data.length > 0 ? data[0].total_count : 0;
      return { data: data as VerificationRequest[], totalCount };
    },
    placeholderData: (previousData) => previousData,
  });

  // Update status (approve/reject) – we keep the direct update (no RPC needed)
  const updateStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status: 'approved' | 'rejected';
      adminNotes?: string;
    }) => {
      const { error } = await supabase
        .from('verified_user_requests')
        .update({ status, admin_notes: adminNotes })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verification-requests'] });
    },
  });

  // Optional: delete request (if needed)
  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('verified_user_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'verification-requests'] });
    },
  });

  return {
    requests: requestsQuery.data?.data ?? [],
    totalCount: requestsQuery.data?.totalCount ?? 0,
    isLoading: requestsQuery.isLoading,
    isFetching: requestsQuery.isFetching,
    error: requestsQuery.error,
    updateStatus,
    deleteRequest,
  };
};
