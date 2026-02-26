import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { useState } from 'react';

export interface Ticket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  assigned_to: string | null;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  last_reply: {
    id: string;
    message: string;
    is_admin: boolean;
    created_at: string;
    user_name: string;
    avatar_url: string | null;
  } | null;
}

export interface Reply {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  attachments: string[] | null;
}

interface UseAdminTicketsProps {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useAdminTickets = ({
  status = '',
  category = '',
  priority = '',
  search = '',
  page = 0,
  limit = 20,
}: UseAdminTicketsProps = {}) => {
  const queryClient = useQueryClient();
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Fetch tickets list
  const ticketsQuery = useQuery({
    queryKey: ['admin', 'tickets', status, category, priority, search, page, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_support_tickets_for_admin', {
        p_status: status || null,
        p_category: category || null,
        p_priority: priority || null,
        p_search: search || null,
        p_limit: limit,
        p_offset: page * limit,
      });
      if (error) throw error;
      return data as { tickets: Ticket[]; total_count: number };
    },
    placeholderData: (previousData) => previousData,
  });

  // Fetch conversation when expanded
  const conversationQuery = useQuery({
    queryKey: ['admin', 'ticketConversation', expandedTicketId],
    queryFn: async () => {
      if (!expandedTicketId) return [];
      const { data, error } = await supabase.rpc('get_ticket_conversation', { p_ticket_id: expandedTicketId });
      if (error) throw error;
      return data as Reply[];
    },
    enabled: !!expandedTicketId,
  });

  // Mutations
  const replyToTicket = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const { error } = await supabase.rpc('reply_to_ticket', { p_ticket_id: ticketId, p_message: message });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'ticketConversation', variables.ticketId] });
      setReplyText('');
    },
  });

  const closeTicket = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase.rpc('close_ticket', { p_ticket_id: ticketId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      if (expandedTicketId) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'ticketConversation', expandedTicketId] });
      }
    },
  });

  const deleteTicket = useMutation({
    mutationFn: async (ticketId: string) => {
      const { error } = await supabase.rpc('delete_ticket', { p_ticket_id: ticketId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tickets'] });
      if (expandedTicketId) setExpandedTicketId(null);
    },
  });

  return {
    tickets: ticketsQuery.data?.tickets ?? [],
    totalCount: ticketsQuery.data?.total_count ?? 0,
    isLoading: ticketsQuery.isLoading,
    isFetching: ticketsQuery.isFetching,
    error: ticketsQuery.error,
    expandedTicketId,
    setExpandedTicketId,
    conversation: conversationQuery.data ?? [],
    isLoadingConversation: conversationQuery.isLoading,
    replyText,
    setReplyText,
    replyToTicket,
    closeTicket,
    deleteTicket,
  };
};