import React, { useState } from 'react';
import {
  UserCheck,
  XCircle,
  CheckCircle,
  Loader2,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAdminVerificationRequests } from '../../hooks/admin/useAdminVerificationRequests';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialogue';
import { FeedbackToast } from '../../components/shared/FeedbackToast';

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all';

const AdminVerificationRequests: React.FC = () => {
  // Pagination & filter state
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: string | null;
    title: string;
  }>({
    isOpen: false,
    id: null,
    title: '',
  });
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const limit = 20;

  const {
    requests,
    totalCount,
    isLoading,
    isFetching,
    error,
    updateStatus,
    deleteRequest,
  } = useAdminVerificationRequests({ page, limit, status: statusFilter });

  const totalPages = Math.ceil(totalCount / limit);

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
  };

  const closeFeedback = () => setFeedback(null);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setSelectedId(id);
    setActionType(action);
    setAdminNotes('');
  };

  const confirmAction = async () => {
    if (!selectedId || !actionType) return;
    try {
      await updateStatus.mutateAsync({
        id: selectedId,
        status: actionType,
        adminNotes: adminNotes.trim() || undefined,
      });
      showFeedback(`Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`, 'success');
      setSelectedId(null);
      setActionType(null);
      setAdminNotes('');
    } catch (err: any) {
      showFeedback(err.message || `Failed to ${actionType} request`, 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDialog.id) return;
    try {
      await deleteRequest.mutateAsync(confirmDialog.id);
      showFeedback('Request deleted', 'success');
    } catch (err: any) {
      showFeedback(err.message || 'Failed to delete', 'error');
    } finally {
      setConfirmDialog({ isOpen: false, id: null, title: '' });
    }
  };

  const openReceipt = (url: string) => {
    window.open(url, '_blank');
  };

  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">Error loading verification requests</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2">
        <UserCheck className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">Verification Requests</h1>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 flex gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setPage(0); // reset to first page on filter change
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              statusFilter === status
                ? 'bg-blue-100 text-blue-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Refetch indicator */}
      {isFetching && (
        <div className="fixed top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs shadow flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" /> Updating...
        </div>
      )}

      {/* Requests table */}
      <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No verification requests found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {req.user_first_name} {req.user_last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{req.user_email}</td>
                  <td className="px-4 py-3 text-gray-600">{req.user_phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openReceipt(req.receipt_url)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {/* Only show approve/reject for pending requests */}
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction(req.id, 'approve')}
                            className="text-green-600 hover:bg-green-50 p-1 rounded"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'reject')}
                            className="text-red-600 hover:bg-red-50 p-1 rounded"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {/* Always show delete */}
                      <button
                        onClick={() => setConfirmDialog({ isOpen: true, id: req.id, title: `request from ${req.user_email}` })}
                        className="text-gray-500 hover:bg-gray-100 p-1 rounded"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {page * limit + 1} to {Math.min((page + 1) * limit, totalCount)} of {totalCount}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Action Modal (approve/reject with notes) */}
      {selectedId && actionType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {actionType === 'approve'
                ? 'This user will become a verified member.'
                : 'This request will be rejected. You can add notes for the user.'}
            </p>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add admin notes (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={confirmAction}
                disabled={updateStatus.isPending}
                className={`flex-1 py-2 rounded-lg font-medium text-white ${
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {updateStatus.isPending ? (
                  <Loader2 size={16} className="animate-spin mx-auto" />
                ) : actionType === 'approve' ? (
                  'Approve'
                ) : (
                  'Reject'
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedId(null);
                  setActionType(null);
                  setAdminNotes('');
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Delete */}
      {confirmDialog.isOpen && (
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          title="Delete Verification Request"
          message={`Delete ${confirmDialog.title} permanently? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDialog({ isOpen: false, id: null, title: '' })}
          isDanger={true}
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

export default AdminVerificationRequests;
