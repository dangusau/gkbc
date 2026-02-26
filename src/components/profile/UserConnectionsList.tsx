import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCheck, UserPlus } from 'lucide-react';
import { connectionsService } from '../../services/supabase/connections';
import { MemberCard } from '../members/MemberCard';
import VerifiedBadge from '../VerifiedBadge';
import { connectionKeys } from '../../hooks/queryKeys';
import { formatTimeAgo } from '../../utils/formatters';

interface UserConnectionsListProps {
  userId: string;
  viewerId: string;
}

export const UserConnectionsList: React.FC<UserConnectionsListProps> = ({ userId, viewerId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch the profile owner's friends
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['user-friends', userId],
    queryFn: () => connectionsService.getFriendsList(userId),
  });

  // Fetch viewer's own friends to know which ones are already connected
  const { data: myFriends = [] } = useQuery({
    queryKey: connectionKeys.friends(),
    queryFn: () => connectionsService.getFriends(),
  });

  const sendRequestMutation = useMutation({
    mutationFn: (targetUserId: string) => connectionsService.sendConnectionRequest(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.friends() });
    },
  });

  const getUserInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const handleProfileClick = (memberId: string) => {
    navigate(`/profile/${memberId}`);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading connections...</div>;
  }

  if (connections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <UserCheck size={24} className="text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">No connections yet</h3>
        <p className="text-gray-600 text-xs">This user hasn't connected with anyone yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {connections.map((conn: any) => {
        const isAlreadyConnected = myFriends.some((f: any) => f.user_id === conn.user_id);
        const isSelf = conn.user_id === viewerId;
        const connectionButton = isSelf ? null : (
          <button
            disabled={isAlreadyConnected || sendRequestMutation.isPending}
            onClick={() => sendRequestMutation.mutate(conn.user_id)}
            className={`w-full py-2 text-xs rounded-lg font-medium min-h-[36px] flex items-center justify-center gap-1 ${
              isAlreadyConnected
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-green-600 text-white hover:bg-green-700 border border-green-700'
            }`}
          >
            {sendRequestMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isAlreadyConnected ? (
              <>
                <UserCheck size={14} />
                <span>Connected</span>
              </>
            ) : (
              <>
                <UserPlus size={14} />
                <span>Connect</span>
              </>
            )}
          </button>
        );

        return (
          <MemberCard
            key={conn.user_id}
            member={{
              id: conn.user_id,
              first_name: conn.user_name.split(' ')[0],
              last_name: conn.user_name.split(' ').slice(1).join(' '),
              avatar_url: conn.user_avatar,
              business_name: '',
              business_type: '',
              market_area: '',
              location: '',
              bio: '',
              role: '',
              user_status: conn.user_status,
            }}
            connectionButton={connectionButton}
            onProfileClick={(id, e) => {
              if ((e.target as HTMLElement).closest('button')) return;
              handleProfileClick(id);
            }}
            getUserInitials={getUserInitials}
          />
        );
      })}
    </div>
  );
};