import React, { useState } from 'react';
import {
  Ticket, Search, ChevronDown, ChevronUp, Trash2,
  CheckCircle, XCircle, Loader2, Filter, Send, Clock,
  AlertCircle, User, Mail, Calendar
} from 'lucide-react';
import { useAdminTickets } from '../../hooks/admin/useAdminTickets';
import { StatCard } from '../../components/admin/StatCard';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialogue';
import { FeedbackToast } from '../../components/shared/FeedbackToast';

type StatusType = 'pending' | 'in_progress' | 'resolved' | 'closed' | '';
type CategoryType = 'general' | 'technical' | 'account' | 'bug' | 'feature' | 'payment' | 'other' | '';
type PriorityType = 'low' | 'normal' | 'high' | 'urgent' | '';

const AdminTickets: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<StatusType>('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityType>('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    type: 'close' | 'delete';
    ticket: any;
  } | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const limit = 20;

  const {
    tickets,
    totalCount,
    isLoading,
    isFetching,
    error,
    expandedTicketId,
    setExpandedTicketId,
    conversation,
    isLoadingConversation,
    replyText,
    setReplyText,
    replyToTicket,
    closeTicket,
    deleteTicket,
  } = useAdminTickets({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    priority: priorityFilter || undefined,
    search,
    page,
    limit,
  });

  const statusOptions = ['pending', 'in_progress', 'resolved', 'closed'];
  const categoryOptions = ['general', 'technical', 'account', 'bug', 'feature', 'payment', 'other'];
  const priorityOptions = ['low', 'normal', 'high', 'urgent'];

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
  };

  const closeFeedback = () => setFeedback(null);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    try {
      await replyToTicket.mutateAsync({ ticketId, message: replyText });
      showFeedback('Reply sent', 'success');
    } catch (err: any) {
      showFeedback(err.message || 'Failed to send reply', 'error');
    }
  };

  const confirmHandler = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'close') {
        await closeTicket.mutateAsync(confirmAction.ticket.id);
        showFeedback('Ticket closed', 'success');
      } else {
        await deleteTicket.mutateAsync(confirmAction.ticket.id);
        showFeedback('Ticket deleted', 'success');
      }
    } catch (err: any) {
      showFeedback(err.message || 'Action failed', 'error');
    } finally {
      setConfirmAction(null);
    }
  };

  const cancelConfirm = () => setConfirmAction(null);

  const totalPages = Math.ceil(totalCount / limit);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">Error loading tickets</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Ticket className="text-green-600" size={24} /> Support Tickets
        </h1>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by subject or user..."
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
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as StatusType); setPage(0); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">All Status</option>
            {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value as CategoryType); setPage(0); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">All Categories</option>
            {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value as PriorityType); setPage(0); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="">All Priorities</option>
            {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {isFetching && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs shadow flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" /> Updating tickets...
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Reply</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <React.Fragment key={ticket.id}>
                  <tr
                    className={`hover:bg-gray-50 cursor-pointer ${expandedTicketId === ticket.id ? 'bg-green-50' : ''}`}
                    onClick={() => setExpandedTicketId(expandedTicketId === ticket.id ? null : ticket.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{ticket.subject}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs mr-2">
                          {ticket.user.avatar_url ? (
                            <img src={ticket.user.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            `${ticket.user.first_name?.charAt(0) || ''}${ticket.user.last_name?.charAt(0) || ''}`
                          )}
                        </div>
                        <span className="text-sm">{ticket.user.first_name} {ticket.user.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.last_reply ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{new Date(ticket.last_reply.created_at).toLocaleDateString()}</span>
                          <span className="text-xs text-gray-400">by {ticket.last_reply.user_name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No replies</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {ticket.status !== 'closed' && (
                          <button
                            onClick={() => setConfirmAction({ isOpen: true, type: 'close', ticket })}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Close ticket"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirmAction({ isOpen: true, type: 'delete', ticket })}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete ticket"
                        >
                          <Trash2 size={18} />
                        </button>
                        {expandedTicketId === ticket.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                      </div>
                    </td>
                  </tr>
                  {expandedTicketId === ticket.id && (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 bg-green-50">
                        <div className="space-y-4">
                          {/* Original message */}
                          <div className="bg-white rounded-lg border border-green-200 p-3">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                                {ticket.user.avatar_url ? (
                                  <img src={ticket.user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  `${ticket.user.first_name?.charAt(0) || ''}${ticket.user.last_name?.charAt(0) || ''}`
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{ticket.user.first_name} {ticket.user.last_name}</span>
                                  <span className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{ticket.message}</p>
                              </div>
                            </div>
                          </div>

                          {/* Conversation */}
                          {isLoadingConversation ? (
                            <div className="flex justify-center py-4">
                              <Loader2 size={20} className="animate-spin text-green-600" />
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                              {conversation.map((reply) => (
                                <div key={reply.id} className={`flex gap-3 ${reply.is_admin ? 'flex-row-reverse' : ''}`}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                    reply.is_admin ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    {reply.user.avatar_url ? (
                                      <img src={reply.user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                      reply.user.first_name?.charAt(0) || 'U'
                                    )}
                                  </div>
                                  <div className={`flex-1 max-w-[80%] ${reply.is_admin ? 'text-right' : ''}`}>
                                    <div className={`inline-block rounded-lg p-3 ${
                                      reply.is_admin ? 'bg-green-100' : 'bg-white border border-gray-200'
                                    }`}>
                                      <p className="text-sm text-gray-700">{reply.message}</p>
                                      {reply.attachments && reply.attachments.length > 0 && (
                                        <div className="mt-2 text-xs text-blue-600">📎 Attachments</div>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {new Date(reply.created_at).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply form */}
                          {ticket.status !== 'closed' && (
                            <div className="flex gap-2">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500"
                                rows={3}
                              />
                              <button
                                onClick={() => handleReply(ticket.id)}
                                disabled={!replyText.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 self-end"
                              >
                                <Send size={16} />
                              </button>
                            </div>
                          )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {page * limit + 1} to {Math.min((page + 1) * limit, totalCount)} of {totalCount} tickets
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

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmationDialog
          isOpen={confirmAction.isOpen}
          title={confirmAction.type === 'close' ? 'Close Ticket' : 'Delete Ticket'}
          message={
            confirmAction.type === 'close'
              ? `Close ticket "${confirmAction.ticket.subject}"?`
              : `Delete ticket "${confirmAction.ticket.subject}" permanently? This action cannot be undone.`
          }
          confirmText={confirmAction.type === 'close' ? 'Close' : 'Delete'}
          onConfirm={confirmHandler}
          onCancel={cancelConfirm}
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

export default AdminTickets;