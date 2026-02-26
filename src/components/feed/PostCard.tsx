import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, MapPin, Send, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useLikeShare } from '../../hooks/useLikeShare';
import { useComments } from '../../hooks/useComments';
import { useVideoAutoplay } from '../../hooks/useVideoAutoPlay';
import { VideoPlayer } from './VideoPlayer';
import VerifiedBadge from '../VerifiedBadge';
import { ConfirmationDialog } from '../shared/ConfirmationDialogue';
import { FeedbackToast } from '../shared/FeedbackToast';
import type { Post } from '../../types';

interface PostCardProps {
  post: Post;
  postsQueryKey?: any;
  commentsQueryKey?: any;
  onDelete?: (postId: string) => Promise<any> | void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  postsQueryKey,
  commentsQueryKey,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { toggleLike, toggleShare } = useLikeShare(postsQueryKey);
  const { comments, addComment, isLoading: commentsLoading } = useComments(
    post.id,
    commentsQueryKey,
    postsQueryKey
  );
  const { playingVideo, playVideo, registerVideo, handleVideoEnded } = useVideoAutoplay();

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'some time ago';
    }
  };

  const handleLike = () => toggleLike(post.id);
  const handleShare = () => toggleShare(post.id);
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    await addComment(newComment.trim());
    setNewComment('');
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setShowDropdown(false);
  };

  const confirmDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete(post.id);
      setFeedback({ message: 'Post deleted', type: 'success' });
    } catch (error: any) {
      setFeedback({ message: error.message || 'Failed to delete post', type: 'error' });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const userInitials = (post.author_first_name?.[0] || '') + (post.author_last_name?.[0] || '') || 'U';

  return (
    <>
      {feedback && (
        <FeedbackToast
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback(null)}
        />
      )}

      <div className="bg-white rounded-xl shadow border border-green-200 overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/profile/${post.author_id}`)}
                className="flex items-center gap-2 group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white shadow bg-gray-100">
                    {post.author_avatar ? (
                      <img
                        src={post.author_avatar}
                        alt={post.author_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-500">
                        <span className="text-white font-bold text-xs">{userInitials}</span>
                      </div>
                    )}
                  </div>
                  {post.author_verified && (
                    <div className="absolute -bottom-1 -right-1">
                      <VerifiedBadge size={16} />
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-sm text-gray-900 hover:text-green-600 cursor-pointer">
                      {post.author_name}
                    </h4>
                    {post.author_verified && <VerifiedBadge size={12} />}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(post.created_at)}
                    </span>
                    {post.location && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500 flex items-center gap-0.5">
                          <MapPin size={10} />
                          {post.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <MoreVertical size={18} />
              </button>
              {onDelete && showDropdown && (
                <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <Trash2 size={16} />
                    <span>Delete post</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="mt-3">
            <p className="text-xs text-gray-900 whitespace-pre-line leading-relaxed">{post.content}</p>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-gradient-to-r from-green-50 to-green-50 text-green-600 text-xs font-medium rounded-full border border-green-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Media */}
          {post.media_urls.length > 0 && (
            <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
              {post.media_type === 'video' ? (
                <VideoPlayer
                  src={post.media_urls[0]}
                  postId={post.id}
                  playingVideo={playingVideo}
                  onPlay={playVideo}
                  onEnded={handleVideoEnded}
                />
              ) : post.media_type === 'image' ? (
                <img
                  src={post.media_urls[0]}
                  alt="Post media"
                  className="w-full h-auto max-h-[320px] object-contain mx-auto"
                  loading="lazy"
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0.5 p-0.5">
                  {post.media_urls.slice(0, 4).map((url, idx) => (
                    <div key={idx} className="relative aspect-square bg-gray-100">
                      <img
                        src={url}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {idx === 3 && post.media_urls.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            +{post.media_urls.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart size={8} className="text-white" />
              </div>
              {post.likes_count}
            </span>
            <span>{post.comments_count} comments</span>
            <span>{post.shares_count} shares</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-1.5 pt-2 border-t border-gray-100">
            <button
              onClick={handleLike}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                post.has_liked
                  ? 'text-red-500 bg-gradient-to-r from-red-50 to-pink-50 border border-red-100'
                  : 'text-gray-500 hover:text-red-500 hover:bg-gray-50'
              }`}
            >
              <Heart size={20} fill={post.has_liked ? 'currentColor' : 'none'} />
              <span className="text-xs font-medium">Like</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-gray-500 hover:text-green-500 hover:bg-green-50 transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-xs font-medium">Comment</span>
            </button>

            <button
              onClick={handleShare}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                post.has_shared
                  ? 'text-green-500 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100'
                  : 'text-gray-500 hover:text-green-500 hover:bg-gray-50'
              }`}
            >
              <Share2 size={20} />
              <span className="text-xs font-medium">Share</span>
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              {/* Add Comment */}
              <div className="flex items-center gap-1.5 mb-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim()}
                  className="p-2 bg-gradient-to-r from-green-600 to-green-600 text-white rounded-full hover:from-green-700 hover:to-green-700 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Comments List */}
              {commentsLoading ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-2 animate-pulse">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-2.5 bg-gray-200 rounded w-1/4 mb-1.5"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <button
                        onClick={() => navigate(`/profile/${comment.author_id}`)}
                        className="flex-shrink-0"
                      >
                        <div className="relative">
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-white">
                            {comment.author_avatar ? (
                              <img
                                src={comment.author_avatar}
                                alt={comment.author_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-500">
                                <span className="text-white text-xs font-bold">
                                  {comment.author_name[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          {comment.author_verified && (
                            <div className="absolute -bottom-0.5 -right-0.5">
                              <VerifiedBadge size={10} />
                            </div>
                          )}
                        </div>
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => navigate(`/profile/${comment.author_id}`)}
                            className="font-bold text-xs text-gray-900 hover:text-green-600 cursor-pointer"
                          >
                            {comment.author_name}
                          </span>
                          {comment.author_verified && <VerifiedBadge size={8} />}
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 text-xs py-3">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDanger={true}
      />
    </>
  );
};