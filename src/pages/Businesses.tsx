import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Store, Star, MapPin, X, AlertCircle } from 'lucide-react';
import { useBusinessData } from '../hooks/useBusinessData';
import { useBusinessMutations } from '../hooks/useBusinessMutations';
import BusinessCard from '../components/business/BusinessCard';
import CreateBusinessModal from '../components/business/CreateBusinessModal';
import { useAuth } from '../contexts/AuthContext';
import { LOCATION_AXIS } from '../types/index';

const Businesses: React.FC = () => {
  const { userProfile } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'products' | 'services' | 'all'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

  const filters = useMemo(() => ({
    business_type: selectedType === 'all' ? undefined : selectedType,
    location_axis: selectedLocation === 'all' ? undefined : selectedLocation,
    search: searchQuery || undefined,
  }), [selectedType, selectedLocation, searchQuery]);

  const {
    businessesPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    userStatus,
  } = useBusinessData(filters);

  const { createBusiness } = useBusinessMutations();

  const businesses = businessesPages.flat();
  const isVerified = userStatus.can_create_business;

  const handleCreateClick = useCallback(() => {
    if (!isVerified) {
      setShowVerificationAlert(true);
      setTimeout(() => setShowVerificationAlert(false), 3000);
      return;
    }
    setShowCreateModal(true);
  }, [isVerified]);

  const clearFilters = useCallback(() => {
    setSelectedType('all');
    setSelectedLocation('all');
    setSearchQuery('');
    setShowFilters(false);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedType !== 'all') count++;
    if (selectedLocation !== 'all') count++;
    if (searchQuery) count++;
    return count;
  }, [selectedType, selectedLocation, searchQuery]);

  if (isLoading && businesses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white safe-area">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 border-b border-green-800">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-sm font-bold mb-1">GJBC Business Directory</h1>
            <p className="text-green-100 text-xs">Find reliable and trusted businesses</p>
          </div>
        </div>
        <div className="p-3 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-3 border border-green-200 animate-pulse">
              <div className="flex gap-2">
                <div className="w-14 h-14 bg-gray-200 rounded-lg border border-green-200"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2.5 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-2.5 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-20 safe-area">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 border-b border-green-800">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-sm font-bold mb-1">GJBC Business Directory</h1>
          <p className="text-green-100 text-xs">Find GJBC Businesses in Jigawa • Reliable and Verified</p>
        </div>
      </div>

      {/* Verification Alert */}
      {showVerificationAlert && (
        <div className="animate-fade-in px-3 pt-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-yellow-800 text-xs">Verified Members Only</h4>
              <p className="text-yellow-700 text-xs">Contact support to upgrade your account.</p>
            </div>
            <button
              onClick={() => setShowVerificationAlert(false)}
              className="text-yellow-600 hover:text-yellow-800 min-h-[36px] min-w-[36px] p-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="sticky top-0 bg-white border-b border-green-200 z-10 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search businesses..."
              className="w-full pl-10 pr-3 py-2.5 bg-white rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-xs min-h-[36px]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-white rounded-lg border border-green-300 hover:bg-green-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <Filter size={16} className="text-green-600" />
          </button>
          {activeFiltersCount > 0 && !showFilters && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="bg-green-50 border-b border-green-200 p-3 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-gray-900 text-xs">Filters</h2>
              <button onClick={clearFilters} className="text-xs text-green-600 hover:text-green-700 font-medium">
                Clear All
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 font-medium mb-1">Business Type</label>
                <div className="flex border border-green-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`flex-1 py-2 text-center font-medium text-xs transition-colors min-h-[36px] ${
                      selectedType === 'all' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedType('products')}
                    className={`flex-1 py-2 text-center font-medium text-xs transition-colors min-h-[36px] ${
                      selectedType === 'products' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    Products
                  </button>
                  <button
                    onClick={() => setSelectedType('services')}
                    className={`flex-1 py-2 text-center font-medium text-xs transition-colors min-h-[36px] ${
                      selectedType === 'services' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-green-50'
                    }`}
                  >
                    Services
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-medium mb-1">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-xs min-h-[36px]"
                >
                  <option value="all">All Locations</option>
                  {LOCATION_AXIS.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Indicator */}
      {activeFiltersCount > 0 && !showFilters && (
        <div className="bg-green-50 border-b border-green-200 px-3 py-1.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-gray-600">Active filters:</span>
              {selectedType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                  {selectedType}
                  <button onClick={() => setSelectedType('all')} className="ml-0.5 p-0.5">
                    <X size={8} />
                  </button>
                </span>
              )}
              {selectedLocation !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                  {selectedLocation}
                  <button onClick={() => setSelectedLocation('all')} className="ml-0.5 p-0.5">
                    <X size={8} />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-200">
                  Search: {searchQuery.substring(0, 10)}{searchQuery.length > 10 ? '...' : ''}
                  <button onClick={() => setSearchQuery('')} className="ml-0.5 p-0.5">
                    <X size={8} />
                  </button>
                </span>
              )}
            </div>
            <button onClick={() => setShowFilters(true)} className="text-xs text-green-600 hover:text-green-700 font-medium">
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Businesses List */}
      <div className="max-w-7xl mx-auto">
        {businesses.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center border border-green-200">
              <Store size={24} className="text-green-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 text-xs mb-4">
              {isVerified ? 'Be the first to list a business!' : 'No businesses found in this area.'}
            </p>
            <button
              onClick={handleCreateClick}
              className={`px-4 py-2.5 rounded-lg font-medium text-xs min-h-[36px] ${
                isVerified
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                  : 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
              }`}
            >
              {isVerified ? 'List Your Business' : 'Verified Members Only'}
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {businesses.map(business => (
              <BusinessCard key={business.id} business={business} />
            ))}
            {hasNextPage && (
              <div className="text-center py-3">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg text-xs hover:bg-green-50 disabled:opacity-50"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
            {isFetching && !isFetchingNextPage && (
              <div className="text-center py-2">
                <span className="text-xs text-green-600">Updating...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Business FAB */}
      {isVerified && (
        <button
          onClick={handleCreateClick}
          className="fixed bottom-20 right-4 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Plus size={20} />
        </button>
      )}

      <CreateBusinessModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default Businesses;