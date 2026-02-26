import type { MarketplaceListing } from '../../hooks/admin/useAdminMarketplace';
import React, { useState } from 'react';
import {
  ShoppingBag, Search, ChevronDown, ChevronUp, Trash2,
  Star, Eye, Heart, Loader2, Filter, XCircle
} from 'lucide-react';
import { useAdminMarketplace } from '../../hooks/admin/useAdminMarketplace';
import { StatCard } from '../../components/admin/StatCard';
import { ConfirmationDialog } from '../../components/shared/ConfirmationDialogue';
import { FeedbackToast } from '../../components/shared/FeedbackToast';

const AdminMarketplace: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [isSold, setIsSold] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    listing: MarketplaceListing | null;
  }>({ isOpen: false, listing: null });
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const limit = 20;

  const {
    listings,
    totalCount,
    isLoading,
    isFetching,
    error,
    expandedListingId,
    setExpandedListingId,
    listingDetails,
    isLoadingDetails,
    deleteListing,
  } = useAdminMarketplace({ search, category, condition, isSold, page, limit });

  // Categories from your schema – adjust if needed
  const categories = ['products', 'services'];
  const conditions = ['new', 'used', 'refurbished'];

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
  };

  const closeFeedback = () => setFeedback(null);

  const handleDelete = (listing: MarketplaceListing) => {
    setConfirmAction({ isOpen: true, listing });
  };

  const confirmDelete = async () => {
    if (!confirmAction.listing) return;
    try {
      await deleteListing.mutateAsync(confirmAction.listing.id);
      showFeedback('Listing deleted permanently', 'success');
    } catch (err: any) {
      showFeedback(err.message || 'Delete failed', 'error');
    } finally {
      setConfirmAction({ isOpen: false, listing: null });
    }
  };

  const cancelDelete = () => {
    setConfirmAction({ isOpen: false, listing: null });
  };

  const totalPages = Math.ceil(totalCount / limit);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-green-600" size={32} />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="text-green-600" size={24} /> Marketplace Listings
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by title or seller..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
          >
            Search
          </button>
        </div>
      </div>

      {isFetching && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs shadow flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" /> Updating...
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select
          value={condition}
          onChange={(e) => { setCondition(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Conditions</option>
          {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
        </select>
        <select
          value={isSold === undefined ? '' : isSold.toString()}
          onChange={(e) => {
            const val = e.target.value;
            setIsSold(val === '' ? undefined : val === 'true');
            setPage(0);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="false">Available</option>
          <option value="true">Sold</option>
        </select>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {listings.map((listing) => (
              <React.Fragment key={listing.id}>
                <tr
                  className={`hover:bg-gray-50 cursor-pointer ${expandedListingId === listing.id ? 'bg-green-50' : ''}`}
                  onClick={() => setExpandedListingId(expandedListingId === listing.id ? null : listing.id)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{listing.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{listing.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs mr-2">
                        {listing.seller.avatar_url ? (
                          <img src={listing.seller.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          `${listing.seller.first_name?.charAt(0) || ''}${listing.seller.last_name?.charAt(0) || ''}`
                        )}
                      </div>
                      <span className="text-sm">{listing.seller.first_name} {listing.seller.last_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    ₦{listing.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {listing.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {listing.condition}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      listing.is_sold
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {listing.is_sold ? 'Sold' : 'Available'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(listing)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete permanently"
                      >
                        <Trash2 size={18} />
                      </button>
                      {expandedListingId === listing.id ? (
                        <ChevronUp size={18} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-400" />
                      )}
                    </div>
                  </td>
                </tr>
                {expandedListingId === listing.id && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-green-50">
                      {isLoadingDetails ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Loader2 size={16} className="animate-spin" /> Loading details...
                        </div>
                      ) : listingDetails ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <StatCard title="Views" value={listingDetails.views_count} previous={null} icon={<Eye size={16} />} />
                          <StatCard title="Favorites" value={listingDetails.favorites_count} previous={null} icon={<Heart size={16} />} />
                          <StatCard title="Reviews" value={listingDetails.reviews_count} previous={null} icon={<Star size={16} />} />
                          <StatCard title="Avg Rating" value={listingDetails.average_rating} previous={null} icon={<Star size={16} />} precision={1} suffix=" ★" />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">No details available</div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {page * limit + 1} to {Math.min((page + 1) * limit, totalCount)} of {totalCount} listings
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction.isOpen && (
        <ConfirmationDialog
          isOpen={confirmAction.isOpen}
          title="Delete Listing Permanently"
          message={`Are you sure you want to delete "${confirmAction.listing?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDanger={true}
        />
      )}

      {/* Feedback Toast */}
      {feedback && (
        <FeedbackToast
          message={feedback.message}
          type={feedback.type}
          onClose={closeFeedback}
        />
      )}
    </div>
  );
};

export default AdminMarketplace;