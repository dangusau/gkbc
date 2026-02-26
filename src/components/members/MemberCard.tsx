import React from 'react';
import type { Member } from '../../types/index';
import VerifiedBadge from '../VerifiedBadge';

interface MemberCardProps {
  member: Member;
  connectionButton: React.ReactNode;
  onProfileClick: (memberId: string, e: React.MouseEvent) => void;
  getUserInitials: (first?: string, last?: string) => string;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  connectionButton,
  onProfileClick,
  getUserInitials,
}) => {
  const isVerified = member.user_status === 'verified';

  return (
    <div
      className="bg-white rounded-xl p-3 border hover:shadow-md transition-shadow cursor-pointer flex flex-col"
      onClick={(e) => onProfileClick(member.id, e)}
    >
      <div className="flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Avatar wrapper – no overflow hidden here */}
            <div className="relative w-14 h-14 flex-shrink-0">
              {/* Avatar image container – clips the image to a circle */}
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-green-200">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.full_name || `${member.first_name} ${member.last_name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-500 text-white font-bold">
                    {getUserInitials(member.first_name, member.last_name)}
                  </div>
                )}
              </div>
              {/* Badge positioned relative to the outer wrapper – can overflow */}
              {isVerified && (
                <div className="absolute -bottom-0.5 -right-1 z-10">
                  <VerifiedBadge size={14} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h3 className="font-bold text-gray-900 text-sm truncate">
                  {member.first_name} {member.last_name}
                </h3>
                {isVerified && <VerifiedBadge size={14} />}
              </div>
              {member.business_name && (
                <p className="text-gray-700 text-xs font-medium truncate">{member.business_name}</p>
              )}
            </div>
          </div>
        </div>
        {member.business_type && (
          <div className="mb-2">
            <span className="inline-block px-2 py-1 text-xs bg-green-50 text-green-600 font-medium rounded-full border border-green-200">
              {member.business_type}
            </span>
          </div>
        )}
        {member.market_area && (
          <div className="mb-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 font-medium rounded-full border border-green-300 truncate">
                {member.market_area}
              </span>
            </div>
          </div>
        )}
        {member.location && member.location !== member.market_area && (
          <div className="flex items-center gap-1.5 text-gray-600 text-xs mb-2">
            <span className="truncate">{member.location}</span>
          </div>
        )}
        {member.bio && (
          <p className="text-gray-700 text-xs line-clamp-2 mt-1 flex-1">{member.bio}</p>
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
        {connectionButton}
      </div>
    </div>
  );
};
