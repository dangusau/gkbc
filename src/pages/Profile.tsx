import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { ChevronLeft, MoreVertical, Edit3, Share2, LogOut, AlertCircle, UserPlus, UserMinus, Check, Clock, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile, useProfilePosts, profileKeys } from '../hooks/useProfile';
import { useConnectionsData } from '../hooks/useConnectionsData';
import { useConnectionMutations } from '../hooks/useConnectionMutations';
import { connectionKeys } from '../hooks/queryKeys';
import { profileService } from '../services/supabase/profile';
import { connectionsService } from '../services/supabase/connections';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ProfileTabs } from '../components/profile/ProfileTabs';
import { EditModal } from '../components/profile/EditModal';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialogue';
import { FeedbackToast } from '../components/shared/FeedbackToast';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  console.log('Profile rendered with userId param:', userId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const viewerId = user?.id;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'connect' | 'withdraw' | 'accept' | 'reject' | 'disconnect' | 'deletePost' | 'deleteAvatar' | 'deleteHeader';
    targetId?: string;
    userName?: string;
  } | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const profileUserId = userId || 'current';
  console.log('userId param:', userId);
  const { data: profileData, isLoading } = useProfile(profileUserId, viewerId || 'current');
  const profileQueryKey = profileKeys.detail(profileUserId, viewerId!);
  const { data: posts = [] } = useProfilePosts(profileUserId, viewerId || 'current');
  const { receivedRequests, sentRequests, friends } = useConnectionsData('', '', '');
  const mutations = useConnectionMutations('', '', '');

  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => profileService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.posts(profileUserId, viewerId!) });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('Profile not loaded');
      await connectionsService.removeConnection(profile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
      showNotification('Disconnected', 'success');
    },
    onError: (error: any) => {
      showNotification(error.message || 'Failed to disconnect', 'error');
    },
  });

  if (isLoading || !profileData?.profile) {
    return <div className="min-h-screen bg-gray-50 animate-pulse" />;
  }

  const { profile, stats, relationship } = profileData;
  const isOwner = !!relationship?.is_owner;
  const isConnected = !!relationship?.is_connected;
  console.log('isOwner:', isOwner, 'isConnected:', isConnected, 'relationship:', relationship);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Top action button handlers
  const handleConnect = () => {
    setConfirmAction({ type: 'connect', targetId: profile.id, userName: `${profile.first_name} ${profile.last_name}` });
    setShowConfirmModal(true);
  };

  const handleWithdraw = async () => {
    const pending = sentRequests.find(r => r.connected_user_id === profile.id);
    if (pending) {
      setConfirmAction({ type: 'withdraw', targetId: pending.id, userName: `${profile.first_name} ${profile.last_name}` });
      setShowConfirmModal(true);
    }
  };

  const handleAccept = async () => {
    console.log('handleAccept called');
    const pending = receivedRequests.find(r => r.sender_id === profile.id);
    if (pending) {
      console.log('Found pending request:', pending.id);
      setConfirmAction({ type: 'accept', targetId: pending.id, userName: `${profile.first_name} ${profile.last_name}` });
      setShowConfirmModal(true);
    } else {
      console.log('No pending request found');
    }
  };

  const handleReject = async () => {
    const pending = receivedRequests.find(r => r.sender_id === profile.id);
    if (pending) {
      setConfirmAction({ type: 'reject', targetId: pending.id, userName: `${profile.first_name} ${profile.last_name}` });
      setShowConfirmModal(true);
    }
  };

  // Connections tab handlers (receive requestId directly)
  const handleAcceptRequest = (requestId: string, senderName: string) => {
    setConfirmAction({ type: 'accept', targetId: requestId, userName: senderName });
    setShowConfirmModal(true);
  };

  const handleRejectRequest = (requestId: string, senderName: string) => {
    setConfirmAction({ type: 'reject', targetId: requestId, userName: senderName });
    setShowConfirmModal(true);
  };

  const handleWithdrawRequest = (requestId: string, userName: string) => {
    setConfirmAction({ type: 'withdraw', targetId: requestId, userName });
    setShowConfirmModal(true);
  };

  const handleDisconnect = () => {
    setConfirmAction({ type: 'disconnect', targetId: profile.id, userName: `${profile.first_name} ${profile.last_name}` });
    setShowConfirmModal(true);
  };

  const confirmConnectionAction = async () => {
    if (!confirmAction || !profile) return;
    try {
      if (confirmAction.type === 'connect') {
        await mutations.sendRequest(profile.id);
        showNotification('Connection request sent', 'success');
      } else if (confirmAction.type === 'withdraw' && confirmAction.targetId) {
        await mutations.withdrawRequest(confirmAction.targetId);
        showNotification('Request withdrawn', 'success');
      } else if (confirmAction.type === 'accept' && confirmAction.targetId) {
        console.log('About to accept request:', confirmAction.targetId);
        await mutations.acceptRequest(confirmAction.targetId);
        console.log('Accept mutation succeeded');
        showNotification('Connection accepted', 'success');
      } else if (confirmAction.type === 'reject' && confirmAction.targetId) {
        await mutations.rejectRequest(confirmAction.targetId);
        showNotification('Request rejected', 'success');
      } else if (confirmAction.type === 'disconnect') {
        await disconnectMutation.mutateAsync();
      }
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
    } catch (error: any) {
      showNotification(error.message || 'Action failed', 'error');
    } finally {
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleDeletePost = (post: any) => {
    setConfirmAction({ type: 'deletePost', targetId: post.id, userName: 'this post' });
    setShowConfirmModal(true);
  };

  const handleDeleteAvatar = () => {
    setConfirmAction({ type: 'deleteAvatar', userName: 'profile picture' });
    setShowConfirmModal(true);
  };

  const handleDeleteHeader = () => {
    setConfirmAction({ type: 'deleteHeader', userName: 'cover photo' });
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'deletePost' && confirmAction.targetId) {
        await profileService.deletePost(confirmAction.targetId);
        showNotification('Post deleted', 'success');
        queryClient.invalidateQueries({ queryKey: profileKeys.posts(profileUserId, viewerId!) });
      } else if (confirmAction.type === 'deleteAvatar') {
        await profileService.removeProfileAvatar();
        showNotification('Avatar removed', 'success');
        queryClient.invalidateQueries({ queryKey: profileQueryKey });
      } else if (confirmAction.type === 'deleteHeader') {
        await profileService.removeProfileHeader();
        showNotification('Cover photo removed', 'success');
        queryClient.invalidateQueries({ queryKey: profileQueryKey });
      }
    } catch (error: any) {
      showNotification(error.message || 'Delete failed', 'error');
    } finally {
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      await profileService.updateProfileAvatar(file);
      showNotification('Profile picture updated', 'success');
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
    } catch (error: any) {
      showNotification(error.message || 'Upload failed', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingHeader(true);
      await profileService.updateProfileHeader(file);
      showNotification('Cover photo updated', 'success');
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
    } catch (error: any) {
      showNotification(error.message || 'Upload failed', 'error');
    } finally {
      setUploadingHeader(false);
    }
  };

  const shareProfile = async () => {
    const url = `${window.location.origin}/profile/${profile.id}`;
    await navigator.clipboard.writeText(url);
    showNotification('Profile link copied', 'success');
    setShowShareMenu(false);
  };

  const renderPrimaryActionButton = () => {
    if (isOwner) {
      return (
        <button
          onClick={handleEditProfile}
          className="w-full max-w-xs mx-auto py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:from-green-700 hover:to-green-800 active:scale-[0.98] transition-all min-h-[52px] border border-green-800"
        >
          <Edit3 size={20} />
          Edit Profile
        </button>
      );
    }
    if (isConnected) {
      return (
        <button
          onClick={handleDisconnect}
          className="w-full max-w-xs mx-auto py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:from-red-600 hover:to-rose-700 active:scale-[0.98] transition-all min-h-[52px] border border-red-800"
        >
          <UserMinus size={20} />
          Disconnect
        </button>
      );
    }
    const pendingSent = sentRequests.find(r => r.connected_user_id === profile.id);
    const pendingReceived = receivedRequests.find(r => r.sender_id === profile.id);
    if (pendingSent) {
      return (
        <button
          onClick={handleWithdraw}
          className="w-full max-w-xs mx-auto py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:from-yellow-600 hover:to-amber-600 active:scale-[0.98] transition-all min-h-[52px] border border-yellow-700"
        >
          <Clock size={20} />
          Withdraw Request
        </button>
      );
    }
    if (pendingReceived) {
      return (
        <div className="w-full max-w-xs mx-auto flex gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:from-green-600 hover:to-emerald-600 active:scale-[0.98] transition-all min-h-[52px] border border-green-700"
          >
            <Check size={20} />
            Accept
          </button>
          <button
            onClick={handleReject}
            className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:from-red-600 hover:to-rose-600 active:scale-[0.98] transition-all min-h-[52px] border border-red-700"
          >
            <X size={20} />
            Reject
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={handleConnect}
        className="w-full max-w-xs mx-auto py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:from-green-600 hover:to-emerald-700 active:scale-[0.98] transition-all min-h-[52px] border border-green-800"
      >
        <UserPlus size={20} />
        Connect
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {notification && <FeedbackToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
      <input type="file" ref={headerInputRef} onChange={handleHeaderUpload} accept="image/*" className="hidden" />

      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full border border-gray-200">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Profile</h1>
          <div className="relative">
            <button onClick={() => setShowOptionsMenu(!showOptionsMenu)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full border border-gray-200">
              <MoreVertical size={24} />
            </button>
            {showOptionsMenu && (
              <div className="absolute right-0 top-12 bg-white rounded-xl shadow-2xl border border-gray-200 w-48 py-2 z-40">
                {isOwner ? (
                  <>
                    <button onClick={() => { setShowOptionsMenu(false); handleEditProfile(); }} className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50">
                      <Edit3 size={18} className="text-gray-600" />
                      <span className="font-medium">Edit Profile</span>
                    </button>
                    <button onClick={() => { setShowOptionsMenu(false); setShowShareMenu(true); }} className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50">
                      <Share2 size={18} className="text-gray-600" />
                      <span className="font-medium">Share Profile</span>
                    </button>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button onClick={() => { setShowOptionsMenu(false); }} className="w-full px-4 py-3 text-left flex items-center gap-3 text-red-600 hover:bg-red-50">
                      <LogOut size={18} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setShowOptionsMenu(false); setShowShareMenu(true); }} className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50">
                      <Share2 size={18} className="text-gray-600" />
                      <span className="font-medium">Share Profile</span>
                    </button>
                    <button onClick={() => { setShowOptionsMenu(false); navigate(`/report?type=user&id=${profile.id}`); }} className="w-full px-4 py-3 text-left flex items-center gap-3 text-red-600 hover:bg-red-50 border-t border-gray-200 mt-2 pt-3">
                      <AlertCircle size={18} />
                      <span className="font-medium">Report User</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfileHeader
        profile={profile}
        isOwner={isOwner}
        isVerified={profile.user_status === 'verified'}
        onEditProfile={handleEditProfile}
        onRemoveAvatar={handleDeleteAvatar}
        onRemoveHeader={handleDeleteHeader}
        uploadingAvatar={uploadingAvatar}
        uploadingHeader={uploadingHeader}
        avatarInputRef={avatarInputRef as React.RefObject<HTMLInputElement>}
        headerInputRef={headerInputRef as React.RefObject<HTMLInputElement>}
      />

      <ProfileStats
        postsCount={stats?.posts_count ?? 0}
        connectionsCount={stats?.connections_count ?? 0}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="px-4 mt-8 mb-6">{renderPrimaryActionButton()}</div>

      {/* Fixed: Use the request-specific handlers for the connections tab */}
      <ProfileTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        profileUserId={profile.id}
        viewerId={viewerId!}
        isOwner={isOwner}
        isConnected={isConnected}
        posts={posts}
        receivedRequests={receivedRequests}
        sentRequests={sentRequests}
        friends={friends}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        onWithdrawRequest={handleWithdrawRequest}
        connectionsCount={stats?.connections_count ?? 0}
        postsQueryKey={profileKeys.posts(profileUserId, viewerId!)}
        onDeletePostMutation={isOwner ? deletePostMutation.mutateAsync : undefined}
      />

      <ConfirmationDialog
        isOpen={showConfirmModal}
        title={
          confirmAction?.type === 'connect' ? `Connect with ${confirmAction.userName}?` :
          confirmAction?.type === 'withdraw' ? `Withdraw request to ${confirmAction.userName}?` :
          confirmAction?.type === 'accept' ? `Accept connection from ${confirmAction.userName}?` :
          confirmAction?.type === 'reject' ? `Reject connection from ${confirmAction.userName}?` :
          confirmAction?.type === 'disconnect' ? `Remove ${confirmAction.userName} from your connections?` :
          confirmAction?.type === 'deletePost' ? 'Delete this post?' :
          confirmAction?.type === 'deleteAvatar' ? 'Remove profile picture?' :
          confirmAction?.type === 'deleteHeader' ? 'Remove cover photo?' : ''
        }
        message={
          confirmAction?.type === 'connect' ? 'They will be notified and need to accept.' :
          confirmAction?.type === 'withdraw' ? 'Your pending request will be cancelled.' :
          confirmAction?.type === 'accept' ? 'You will be able to message each other.' :
          confirmAction?.type === 'reject' ? 'They will not be notified.' :
          confirmAction?.type === 'disconnect' ? 'This action cannot be undone.' :
          confirmAction?.type?.includes('delete') ? 'This action cannot be undone.' : ''
        }
        confirmText={
          confirmAction?.type === 'connect' ? 'Send Request' :
          confirmAction?.type === 'withdraw' ? 'Withdraw' :
          confirmAction?.type === 'accept' ? 'Accept' :
          confirmAction?.type === 'reject' ? 'Reject' :
          confirmAction?.type === 'disconnect' ? 'Remove' :
          'Delete'
        }
        onConfirm={() => {
          if (confirmAction?.type?.startsWith('delete')) {
            confirmDelete();
          } else {
            confirmConnectionAction();
          }
        }}
        onCancel={() => setShowConfirmModal(false)}
        isDanger={confirmAction?.type === 'reject' || confirmAction?.type === 'disconnect' || confirmAction?.type?.startsWith('delete')}
      />

      {showShareMenu && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setShowShareMenu(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 animate-slideUp border-t border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Share Profile</h3>
              <button onClick={() => setShowShareMenu(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <button onClick={shareProfile} className="w-full py-4 bg-green-50 text-green-700 rounded-xl font-bold flex items-center justify-center gap-3 border-2 border-green-200 hover:bg-green-100">
              <Share2 size={20} />
              Copy Profile Link
            </button>
          </div>
        </>
      )}

      <EditModal
        type="profile"
        data={profile}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={async (updatedData) => {
          try {
            await profileService.updateProfileData(updatedData);
            showNotification('Profile updated', 'success');
            queryClient.invalidateQueries({ queryKey: profileQueryKey });
            setShowEditModal(false);
          } catch (error: any) {
            showNotification(error.message || 'Update failed', 'error');
            throw error;
          }
        }}
      />
    </div>
  );
};

export default Profile;