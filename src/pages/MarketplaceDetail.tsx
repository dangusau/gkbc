import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMarketplaceData } from '../hooks/useMarketplaceData';
import { useMarketplaceMutations } from '../hooks/useMarketplaceMutations';
import { Heart, MapPin, Eye, Shield, Star, ArrowLeft, MessageCircle } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters';
import { marketplaceService } from '../services/supabase/marketplace';
import { messagingService } from '../services/supabase/messaging';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialogue';
import { FeedbackToast } from '../components/shared/FeedbackToast';

// Simple star rating components
const StarRatingInput: React.FC<{ value: number; onChange: (rating: number) => void }> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            size={20}
            className={star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
};

const StarRatingDisplay: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
        />
      ))}
    </div>
  );
};

const MarketplaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useListing, useReviews } = useMarketplaceData();
  const { toggleFavorite, addReview, deleteListing } = useMarketplaceMutations();

  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const {
    data: listing,
    isLoading: listingLoading,
    error: listingError,
  } = useListing(id!);

  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    refetch: refetchReviews,
  } = useReviews(id!);

  // Safe defaults
  const safeListing = {
    id: listing?.id || '',
    seller_id: listing?.seller_id || '',
    title: listing?.title || '',
    price: listing?.price ?? 0,
    description: listing?.description || '',
    category: listing?.category || '',
    condition: listing?.condition || '',
    location: listing?.location || '',
    images: listing?.images || [],
    views_count: listing?.views_count || 0,
    created_at: listing?.created_at || new Date().toISOString(),
    seller_name: listing?.seller_name || 'Unknown',
    seller_verified: listing?.seller_verified || false,
    seller_avatar: listing?.seller_avatar || null,
    is_favorited: listing?.is_favorited || false,
    favorite_count: listing?.favorite_count || 0,
    is_sold: listing?.is_sold || false,
  };

  const images = safeListing.images;
  const currentImage = images[selectedImage] || '/placeholder-image.jpg';
  const isOwner = user?.id === safeListing.seller_id;
  const userHasReviewed = reviews.some(r => r.reviewer_id === user?.id);

  // Increment view count (only once per user)
  useEffect(() => {
    if (listing && user) {
      marketplaceService.incrementViews(listing.id, user.id).catch(console.error);
    }
  }, [listing, user]);

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleFavorite = async () => {
    if (!user) {
      showFeedback('Please sign in to favorite listings', 'error');
      return;
    }
    if (listing) {
      try {
        await toggleFavorite.mutateAsync(listing.id);
      } catch (error: any) {
        showFeedback(error.message || 'Failed to update favorite', 'error');
      }
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showFeedback('Please sign in to add a review', 'error');
      return;
    }
    if (!listing) return;

    setSubmittingReview(true);
    try {
      await addReview.mutateAsync({
        listingId: listing.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment('');
      setReviewRating(5);
      refetchReviews();
      showFeedback('Review added successfully', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to add review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    setDeleting(true);
    try {
      await deleteListing.mutateAsync(listing.id);
      showFeedback('Listing deleted successfully', 'success');
      setTimeout(() => navigate('/marketplace'), 1500);
    } catch (error: any) {
      showFeedback(error.message || 'Failed to delete listing', 'error');
      setDeleting(false);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  const handleContact = async () => {
    if (!user) {
      showFeedback('Please sign in to contact the seller', 'error');
      return;
    }
    try {
      const conversationId = await messagingService.getOrCreateConversation(
        user.id,
        safeListing.seller_id,
        'marketplace',
        safeListing.id
      );
      navigate(`/messages/${conversationId}`, {
        state: {
          otherUser: {
            id: safeListing.seller_id,
            name: safeListing.seller_name,
            avatar: safeListing.seller_avatar,
            status: safeListing.seller_verified ? 'verified' : 'member',
          },
          context: 'marketplace',
          listing: {
            id: safeListing.id,
            title: safeListing.title,
          },
        },
      });
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      showFeedback('Failed to start conversation', 'error');
    }
  };

  if (listingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-square bg-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (listingError || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-lg font-bold text-gray-900">Listing not found</h2>
          <button
            onClick={() => navigate('/marketplace')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Feedback Toast */}
      {feedback && (
        <FeedbackToast
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDanger={true}
      />

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-blue-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/marketplace')}
            className="p-2 hover:bg-blue-50 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-blue-600" />
          </button>
          <h1 className="text-sm font-bold text-gray-900">Listing Details</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Images */}
          <div className="space-y-3">
            <div className="aspect-square bg-white rounded-xl overflow-hidden border border-blue-200">
              <img
                src={currentImage}
                alt={safeListing.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
                      selectedImage === idx ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right column - Details */}
          <div className="space-y-4">
            {/* Title and price */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{safeListing.title}</h1>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    ₦{safeListing.price.toLocaleString()}
                  </p>
                </div>
                {!isOwner && (
                  <button
                    onClick={handleFavorite}
                    className="p-3 bg-white rounded-full shadow border border-blue-200 hover:bg-blue-50 transition-colors"
                    aria-label={safeListing.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      size={20}
                      fill={safeListing.is_favorited ? '#EF4444' : 'none'}
                      strokeWidth={2}
                      className={safeListing.is_favorited ? 'text-red-500' : 'text-gray-600'}
                    />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Eye size={16} className="text-gray-400" />
                  <span>{safeListing.views_count} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  <span>{reviews.length} reviews</span>
                </div>
              </div>
            </div>

            {/* Seller info */}
            <div className="border-t border-blue-200 pt-4">
              <h2 className="font-semibold text-gray-900 mb-2">Seller Information</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                    {safeListing.seller_avatar ? (
                      <img src={safeListing.seller_avatar} alt={safeListing.seller_name} className="w-full h-full object-cover" />
                    ) : (
                      safeListing.seller_name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  {safeListing.seller_verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Shield size={8} className="text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{safeListing.seller_name}</p>
                  <p className="text-xs text-gray-500">Listed {formatTimeAgo(safeListing.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-blue-200 pt-4">
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {safeListing.description || 'No description provided.'}
              </p>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-blue-200 pt-4">
              <div>
                <span className="text-xs text-gray-500">Category</span>
                <p className="font-medium text-sm">{safeListing.category}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Condition</span>
                <p className="font-medium text-sm capitalize">{safeListing.condition}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Location</span>
                <div className="flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" />
                  <p className="font-medium text-sm">{safeListing.location}</p>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Posted</span>
                <p className="font-medium text-sm">{formatTimeAgo(safeListing.created_at)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {!isOwner && (
                <button
                  onClick={handleContact}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Contact Seller
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    onClick={() => navigate(`/marketplace/edit/${listing.id}`)}
                    className="flex-1 py-3 bg-white text-blue-600 rounded-xl font-medium border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleting}
                    className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-medium border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 border-t border-blue-200 pt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Reviews ({reviews.length})</h2>

          {user && !isOwner && !userHasReviewed && (
            <form onSubmit={handleAddReview} className="bg-white rounded-xl p-4 border border-blue-200 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Write a Review</h3>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Rating</label>
                <StarRatingInput value={reviewRating} onChange={setReviewRating} />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingReview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {reviewsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-blue-200 animate-pulse">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                        {review.reviewer_avatar ? (
                          <img src={review.reviewer_avatar} alt={review.reviewer_name} className="w-full h-full object-cover" />
                        ) : (
                          review.reviewer_name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{review.reviewer_name}</span>
                      {/* Verified badge removed because review.reviewer_verified doesn't exist */}
                    </div>
                    <StarRatingDisplay rating={review.rating} />
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(review.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceDetail;