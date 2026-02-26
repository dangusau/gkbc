import React, { useState } from 'react';
import {
  Shield, UserPlus, UserMinus, Search, Loader2,
  ChevronDown, ChevronUp, Trash2, X
} from 'lucide-react';
import { useAdminManagement } from '../../hooks/admin/useAdminManagement';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialogue';
import { FeedbackToast } from '../../components/shared/FeedbackToast';

const AdminManagement: React.FC = () => {
  const {
    admins,
    isLoadingAdmins,
    adminsError,
    nonAdminUsers,
    nonAdminTotal,
    isLoadingNonAdmin,
    nonAdminError,
    searchNonAdmin,
    pageNonAdmin,
    setPageNonAdmin,
    addAdmin,
    removeAdmin,
  } = useAdminManagement();

  const [searchInput, setSearchInput] = useState('');
  const [expandedAdminId, setExpandedAdminId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    type: 'add' | 'remove';
    user: any; // NonAdminUser or AdminUser
  } | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const limit = 20;
  const totalPages = Math.ceil(nonAdminTotal / limit);

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
  };

  const closeFeedback = () => setFeedback(null);

  const handleSearch = () => {
    searchNonAdmin(searchInput);
    setPageNonAdmin(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleAddAdmin = (user: any) => {
    setConfirmAction({ isOpen: true, type: 'add', user });
  };

  const handleRemoveAdmin = (user: any) => {
    setConfirmAction({ isOpen: true, type: 'remove', user });
  };

  const confirmHandler = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'add') {
        await addAdmin.mutateAsync(confirmAction.user.id);
        showFeedback(`${confirmAction.user.first_name} ${confirmAction.user.last_name} promoted to admin`, 'success');
      } else {
        await removeAdmin.mutateAsync(confirmAction.user.profile_id);
        showFeedback(`${confirmAction.user.profile.first_name} ${confirmAction.user.profile.last_name} removed from admins`, 'success');
      }
    } catch (err: any) {
      showFeedback(err.message || 'Action failed', 'error');
    } finally {
      setConfirmAction(null);
    }
  };

  const cancelConfirm = () => setConfirmAction(null);

  if (isLoadingAdmins) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  if (adminsError) {
    return <div className="p-6 text-red-600">Error loading admins</div>;
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-2">
        <Shield className="text-green-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
      </div>

      {/* Current Admins Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Admins</h2>
        <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {admins.map((admin) => (
                  <React.Fragment key={admin.id}>
                    <tr
                      className={`hover:bg-gray-50 cursor-pointer ${expandedAdminId === admin.id ? 'bg-green-50' : ''}`}
                      onClick={() => setExpandedAdminId(expandedAdminId === admin.id ? null : admin.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold mr-3">
                            {admin.profile.avatar_url ? (
                              <img src={admin.profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              `${admin.profile.first_name?.charAt(0) || ''}${admin.profile.last_name?.charAt(0) || ''}`
                            )}
                          </div>
                          <div className="font-medium text-gray-900">
                            {admin.profile.first_name} {admin.profile.last_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.profile.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.creator ? `${admin.creator.first_name} ${admin.creator.last_name}` : 'System'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleRemoveAdmin(admin)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Remove admin"
                            disabled={admin.profile_id === admin.created_by} // optional: prevent self‑removal
                          >
                            <UserMinus size={18} />
                          </button>
                          {expandedAdminId === admin.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                        </div>
                      </td>
                    </tr>
                    {expandedAdminId === admin.id && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-green-50">
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Permissions:</span> {admin.permissions ? JSON.stringify(admin.permissions) : 'None'}</p>
                            <p><span className="font-medium">Admin ID:</span> {admin.id}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add New Admin Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Admin</h2>

        {/* Search */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search users by name or email..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            Search
          </button>
        </div>

        {isLoadingNonAdmin ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-green-600" size={24} />
          </div>
        ) : nonAdminError ? (
          <div className="text-red-600">Error loading users</div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {nonAdminUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      nonAdminUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold mr-3">
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`
                                )}
                              </div>
                              <div className="font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.user_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.user_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleAddAdmin(user)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Promote to admin"
                              disabled={addAdmin.isPending}
                            >
                              <UserPlus size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination for non‑admin users */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {pageNonAdmin * limit + 1} to {Math.min((pageNonAdmin + 1) * limit, nonAdminTotal)} of {nonAdminTotal}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPageNonAdmin(p => Math.max(0, p - 1))}
                    disabled={pageNonAdmin === 0}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPageNonAdmin(p => Math.min(totalPages - 1, p + 1))}
                    disabled={pageNonAdmin >= totalPages - 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmationDialog
          isOpen={confirmAction.isOpen}
          title={confirmAction.type === 'add' ? 'Promote to Admin' : 'Remove Admin'}
          message={
            confirmAction.type === 'add'
              ? `Are you sure you want to promote ${confirmAction.user.first_name} ${confirmAction.user.last_name} to admin?`
              : `Remove ${confirmAction.user.profile.first_name} ${confirmAction.user.profile.last_name} from admins?`
          }
          confirmText={confirmAction.type === 'add' ? 'Promote' : 'Remove'}
          onConfirm={confirmHandler}
          onCancel={cancelConfirm}
          isDanger={confirmAction.type === 'remove'}
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

export default AdminManagement;