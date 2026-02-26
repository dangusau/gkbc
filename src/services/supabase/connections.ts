import { supabase } from '../supabase'; // adjust path as needed

export interface ConnectionRequest {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  sender_email: string;
  status: string;
  created_at: string;
}

export interface Friend {
  user_id: string;
  user_name: string;
  user_avatar: string;
  user_email: string;
  connected_at: string;
  user_status: 'verified' | 'member';
}

export interface SentRequest {
  id: string;
  connected_user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string;
  created_at: string;
}

export interface ConnectionStatus {
  exists: boolean;
  status?: string;
  isSender?: boolean;
}

export const connectionsService = {
  // Member functions
  async getMembers(
    search?: string,
    businessType?: string,
    marketArea?: string,
    page = 0,
    limit = 20
  ): Promise<any[]> {
    const offset = page * limit;
    try {
      const { data, error } = await supabase.rpc('get_member_directory', {
        p_search: search || null,
        p_business_type: businessType || null,
        p_market_area: marketArea || null,
        p_limit: limit,
        p_offset: offset,
      });
      if (error) throw error;
      return data || [];
    } catch {
      throw new Error('Failed to load members');
    }
  },

  async getMemberById(userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  },

  async searchMembers(query: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,business_name.ilike.%${query}%`)
        .limit(50);
      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  // Connection functions
  async getReceivedRequests(): Promise<ConnectionRequest[]> {
    const { data, error } = await supabase.rpc('get_received_connection_requests');
    if (error) throw error;
    return data || [];
  },

  async getSentRequests(): Promise<SentRequest[]> {
    const { data, error } = await supabase.rpc('get_sent_connection_requests');
    if (error) throw error;
    return data || [];
  },

  async getFriends(): Promise<Friend[]> {
    const { data, error } = await supabase.rpc('get_friends_list');
    if (error) throw error;
    return data || [];
  },

  // NEW: Get another user's friends list
  async getFriendsList(userId: string): Promise<Friend[]> {
    const { data, error } = await supabase.rpc('get_user_friends', { p_user_id: userId });
    if (error) throw error;
    return data || [];
  },

  async acceptRequest(requestId: string): Promise<void> {
    const { error } = await supabase.rpc('accept_connection_request', {
      p_request_id: requestId,
    });
    if (error) throw error;
  },

  async rejectRequest(requestId: string): Promise<void> {
    const { error } = await supabase.rpc('reject_connection_request', {
      p_request_id: requestId,
    });
    if (error) throw error;
  },

  async withdrawRequest(requestId: string): Promise<void> {
    const { error } = await supabase.rpc('withdraw_connection_request', {
      p_request_id: requestId,
    });
    if (error) throw error;
  },

  async removeConnection(otherUserId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_connection', {
    p_other_user_id: otherUserId,
  });
  if (error) throw error;
},

  async getConnectionStatus(otherUserId: string): Promise<string> {
    const { data, error } = await supabase.rpc('get_connection_status', {
      p_other_user_id: otherUserId,
    });
    if (error) return 'not_connected';
    return data || 'not_connected';
  },

  async checkConnection(userId: string): Promise<ConnectionStatus> {
    try {
      const { data, error } = await supabase.rpc('check_connection_exists', {
        p_other_user_id: userId,
      });
      if (error) throw error;
      return data || { exists: false };
    } catch {
      return { exists: false };
    }
  },

  async sendConnectionRequest(userId: string): Promise<{ id: string }> {
    try {
      const { data, error } = await supabase.rpc('send_connection_request', {
        p_connected_user_id: userId,
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send connection request');
    }
  },
};