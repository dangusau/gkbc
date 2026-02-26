import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Eye, User, Shield } from 'lucide-react';
import type{ MarketplaceListing } from '../../types/index';
import { formatTimeAgo } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { useMarketplaceMutations } from '../../hooks/useMarketplaceMutations';

interface MarketplaceListingCardProps {
  listing: MarketplaceListing;
  onToggleFavorite?: (listingId: string) => void;
  showManage?: boolean;
  onEdit?: (listing: MarketplaceListing) => void;
  onDelete?: (listingId: string) => void;
}

const MarketplaceListingCard: React.FC<MarketplaceListingCardProps> = ({
  listing,
  showManage = false,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // only need user.id for ownership check
  const { toggleFavorite } = useMarketplaceMutations();

  const isOwner = user?.id === listing.seller_id;

  const handleCardClick = () => {
    navigate(`/marketplace/${listing.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    toggleFavorite.mutate(listing.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(listing);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this listing?')) {
      onDelete?.(listing.id);
    }
  };

  const getConditionBadgeStyle = (): string => {
    switch (listing.condition) {
      case 'new':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'used':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'refurbished':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getCategoryBadgeStyle = (): string => {
    return 'bg-green-50 text-green-700 border border-green-200';
  };

  const getSellerInitials = (): string => {
    return listing.seller_name?.charAt(0).toUpperCase() || 'U';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="w-full h-full flex items-center justify-center bg-gray-100">
          <span class="text-gray-400 text-xs">No image</span>
        </div>
      `;
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-xl border border-green-200 overflow-hidden cursor-pointer 
                 hover:shadow-lg hover:scale-[1.02] active:scale-[0.995] transition-all duration-300
                 focus:outline-none focus:ring-2 focus:ring-green-500/20"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
    >
      {/* Image container */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {listing.images[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-indigo-50">
            <User size={32} className="text-green-300" />
          </div>
        )}

        {/* Favorite button (only if user is logged in and not owner) */}
        {user && !isOwner && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow 
                       hover:bg-white hover:shadow-md transition-all"
            aria-label={listing.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              size={16}
              fill={listing.is_favorited ? '#EF4444' : 'none'}
              strokeWidth={2.5}
              className={listing.is_favorited ? 'text-red-500' : 'text-gray-600'}
            />
          </button>
        )}

        {/* Owner badge */}
        {isOwner && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full shadow">
            Your Listing
          </div>
        )}

        {/* Condition badge */}
        <div className={`absolute bottom-2 left-2 px-2 py-1 text-xs font-medium rounded-full ${getConditionBadgeStyle()}`}>
          {listing.condition.toUpperCase()}
        </div>

        {/* Management buttons (if showManage and owner) */}
        {showManage && isOwner && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <button
              onClick={handleEditClick}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow hover:bg-white"
              aria-label="Edit listing"
            >
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow hover:bg-white"
              aria-label="Delete listing"
            >
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="mb-2">
          <h3 className="text-sm font-bold text-gray-900 truncate leading-tight mb-1">
            {listing.title}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-green-600">
              ₦{listing.price.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <MapPin size={12} className="text-gray-400" />
            <span className="truncate max-w-[100px]">{listing.location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Eye size={12} className="text-gray-400" />
            <span>{listing.views_count}</span>
          </div>
        </div>

        {/* Seller info */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <div className="relative">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {getSellerInitials()}
            </div>
            {listing.seller_verified && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border border-white">
                <Shield size={6} className="text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-800 truncate">
                {listing.seller_name}
              </span>
              <span className="text-xs text-gray-500">
                {formatTimeAgo(listing.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="mt-3">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadgeStyle()}`}>
            {listing.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceListingCard;