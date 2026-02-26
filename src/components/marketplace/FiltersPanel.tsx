import React, { useState } from 'react';
import { X, Filter } from 'lucide-react';

interface FiltersPanelProps {
  categories: string[];
  conditions: { value: string; label: string }[];
  selectedCategory: string;
  filters: {
    minPrice: string;
    maxPrice: string;
    condition: string;
  };
  onCategoryChange: (category: string) => void;
  onFilterChange: (key: string, value: string) => void;
  onApply: () => void;
  onClear: () => void;
  activeFilterCount: number;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  categories,
  conditions,
  selectedCategory,
  filters,
  onCategoryChange,
  onFilterChange,
  onApply,
  onClear,
  activeFilterCount
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-xl border border-green-200 bg-white text-green-600 hover:bg-green-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
        aria-label="Open filters"
      >
        <Filter size={16} />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border border-white">
            {activeFilterCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white border border-green-200 rounded-xl p-3 shadow-lg animate-slideDown">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-gray-900">Filters</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-100 rounded-full min-h-[36px] min-w-[36px] flex items-center justify-center"
          aria-label="Close filters"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => onCategoryChange('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedCategory === 'All'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-green-200 hover:bg-green-50'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedCategory === cat
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-green-200 hover:bg-green-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Min Price (₦)</label>
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            placeholder="0"
            className="w-full p-2 border border-green-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Max Price (₦)</label>
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            placeholder="Any"
            className="w-full p-2 border border-green-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
        <select
          value={filters.condition}
          onChange={(e) => onFilterChange('condition', e.target.value)}
          className="w-full p-2 border border-green-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20"
        >
          <option value="all">All Conditions</option>
          {conditions.map(cond => (
            <option key={cond.value} value={cond.value}>{cond.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onApply}
          className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all text-xs"
        >
          Apply Filters
        </button>
        <button
          onClick={onClear}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all text-xs"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default FiltersPanel;