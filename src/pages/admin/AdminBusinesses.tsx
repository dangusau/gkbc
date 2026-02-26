import type { Business } from '../../hooks/admin/useAdminBusiness';
import React, { useState } from 'react';
import {
  Briefcase, Search, ChevronDown, ChevronUp, Trash2,
  Star, CheckCircle, XCircle, Loader2
} from 'lucide-react'; // removed AlertCircle, Filter
import { useAdminBusinesses } from '../../hooks/admin/useAdminBusiness';
import { StatCard } from '../../components/admin/StatCard';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialogue';
import { FeedbackToast } from '../../components/shared/FeedbackToast';

const AdminBusinesses: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [page, setPage] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    type: 'approve' | 'delete';
    business: Business | null;
  }>({ isOpen: false, type: 'approve', business: null });
  const [rejectState, setRejectState] = useState<{
    isOpen: boolean;
    business: Business | null;
    reason: string;
  }>({ isOpen: false, business: null, reason: '' });
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const limit = 20;

  const {
    businesses,
    totalCount,
    isLoading,
    isFetching,
    error,
    expandedBusinessId,
    setExpandedBusinessId,
    businessDetails,
    isLoadingDetails,
    approveBusiness,
    rejectBusiness,
    deleteBusiness,
  } = useAdminBusinesses({ search, verificationStatus, businessType, page, limit });

  const businessTypes = ['products', 'services'];

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

  const handleApprove = (business: Business) => {
    setConfirmAction({ isOpen: true, type: 'approve', business });
  };

  const handleReject = (business: Business) => {
    setRejectState({ isOpen: true, business, reason: business.rejection_reason || '' });
  };

  const handleDelete = (business: Business) => {
    setConfirmAction({ isOpen: true, type: 'delete', business });
  };

  const confirmApproveOrDelete = async () => {
    if (!confirmAction.business) return;
    try {
      if (confirmAction.type === 'approve') {
        await approveBusiness.mutateAsync(confirmAction.business.id);
        showFeedback(`"${confirmAction.business.name}" approved`, 'success');
      } else {
        await deleteBusiness.mutateAsync(confirmAction.business.id);
        showFeedback(`Business deleted permanently`, 'success');
      }
    } catch (err: any) {
      showFeedback(err.message || 'Action failed', 'error');
    } finally {
      setConfirmAction({ isOpen: false, type: 'approve', business: null });
    }
  };

  const confirmReject = async () => {
    if (!rejectState.business) return;
    try {
      await rejectBusiness.mutateAsync({ businessId: rejectState.business.id, reason: rejectState.reason || undefined });
      showFeedback(`"${rejectState.business.name}" rejected`, 'success');
    } catch (err: any) {
      showFeedback(err.message || 'Rejection failed', 'error');
    } finally {
      setRejectState({ isOpen: false, business: null, reason: '' });
    }
  };

  const cancelAction = () => {
    setConfirmAction({ isOpen: false, type: 'approve', business: null });
  };

  const cancelReject = () => {
    setRejectState({ isOpen: false, business: null, reason: '' });
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
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Briefcase className="text-green-600" size={24} /> Business Listings
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name or owner..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
      </div>

      {isFetching && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs shadow flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" /> Updating...
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={verificationStatus}
          onChange={(e) => { setVerificationStatus(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={businessType}
          onChange={(e) => { setBusinessType(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Types</option>
          {businessTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      {/* Businesses Table */}
      <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {businesses.map((business) => (
              <React.Fragment key={business.id}>
                <tr
                  className={`hover:bg-gray-50 cursor-pointer ${expandedBusinessId === business.id ? 'bg-green-50' : ''}`}
                  onClick={() => setExpandedBusinessId(expandedBusinessId === business.id ? null : business.id)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{business.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{business.description}</div>
                    <div className="text-xs text-gray-400 mt-1">{business.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs mr-2">
                        {business.owner.avatar_url ? (
                          <img src={business.owner.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          `${business.owner.first_name?.charAt(0) || ''}${business.owner.last_name?.charAt(0) || ''}`
                        )}
                      </div>
                      <span className="text-sm">{business.owner.first_name} {business.owner.last_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {business.business_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{business.average_rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({business.review_count})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      business.verification_status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : business.verification_status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {business.verification_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {business.verification_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(business)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleReject(business)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(business)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete permanently"
                      >
                        <Trash2 size={18} />
                      </button>
                      {expandedBusinessId === business.id ? (
                        <ChevronUp size={18} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-400" />
                      )}
                    </div>
                  </td>
                </tr>
                {expandedBusinessId === business.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-green-50">
                      {isLoadingDetails ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Loader2 size={16} className="animate-spin" /> Loading details...
                        </div>
                      ) : businessDetails ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                          <StatCard title="Reviews" value={businessDetails.reviews_count} previous={null} icon={<Star size={16} />} />
                          <StatCard title="Avg Rating" value={businessDetails.average_rating} previous={null} icon={<Star size={16} />} precision={1} suffix=" ★" />
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
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {page * limit + 1} to {Math.min((page + 1) * limit, totalCount)} of {totalCount} businesses
          </div>
          <div className="flex gap-2">
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

      {/* Approve/Delete Confirmation Dialog */}
      {confirmAction.isOpen && (
        <ConfirmationDialog
          isOpen={confirmAction.isOpen}
          title={confirmAction.type === 'approve' ? 'Approve Business' : 'Delete Business Permanently'}
          message={
            confirmAction.type === 'approve'
              ? `Are you sure you want to approve "${confirmAction.business?.name}"?`
              : `Are you sure you want to delete "${confirmAction.business?.name}"? This action cannot be undone.`
          }
          confirmText={confirmAction.type === 'approve' ? 'Approve' : 'Delete'}
          onConfirm={confirmApproveOrDelete}
          onCancel={cancelAction}
          isDanger={confirmAction.type === 'delete'}
        />
      )}

      {/* Reject Dialog with Reason Input */}
      {rejectState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Reject Business</h3>
            <p className="text-gray-600 text-xs mb-4">
              Are you sure you want to reject "{rejectState.business?.name}"?
            </p>
            <label className="block text-sm text-gray-600 mb-1">Rejection reason (optional):</label>
            <textarea
              value={rejectState.reason}
              onChange={(e) => setRejectState(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4"
              rows={3}
              placeholder="e.g., incomplete information, policy violation..."
            />
            <div className="flex gap-3">
              <button
                onClick={cancelReject}
                className="flex-1 py-3 text-xs bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 py-3 text-xs bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
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

export default AdminBusinesses;