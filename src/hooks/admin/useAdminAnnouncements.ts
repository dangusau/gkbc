import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience?: string; // 'all', 'verified', 'members'
  created_at: string;
  created_by: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface UseAdminAnnouncementsProps {
  page?: number;
  limit?: number;
}

export const useAdminAnnouncements = ({ page = 0, limit = 20 }: UseAdminAnnouncementsProps = {}) => {
  const queryClient = useQueryClient();

  // Fetch announcements list
  const announcementsQuery = useQuery({
    queryKey: ['admin', 'announcements', page, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_announcements_for_admin', {
        p_limit: limit,
        p_offset: page * limit,
      });
      if (error) throw error;
      return data as { announcements: Announcement[]; total_count: number };
    },
    placeholderData: (previousData) => previousData,
  });

  // Create announcement
  const createAnnouncement = useMutation({
    mutationFn: async ({ title, content, audience }: { title: string; content: string; audience: string }) => {
      const { error } = await supabase.rpc('create_announcement', {
        p_title: title,
        p_content: content,
        p_audience: audience,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
    },
  });

  // Delete announcement
  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('delete_announcement', { p_announcement_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
    },
  });

  return {
    announcements: announcementsQuery.data?.announcements ?? [],
    totalCount: announcementsQuery.data?.total_count ?? 0,
    isLoading: announcementsQuery.isLoading,
    isFetching: announcementsQuery.isFetching,
    error: announcementsQuery.error,
    createAnnouncement,
    deleteAnnouncement,
  };
};