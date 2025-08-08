import React from 'react';
import { 
  FiSearch, 
  FiEye, 
  FiRefreshCw,
  FiFilter,
  FiGrid,
  FiList,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiTag,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiMail,
  FiActivity,
  FiAlertCircle,
  FiDownload,
  FiXCircle,
  FiCheckCircle,
  FiCreditCard,
  FiBox,
  FiGift,
  FiPercent,
  FiShoppingCart
} from 'react-icons/fi';
import PromotionStatsCard from './PromotionStatsCard';
import PromotionFilters from './PromotionFilters';
import PromotionGrid from './PromotionGrid';
import PromotionListView from './PromotionListView';
import Pagination from '../../OrderManagement/components/Pagination';
import LoaderOverlay from '../../../components/LoaderOverlay';

const PromotionList = ({ 
  promotions, 
  loading, 
  error, 
  stats, 
  filters, 
  setFilters,
  onRefresh,
  onEdit,
  onView,
  onDelete,
  onAdd,
  onSearchChange,
  onSortChange,
  onViewModeChange,
  onFiltersToggle,
  onPageChange,
  onItemsPerPageChange,
  setError
}) => {
  // Format functions
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
  const formatUsage = (current, max) => {
    if (max === 0) return `${current} / ∞`;
    return `${current} / ${max}`;
  };

  // Status options with counts
  const statusOptions = [
    { value: 'all', label: 'All Promotions', count: stats.total },
    { value: 'active', label: 'Active', count: stats.active },
    { value: 'inactive', label: 'Inactive', count: stats.inactive },
    { value: 'expired', label: 'Expired', count: stats.expired }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'buyXGetY', label: 'Buy X Get Y Free' },
    { value: 'quantityDiscount', label: 'Quantity Discount' },
    { value: 'cartTotal', label: 'Cart Total Discount' }
  ];

  // Filter and sort promotions
  const filteredPromotions = promotions.filter(promotion => {
    if (filters.selectedStatus !== 'all') {
      const now = new Date();
      const startDate = new Date(promotion.startDate);
      const endDate = new Date(promotion.endDate);
      
      switch (filters.selectedStatus) {
        case 'active':
          if (!promotion.isActive || now < startDate || now > endDate) return false;
          break;
        case 'inactive':
          if (promotion.isActive) return false;
          break;
        case 'expired':
          if (now <= endDate) return false;
          break;
      }
    }
    
    if (filters.selectedType !== 'all' && promotion.type !== filters.selectedType) return false;
    
    if (filters.searchTerm) {
      const searchText = filters.searchTerm.toLowerCase();
      const name = (promotion.name || '').toLowerCase();
      const description = (promotion.description || '').toLowerCase();
      const code = (promotion.code || '').toLowerCase();
      
      return name.includes(searchText) || 
             description.includes(searchText) || 
             code.includes(searchText);
    }

    return true;
  });

  // Sort promotions
  const sortedPromotions = [...filteredPromotions].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'usage-high':
        return (b.currentUsage || 0) - (a.currentUsage || 0);
      case 'usage-low':
        return (a.currentUsage || 0) - (b.currentUsage || 0);
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedPromotions.length / filters.itemsPerPage);
  const startIndex = (filters.currentPage - 1) * filters.itemsPerPage;
  const endIndex = startIndex + filters.itemsPerPage;
  const currentPromotions = sortedPromotions.slice(startIndex, endIndex);

  // Handler functions
  const handleViewModeChange = (mode) => {
    onViewModeChange(mode);
  };

  const handleSortChange = (sortBy) => {
    onSortChange(sortBy);
  };

  const handleFiltersToggle = () => {
    onFiltersToggle();
  };

  const handleSearchChange = (searchTerm) => {
    onSearchChange(searchTerm);
  };

  const handlePageChange = (page) => {
    onPageChange(page);
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    onItemsPerPageChange(itemsPerPage);
  };

  return (
    <div className="w-full max-w-full mb-10 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 right-4 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 bg-[#8e191c]/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-4 sm:left-10 w-32 h-32 sm:w-40 sm:h-40 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="relative">
          <LoaderOverlay text="Loading promotions..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-[#8e191c]/5 border border-[#8e191c]/20 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#8e191c]/10 p-2 rounded-lg">
              <FiAlertCircle className="w-5 h-5 text-[#8e191c]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#6b1416]">Error Loading Promotions</h3>
              <p className="text-[#6b1416] mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-[#8e191c] hover:text-[#6b1416] transition-colors"
            >
              <FiXCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiGift className="w-8 h-8 text-[#8e191c]" />
            <span className="truncate">Promotion Management</span>
          </h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage and track all store promotions and discounts</p>
        </div>
        <button
          onClick={onAdd}
          className="bg-gradient-to-r from-[#8e191c] to-[#6b1416] hover:from-[#6b1416] hover:to-[#4a0f11] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <FiPlus className="w-5 h-5" />
          Add Promotion
        </button>
      </div>
      
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <PromotionStatsCard
          title="Total Promotions"
          value={stats.total}
          icon={FiGift}
          color="bg-gradient-to-r from-[#8e191c] to-[#6b1416]"
          subtitle="All promotions"
        />
        <PromotionStatsCard
          title="Active Promotions"
          value={stats.active}
          icon={FiCheckCircle}
          color="bg-gradient-to-r from-[#059669] to-[#10b981]"
          subtitle="Currently running"
        />
        <PromotionStatsCard
          title="Inactive Promotions"
          value={stats.inactive}
          icon={FiClock}
          color="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]"
          subtitle="Paused promotions"
        />
        <PromotionStatsCard
          title="Total Usage"
          value={stats.totalUsage}
          icon={FiActivity}
          color="bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6]"
          subtitle={`Avg: ${Math.round(stats.avgUsage)} per promotion`}
        />
      </div>

      {/* Filters and Controls */}
      <PromotionFilters
        filters={filters}
        statusOptions={statusOptions}
        typeOptions={typeOptions}
        loading={loading}
        onSearchChange={handleSearchChange}
        onViewModeChange={handleViewModeChange}
        onSortChange={handleSortChange}
        onFiltersToggle={handleFiltersToggle}
        onRefresh={onRefresh}
        setFilters={setFilters}
        promotionsCount={promotions.length}
      />

      {/* Promotions Display */}
      {promotions.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-12 shadow-xl">
            <FiGift className="w-20 h-20 text-[#8e191c] mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Promotions Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">There are no promotions to display at the moment. Create your first promotion to get started!</p>
            <button
              onClick={onAdd}
              className="bg-gradient-to-r from-[#8e191c] to-[#6b1416] hover:from-[#6b1416] hover:to-[#4a0f11] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mx-auto"
            >
              <FiPlus className="w-5 h-5" />
              Create First Promotion
            </button>
          </div>
        </div>
      ) : (
        <>
          {filters.viewMode === 'grid' ? (
            <PromotionGrid 
              promotions={currentPromotions}
              onEdit={onEdit}
              onView={onView}
              onDelete={onDelete}
              formatDate={formatDate}
              formatUsage={formatUsage}
            />
          ) : (
            <PromotionListView 
              promotions={currentPromotions}
              onEdit={onEdit}
              onView={onView}
              onDelete={onDelete}
              formatDate={formatDate}
              formatUsage={formatUsage}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={filters.currentPage}
              totalPages={totalPages}
              itemsPerPage={filters.itemsPerPage}
              totalItems={sortedPromotions.length}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PromotionList; 