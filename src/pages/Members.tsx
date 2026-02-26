import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, UserPlus, Clock, Building, Map, Users, UserCheck, X, User } from 'lucide-react';
import { useConnectionsData } from '../hooks/useConnectionsData';
import { useConnectionMutations } from '../hooks/useConnectionMutations';
import { MemberCard } from '../components/members/MemberCard';
import { ConnectionsTab } from '../components/members/ConnectionsTab';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialogue';
import { FeedbackToast } from '../components/shared/FeedbackToast';
import { formatTimeAgo } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext'; // <-- import

const Members: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // <-- get current user

  useEffect(() => {
    console.log('📦 MembersPage MOUNTED');
    return () => console.log('🗑️ MembersPage UNMOUNTED');
  }, []);

  const [activeTab, setActiveTab] = useState<'all' | 'connections'>('all');
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [marketArea, setMarketArea] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirm, setConfirm] = useState<{
    isOpen: boolean;
    type: 'connect' | 'accept' | 'reject' | 'withdraw';
    userId?: string;
    requestId?: string;
    userName: string;
    callback: () => Promise<unknown>;
  } | null>(null);

  const marketAreas = useMemo(() => [
    'Central / Old City', 'Sabon Gari / Kantin Kwari', 'Farm Center / Beirut',
    'France Road', 'Zoo Road', 'Zaria Road', 'Dawanau', 'Sharada / Challawa',
    'Hotoro', 'Gyadi-Gyadi / Tarauni', 'Jigawa Road', 'Mariri / Sheka',
    'Bompai', 'Transport (Jigawa Line / Sabon Gari Park)', 'Others'
  ], []);

  const {
    receivedRequests,
    sentRequests,
    friends,
    membersPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useConnectionsData(search, businessType, marketArea);

  console.log('🖥️ Members render:', {
    isLoading,
    isFetching,
    membersPagesLength: membersPages.length,
    totalMembers: membersPages.flat().length,
    search,
    businessType,
    marketArea,
    activeTab,
    receivedCount: receivedRequests.length,
    sentCount: sentRequests.length,
    friendsCount: friends.length,
  });

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue]);

  const mutations = useConnectionMutations(search, businessType, marketArea);

  const allMembers = membersPages.flat();
  const filterOutAdmins = useCallback((membersList: any[]) => 
    membersList.filter(m => m.role !== 'admin'), []);
  const members = useMemo(() => filterOutAdmins(allMembers), [allMembers, filterOutAdmins]);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Exclude current user if logged in
      if (user?.id && member.id === user.id) return false;
      const isFriend = friends.some(f => f.user_id === member.id);
      if (isFriend) return false;
      const isReceived = receivedRequests.some(req => req.sender_id === member.id);
      if (isReceived) return false;
      const isSent = sentRequests.some(req => req.connected_user_id === member.id);
      if (isSent) return false;
      return true;
    });
  }, [members, friends, receivedRequests, sentRequests, user?.id]);

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
  };

  const closeFeedback = () => setFeedback(null);

  const showConfirmation = (
    type: 'connect' | 'accept' | 'reject' | 'withdraw',
    userName: string,
    callback: () => Promise<unknown>,
    userId?: string,
    requestId?: string
  ) => {
    setConfirm({ isOpen: true, type, userId, requestId, userName, callback });
  };

  const closeConfirmation = () => setConfirm(null);

  const handleConfirm = async () => {
    if (!confirm) return;
    try {
      await confirm.callback();
      showFeedback(
        confirm.type === 'connect' ? 'Connection request sent' :
        confirm.type === 'accept' ? 'Connected' :
        confirm.type === 'reject' ? 'Request rejected' :
        'Request withdrawn', 'success'
      );
    } catch (error: any) {
      // Show actual error message from the backend
      const errorMessage = error?.message || `Failed to ${confirm.type} connection`;
      showFeedback(errorMessage, 'error');
    } finally {
      closeConfirmation();
    }
  };

  const handleConnect = (memberId: string, memberName: string) => {
    showConfirmation('connect', memberName, () => mutations.sendRequest(memberId), memberId);
  };

  const handleAcceptRequest = (requestId: string, senderName: string) => {
    showConfirmation('accept', senderName, () => mutations.acceptRequest(requestId), undefined, requestId);
  };

  const handleRejectRequest = (requestId: string, senderName: string) => {
    showConfirmation('reject', senderName, () => mutations.rejectRequest(requestId), undefined, requestId);
  };

  const handleWithdrawRequest = (requestId: string, userName: string) => {
    showConfirmation('withdraw', userName, () => mutations.withdrawRequest(requestId), undefined, requestId);
  };

  const clearFilters = () => {
    setInputValue('');
    setSearch('');
    setBusinessType('');
    setMarketArea('');
    setShowFilters(false);
  };

  const handleProfileClick = (memberId: string, e: React.MouseEvent) => {
  console.log('handleProfileClick called with memberId:', memberId);
  console.log('Event target:', e.target);
  const button = (e.target as HTMLElement).closest('button');
  if (button) {
    console.log('Click on button, aborting navigation');
    return;
  }
  console.log('Current path before navigate:', window.location.pathname);
  try {
    navigate(`/profile/${memberId}`);
    console.log('navigate executed, expected new URL:', `/profile/${memberId}`);
  } catch (error) {
    console.error('Navigation error:', error);
  }
};

  const getUserInitials = (firstName?: string, lastName?: string): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const getConnectionStatus = useCallback((member: any) => {
    if (friends.some(f => f.user_id === member.id)) return 'friend';
    if (receivedRequests.some(req => req.sender_id === member.id)) return 'received';
    if (sentRequests.some(req => req.connected_user_id === member.id)) return 'sent';
    return 'none';
  }, [friends, receivedRequests, sentRequests]);

  const getConnectionButton = useCallback((member: any) => {
    const status = getConnectionStatus(member);

    if (status === 'friend') {
      return (
        <button
          onClick={() => navigate(`/profile/${member.id}`)}
          className="flex items-center justify-center gap-1 px-3 py-2 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 border border-green-300 min-h-[36px] w-full sm:w-auto"
        >
          <User size={14} />
          <span>View Profile</span>
        </button>
      );
    }

    if (status === 'received') {
      const request = receivedRequests.find(req => req.sender_id === member.id);
      if (!request) return null;
      return (
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleAcceptRequest(request.id, `${member.first_name} ${member.last_name}`)}
            className="flex-1 sm:flex-none px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 min-h-[36px]"
          >
            Accept
          </button>
          <button
            onClick={() => handleRejectRequest(request.id, `${member.first_name} ${member.last_name}`)}
            className="flex-1 sm:flex-none px-3 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 border border-red-300 min-h-[36px]"
          >
            <X size={14} />
            <span className="hidden sm:inline ml-1">Reject</span>
          </button>
        </div>
      );
    }

    if (status === 'sent') {
      return (
        <button
          className="flex items-center justify-center gap-1 px-3 py-2 text-xs bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-300 min-h-[36px] w-full sm:w-auto"
        >
          <Clock size={14} />
          <span>Pending</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => handleConnect(member.id, `${member.first_name} ${member.last_name}`)}
        className="flex items-center justify-center gap-1 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 border border-green-700 min-h-[36px] w-full sm:w-auto"
      >
        <UserPlus size={14} />
        <span>Connect</span>
      </button>
    );
  }, [getConnectionStatus, receivedRequests, handleAcceptRequest, handleRejectRequest, handleConnect, navigate]);

  // --- Skeleton condition: only when there is no data at all ---
  if (isLoading && membersPages.length === 0) {
    console.log('🟡 Showing skeleton because isLoading =', isLoading, 'and no data');
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-sm font-bold mb-1">GJBC Members Directory</h1>
            <p className="text-green-200 text-xs">Connect with business professionals</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border animate-pulse">
                <div className="flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {confirm && (
        <ConfirmationDialog
          isOpen={confirm.isOpen}
          title={
            confirm.type === 'connect' ? `Connect with ${confirm.userName}?` :
            confirm.type === 'accept' ? `Accept connection from ${confirm.userName}?` :
            confirm.type === 'reject' ? `Reject connection from ${confirm.userName}?` :
            `Withdraw request to ${confirm.userName}?`
          }
          message={
            confirm.type === 'connect' ? 'This will send a connection request to this member.' :
            confirm.type === 'accept' ? 'You will be connected and can message each other.' :
            confirm.type === 'reject' ? 'This will decline the connection request.' :
            'This will cancel your pending connection request.'
          }
          confirmText={
            confirm.type === 'connect' ? 'Send Request' :
            confirm.type === 'accept' ? 'Accept' :
            confirm.type === 'reject' ? 'Reject' :
            'Withdraw'
          }
          onConfirm={handleConfirm}
          onCancel={closeConfirmation}
          isDanger={confirm.type === 'reject' || confirm.type === 'withdraw'}
        />
      )}

      {feedback && (
        <FeedbackToast
          message={feedback.message}
          type={feedback.type}
          onClose={closeFeedback}
        />
      )}

      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-sm font-bold mb-1">GJBC Members Directory</h1>
          <p className="text-green-200 text-xs">Connect with business professionals</p>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-4 text-center font-medium min-h-[36px] ${
              activeTab === 'all' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users size={18} />
              <span className="hidden sm:inline">All Members</span>
              <span className="sm:hidden">All</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex-1 py-4 text-center font-medium min-h-[36px] relative ${
              activeTab === 'connections' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <UserCheck size={18} />
              <span className="hidden sm:inline">Connections</span>
              <span className="sm:hidden">Connections</span>
              {receivedRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {receivedRequests.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'all' && (
        <div className="sticky top-14 z-20 bg-white border-b p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search by name, business..."
                    className="w-full pl-10 pr-4 py-3 text-xs bg-white rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[36px]"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 text-xs bg-white text-green-600 rounded-lg border border-green-300 hover:bg-green-50 flex items-center gap-2 font-medium min-h-[36px]"
                >
                  <Filter size={16} />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>

              {showFilters && (
                <div className="bg-green-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-xs text-gray-900">Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-xs text-green-600 hover:text-green-700 font-medium min-h-[36px] px-3"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 font-medium mb-2">
                        <div className="flex items-center gap-2">
                          <Building size={14} className="text-gray-500" />
                          Business Type
                        </div>
                      </label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-white rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[36px]"
                      >
                        <option value="">All Business Types</option>
                        <option value="products">Products</option>
                        <option value="services">Services</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 font-medium mb-2">
                        <div className="flex items-center gap-2">
                          <Map size={14} className="text-gray-500" />
                          Market Area
                        </div>
                      </label>
                      <select
                        value={marketArea}
                        onChange={(e) => setMarketArea(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-white rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[36px]"
                      >
                        <option value="">All Market Areas</option>
                        {marketAreas.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4">
        {activeTab === 'all' && (
          <>
            {filteredMembers.length === 0 && membersPages.length > 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Building size={32} className="text-green-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">No members found</h3>
                <p className="text-gray-600 text-xs mb-4">Try adjusting your search or check your connections</p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-3 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium min-h-[36px]"
                >
                  Clear All Filters
                </button>
              </div>
            ) : filteredMembers.length > 0 ? (
              <>
                {isFetching && (
                  <div className="text-center py-2">
                    <span className="text-xs text-green-600">Updating...</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredMembers.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      connectionButton={getConnectionButton(member)}
                      onProfileClick={handleProfileClick}
                      getUserInitials={getUserInitials}
                    />
                  ))}
                </div>
                {hasNextPage && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="px-6 py-3 text-xs bg-white text-green-600 font-medium rounded-lg border border-green-300 hover:bg-green-50 disabled:opacity-50 min-h-[36px]"
                    >
                      {isFetchingNextPage ? 'Loading...' : 'Load More Members'}
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </>
        )}

        {activeTab === 'connections' && (
          <ConnectionsTab
            receivedRequests={receivedRequests}
            friends={friends}
            sentRequests={sentRequests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            onWithdraw={handleWithdrawRequest}
            onProfileClick={(userId) => navigate(`/Profile/${userId}`)}
            formatTimeAgo={formatTimeAgo}
          />
        )}
      </div>
    </div>
  );
};

export default Members;