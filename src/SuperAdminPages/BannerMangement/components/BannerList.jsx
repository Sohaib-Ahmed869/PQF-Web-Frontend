import React, { useState } from 'react';
import { 
  FiSearch, 
  FiEye, 
  FiEdit3, 
  FiTrash2, 
  FiImage,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiCalendar,
  FiMoreHorizontal,
  FiFilter,
  FiGrid,
  FiList,
  FiStar,
  FiTrendingUp,
  FiMessageSquare,
  FiGift,
  FiDollarSign,
  FiEyeOff,
  FiDownload,
  FiShare2,
  FiTag,
  FiClock,
  FiUsers,
  FiMapPin,
  FiHome    
} from 'react-icons/fi';
import DeleteBanner from './DeleteBanner';
import { toast } from 'react-toastify';

const BannerList = ({ banners: initialBanners, loading, onDelete, onDeleteRequest, onRefresh, onAdd, onView, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [localBanners, setLocalBanners] = useState(initialBanners);
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'type'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStore, setSelectedStore] = useState('all');

  const bannerTypes = [
    { value: 'all', label: 'All Types', icon: FiGrid, color: 'from-gray-500 to-gray-600', count: 0 },
    { value: 'promotional', label: 'Promotional', icon: FiTrendingUp, color: 'from-red-500 to-red-600', count: 0 },
    { value: 'announcement', label: 'Announcement', icon: FiMessageSquare, color: 'from-red-600 to-red-700', count: 0 },
    { value: 'featured', label: 'Featured', icon: FiStar, color: 'from-red-700 to-red-800', count: 0 },
    { value: 'seasonal', label: 'Seasonal', icon: FiGift, color: 'from-red-500 to-pink-600', count: 0 },
    { value: 'advertisement', label: 'Advertisement', icon: FiDollarSign, color: 'from-red-800 to-red-900', count: 0 }
  ];

  // Update local banners when initialBanners changes
  React.useEffect(() => {
    setLocalBanners(initialBanners);
  }, [initialBanners]);

  // Calculate counts for each banner type
  const typeCounts = React.useMemo(() => {
    const counts = {};
    localBanners.forEach(banner => {
      const type = banner.bannerType || 'promotional';
      counts[type] = (counts[type] || 0) + 1;
    });
    counts.all = localBanners.length;
    return counts;
  }, [localBanners]);

  // Update banner types with counts
  const bannerTypesWithCounts = bannerTypes.map(type => ({
    ...type,
    count: typeCounts[type.value] || 0
  }));

  // Utility to get unique stores
  const getUniqueStores = () => {
    const stores = localBanners.reduce((acc, banner) => {
      if (banner.store_name && banner.store_id) {
        acc[banner.store_id] = {
          id: banner.store_id,
          name: banner.store_name,
          city: banner.store_address_city,
          country: banner.store_address_country
        };
      }
      return acc;
    }, {});
    return Object.values(stores);
  };

  // Update filteredBanners logic to include store filtering
  const filteredBanners = localBanners.filter(banner => {
    // Type filter
    if (selectedType !== 'all' && (banner.bannerType || 'promotional') !== selectedType) {
      return false;
    }

    // Store filter - NEW
    if (selectedStore !== 'all' && banner.store_id !== selectedStore) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchText = searchTerm.toLowerCase();
      const createdDate = new Date(banner.createdAt).toLocaleDateString();
      const bannerId = banner._id.toLowerCase();
      const bannerType = (banner.bannerType || 'promotional').toLowerCase();
      const storeName = (banner.store_name || '').toLowerCase();
      const storeCity = (banner.store_address_city || '').toLowerCase();
      
      return createdDate.includes(searchText) || 
             bannerId.includes(searchText) || 
             bannerType.includes(searchText) ||
             storeName.includes(searchText) ||
             storeCity.includes(searchText);
    }

    return true;
  });

  // Sort banners
  const sortedBanners = [...filteredBanners].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'type':
        return (a.bannerType || 'promotional').localeCompare(b.bannerType || 'promotional');
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedBanners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBanners = sortedBanners.slice(startIndex, endIndex);

  const handleDelete = (bannerId) => {
    const updatedBanners = localBanners.filter(banner => banner._id !== bannerId);
    setLocalBanners(updatedBanners);
    onDelete(bannerId);
    toast.success('Banner deleted successfully! 🗑️', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleCardClick = (banner) => {
    onView(banner);
  };

  const getBannerTypeIcon = (type) => {
    const bannerType = bannerTypes.find(t => t.value === (type || 'promotional'));
    return bannerType ? bannerType.icon : FiImage;
  };

  const getBannerTypeColor = (type) => {
    const bannerType = bannerTypes.find(t => t.value === (type || 'promotional'));
    return bannerType ? bannerType.color : 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-50/20 p-6">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 flex justify-center items-center h-96">
          <div className="text-center">
            {/* Futuristic loading spinner */}
            <div className="w-20 h-20 relative mx-auto mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-red-200 border-t-red-500 animate-spin"></div>
              <div className="absolute inset-2 w-16 h-16 rounded-full border-2 border-red-100 border-b-red-400 animate-spin animate-reverse"></div>
              <div className="absolute inset-4 w-12 h-12 rounded-full border-2 border-pink-100 border-l-pink-500 animate-spin"></div>
            </div>
            <div className="text-red-600 text-xl font-semibold">Loading banners...</div>
            <div className="text-gray-500 text-sm mt-2">Please wait while we fetch your content</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-50/20 p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-600/3 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Filters and Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 mb-8 shadow-xl">
          {/* Search and View Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search banners by date, ID, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all duration-300 shadow-sm border border-gray-200"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="type">By Type</option>
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  showFilters || selectedType !== 'all'
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <FiFilter className="w-4 h-4" />
                Filters
                {selectedType !== 'all' && (
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                )}
              </button>

              <button
                onClick={onRefresh}
                className="px-4 py-2 bg-gray-50 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-300 shadow-sm flex items-center gap-2 border border-gray-200"
              >
                <FiRefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Banner Type Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FiTag className="w-4 h-4" />
                Filter by Banner Type
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {bannerTypesWithCounts.map((type) => {
                  const IconComponent = type.icon;
                  const isSelected = selectedType === type.value;
                  
                  return (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 text-left ${
                        isSelected
                          ? 'bg-gradient-to-r ' + type.color + ' text-white border-transparent shadow-lg transform scale-105'
                          : 'bg-white hover:bg-red-50 border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                          isSelected 
                            ? 'bg-white/20' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className={`text-2xl font-bold ${
                          isSelected ? 'text-white' : 'text-gray-900'
                        }`}>
                          {type.count}
                        </span>
                      </div>
                      <div className={`font-medium text-sm ${
                        isSelected ? 'text-white' : 'text-gray-700'
                      }`}>
                        {type.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Store Filter - NEW */}
              {getUniqueStores().length > 0 && (
                <>
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <FiHome className="w-4 h-4" />
                    Filter by Store
                  </h4>
                  <div className="mb-4">
                    <select
                      value={selectedStore}
                      onChange={(e) => setSelectedStore(e.target.value)}
                      className="w-full md:w-auto px-5 py-3 bg-white border border-gray-300 rounded-2xl text-gray-900 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all duration-300 hover:border-red-400"
                      style={{ minWidth: 260 }}
                    >
                      <option value="all">
                        All Stores ({getUniqueStores().length})
                      </option>
                      {getUniqueStores().map(store => {
                        const storeCount = localBanners.filter(b => b.store_id === store.id).length;
                        return (
                          <option key={store.id} value={store.id}>
                            {store.name} - {store.city}, {store.country} ({storeCount})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-6">
            <div className="text-sm text-gray-600">
              Showing {currentBanners.length} of {sortedBanners.length} banners
              {selectedType !== 'all' && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                  {bannerTypesWithCounts.find(t => t.value === selectedType)?.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiClock className="w-4 h-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Banners Grid/List */}
        {localBanners.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-12 shadow-xl">
              <FiImage className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Banners Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">You haven't uploaded any banners yet. Get started by adding your first banner to showcase your content!</p>
              <button
                onClick={onAdd}
                className="px-8 py-4 bg-gradient-to-r from-red-600 via-red-500 to-pink-500 text-white rounded-xl hover:from-red-700 hover:via-red-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-xl hover:shadow-red-500/30 transform hover:scale-105"
              >
                Add Your First Banner
              </button>
            </div>
          </div>
        ) : sortedBanners.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-12 shadow-xl">
              <FiSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No banners match your filters</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search terms or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedStore('all'); // Add this line
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentBanners.map(banner => {
                  const TypeIcon = getBannerTypeIcon(banner.bannerType);
                  const typeColor = getBannerTypeColor(banner.bannerType);
                  
                  return (
                    <div 
                      key={banner._id} 
                      onClick={() => handleCardClick(banner)}
                      className="bg-white/80 backdrop-blur-sm rounded-3xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2 group shadow-xl overflow-hidden border border-gray-200/50"
                    >
                      <div className="aspect-video overflow-hidden relative">
                        <img
                          src={banner.image}
                          alt="Banner"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Overlay effects */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        
                        {/* Banner Type Badge */}
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r ${typeColor} text-white border border-white/20 flex items-center shadow-lg`}>
                            <TypeIcon className="w-4 h-4 mr-2" />
                            {(banner.bannerType || 'promotional').charAt(0).toUpperCase() + (banner.bannerType || 'promotional').slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                                Banner #{banner._id.slice(-6)}
                              </h3>
                              <span className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center shadow-lg ${
                                  banner.isVisible !== false 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-gray-500 text-white'
                                }`}> 
                                  {banner.isVisible !== false ? (
                                    <FiEye className="w-4 h-4" />
                                  ) : (
                                    <FiEyeOff className="w-4 h-4" />
                                  )}
                                </span>
                            </div>
                            
                            {/* Store Information - NEW */}
                            {banner.store_name && (
                              <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center text-sm text-gray-700 mb-1">
                                  <FiHome className="w-4 h-4 mr-2 text-red-600" />
                                  <span className="font-medium truncate">{banner.store_name}</span>
                                </div>
                                {banner.store_address_city && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <FiMapPin className="w-3 h-3 mr-1" />
                                    <span className="truncate">
                                      {banner.store_address_city}, {banner.store_address_country}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center text-sm text-gray-500 gap-3">
                              <FiCalendar className="w-4 h-4 mr-2" />
                              {new Date(banner.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-3 gap-2 transition-all duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(banner);
                              }}
                              className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-green-700 bg-green-50 rounded-xl hover:bg-green-100 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 group/btn transform hover:scale-105 border border-green-200"
                            >
                              <FiEye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(banner);
                              }}
                              className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group/btn transform hover:scale-105 border border-blue-200"
                            >
                              <FiEdit3 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteRequest(banner);
                              }}
                              className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-red-700 bg-red-50 rounded-xl hover:bg-red-100 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 group/btn transform hover:scale-105 border border-red-200"
                            >
                              <FiTrash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View - UPDATED */
              <div className="space-y-4">
                {currentBanners.map(banner => {
                  const TypeIcon = getBannerTypeIcon(banner.bannerType);
                  const typeColor = getBannerTypeColor(banner.bannerType);
                  
                  return (
                    <div 
                      key={banner._id} 
                      onClick={() => handleCardClick(banner)}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:scale-102 group shadow-lg border border-gray-200/50 overflow-hidden"
                    >
                      <div className="flex items-center p-6">
                        <div className="w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 mr-6">
                          <img
                            src={banner.image}
                            alt="Banner"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors duration-300">
                                Banner #{banner._id.slice(-6)}
                              </h3>
                              
                              {/* Store Information in List View - NEW */}
                              {banner.store_name && (
                                <div className="mb-2">
                                  <div className="flex items-center text-sm text-gray-600 mb-1">
                                    <FiHome className="w-4 h-4 mr-2 text-red-600" />
                                    <span className="font-medium">{banner.store_name}</span>
                                  </div>
                                  {banner.store_address_city && (
                                    <div className="flex items-center text-xs text-gray-500 ml-6">
                                      <FiMapPin className="w-3 h-3 mr-1" />
                                      <span>{banner.store_address_city}, {banner.store_address_country}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <FiCalendar className="w-4 h-4 mr-2" />
                                  {new Date(banner.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                                <div className="flex items-center">
                                  <TypeIcon className="w-4 h-4 mr-2" />
                                  {(banner.bannerType || 'promotional').charAt(0).toUpperCase() + (banner.bannerType || 'promotional').slice(1)}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                banner.isVisible !== false 
                                  ? 'bg-green-100 text-green-700 border border-green-300' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-300'
                              }`}> 
                                {banner.isVisible !== false ? (
                                  <FiEye className="w-3 h-3 inline" />
                                ) : (
                                  <FiEyeOff className="w-3 h-3 inline" />
                                )}
                              </span>
                              
                              <div className="flex items-center space-x-2 transition-all duration-300">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onView(banner);
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 hover:scale-110"
                                  title="View Banner"
                                >
                                  <FiEye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(banner);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-110"
                                  title="Edit Banner"
                                >
                                  <FiEdit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteRequest(banner);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                                  title="Delete Banner"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, sortedBanners.length)} of {sortedBanners.length} banners
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value={6}>6 per page</option>
                    <option value={9}>9 per page</option>
                    <option value={12}>12 per page</option>
                    <option value={18}>18 per page</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    First
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-sm border border-gray-200"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300 ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105'
                              : 'text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-sm border border-gray-200"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BannerList;