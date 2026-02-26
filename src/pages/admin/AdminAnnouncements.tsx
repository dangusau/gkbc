import React, { useState } from 'react';
import {
  Megaphone, Send, Trash2, Loader2, Users, UserCheck,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { useAdminAnnouncements } from '../../hooks/admin/useAdminAnnouncements';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialogue';
import { FeedbackToast } from '../../components/shared/FeedbackToast';

const AdminAnnouncements: React.FC = () => {
  const [page, setPage] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<'all' | 'verified' | 'members'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null; title: string }>({
    isOpen: false,
    id: null,
    title: '',
  });
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const limit = 10;

  const {
    announcements,
    totalCount,
    isLoading,
    isFetching,
    error,
    createAnnouncement,
    deleteAnnouncement,
  } = useAdminAnnouncements({ page, limit }); // removed 'search'

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
  };

  const closeFeedback = () => setFeedback(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    try {
      await createAnnouncement.mutateAsync({ title, content, audience });
      showFeedback('Announcement sent', 'success');
      setTitle('');
      setContent('');
      setAudience('all');
    } catch (err: any) {
      showFeedback(err.message || 'Failed to send announcement', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteAnnouncement.mutateAsync(confirmDelete.id);
      showFeedback('Announcement deleted', 'success');
      if (expandedId === confirmDelete.id) setExpandedId(null);
    } catch (err: any) {
      showFeedback(err.message || 'Failed to delete', 'error');
    } finally {
      setConfirmDelete({ isOpen: false, id: null, title: '' });
    }
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
    return <div className="p-6 text-red-600">Error loading announcements</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-2">
        <Megaphone className="text-green-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-xl border border-green-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">New Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Announcement title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Write your announcement..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Send to</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="all"
                  checked={audience === 'all'}
                  onChange={(e) => setAudience(e.target.value as typeof audience)}
                  className="text-green-600"
                />
                <Users size={16} className="text-gray-600" />
                <span>All Users</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="verified"
                  checked={audience === 'verified'}
                  onChange={(e) => setAudience(e.target.value as typeof audience)}
                  className="text-green-600"
                />
                <UserCheck size={16} className="text-gray-600" />
                <span>Verified</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="members"
                  checked={audience === 'members'}
                  onChange={(e) => setAudience(e.target.value as typeof audience)}
                  className="text-green-600"
                />
                <Users size={16} className="text-gray-600" />
                <span>Members</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={createAnnouncement.isPending}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {createAnnouncement.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Send Announcement
          </button>
        </form>
      </div>

      {/* Past Announcements */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Past Announcements</h2>
        {isFetching && (
          <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs shadow flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Updating...
          </div>
        )}

        <div className="space-y-3">
          {announcements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No announcements yet.</p>
          ) : (
            announcements.map((ann) => (
              <div key={ann.id} className="bg-white rounded-lg border border-green-200 overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === ann.id ? null : ann.id)}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{ann.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                      {ann.created_by && (
                        <span>by {ann.created_by.first_name} {ann.created_by.last_name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDelete({ isOpen: true, id: ann.id, title: ann.title });
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                    {expandedId === ann.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </div>
                {expandedId === ann.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    {ann.audience && (
                      <div className="text-xs text-gray-500 mb-2">Audience: {ann.audience}</div>
                    )}
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{ann.content}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, totalCount)} of {totalCount}
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
      </div>

      {/* Confirmation Dialog */}
      {confirmDelete.isOpen && (
        <ConfirmationDialog
          isOpen={confirmDelete.isOpen}
          title="Delete Announcement"
          message={`Delete "${confirmDelete.title}" permanently? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete({ isOpen: false, id: null, title: '' })}
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

export default AdminAnnouncements;