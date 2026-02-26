import React from 'react';
import { Camera, Upload, X, MapPin, Mail, Phone, Globe, ExternalLink, Calendar } from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';
import { formatTimeAgo } from '../../utils/formatters';
import type { Profile } from '../../types/index';

interface ProfileHeaderProps {
  profile: Profile;
  isOwner: boolean;
  isVerified: boolean;
  onEditProfile: () => void;
  onRemoveAvatar: () => void;
  onRemoveHeader: () => void;
  uploadingAvatar: boolean;
  uploadingHeader: boolean;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  headerInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwner,
  isVerified,
  onRemoveAvatar,
  onRemoveHeader,
  uploadingAvatar,
  uploadingHeader,
  avatarInputRef,
  headerInputRef,
}) => (
  <>
    {/* Cover + Avatar container – relative to anchor the avatar */}
    <div className="relative">
      {/* Cover */}
      <div className="h-36 bg-gradient-to-r from-green-400 to-green-600">
        {profile.header_image_url && (
          <img src={profile.header_image_url} alt="Cover" className="w-full h-full object-cover" />
        )}
        {isOwner && (
          <div className="absolute top-4 right-4 flex gap-2">
            {profile.header_image_url && (
              <button
                onClick={onRemoveHeader}
                disabled={uploadingHeader}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white disabled:opacity-50"
              >
                {uploadingHeader ? (
                  <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <X size={20} />
                )}
              </button>
            )}
            <button
              onClick={() => headerInputRef.current?.click()}
              disabled={uploadingHeader}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white disabled:opacity-50"
            >
              {uploadingHeader ? (
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={20} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Avatar – absolutely positioned relative to the container */}
      <div className="absolute -bottom-12 left-4 sm:left-1/2 sm:transform sm:-translate-x-1/2">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full border-4 border-white shadow-xl overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.first_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 text-white text-3xl font-bold">
                {profile.first_name?.charAt(0)}
              </div>
            )}
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 z-10">
                <VerifiedBadge size={25} />
              </div>
            )}
          </div>
          {isOwner && (
            <div className="absolute -bottom-1 left-2 transform -translate-x-1/2 flex gap-2 mt-2">
              {profile.avatar_url && (
                <button
                  onClick={onRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X size={15} />
                  )}
                </button>
              )}
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload size={15} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Info section – starts after the cover+avatar container */}
    <div className="pt-16 px-4 text-center">
      <div className="mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {profile.first_name} {profile.last_name}
          </h1>
          {isVerified && <VerifiedBadge size={15} />}
        </div>
        {profile.business_name && <p className="text-gray-600 mt-1 font-medium">{profile.business_name}</p>}
        {!isVerified && (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full mt-2">
            <span className="text-xs font-medium text-yellow-700">Member Account</span>
          </div>
        )}
      </div>

      {profile.bio && (
        <div className="mt-6 bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-green-100 max-w-2xl mx-auto">
          <p className="text-gray-600 leading-relaxed text-sm">{profile.bio}</p>
        </div>
      )}

      {/* Contact Info */}
      {(profile.email || profile.phone || profile.location || profile.website) && (
        <div className="mt-6 flex flex-wrap justify-center gap-3 px-2">
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-2 text-gray-500 hover:text-green-600 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300"
            >
              <Mail size={16} />
              <span className="text-sm">Email</span>
            </a>
          )}
          {profile.phone && (
            <a
              href={`tel:${profile.phone}`}
              className="flex items-center gap-2 text-gray-500 hover:text-green-600 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300"
            >
              <Phone size={16} />
              <span className="text-sm">Call</span>
            </a>
          )}
          {profile.location && (
            <div className="flex items-center gap-2 text-gray-500 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <MapPin size={16} />
              <span className="text-sm">{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green-600 hover:text-green-700 px-3 py-2 bg-green-50 rounded-lg border border-green-200 hover:border-green-300"
            >
              <Globe size={16} />
              <span className="text-sm">Website</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}

      {/* Member Since */}
      <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full border border-gray-300">
        <Calendar size={14} className="text-gray-500" />
        <span className="text-sm text-gray-700 font-medium">Member since {formatTimeAgo(profile.created_at)}</span>
      </div>
    </div>
  </>
);