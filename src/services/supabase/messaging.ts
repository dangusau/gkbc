import { supabase } from '../supabase';
import type { Conversation, Message, UnreadCounts } from '../../types/index';

// Helper: compress image (standalone, not part of the service object)
async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

export const messagingService = {
  // ==================== CONVERSATIONS ====================
  async getConversations(userId: string, context?: string): Promise<Conversation[]> {
    const { data, error } = await supabase.rpc('get_user_conversations', {
      p_user_id: userId,
      p_context: context || null,
    });
    if (error) {
      console.error('RPC error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }
    // Map the result to include 'id' as an alias for 'conversation_id'
    return (data || []).map((item: any) => ({
      ...item,
      id: item.conversation_id, // this is the missing field
    }));
  },

  async getOrCreateConversation(
    userId: string,
    otherUserId: string,
    context: 'connection' | 'marketplace',
    listingId?: string
  ): Promise<string> {
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      p_user1_id: userId,
      p_user2_id: otherUserId,
      p_context: context,
      p_listing_id: listingId || null,
    });
    if (error) throw error;
    return data;
  },

  async searchVerifiedUsers(query: string, currentUserId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, user_status')
      .neq('id', currentUserId)
      .eq('user_status', 'verified')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .order('first_name')
      .limit(20);
    if (error) throw error;
    return data || [];
  },

  async areUsersConnected(userId1: string, userId2: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('connections')
      .select('status')
      .or(`and(user_id.eq.${userId1},connected_user_id.eq.${userId2}),and(user_id.eq.${userId2},connected_user_id.eq.${userId1})`)
      .eq('status', 'connected')
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },

  async getConnectedVerifiedUsers(): Promise<Array<{ id: string; username: string; avatar_url: string | null }>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.rpc('get_connected_verified_users', { p_user_id: user.id });
    if (error) throw error;
    return data || [];
  },

  // ==================== CONNECTION REQUESTS ====================
  async sendConnectionRequest(otherUserId: string): Promise<{ id: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.rpc('send_connection_request', {
      p_connected_user_id: otherUserId,
    });
    if (error) throw error;
    return data;
  },

  // ==================== MESSAGES ====================
  async getMessages(
    conversationId: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    console.log('🔍 getMessages called with:', { conversationId, limit, offset });
    try {
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        p_conversation_id: conversationId,
        p_limit: limit,
        p_offset: offset,
      });
      if (error) {
        console.error('❌ RPC error in getMessages:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }
      console.log('✅ getMessages success, data length:', data?.length);
      // The RPC returns newest first; we reverse to show oldest first in UI
      return (data || []).reverse();
    } catch (err) {
      console.error('❌ Unexpected error in getMessages:', err);
      throw err;
    }
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: Message['type'] = 'text',
    listingId?: string,
    mediaUrl?: string
  ): Promise<string> {
    const { data, error } = await supabase.rpc('send_message', {
      p_conversation_id: conversationId,
      p_sender_id: senderId,
      p_content: content,
      p_type: type,
      p_listing_id: listingId || null,
      p_media_url: mediaUrl || null,
    });
    if (error) throw error;
    return data;
  },

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    console.log('🔍 markMessagesAsRead called with:', { conversationId, userId });
    try {
      const { error } = await supabase.rpc('mark_messages_as_read', {
        p_conversation_id: conversationId,
        p_user_id: userId,
      });
      if (error) {
        console.error('❌ RPC error in markMessagesAsRead:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }
      console.log('✅ markMessagesAsRead success');
    } catch (err) {
      console.error('❌ Unexpected error in markMessagesAsRead:', err);
      throw err;
    }
  },

  // ==================== UNREAD COUNTS ====================
  async getUnreadCounts(userId: string): Promise<UnreadCounts> {
    const { data, error } = await supabase.rpc('get_unread_counts', { p_user_id: userId });
    if (error) throw error;
    const row = data?.[0] || { total_unread: 0, marketplace_unread: 0, connection_unread: 0 };
    return {
      total: row.total_unread,
      marketplace: row.marketplace_unread,
      connection: row.connection_unread,
    };
  },

  // ==================== CONNECTION CHAT VALIDATION ====================
  async canStartConnectionChat(userId: string, otherUserId: string): Promise<{ canStart: boolean; reason?: string }> {
    const { data, error } = await supabase.rpc('can_start_connection_chat', {
      p_user_id: userId,
      p_other_user_id: otherUserId,
    });
    if (error) throw error;
    return data;
  },

  // ==================== ONLINE PRESENCE ====================
  async updateLastSeen(userId: string): Promise<void> {
    const { error } = await supabase.rpc('update_last_seen', { p_user_id: userId });
    if (error) console.error('Failed to update last seen', error);
  },

  async getUserLastSeen(userId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_user_last_seen', { p_user_id: userId });
  if (error) throw error;
  return data;
},

  // ==================== MEDIA UPLOAD ====================
  async uploadMedia(conversationId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${conversationId}/${Date.now()}.${fileExt}`;
    const filePath = `chat-media/${fileName}`;

    // Compress image if needed
    let processedFile = file;
    if (file.type.startsWith('image/')) {
      processedFile = await compressImage(file);
    }

    const { error } = await supabase.storage
      .from('chat-media')
      .upload(filePath, processedFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from('chat-media').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  },
};