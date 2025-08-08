import React from 'react';
import { 
  FiSearch, 
  FiFilter,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';

const PromotionFilters = ({
  filters,
  statusOptions,
  typeOptions,
  loading,
  onSearchChange,
  onViewModeChange,
  onSortChange,
  onFiltersToggle,
  onRefresh,
  setFilters,
  promotionsCount
}) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'usage-high', label: 'Usage High-Low' },
    { value: 'usage-low', label: 'Usage Low-High' }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search promotions..."
              value={filters.searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-[#8e191c] focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-4">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.selectedStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, selectedStatus: e.target.value }))}
              className="appearance-none bg-white/50 backdrop-blur-sm border border-gray-300 rounded-2xl px-4 py-3 pr-10 focus:ring-2 focus:ring-[#8e191c] focus:border-transparent transition-all duration-300 min-w-[140px]"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={filters.selectedType}
              onChange={(e) => setFilters(prev => ({ ...prev, selectedType: e.target.value }))}
              className="appearance-none bg-white/50 backdrop-blur-sm border border-gray-300 rounded-2xl px-4 py-3 pr-10 focus:ring-2 focus:ring-[#8e191c] focus:border-transparent transition-all duration-300 min-w-[160px]"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Sort Options */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white/50 backdrop-blur-sm border border-gray-300 rounded-2xl px-4 py-3 pr-10 focus:ring-2 focus:ring-[#8e191c] focus:border-transparent transition-all duration-300 min-w-[140px]"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-xl transition-all duration-300 ${
                filters.viewMode === 'grid'
                  ? 'bg-white shadow-lg text-[#8e191c]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-xl transition-all duration-300 ${
                filters.viewMode === 'list'
                  ? 'bg-white shadow-lg text-[#8e191c]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-3 bg-gradient-to-r from-[#8e191c] to-[#6b1416] hover:from-[#6b1416] hover:to-[#4a0f11] text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {promotionsCount} promotion{promotionsCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default PromotionFilters; 