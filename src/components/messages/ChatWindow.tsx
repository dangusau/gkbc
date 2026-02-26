import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, X, Check, CheckCheck, Clock, Store, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMessages } from '../../hooks/useMessages';
import { useSendMessage } from '../../hooks/useSendMessage';
import { useMarkAsRead } from '../../hooks/useMarkAsRead';
import { useConversationSubscription } from '../../hooks/useConversationSubscription';
import { formatTimeAgo } from '../../utils/formatters';
import VerifiedBadge from '../VerifiedBadge';
import { messagingService } from '../../services/supabase/messaging';
import { useQueryClient } from '@tanstack/react-query';
import { messagingKeys } from '../../hooks/queryKeys';
import { useUserLastSeen } from '../../hooks/useUserLastSeen';

// Simple inline message bubble component
const MessageBubble: React.FC<{
  message: any;
  isOwn: boolean;
  showSender?: boolean;
}> = ({ message, isOwn, showSender }) => {
  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={message.media_url}
              alt="Shared image"
              className="max-w-full rounded-lg max-h-64 object-cover"
              loading="lazy"
            />
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        );
      case 'video':
        return (
          <div className="space-y-2">
            <video src={message.media_url} controls className="max-w-full rounded-lg max-h-64" />
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-2">
            <audio src={message.media_url} controls className="w-full" />
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        );
      default:
        return <p className="whitespace-pre-wrap">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {showSender && !isOwn && (
          <div className="flex items-center gap-1 ml-1 mb-1">
            <span className="text-xs font-medium text-gray-700">{message.sender_name}</span>
            {message.sender_status === 'verified' && <VerifiedBadge size={10} />}
          </div>
        )}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-green-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-900 rounded-bl-none'
          }`}
        >
          {renderContent()}
        </div>
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{formatTimeAgo(message.created_at)}</span>
          {isOwn && (
            <span>
              {message.is_read ? (
                <CheckCheck className="w-3 h-3 text-green-500" />
              ) : (
                <Check className="w-3 h-3 text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Inline media preview modal
const MediaPreviewModal: React.FC<{
  file: File;
  onSend: () => void;
  onCancel: () => void;
  isUploading: boolean;
}> = ({ file, onSend, onCancel, isUploading }) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-gray-900">Preview File</h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl" disabled={isUploading}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {previewUrl && file.type.startsWith('image/') ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : previewUrl && file.type.startsWith('video/') ? (
                <video src={previewUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Paperclip className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={isUploading}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSend}
              disabled={isUploading}
              className="flex-1 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatWindow: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isNewConversation, setIsNewConversation] = useState(false);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [context, setContext] = useState<'connection' | 'marketplace'>('connection');
  const [isCreating, setIsCreating] = useState(false);

  // Determine if this is a new conversation (no conversationId)
  useEffect(() => {
    if (!conversationId) {
      const state = location.state as any;
      if (state?.otherUser) {
        setIsNewConversation(true);
        setTargetUser(state.otherUser);
        setContext(state.context || 'connection');
      } else {
        navigate('/messages');
      }
    } else {
      setIsNewConversation(false);
    }
  }, [conversationId, location.state, navigate]);

  // For existing conversations, use the normal hooks
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId!);
  const sendMessageMutation = useSendMessage(conversationId!);
  const markAsRead = useMarkAsRead(conversationId!);
  useConversationSubscription(conversationId!);

  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const messages = isNewConversation ? localMessages : (messagesData?.pages.flat() || []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when conversation opens (only for existing)
  useEffect(() => {
    if (conversationId && user && !isNewConversation) {
      markAsRead.mutate();
    }
  }, [conversationId, user, isNewConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isCreating) return;

    if (isNewConversation) {
      setIsCreating(true);
      try {
        const newConversationId = await messagingService.getOrCreateConversation(
          user.id,
          targetUser.id,
          context,
          undefined
        );

        await messagingService.sendMessage(
          newConversationId,
          user.id,
          newMessage.trim(),
          'text',
          undefined,
          undefined
        );

        // Invalidate and force refetch of conversations and unread counts
        await queryClient.invalidateQueries({ queryKey: messagingKeys.all });
        await queryClient.invalidateQueries({ queryKey: messagingKeys.unreadCounts() });
        await queryClient.refetchQueries({ queryKey: messagingKeys.conversations() });
        await queryClient.refetchQueries({ queryKey: messagingKeys.unreadCounts() });

        navigate(`/messages/${newConversationId}`, {
          replace: true,
          state: {
            otherUser: targetUser,
            context,
          },
        });
      } catch (error) {
        console.error('Error creating conversation:', error);
        alert('Failed to start conversation. Please try again.');
      } finally {
        setIsCreating(false);
      }
    } else {
      sendMessageMutation.mutate(
        {
          content: newMessage,
          type: 'text',
          listingId: location.state?.listing?.id,
        },
        {
          onSuccess: () => setNewMessage(''),
        }
      );
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowFilePreview(true);
    }
    event.target.value = '';
  };

  const handleSendFile = async () => {
    if (!selectedFile || !user || isCreating) return;

    if (isNewConversation) {
      setIsCreating(true);
      try {
        const newConversationId = await messagingService.getOrCreateConversation(
          user.id,
          targetUser.id,
          context,
          undefined
        );
        const mediaUrl = await messagingService.uploadMedia(newConversationId, selectedFile);
        const messageType = selectedFile.type.startsWith('image/')
          ? 'image'
          : selectedFile.type.startsWith('video/')
          ? 'video'
          : selectedFile.type.startsWith('audio/')
          ? 'audio'
          : 'text';

        await messagingService.sendMessage(
          newConversationId,
          user.id,
          selectedFile.name,
          messageType,
          undefined,
          mediaUrl
        );

        // Invalidate and force refetch
        await queryClient.invalidateQueries({ queryKey: messagingKeys.all });
        await queryClient.invalidateQueries({ queryKey: messagingKeys.unreadCounts() });
        await queryClient.refetchQueries({ queryKey: messagingKeys.conversations() });
        await queryClient.refetchQueries({ queryKey: messagingKeys.unreadCounts() });

        navigate(`/messages/${newConversationId}`, {
          replace: true,
          state: { otherUser: targetUser, context },
        });
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload file');
      } finally {
        setIsCreating(false);
        setShowFilePreview(false);
        setSelectedFile(null);
      }
    } else {
      setUploading(true);
      try {
        const mediaUrl = await messagingService.uploadMedia(conversationId!, selectedFile);
        const messageType = selectedFile.type.startsWith('image/')
          ? 'image'
          : selectedFile.type.startsWith('video/')
          ? 'video'
          : selectedFile.type.startsWith('audio/')
          ? 'audio'
          : 'text';

        sendMessageMutation.mutate(
          {
            content: selectedFile.name,
            type: messageType,
            mediaUrl,
            listingId: location.state?.listing?.id,
          },
          {
            onSettled: () => {
              setShowFilePreview(false);
              setSelectedFile(null);
              setUploading(false);
            },
          }
        );
      } catch (error) {
        console.error('Upload failed:', error);
        setUploading(false);
        alert('Failed to upload file');
      }
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isNewConversation) {
      fetchNextPage();
    }
  };

  const otherUser = isNewConversation ? targetUser : (location.state?.otherUser || {
    id: '',
    name: 'Unknown User',
    avatar: '',
    status: 'member',
  });

  const { data: lastSeen } = useUserLastSeen(otherUser.id);

  const isOnline = lastSeen 
    ? (new Date().getTime() - new Date(lastSeen).getTime()) < 2 * 60 * 1000  // within 2 minutes
    : false;

  const statusText = isOnline 
    ? 'Online' 
    : lastSeen 
      ? `Last seen ${formatTimeAgo(lastSeen)}` 
      : '';

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            {/* Avatar with badge outside the frame */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-green-600">
                {otherUser.avatar ? (
                  <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {otherUser.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {otherUser.status === 'verified' && (
                <div className="absolute -bottom-1 -right-1">
                  <VerifiedBadge size={12} />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h2 className="font-bold text-gray-900">{otherUser.name}</h2>
                {otherUser.status === 'verified' && <VerifiedBadge size={12} />}
              </div>
              {/* Online/Last Seen Status */}
              {otherUser.id && (
                <p className="text-xs text-gray-500">{statusText}</p>
              )}
              {location.state?.listing && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Store className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{location.state.listing.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!isNewConversation && hasNextPage && (
          <button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            className="w-full py-2 text-sm text-green-600 hover:text-green-700 disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load older messages'}
          </button>
        )}
        {messages.length === 0 && isNewConversation && (
          <div className="text-center text-gray-500 py-8">
            <p>Send a message to start the conversation.</p>
          </div>
        )}
        {messages.map((message, index) => {
          const isOwn = message.sender_id === user?.id;
          const showSender = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
          return (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={isOwn}
              showSender={showSender}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t p-3">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
            disabled={isCreating}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isCreating}
            className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      {/* File Preview Modal */}
      {showFilePreview && selectedFile && (
        <MediaPreviewModal
          file={selectedFile}
          onSend={handleSendFile}
          onCancel={() => {
            setShowFilePreview(false);
            setSelectedFile(null);
          }}
          isUploading={uploading}
        />
      )}
    </div>
  );
};

export default ChatWindow;