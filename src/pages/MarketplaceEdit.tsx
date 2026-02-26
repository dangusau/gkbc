import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMarketplaceData } from '../hooks/useMarketplaceData';
import { useMarketplaceMutations } from '../hooks/useMarketplaceMutations';
import { ArrowLeft, Upload, X, DollarSign, MapPin, Camera, AlertCircle, Info } from 'lucide-react';
import { storageService } from '../services/supabase/storage';
import { FeedbackToast } from '../components/shared/FeedbackToast';

const CATEGORIES = ['Electronics', 'Fashion', 'Vehicles', 'Property', 'Services', 'Others'];
const CONDITIONS = [
  { value: 'new', label: 'Brand New' },
  { value: 'used', label: 'Used - Good' },
  { value: 'refurbished', label: 'Refurbished' }
];
const MAX_IMAGES = 5;

const MarketplaceEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { useListing } = useMarketplaceData();
  const { updateListing } = useMarketplaceMutations();

  const { data: listing, isLoading, error } = useListing(id!);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('used');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load listing data into form
  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description || '');
      setPrice(listing.price.toString());
      setCategory(listing.category);
      setCondition(listing.condition);
      setLocation(listing.location);
      setExistingImages(listing.images || []);
    }
  }, [listing]);

  // Check ownership and verification
  const isOwner = user?.id === listing?.seller_id;
  const isVerified = profile?.user_status === 'verified';

  useEffect(() => {
    if (!isLoading && (!listing || !isOwner || !isVerified)) {
      navigate(`/marketplace/${id}`, { replace: true });
    }
  }, [isLoading, listing, isOwner, isVerified, navigate, id]);

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Title is required';
    else if (title.length < 3) errors.title = 'Title must be at least 3 characters';

    if (!price) errors.price = 'Price is required';
    else if (parseFloat(price) <= 0) errors.price = 'Price must be greater than 0';

    if (!category) errors.category = 'Category is required';
    if (!location.trim()) errors.location = 'Location is required';
    if (existingImages.length === 0 && images.length === 0) {
      errors.images = 'At least one image is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !listing) return;

    setUploading(true);
    try {
      let imageUrls = [...existingImages];

      // Upload new images
      if (images.length > 0) {
        const newUrls = await storageService.uploadMarketplaceImages(images, user?.id || '');
        imageUrls = [...imageUrls, ...newUrls];
      }

      await updateListing.mutateAsync({
        id: listing.id,
        updates: {
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price),
          category,
          condition,
          location: location.trim(),
          images: imageUrls,
        },
      });

      showFeedback('Listing updated successfully', 'success');
      setTimeout(() => navigate(`/marketplace/${listing.id}`), 1500);
    } catch (error: any) {
      showFeedback(error.message || 'Failed to update listing', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );
    const totalImages = existingImages.length + images.length + validFiles.length;
    if (totalImages > MAX_IMAGES) {
      showFeedback(`You can only upload up to ${MAX_IMAGES} images`, 'error');
      return;
    }
    setImages(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    navigate(`/marketplace/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h2 className="text-lg font-bold text-gray-900">Listing not found</h2>
          <button
            onClick={() => navigate('/marketplace')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl"
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

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-green-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-green-50 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-green-600" />
          </button>
          <h1 className="text-sm font-bold text-gray-900">Edit Listing</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title field (same as before) */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">Product Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (formErrors.title) setFormErrors(prev => ({ ...prev, title: '' })); }}
              placeholder="What are you selling?"
              className={`w-full p-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all ${
                formErrors.title ? 'border-red-300' : 'border-green-200'
              }`}
              maxLength={100}
            />
            {formErrors.title && (
              <div className="flex items-center gap-1 text-red-600 text-xs">
                <AlertCircle size={10} />
                <span>{formErrors.title}</span>
              </div>
            )}
          </div>

          {/* Description field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item in detail..."
              className="w-full p-2 border border-green-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all h-24 resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Optional</span>
              <span>{description.length}/1000</span>
            </div>
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">Price (₦) *</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center">
                  <DollarSign className="text-gray-400" size={16} />
                </div>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => { setPrice(e.target.value); if (formErrors.price) setFormErrors(prev => ({ ...prev, price: '' })); }}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all ${
                    formErrors.price ? 'border-red-300' : 'border-green-200'
                  }`}
                  min="0"
                  step="0.01"
                />
              </div>
              {formErrors.price && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle size={10} />
                  <span>{formErrors.price}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">Category *</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); if (formErrors.category) setFormErrors(prev => ({ ...prev, category: '' })); }}
                className={`w-full p-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all ${
                  formErrors.category ? 'border-red-300' : 'border-green-200'
                }`}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {formErrors.category && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle size={10} />
                  <span>{formErrors.category}</span>
                </div>
              )}
            </div>
          </div>

          {/* Condition and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">Condition *</label>
              <div className="grid grid-cols-3 gap-1">
                {CONDITIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCondition(value)}
                    className={`p-2 rounded-lg border text-xs font-medium transition-all min-h-[36px] ${
                      condition === value
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-green-200 hover:bg-green-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">Location *</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center">
                  <MapPin className="text-gray-400" size={16} />
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); if (formErrors.location) setFormErrors(prev => ({ ...prev, location: '' })); }}
                  placeholder="City, State"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all ${
                    formErrors.location ? 'border-red-300' : 'border-green-200'
                  }`}
                />
              </div>
              {formErrors.location && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle size={10} />
                  <span>{formErrors.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700">Product Images *</label>
              <span className="text-xs text-gray-500">
                {existingImages.length + images.length}/{MAX_IMAGES}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {/* Existing images */}
              {existingImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-green-200 group">
                  <img src={url} alt={`Existing ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                  {index === 0 && existingImages.length > 0 && (
                    <div className="absolute top-1 left-1 px-1 py-0.5 bg-green-600 text-white text-xs font-medium rounded-full">
                      Cover
                    </div>
                  )}
                </div>
              ))}

              {/* New images */}
              {images.map((file, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border border-green-200 group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Add button */}
              {existingImages.length + images.length < MAX_IMAGES && (
                <label className="aspect-square border border-dashed border-green-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all group">
                  <Camera size={16} className="text-green-600 mb-2" />
                  <span className="text-xs font-medium text-green-700">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {formErrors.images && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={14} className="text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-xs">{formErrors.images}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
            >
              {uploading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarketplaceEdit;