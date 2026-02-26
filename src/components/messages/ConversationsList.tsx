import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Store, Users, Search, Plus, RefreshCw, Bell, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useConversations } from '../../hooks/useConversations';
import { useUnreadCounts } from '../../hooks/useUnreadCounts';
import { formatTimeAgo } from '../../utils/formatters';
import VerifiedBadge from '../VerifiedBadge';
import { supabase } from '../../services/supabase';

const ConversationsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'network' | 'marketplace'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userStatus, setUserStatus] = useState<'verified' | 'member' | null>(null);

  // Fetch user status
  useEffect(() => {
    const getUserStatus = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('user_status')
          .eq('id', user.id)
          .single();
        if (data) {
          setUserStatus(data.user_status as 'verified' | 'member');
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
      }
    };
    getUserStatus();
  }, [user]);

  const { data: conversations = [], isLoading, refetch } = useConversations(
    activeTab === 'all' ? undefined : activeTab === 'network' ? 'connection' : 'marketplace'
  );
  const { data: unreadCounts } = useUnreadCounts();

  // Filter conversations for members: only show marketplace
  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    if (userStatus === 'member') {
      filtered = filtered.filter(c => c.context === 'marketplace');
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.other_user_name?.toLowerCase().includes(query) ||
        conv.listing_title?.toLowerCase().includes(query) ||
        conv.last_message?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [conversations, searchQuery, userStatus]);

  const handleConversationClick = (conversation: any) => {
    navigate(`/messages/${conversation.id}`, {
      state: {
        otherUser: {
          id: conversation.other_user_id,
          name: conversation.other_user_name,
          avatar: conversation.other_user_avatar,
          status: conversation.other_user_status,
        },
        context: conversation.context,
        listing: conversation.listing_id ? {
          id: conversation.listing_id,
          title: conversation.listing_title,
        } : null,
      },
    });
  };

  const handleNewConversation = () => {
    // Verified users go to /messages/new, members go to marketplace
    if (userStatus === 'verified') {
      navigate('/messages/new');
    } else {
      navigate('/marketplace');
    }
  };

  const getUnreadForTab = (tab: string) => {
    if (!unreadCounts) return 0;
    if (tab === 'all') return unreadCounts.total;
    if (tab === 'network') return unreadCounts.connection;
    return unreadCounts.marketplace;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white border-b p-4">
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse mb-4"></div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="border-b bg-white p-4">
          <div className="flex space-x-4">
            {[1,2,3].map(i => <div key={i} className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>)}
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            {unreadCounts?.total ? (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCounts.total}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-gray-100 rounded-xl"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[116px] bg-white border-b z-10">
        <div className="flex px-4 space-x-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 py-3 border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-green-600'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">All</span>
            {getUnreadForTab('all') > 0 && (
              <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                {getUnreadForTab('all')}
              </span>
            )}
          </button>

          {/* Network tab only for verified users */}
          {userStatus === 'verified' && (
            <button
              onClick={() => setActiveTab('network')}
              className={`flex items-center gap-2 py-3 border-b-2 transition-colors ${
                activeTab === 'network'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-green-600'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">Network</span>
              {getUnreadForTab('network') > 0 && (
                <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                  {getUnreadForTab('network')}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center gap-2 py-3 border-b-2 transition-colors ${
              activeTab === 'marketplace'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-green-600'
            }`}
          >
            <Store className="w-4 h-4" />
            <span className="font-medium">Marketplace</span>
            {getUnreadForTab('marketplace') > 0 && (
              <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                {getUnreadForTab('marketplace')}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="p-4">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {activeTab === 'network' ? (
                <Users className="w-8 h-8 text-gray-400" />
              ) : activeTab === 'marketplace' ? (
                <Store className="w-8 h-8 text-gray-400" />
              ) : (
                <MessageCircle className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {searchQuery ? 'No matches found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              {searchQuery
                ? 'Try a different search term'
                : activeTab === 'network'
                ? 'Connect with verified members to start chatting'
                : activeTab === 'marketplace'
                ? 'Start a conversation about a product'
                : 'Start a conversation with someone'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleNewConversation}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                {activeTab === 'marketplace' ? 'Browse Marketplace' : 'New Conversation'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleConversationClick(conv)}
                className="w-full bg-white rounded-xl p-4 hover:shadow-md transition-shadow border text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-green-600">
                      {conv.other_user_avatar ? (
                        <img
                          src={conv.other_user_avatar}
                          alt={conv.other_user_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                          {conv.other_user_name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {conv.other_user_status === 'verified' && (
                      <div className="absolute -bottom-1 -right-1">
                        <VerifiedBadge size={14} />
                      </div>
                    )}
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {conv.unread_count > 9 ? '9+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1">
                    <h3 className="font-bold text-gray-900 truncate">
                      {conv.other_user_name}
                    </h3>
                    {conv.other_user_status === 'verified' && <VerifiedBadge size={12} />}
                    </div>
                      {conv.context === 'marketplace' && (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                          <Store className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    {conv.context === 'marketplace' && conv.listing_title && (
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {conv.listing_title}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 truncate">
                      {conv.last_message || 'Start a conversation...'}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(conv.last_message_at)}</span>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="text-xs font-medium text-green-600">
                          {conv.unread_count} new
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Conversation FAB - hidden for members */}
      {userStatus === 'verified' && (
        <button
          onClick={handleNewConversation}
          className="fixed bottom-20 right-4 bg-green-600 text-white p-4 rounded-full shadow-xl hover:bg-green-700 transition-colors"
          aria-label="New conversation"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ConversationsList;