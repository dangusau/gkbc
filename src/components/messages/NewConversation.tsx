import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserCheck, UserPlus, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { messagingService } from '../../services/supabase/messaging';
import { supabase } from '../../services/supabase';
import VerifiedBadge from '../VerifiedBadge';
import { useQueryClient } from '@tanstack/react-query';
import { messagingKeys } from '../../hooks/queryKeys';

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  status: 'verified' | 'member';
  connection_status?: 'connected' | 'pending' | null;
}

const NewConversation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'connections' | 'discover'>('connections');
  const [userStatus, setUserStatus] = useState<'verified' | 'member' | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [connectionStatusMap, setConnectionStatusMap] = useState<Map<string, 'connected' | 'pending'>>(new Map());

  // Fetch user status and redirect members
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const { data } = await supabase
          .from('profiles')
          .select('user_status')
          .eq('id', user.id)
          .single();
        if (data) {
          const status = data.user_status as 'verified' | 'member';
          setUserStatus(status);
          if (status === 'member') {
            navigate('/marketplace');
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, [user, navigate]);

  // Fetch all connections (both directions) to know who is connected or pending
  useEffect(() => {
    if (!user || userStatus !== 'verified') return;

    const fetchConnections = async () => {
      const { data, error } = await supabase
        .from('connections')
        .select('user_id, connected_user_id, status')
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

      if (error) {
        console.error('Error fetching connections:', error);
        return;
      }

      const map = new Map<string, 'connected' | 'pending'>();
      data.forEach((conn: any) => {
        const otherId = conn.user_id === user.id ? conn.connected_user_id : conn.user_id;
        if (conn.status === 'connected' || conn.status === 'pending') {
          map.set(otherId, conn.status);
        }
      });
      setConnectionStatusMap(map);
    };

    fetchConnections();
  }, [user, userStatus]);

  useEffect(() => {
    if (userStatus === 'verified') {
      loadConnections();
    }
  }, [userStatus, connectionStatusMap]);

  useEffect(() => {
    if (activeTab === 'discover' && searchQuery.trim() && userStatus === 'verified') {
      const delay = setTimeout(() => searchUsers(), 300);
      return () => clearTimeout(delay);
    } else if (activeTab === 'discover' && !searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery, activeTab, userStatus]);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const data = await messagingService.getConnectedVerifiedUsers();
      // Map connection status from the map
      const enriched = data.map(u => ({
        ...u,
        status: 'verified' as const,
        connection_status: connectionStatusMap.get(u.id) || null,
      }));
      setConnections(enriched);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return;
    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('user_status', 'verified')
        .neq('id', user.id)
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
        .limit(20);
      if (error) throw error;
      const results = (data || []).map(p => ({
        id: p.id,
        username: `${p.first_name} ${p.last_name}`.trim(),
        avatar_url: p.avatar_url,
        status: 'verified' as const,
        connection_status: connectionStatusMap.get(p.id) || null,
      }));
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  // Mutation for sending connection request
  const sendConnectionRequest = async (otherUserId: string) => {
    try {
      await messagingService.sendConnectionRequest(otherUserId);
      // Optimistically update local status
      setConnectionStatusMap(prev => new Map(prev).set(otherUserId, 'pending'));
      // Also update connections list if the user appears there
      setConnections(prev =>
        prev.map(u => (u.id === otherUserId ? { ...u, connection_status: 'pending' } : u))
      );
      setSearchResults(prev =>
        prev.map(u => (u.id === otherUserId ? { ...u, connection_status: 'pending' } : u))
      );
      // Invalidate relevant queries (e.g., conversations might be affected later)
      queryClient.invalidateQueries({ queryKey: messagingKeys.all });
    } catch (error: any) {
      console.error('Failed to send connection request:', error);
      alert(error.message || 'Failed to send request');
    }
  };

  const handleStartConversation = async (otherUserId: string) => {
    if (!user || userStatus !== 'verified') return;
    try {
      const validation = await messagingService.canStartConnectionChat(user.id, otherUserId);
      if (!validation || !validation.canStart) {
        alert(validation?.reason || 'Cannot start conversation');
        return;
      }
      const conversationId = await messagingService.getOrCreateConversation(user.id, otherUserId, 'connection');
      const otherUser = (activeTab === 'connections' ? connections : searchResults).find(u => u.id === otherUserId);
      navigate(`/messages/${conversationId}`, {
        state: {
          otherUser: {
            id: otherUserId,
            name: otherUser?.username,
            avatar: otherUser?.avatar_url,
            status: 'verified',
          },
          context: 'connection',
        },
      });
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      alert(error.message || 'Failed to start conversation');
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (userStatus !== 'verified') return null;

  const displayedUsers = activeTab === 'connections' ? connections : searchResults;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b z-10 p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">New Conversation</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'connections' ? 'Search connections...' : 'Search verified users...'}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
          />
        </div>
      </div>

      <div className="border-b bg-white">
        <div className="flex px-4">
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex-1 py-3 border-b-2 transition-colors ${
              activeTab === 'connections'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span className="font-medium">Connections</span>
              {connections.length > 0 && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  {connections.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-3 border-b-2 transition-colors ${
              activeTab === 'discover'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              <span className="font-medium">Discover</span>
            </div>
          </button>
        </div>
      </div>

      <div className="p-4">
        {loading && activeTab === 'connections' ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searching ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-600">Searching...</p>
          </div>
        ) : displayedUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {activeTab === 'connections' ? (
                <UserCheck className="w-8 h-8 text-gray-400" />
              ) : (
                <Search className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {activeTab === 'connections'
                ? 'No verified connections yet'
                : searchQuery
                ? 'No users found'
                : 'Search for verified users'}
            </h3>
            <p className="text-gray-600 text-sm">
              {activeTab === 'connections'
                ? 'Connect with verified members to start chatting'
                : 'Try searching by name'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedUsers.map((u) => (
              <div key={u.id} className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  {/* Left side: Avatar and name with badges */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar with verification badge outside the frame */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-green-600">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                            {u.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {/* Verification badge on avatar (outside frame) */}
                      <div className="absolute -bottom-1 -right-1 z-10">
                        <VerifiedBadge size={12} />
                      </div>
                    </div>

                    {/* Name with verification badge and status */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="font-bold text-gray-900 truncate">{u.username}</h3>
                        {/* Badge next to name */}
                        <VerifiedBadge size={12} />
                      </div>
                      <p className="text-xs text-gray-500">
                        {u.connection_status === 'connected'
                          ? 'Connected'
                          : u.connection_status === 'pending'
                          ? 'Request Pending'
                          : 'Not connected'}
                      </p>
                    </div>
                  </div>

                  {/* Right side: Action button */}
                  <div className="flex-shrink-0 ml-2">
                    {u.connection_status === 'connected' ? (
                      <button
                        onClick={() => handleStartConversation(u.id)}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 whitespace-nowrap"
                      >
                        Message
                      </button>
                    ) : u.connection_status === 'pending' ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-100 text-gray-500 font-medium rounded-xl cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                      >
                        <Clock className="w-4 h-4" />
                        Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => sendConnectionRequest(u.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 whitespace-nowrap"
                      >
                        <UserPlus className="w-4 h-4" />
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewConversation;