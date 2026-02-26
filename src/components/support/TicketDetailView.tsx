import React, { useState } from 'react';
import { ChevronLeft, User, Mail, Calendar, Tag, AlertCircle, MessageSquare, X } from 'lucide-react';
import { useTicketReplies, useAddReply, useCloseTicket } from '../../hooks/useSupportQueries';
import type { SupportTicket } from '../../types/index';
import { formatDate } from '../../utils/formatters'; // we'll create a simple formatter

interface TicketDetailViewProps {
  ticket: SupportTicket;
  onClose: () => void;
}

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({ ticket, onClose }) => {
  const [replyText, setReplyText] = useState('');

  const { data: replies = [], isLoading: repliesLoading } = useTicketReplies(ticket.id);
  const addReplyMutation = useAddReply(ticket.id);
  const closeTicketMutation = useCloseTicket(ticket.id);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await addReplyMutation.mutateAsync(replyText);
      setReplyText('');
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const canReply = ticket.status !== 'closed' && ticket.status !== 'resolved';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{ticket.subject}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-500">• Ticket #{ticket.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Ticket Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Category</div>
                  <div className="font-medium capitalize">{ticket.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Created</div>
                  <div className="font-medium">{formatDate(ticket.created_at)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">Priority</div>
                  <div className="font-medium capitalize">{ticket.priority}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Original Message */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-green-600" />
              </div>
              <div>
                <div className="font-medium">You</div>
                <div className="text-sm text-gray-500">{formatDate(ticket.created_at)}</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 ml-10">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
            </div>
          </div>

          {/* Replies */}
          <div className="space-y-6">
            {repliesLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading replies...</p>
              </div>
            ) : replies.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <MessageSquare size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No replies yet</p>
                <p className="text-gray-400 text-sm mt-1">Support team will reply here</p>
              </div>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className={`${reply.is_admin ? 'border-l-4 border-green-500 pl-4' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 ${reply.is_admin ? 'bg-green-100' : 'bg-green-100'} rounded-full flex items-center justify-center`}>
                      {reply.is_admin ? (
                        <Mail size={16} className="text-green-600" />
                      ) : (
                        <User size={16} className="text-green-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {reply.is_admin ? 'Support Team' : 'You'}
                        {reply.is_admin && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{formatDate(reply.created_at)}</div>
                    </div>
                  </div>
                  <div className={`rounded-xl p-4 ml-10 ${reply.is_admin ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Reply Form */}
          {canReply && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <form onSubmit={handleSubmitReply}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
                />
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addReplyMutation.isPending || !replyText.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {addReplyMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      'Send Reply'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};