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
  FiFilter,
  FiGrid,
  FiList,
  FiTag,
  FiClock,
  FiUsers,
  FiHash,
  FiCheckCircle,
  FiXCircle,
  FiBox,
  FiHome,
  FiMapPin
} from 'react-icons/fi';
import Select from 'react-select';

const CategoryList = ({ categories: initialCategories, loading, onDelete, onRefresh, onAdd, onView, onEdit, onDeleteRequest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [localCategories, setLocalCategories] = useState(initialCategories);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStore, setSelectedStore] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Categories', count: 0 },
    { value: 'active', label: 'Active', count: 0 },
    { value: 'inactive', label: 'Inactive', count: 0 }
  ];

  // Update local categories when initialCategories changes
  React.useEffect(() => {
    setLocalCategories(initialCategories);
  }, [initialCategories]);

  // Calculate counts for each status
  const statusCounts = React.useMemo(() => {
    const counts = {};
    localCategories.forEach(category => {
      if (category.isActive) {
        counts.active = (counts.active || 0) + 1;
      } else {
        counts.inactive = (counts.inactive || 0) + 1;
      }
    });
    counts.all = localCategories.length;
    return counts;
  }, [localCategories]);

  // Update status options with counts
  const statusOptionsWithCounts = statusOptions.map(option => ({
    ...option,
    count: statusCounts[option.value] || 0
  }));

  // Utility to get unique stores from categories
  const getUniqueStores = () => {
    const stores = localCategories.reduce((acc, category) => {
      if (category.store_name && category.store_id) {
        acc[category.store_id] = {
          id: category.store_id,
          name: category.store_name,
          city: category.store_address_city,
          country: category.store_address_country
        };
      }
      return acc;
    }, {});
    return Object.values(stores);
  };

  const filteredCategories = localCategories.filter(category => {
    // Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active' && !category.isActive) return false;
      if (selectedStatus === 'inactive' && category.isActive) return false;
    }

    // Store filter
    if (selectedStore !== 'all' && category.store_id !== selectedStore) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const searchText = searchTerm.toLowerCase();
      const categoryName = category.name.toLowerCase();
      const groupCode = category.ItemsGroupCode.toString();
      const createdDate = new Date(category.createdAt).toLocaleDateString();
      
      return categoryName.includes(searchText) || 
             groupCode.includes(searchText) || 
             createdDate.includes(searchText);
    }

    return true;
  });

  // Sort categories
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'groupCode':
        return a.ItemsGroupCode - b.ItemsGroupCode;
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = sortedCategories.slice(startIndex, endIndex);

  const handleCardClick = (category) => {
    onView(category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-50/20 p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 flex justify-center items-center h-96">
          <div className="text-center">
            <div className="w-20 h-20 relative mx-auto mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-red-200 border-t-red-500 animate-spin"></div>
              <div className="absolute inset-2 w-16 h-16 rounded-full border-2 border-red-100 border-b-red-400 animate-spin animate-reverse"></div>
              <div className="absolute inset-4 w-12 h-12 rounded-full border-2 border-pink-100 border-l-pink-500 animate-spin"></div>
            </div>
            <div className="text-red-600 text-xl font-semibold">Loading categories...</div>
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
                  placeholder="Search categories by name, group code, or date..."
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
                <option value="name">By Name</option>
                <option value="groupCode">By Group Code</option>
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  showFilters || selectedStatus !== 'all'
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <FiFilter className="w-4 h-4" />
                Filters
                {selectedStatus !== 'all' && (
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

          {/* Status Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FiTag className="w-4 h-4" />
                Filter by Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {statusOptionsWithCounts.map((status) => {
                  const isSelected = selectedStatus === status.value;
                  const Icon = status.value === 'active' ? FiCheckCircle : 
                              status.value === 'inactive' ? FiXCircle : FiGrid;
                  
                  return (
                    <button
                      key={status.value}
                      onClick={() => setSelectedStatus(status.value)}
                      className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 text-left ${
                        isSelected
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-transparent shadow-lg transform scale-105'
                          : 'bg-white hover:bg-red-50 border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                          isSelected 
                            ? 'bg-white/20' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-2xl font-bold ${
                          isSelected ? 'text-white' : 'text-gray-900'
                        }`}>
                          {status.count}
                        </span>
                      </div>
                      <div className={`font-medium text-sm ${
                        isSelected ? 'text-white' : 'text-gray-700'
                      }`}>
                        {status.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Store Filter - NEW */}
              {getUniqueStores().length > 0 && (
                <>
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2 mt-6">
                    <FiHome className="w-4 h-4" />
                    Filter by Store
                  </h4>
                  <div className="mb-4">
                    <Select
                      options={[
                        { value: 'all', label: `All Stores (${getUniqueStores().length})` },
                        ...getUniqueStores().map(store => ({
                          value: store.id,
                          label: `${store.name} - ${store.city || ''}${store.city && store.country ? ', ' : ''}${store.country || ''} (${localCategories.filter(c => c.store_id === store.id).length})`
                        }))
                      ]}
                      value={(() => {
                        if (selectedStore === 'all') return { value: 'all', label: `All Stores (${getUniqueStores().length})` };
                        const store = getUniqueStores().find(s => s.id === selectedStore);
                        return store ? {
                          value: store.id,
                          label: `${store.name} - ${store.city || ''}${store.city && store.country ? ', ' : ''}${store.country || ''} (${localCategories.filter(c => c.store_id === store.id).length})`
                        } : null;
                      })()}
                      onChange={opt => setSelectedStore(opt ? opt.value : 'all')}
                      isClearable
                      isSearchable
                      placeholder="-- Select a Store --"
                      classNamePrefix="react-select"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: state.isFocused ? '#ef4444' : base.borderColor,
                          boxShadow: state.isFocused ? '0 0 0 2px #fecaca' : base.boxShadow,
                          '&:hover': { borderColor: '#ef4444' },
                          minWidth: 260
                        })
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-6">
            <div className="text-sm text-gray-600">
              Showing {currentCategories.length} of {sortedCategories.length} categories
              {selectedStatus !== 'all' && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                  {statusOptionsWithCounts.find(s => s.value === selectedStatus)?.label}
                </span>
              )}
              {selectedStore !== 'all' && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                  {getUniqueStores().find(s => s.id === selectedStore)?.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiClock className="w-4 h-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Categories Grid/List */}
        {localCategories.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-12 shadow-xl">
              <FiImage className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Categories Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">You haven't created any categories yet. Get started by adding your first category to organize your products!</p>
              <button
                onClick={onAdd}
                className="px-8 py-4 bg-gradient-to-r from-red-600 via-red-500 to-pink-500 text-white rounded-xl hover:from-red-700 hover:via-red-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-xl hover:shadow-red-500/30 transform hover:scale-105"
              >
                Add Your First Category
              </button>
            </div>
          </div>
        ) : sortedCategories.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-12 shadow-xl">
              <FiSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No categories match your filters</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search terms or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedStore('all');
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
                {currentCategories.map(category => (
                  <div 
                    key={category._id} 
                    onClick={() => handleCardClick(category)}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2 group shadow-xl overflow-hidden border border-gray-200/50"
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center shadow-lg ${
                          category.isActive 
                            ? 'bg-green-500 text-white border border-green-400' 
                            : 'bg-gray-500 text-white border border-gray-400'
                        }`}>
                          {category.isActive ? (
                            <>
                              <FiCheckCircle className="w-4 h-4 mr-2" />
                              Active
                            </>
                          ) : (
                            <>
                              <FiXCircle className="w-4 h-4 mr-2" />
                              Inactive
                            </>
                          )}
                        </span>
                      </div>

                      {/* Group Code Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-2 rounded-xl text-sm font-semibold bg-red-500 text-white border border-red-400 flex items-center shadow-lg">
                          <FiHash className="w-4 h-4 mr-1" />
                          {category.ItemsGroupCode}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                              {category.name}
                            </h3>
                            <span className="flex items-center text-sm text-pink-600 font-semibold bg-pink-50 rounded-lg px-2 py-1">
                              <FiBox className="w-4 h-4 mr-1" />
                              {category.itemCount || 0}
                            </span>
                          </div>
                          {/* Store Information - NEW */}
                          {category.store_name && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="flex items-center text-sm text-gray-700 mb-1">
                                <FiHome className="w-4 h-4 mr-2 text-red-600" />
                                <span className="font-medium truncate">{category.store_name}</span>
                              </div>
                              {category.store_address_city && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <FiMapPin className="w-3 h-3 mr-1" />
                                  <span className="truncate">
                                    {category.store_address_city}, {category.store_address_country}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-500 gap-3">
                            <FiCalendar className="w-4 h-4 mr-2" />
                            {new Date(category.createdAt).toLocaleDateString('en-US', {
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
                              onView(category);
                            }}
                            className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-green-700 bg-green-50 rounded-xl hover:bg-green-100 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 group/btn transform hover:scale-105 border border-green-200"
                          >
                            <FiEye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(category);
                            }}
                            className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group/btn transform hover:scale-105 border border-blue-200"
                          >
                            <FiEdit3 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onDeleteRequest) onDeleteRequest(category);
                            }}
                            className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-red-700 bg-red-50 rounded-xl hover:bg-red-100 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 group/btn transform hover:scale-105 border border-red-200"
                          >
                            <FiTrash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {currentCategories.map(category => (
                  <div 
                    key={category._id} 
                    onClick={() => handleCardClick(category)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:scale-102 group shadow-lg border border-gray-200/50 overflow-hidden"
                  >
                    <div className="flex items-center p-6">
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 mr-6">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                              {category.name}
                            </h3>
                            <span className="flex items-center text-sm text-pink-600 font-semibold bg-pink-50 rounded-lg px-2 py-1">
                              <FiUsers className="w-4 h-4 mr-1" />
                              {category.itemCount || 0}
                            </span>
                          </div>
                          {/* Store Information in List View - NEW */}
                          {category.store_name && (
                            <div className="mb-2">
                              <div className="flex items-center text-sm text-gray-600 mb-1">
                                <FiHome className="w-4 h-4 mr-2 text-red-600" />
                                <span className="font-medium">{category.store_name}</span>
                              </div>
                              {category.store_address_city && (
                                <div className="flex items-center text-xs text-gray-500 ml-6">
                                  <FiMapPin className="w-3 h-3 mr-1" />
                                  <span>{category.store_address_city}, {category.store_address_country}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, sortedCategories.length)} of {sortedCategories.length} categories
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

export default CategoryList;