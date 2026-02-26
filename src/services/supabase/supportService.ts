import { supabase } from '../supabase';
import type { SupportTicket, SupportReply, SubmitTicketData } from '../../types/index';

export const supportService = {
  // Get all tickets for current user
  async getUserTickets(): Promise<SupportTicket[]> {
    const { data, error } = await supabase.rpc('get_user_support_tickets');
    if (error) throw error;
    return data || [];
  },

  // Get replies for a specific ticket
  async getTicketReplies(ticketId: string): Promise<SupportReply[]> {
    const { data, error } = await supabase.rpc('get_ticket_replies', { p_ticket_id: ticketId });
    if (error) throw error;
    return data || [];
  },

  // Submit a new ticket
  async submitTicket(ticketData: SubmitTicketData): Promise<SupportTicket> {
    const { data, error } = await supabase.rpc('submit_support_ticket', {
      p_subject: ticketData.subject,
      p_message: ticketData.message,
      p_category: ticketData.category || 'general',
      p_priority: ticketData.priority || 'normal',
    });
    if (error) throw error;
    return data;
  },

  // Add a reply to a ticket
  async addReply(ticketId: string, message: string): Promise<SupportReply> {
    const { data, error } = await supabase.rpc('add_ticket_reply', {
      p_ticket_id: ticketId,
      p_message: message,
    });
    if (error) throw error;
    return data;
  },

  // Close a ticket
  async closeTicket(ticketId: string): Promise<void> {
    const { error } = await supabase.rpc('close_ticket', { p_ticket_id: ticketId });
    if (error) throw error;
  },

  // Optional: get a single ticket (if needed)
  async getTicketById(ticketId: string): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();
    if (error) throw error;
    return data;
  },
};