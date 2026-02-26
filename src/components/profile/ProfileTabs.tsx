import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck } from 'lucide-react';
import { ConnectionsTab } from '../members/ConnectionsTab';
import { UserConnectionsList } from './UserConnectionsList';
import { PostCard } from '../feed/PostCard'; // import from feed
import { formatTimeAgo } from '../../utils/formatters';
import { profileKeys } from '../../hooks/useProfile';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  profileUserId: string;
  viewerId: string;
  isOwner: boolean;
  isConnected: boolean;
  posts: any[];
  receivedRequests: any[];
  sentRequests: any[];
  friends: any[];
  onAcceptRequest: (requestId: string, senderName: string) => void;
  onRejectRequest: (requestId: string, senderName: string) => void;
  onWithdrawRequest: (requestId: string, userName: string) => void;
  connectionsCount: number;
  // New props for enhanced PostCard
  postsQueryKey: any;
  onDeletePostMutation?: (postId: string) => Promise<any>;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange,
  profileUserId,
  viewerId,
  isOwner,
  isConnected,
  posts,
  receivedRequests,
  sentRequests,
  friends,
  onAcceptRequest,
  onRejectRequest,
  onWithdrawRequest,
  connectionsCount,
  postsQueryKey,
  onDeletePostMutation,
}) => {
  const navigate = useNavigate();

  const renderPosts = () => {
    if (!isOwner && !isConnected) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UserCheck size={24} className="text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Connect to view posts</h3>
          <p className="text-gray-600 text-xs">Connect with this user to see their posts.</p>
        </div>
      );
    }
    if (posts.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
            <div className="text-2xl">📝</div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Posts</h3>
          <p className="text-gray-600 text-sm">No posts to display.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            postsQueryKey={postsQueryKey}
            commentsQueryKey={profileKeys.comments(profileUserId, post.id)}
            onDelete={onDeletePostMutation}
          />
        ))}
      </div>
    );
  };

  const renderConnections = () => {
    if (isOwner) {
      return (
        <ConnectionsTab
          receivedRequests={receivedRequests}
          friends={friends}
          sentRequests={sentRequests}
          onAccept={onAcceptRequest}
          onReject={onRejectRequest}
          onWithdraw={onWithdrawRequest}
          onProfileClick={(userId) => navigate(`/profile/${userId}`)}
          formatTimeAgo={formatTimeAgo}
        />
      );
    }
    if (isConnected) {
      return <UserConnectionsList userId={profileUserId} viewerId={viewerId} />;
    }
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <UserCheck size={24} className="text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">{connectionsCount} Connections</h3>
        <p className="text-gray-600 text-xs">Connect with this user to see who they are connected with.</p>
      </div>
    );
  };

  return (
    <div>
      <div className="flex border-b border-gray-200 bg-gray-50/50">
        {['posts', 'connections'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-1 py-4 text-sm font-medium capitalize transition-all relative ${
              activeTab === tab ? 'text-green-600 bg-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />}
          </button>
        ))}
      </div>
      <div className="p-4">
        {activeTab === 'posts' && renderPosts()}
        {activeTab === 'connections' && renderConnections()}
      </div>
    </div>
  );
};