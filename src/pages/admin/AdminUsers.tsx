import type { AdminUser } from '../../hooks/admin/useAdminUsers';
import React, { useState } from 'react';
import {
  Users, Search, ChevronDown, ChevronUp, UserCheck, UserX,
  Trash2, Calendar, Clock, Mail, MessageCircle, Heart,
  ShoppingBag, Briefcase, Ticket, Star, Loader2
} from 'lucide-react';
import { useAdminUsers } from '../../hooks/admin/useAdminUsers';
import { StatCard } from '../../components/admin/StatCard';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialogue';
import { FeedbackToast } from '../../components/shared/FeedbackToast';

const AdminUsers: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    type: 'verify' | 'unverify' | 'delete';
    user: AdminUser | null;
  }>({ isOpen: false, type: 'verify', user: null });
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const limit = 20;

  const {
    users,
    totalCount,
    isLoading,
    isFetching,
    error,
    expandedUserId,
    setExpandedUserId,
    userDetails,
    isLoadingDetails,
    verifyUser,
    unverifyUser,
    deleteUser,
  } = useAdminUsers({ search, userStatus, role, page, limit });

  // Debounce search
  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
  };

  const closeFeedback = () => setFeedback(null);

  const handleVerify = (user: AdminUser) => {
    setConfirmAction({ isOpen: true, type: 'verify', user });
  };

  const handleUnverify = (user: AdminUser) => {
    setConfirmAction({ isOpen: true, type: 'unverify', user });
  };

  const handleDelete = (user: AdminUser) => {
    setConfirmAction({ isOpen: true, type: 'delete', user });
  };

  const confirmActionHandler = async () => {
    if (!confirmAction.user) return;
    try {
      if (confirmAction.type === 'verify') {
        await verifyUser.mutateAsync(confirmAction.user.id);
        showFeedback(`${confirmAction.user.first_name} ${confirmAction.user.last_name} verified`, 'success');
      } else if (confirmAction.type === 'unverify') {
        await unverifyUser.mutateAsync(confirmAction.user.id);
        showFeedback(`${confirmAction.user.first_name} ${confirmAction.user.last_name} unverified`, 'success');
      } else {
        await deleteUser.mutateAsync(confirmAction.user.id);
        showFeedback(`User deleted permanently`, 'success');
      }
    } catch (err: any) {
      showFeedback(err.message || 'Action failed', 'error');
    } finally {
      setConfirmAction({ isOpen: false, type: 'verify', user: null });
    }
  };

  const cancelAction = () => {
    setConfirmAction({ isOpen: false, type: 'verify', user: null });
  };

  const totalPages = Math.ceil(totalCount / limit);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-green-600" size={24} /> User Management
        </h1>
        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>

      {isFetching && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs shadow flex items-center gap-2 z-50">
          <Loader2 size={14} className="animate-spin" /> Updating...
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={userStatus}
          onChange={(e) => { setUserStatus(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="verified">Verified</option>
          <option value="member">Member</option>
        </select>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* Users Table – responsive wrapper */}
      <div className="bg-white rounded-xl border border-green-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="hidden md:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="hidden lg:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <React.Fragment key={user.id}>
                <tr
                  className={`hover:bg-gray-50 cursor-pointer ${expandedUserId === user.id ? 'bg-green-50' : ''}`}
                  onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold mr-3 flex-shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-[120px] sm:max-w-none">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.user_status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.user_status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    {user.role === 'admin' ? (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Admin</span>
                    ) : (
                      <span className="text-sm text-gray-500">Member</span>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_seen ? new Date(user.last_seen).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm font-medium">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {user.user_status === 'verified' ? (
                        <button
                          onClick={() => handleUnverify(user)}
                          className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Unverify"
                        >
                          <UserX size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(user)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Verify"
                        >
                          <UserCheck size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete permanently"
                      >
                        <Trash2 size={18} />
                      </button>
                      <span className="sm:hidden">
                        {expandedUserId === user.id ? (
                          <ChevronUp size={18} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-400" />
                        )}
                      </span>
                    </div>
                  </td>
                </tr>
                {expandedUserId === user.id && (
                  <tr>
                    <td colSpan={6} className="px-4 sm:px-6 py-4 bg-green-50">
                      {isLoadingDetails ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Loader2 size={16} className="animate-spin" /> Loading details...
                        </div>
                      ) : userDetails ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          <StatCard title="Posts" value={userDetails.posts_count} previous={null} icon={<MessageCircle size={16} />} />
                          <StatCard title="Comments" value={userDetails.comments_count} previous={null} icon={<MessageCircle size={16} />} />
                          <StatCard title="Likes" value={userDetails.likes_given} previous={null} icon={<Heart size={16} />} />
                          <StatCard title="Connections" value={userDetails.connections_count} previous={null} icon={<Users size={16} />} />
                          <StatCard title="Marketplace" value={userDetails.marketplace_listings_count} previous={null} icon={<ShoppingBag size={16} />} />
                          <StatCard title="Favorites" value={userDetails.marketplace_favorites_count} previous={null} icon={<Heart size={16} />} />
                          <StatCard title="Reviews Given" value={userDetails.marketplace_reviews_given} previous={null} icon={<Star size={16} />} />
                          <StatCard title="Reviews Received" value={userDetails.marketplace_reviews_received} previous={null} icon={<Star size={16} />} />
                          <StatCard title="Businesses" value={userDetails.businesses_count} previous={null} icon={<Briefcase size={16} />} />
                          <StatCard title="Jobs" value={userDetails.jobs_count} previous={null} icon={<Briefcase size={16} />} />
                          <StatCard title="Events" value={userDetails.events_count} previous={null} icon={<Calendar size={16} />} />
                          <StatCard title="Event RSVPs" value={userDetails.event_rsvps_count} previous={null} icon={<Calendar size={16} />} />
                          <StatCard title="Tickets" value={userDetails.support_tickets_count} previous={null} icon={<Ticket size={16} />} />
                          <StatCard title="Conversations" value={userDetails.conversations_count} previous={null} icon={<MessageCircle size={16} />} />
                          <StatCard title="Messages Sent" value={userDetails.messages_sent} previous={null} icon={<Mail size={16} />} />
                          <StatCard title="Messages Received" value={userDetails.messages_received} previous={null} icon={<Mail size={16} />} />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">No details available</div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            Showing {page * limit + 1} to {Math.min((page + 1) * limit, totalCount)} of {totalCount} users
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction.isOpen && (
        <ConfirmationDialog
          isOpen={confirmAction.isOpen}
          title={
            confirmAction.type === 'verify' ? 'Verify User' :
            confirmAction.type === 'unverify' ? 'Unverify User' :
            'Delete User Permanently'
          }
          message={
            confirmAction.type === 'verify'
              ? `Are you sure you want to verify ${confirmAction.user?.first_name} ${confirmAction.user?.last_name}?`
              : confirmAction.type === 'unverify'
              ? `Are you sure you want to unverify ${confirmAction.user?.first_name} ${confirmAction.user?.last_name}?`
              : `This will permanently delete ${confirmAction.user?.first_name} ${confirmAction.user?.last_name} and all associated data. This action cannot be undone.`
          }
          confirmText={
            confirmAction.type === 'verify' ? 'Verify' :
            confirmAction.type === 'unverify' ? 'Unverify' :
            'Delete'
          }
          onConfirm={confirmActionHandler}
          onCancel={cancelAction}
          isDanger={confirmAction.type === 'delete'}
        />
      )}

      {/* Feedback Toast */}
      {feedback && (
        <FeedbackToast
          message={feedback.message}
          type={feedback.type}
          onClose={closeFeedback}
        />
      )}
    </div>
  );
};

export default AdminUsers;