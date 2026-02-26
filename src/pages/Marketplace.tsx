import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Search, Plus, MessageCircle, Shield, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMarketplaceData } from '../hooks/useMarketplaceData';
import { useMarketplaceMutations } from '../hooks/useMarketplaceMutations';
import MarketplaceListingCard from '../components/marketplace/MarketplaceListingCard';
import CreateListingModal from '../components/marketplace/CreateListingModal';
import FiltersPanel from '../components/marketplace/FiltersPanel';
import { FeedbackToast } from '../components/shared/FeedbackToast';

const CATEGORIES = ['Electronics', 'Fashion', 'Vehicles', 'Property', 'Services', 'Others'];
const CONDITIONS = [
  { value: 'all', label: 'All Conditions' },
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'refurbished', label: 'Refurbished' }
];

const Marketplace: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'myListings'>('browse');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    condition: 'all'
  });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isVerified = profile?.user_status === 'verified';

  // Build filter params for API
  const apiFilters = useMemo(() => {
    const params: any = {};
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
    if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
    if (filters.condition !== 'all') params.condition = filters.condition;
    if (debouncedSearch) params.search = debouncedSearch;
    return params;
  }, [selectedCategory, filters, debouncedSearch]);

  // Data hooks
  const { browseQuery, myListings, isLoadingMyListings } = useMarketplaceData(apiFilters);
  const { createListing, deleteListing, toggleFavorite } = useMarketplaceMutations();

  // Extract data from infinite query
  const listings = browseQuery.data?.pages.flat() ?? [];
  const isLoadingBrowse = browseQuery.isLoading && listings.length === 0;
  const isFetchingMore = browseQuery.isFetchingNextPage;

  // Active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.condition !== 'all') count++;
    if (selectedCategory !== 'All') count++;
    if (debouncedSearch) count++;
    return count;
  }, [filters, selectedCategory, debouncedSearch]);

  // Show feedback
  const showFeedback = useCallback((message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  // Search debounce
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  // Handle create listing - passed to modal
  const handleCreateListing = useCallback(async (listingData: any) => {
    try {
      await createListing.mutateAsync(listingData);
      showFeedback('Listing created successfully', 'success');
      setShowCreateModal(false);
    } catch (error: any) {
      showFeedback(error.message || 'Failed to create listing', 'error');
    }
  }, [createListing, showFeedback]);

  // Handle delete listing
  const handleDeleteListing = useCallback(async (listingId: string) => {
    try {
      await deleteListing.mutateAsync(listingId);
      showFeedback('Listing deleted', 'success');
    } catch (error: any) {
      showFeedback(error.message || 'Failed to delete listing', 'error');
    }
  }, [deleteListing, showFeedback]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedCategory('All');
    setFilters({ minPrice: '', maxPrice: '', condition: 'all' });
    setSearchQuery('');
    setDebouncedSearch('');
    showFeedback('Filters cleared', 'success'); // changed from 'info' to 'success'
  }, [showFeedback]);

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
      <div className="sticky top-0 z-30 bg-white border-b border-green-200">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold text-white">Marketplace</h1>
              <p className="text-xs text-green-100">GJBC community marketplace</p>
            </div>
            {user && (
              <div className="flex items-center gap-1">
                {isVerified ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-400/30 rounded-full">
                    <Shield size={10} className="text-green-200" />
                    <span className="text-xs text-green-100 font-medium">Verified</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-400/30 rounded-full">
                    <span className="text-xs text-yellow-100 font-medium">Member</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-3 text-center font-medium text-sm ${
              activeTab === 'browse'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Browse
          </button>
          {isVerified && (
            <button
              onClick={() => setActiveTab('myListings')}
              className={`flex-1 py-3 text-center font-medium text-sm ${
                activeTab === 'myListings'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Listings
            </button>
          )}
        </div>

        {/* Search and filter bar (only in browse tab) */}
        {activeTab === 'browse' && (
          <div className="p-3 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings..."
                className="w-full pl-9 pr-8 py-2 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <FiltersPanel
              categories={CATEGORIES}
              conditions={CONDITIONS}
              selectedCategory={selectedCategory}
              filters={filters}
              onCategoryChange={setSelectedCategory}
              onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
              onApply={() => browseQuery.refetch()}
              onClear={clearFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {activeTab === 'browse' && (
          <>
            {isLoadingBrowse ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 border animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={24} className="text-green-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">No listings found</h3>
                <p className="text-xs text-gray-600 mb-4">
                  {activeFilterCount > 0 ? 'Try adjusting your filters' : 'Be the first to create a listing'}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-white text-green-600 rounded-xl font-medium border border-green-200 hover:bg-green-50 text-xs"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {listings.map(listing => (
                    <MarketplaceListingCard
                      key={listing.id}
                      listing={listing}
                      onToggleFavorite={() => toggleFavorite.mutate(listing.id)}
                    />
                  ))}
                </div>
                {browseQuery.hasNextPage && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => browseQuery.fetchNextPage()}
                      disabled={isFetchingMore}
                      className="px-6 py-2 bg-white text-green-600 rounded-xl font-medium border border-green-200 hover:bg-green-50 disabled:opacity-50 text-xs"
                    >
                      {isFetchingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'myListings' && isVerified && (
          <>
            {isLoadingMyListings ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 border animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Plus size={24} className="text-green-500" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">No listings yet</h3>
                <p className="text-xs text-gray-600 mb-4">Create your first listing to start selling</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 text-xs"
                >
                  Create Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {myListings.map(listing => (
                  <MarketplaceListingCard
                    key={listing.id}
                    listing={listing}
                    showManage={true}
                    onEdit={(listing) => {
                      // You can implement edit modal later
                      alert('Edit feature coming soon');
                    }}
                    onDelete={handleDeleteListing}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating action button for verified users (only visible in browse tab) */}
      {activeTab === 'browse' && isVerified && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-20 right-4 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Create listing"
        >
          <Plus size={20} />
        </button>
      )}

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateListing}
      />
    </div>
  );
};

export default Marketplace;