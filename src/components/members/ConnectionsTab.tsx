import React from 'react';
import { UserCheck } from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';

interface ConnectionsTabProps {
  receivedRequests: any[];
  friends: any[];
  sentRequests: any[];
  onAccept: (requestId: string, senderName: string) => void;
  onReject: (requestId: string, senderName: string) => void;
  onWithdraw: (requestId: string, userName: string) => void;
  onProfileClick: (userId: string) => void;
  formatTimeAgo: (date: string) => string;
}

export const ConnectionsTab: React.FC<ConnectionsTabProps> = ({
  receivedRequests,
  friends,
  sentRequests,
  onAccept,
  onReject,
  onWithdraw,
  onProfileClick,
  formatTimeAgo,
}) => {
  if (receivedRequests.length === 0 && friends.length === 0 && sentRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <UserCheck size={32} className="text-green-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">No connections yet</h3>
        <p className="text-gray-600 text-xs mb-4">Connect with members to build your network</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {receivedRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4">Connection Requests</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {receivedRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl p-4 border flex flex-col">
                <div
                  className="flex items-center gap-3 mb-4 cursor-pointer flex-1"
                  onClick={() => onProfileClick(request.sender_id)}
                >
                  {/* Avatar wrapper with relative positioning for the absolute badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 bg-gray-100 rounded-full overflow-hidden border-2 border-green-300">
                      {request.sender_avatar ? (
                        <img src={request.sender_avatar} alt={request.sender_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-500 text-white font-bold">
                          {request.sender_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {request.sender_status === 'verified' && (
                      <div className="absolute -bottom-1 -right-1 z-10">
                        <VerifiedBadge size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{request.sender_name}</h3>
                      {request.sender_status === 'verified' && <VerifiedBadge size={10} />}
                      <span className="inline-flex items-center px-1 py-0.5 text-xs bg-yellow-100 text-yellow-700 font-bold rounded border border-yellow-300 flex-shrink-0">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{request.sender_email}</p>
                    <p className="text-xs text-gray-400">Sent {formatTimeAgo(request.created_at)}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => onAccept(request.id, request.sender_name)}
                    className="flex-1 py-2.5 text-xs bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 min-h-[36px]"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(request.id, request.sender_name)}
                    className="flex-1 py-2.5 text-xs bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 min-h-[36px]"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {friends.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4">Your Connections</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <div
                key={friend.user_id}
                className="bg-white rounded-xl p-4 border flex flex-col cursor-pointer"
                onClick={() => onProfileClick(friend.user_id)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 bg-gray-100 rounded-full overflow-hidden border-2 border-green-300">
                      {friend.user_avatar ? (
                        <img src={friend.user_avatar} alt={friend.user_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-500 text-white font-bold">
                          {friend.user_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {friend.user_status === 'verified' && (
                      <div className="absolute -bottom-1 -right-1 z-10">
                        <VerifiedBadge size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{friend.user_name}</h3>
                      {friend.user_status === 'verified' && <VerifiedBadge size={10} />}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{friend.user_email}</p>
                    <p className="text-xs text-gray-400">Connected {formatTimeAgo(friend.connected_at)}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onProfileClick(friend.user_id);
                  }}
                  className="w-full py-2 text-xs bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 mt-3 min-h-[36px]"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {sentRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-4">Sent Requests</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sentRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl p-4 border flex flex-col">
                <div
                  className="flex items-center gap-3 mb-4 cursor-pointer flex-1"
                  onClick={() => onProfileClick(request.connected_user_id)}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 bg-gray-100 rounded-full overflow-hidden border-2 border-green-300">
                      {request.user_avatar ? (
                        <img src={request.user_avatar} alt={request.user_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-500 text-white font-bold">
                          {request.user_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {request.user_status === 'verified' && (
                      <div className="absolute -bottom-1 -right-1 z-10">
                        <VerifiedBadge size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{request.user_name}</h3>
                      {request.user_status === 'verified' && <VerifiedBadge size={10} />}
                      <span className="inline-flex items-center px-1 py-0.5 text-xs bg-yellow-100 text-yellow-700 font-bold rounded border border-yellow-300 flex-shrink-0">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{request.user_email}</p>
                    <p className="text-xs text-gray-400">Sent {formatTimeAgo(request.created_at)}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProfileClick(request.connected_user_id);
                    }}
                    className="flex-1 py-2.5 text-xs bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 min-h-[36px]"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onWithdraw(request.id, request.user_name);
                    }}
                    className="flex-1 py-2.5 text-xs bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 min-h-[36px]"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};