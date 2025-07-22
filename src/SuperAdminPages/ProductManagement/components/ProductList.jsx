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
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiZap,
  FiHeart,
  FiPackage,
  FiBox,
  FiTruck,
  FiHome,
  FiShoppingCart,
  FiMapPin
} from 'react-icons/fi';
import { FaSnowflake } from 'react-icons/fa';
import Select from 'react-select';

const ProductList = ({ products: initialProducts, loading, onDelete, onRefresh, onView, onEdit, selectedPriceList, setSelectedPriceList, onDeleteRequest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [localProducts, setLocalProducts] = useState(initialProducts);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStore, setSelectedStore] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Products', count: 0 },
    { value: 'frozen', label: 'Frozen', count: 0 },
    { value: 'inStock', label: 'In Stock', count: 0 },
    { value: 'outOfStock', label: 'Out of Stock', count: 0 },
    { value: 'active', label: 'Active', count: 0 },
    { value: 'inactive', label: 'Inactive', count: 0 }
  ];

  const priceListOptions = [
    { value: 1, label: 'On-Site Price' },
    { value: 2, label: 'Delivery Price' },
    { value: 3, label: 'Pallet Complete Onsite' },
    { value: 5, label: 'Pallet Complete Delivery' }
  ];

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-10', label: '€0 - €10' },
    { value: '10-25', label: '€10 - €25' },
    { value: '25-50', label: '€25 - €50' },
    { value: '50+', label: '€50+' }
  ];

  // Update local products when initialProducts changes
  React.useEffect(() => {
    setLocalProducts(initialProducts);
  }, [initialProducts]);

  // Calculate counts for each status
  const statusCounts = React.useMemo(() => {
    const counts = {};
    localProducts.forEach(product => {
      if (product.frozen === 'tYES') counts.frozen = (counts.frozen || 0) + 1;
      if ((product.stock || 0) > 0) counts.inStock = (counts.inStock || 0) + 1;
      if ((product.stock || 0) === 0) counts.outOfStock = (counts.outOfStock || 0) + 1;
      if (product.valid === 'tYES') counts.active = (counts.active || 0) + 1;
      if (product.valid === 'tNO') counts.inactive = (counts.inactive || 0) + 1;
    });
    counts.all = localProducts.length;
    return counts;
  }, [localProducts]);

  // Update status options with counts
  const statusOptionsWithCounts = statusOptions.map(option => ({
    ...option,
    count: statusCounts[option.value] || 0
  }));

  // Utility to get unique stores from products
  const getUniqueStores = () => {
    const stores = localProducts.reduce((acc, product) => {
      if (product.store_id && product.store_name) {
        acc[product.store_id] = {
          id: product.store_id,
          name: product.store_name,
          city: product.store_address_city,
          country: product.store_address_country
        };
      }
      return acc;
    }, {});
    return Object.values(stores);
  };

  // Get price for selected price list
  const getPrice = (product, priceListId = selectedPriceList) => {
    if (product.prices && Array.isArray(product.prices)) {
      const priceItem = product.prices.find(p => p.PriceList === priceListId);
      return priceItem ? priceItem.Price : 0;
    } else if (product.ItemPrices && Array.isArray(product.ItemPrices)) {
      const priceItem = product.ItemPrices.find(p => p.PriceList === priceListId);
      return priceItem ? priceItem.Price : 0;
    }
    return 0;
  };

  // Format price display
  const formatPrice = (product) => {
    const price = getPrice(product);
    return `€${price.toFixed(2)}`;
  };

  // Get price list label
  const getPriceListLabel = (priceListId) => {
    const option = priceListOptions.find(opt => opt.value === priceListId);
    return option ? option.label : `Price List ${priceListId}`;
  };

  const filteredProducts = localProducts.filter(product => {
    // Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'frozen' && product.frozen !== 'tYES') return false;
      if (selectedStatus === 'inStock' && (product.stock || 0) <= 0) return false;
      if (selectedStatus === 'outOfStock' && (product.stock || 0) > 0) return false;
      if (selectedStatus === 'active' && product.valid !== 'tYES') return false;
      if (selectedStatus === 'inactive' && product.valid !== 'tNO') return false;
    }

    // Store filter
    if (selectedStore !== 'all' && product.store_id !== selectedStore) {
      return false;
    }

    // Price range filter
    if (priceRange !== 'all') {
      const price = getPrice(product);
      if (priceRange === '0-10' && (price < 0 || price > 10)) return false;
      if (priceRange === '10-25' && (price < 10 || price > 25)) return false;
      if (priceRange === '25-50' && (price < 25 || price > 50)) return false;
      if (priceRange === '50+' && price < 50) return false;
    }

    // Search filter
    if (searchTerm) {
      const searchText = searchTerm.toLowerCase();
      const productName = (product.ItemName || '').toLowerCase();
      const productCode = (product.ItemCode || '').toLowerCase();
      const storeName = (product.store?.name || product.store_name || '').toLowerCase();

      return productName.includes(searchText) ||
        productCode.includes(searchText) ||
        storeName.includes(searchText);
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.ItemName || '').localeCompare(b.ItemName || '');
      case 'price-low':
        return getPrice(a) - getPrice(b);
      case 'price-high':
        return getPrice(b) - getPrice(a);
      case 'stock':
        return (b.stock || 0) - (a.stock || 0);
      case 'code':
        return (a.ItemCode || '').localeCompare(b.ItemCode || '');
      case 'newest':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  // Add this handler back to fix the error:
  const handleCardClick = (product) => {
    onView(product);
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
            <div className="text-red-600 text-xl font-semibold">Loading products...</div>
            <div className="text-gray-500 text-sm mt-2">Please wait while we fetch your inventory</div>
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
                  placeholder="Search products by name, code, or store..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all duration-300 shadow-sm border border-gray-200"
                />
              </div>
            </div>

            <div className="flex gap-3">
              {/* Price List Selector */}
              <select
                value={selectedPriceList}
                onChange={(e) => setSelectedPriceList(Number(e.target.value))}
                className="px-4 py-2 bg-gradient-to-r from-red-50 to-pink-100 border border-red-200 rounded-xl text-red-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
              >
                {priceListOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-red-600'
                    }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list'
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
                <option value="name">By Name</option>
                <option value="code">By Code</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">By Stock</option>
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${showFilters || selectedStatus !== 'all' || priceRange !== 'all' || selectedStore !== 'all'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  }`}
              >
                <FiFilter className="w-4 h-4" />
                Filters
                {(selectedStatus !== 'all' || priceRange !== 'all' || selectedStore !== 'all') && (
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

          {/* Current Price List Info */}
          <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <FiDollarSign className="w-5 h-5" />
              <span className="font-semibold">Current Price List:</span>
              <span className="font-bold">{getPriceListLabel(selectedPriceList)}</span>
            </div>
          </div>

          {/* Status and Price Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-6 space-y-6">
              {/* Status Filters */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FiTag className="w-4 h-4" />
                  Filter by Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {statusOptionsWithCounts.map((status) => {
                    const isSelected = selectedStatus === status.value;
                    const Icon = status.value === 'frozen' ? FaSnowflake :
                      status.value === 'inStock' ? FiCheckCircle :
                        status.value === 'outOfStock' ? FiXCircle :
                          status.value === 'active' ? FiCheckCircle :
                            status.value === 'inactive' ? FiXCircle : FiGrid;

                    return (
                      <button
                        key={status.value}
                        onClick={() => setSelectedStatus(status.value)}
                        className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 text-left ${isSelected
                            ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white border-transparent shadow-lg transform scale-105'
                            : 'bg-white hover:bg-red-50 border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-700'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 rounded-lg transition-all duration-300 ${isSelected
                              ? 'bg-white/20'
                              : 'bg-red-100 text-red-600'
                            }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-gray-900'
                            }`}>
                            {status.count}
                          </span>
                        </div>
                        <div className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-700'
                          }`}>
                          {status.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Store Filter - NEW */}
              {getUniqueStores().length > 0 && (
                <div>
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
                          label: `${store.name} - ${store.city || ''}${store.city && store.country ? ', ' : ''}${store.country || ''} (${localProducts.filter(p => p.store_id === store.id).length})`
                        }))
                      ]}
                      value={(() => {
                        if (selectedStore === 'all') return { value: 'all', label: `All Stores (${getUniqueStores().length})` };
                        const store = getUniqueStores().find(s => s.id === selectedStore);
                        return store ? {
                          value: store.id,
                          label: `${store.name} - ${store.city || ''}${store.city && store.country ? ', ' : ''}${store.country || ''} (${localProducts.filter(p => p.store_id === store.id).length})`
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
                </div>
              )}

              {/* Price Range Filter */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <FiDollarSign className="w-4 h-4" />
                  Filter by Price Range
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {priceRanges.map((range) => {
                    const isSelected = priceRange === range.value;

                    return (
                      <button
                        key={range.value}
                        onClick={() => setPriceRange(range.value)}
                        className={`p-3 rounded-xl cursor-pointer transition-all duration-300 border-2 text-center ${isSelected
                            ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white border-transparent shadow-lg transform scale-105'
                            : 'bg-white hover:bg-pink-50 border-gray-200 hover:border-pink-300 text-gray-700 hover:text-pink-700'
                          }`}
                      >
                        <div className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-700'
                          }`}>
                          {range.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-6">
            <div className="text-sm text-gray-600">
              Showing {currentProducts.length} of {sortedProducts.length} products
              {(selectedStatus !== 'all' || priceRange !== 'all' || selectedStore !== 'all') && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {selectedStatus !== 'all' && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                      {statusOptionsWithCounts.find(s => s.value === selectedStatus)?.label}
                    </span>
                  )}
                  {priceRange !== 'all' && (
                    <span className="px-2 py-1 bg-pink-100 text-pink-600 rounded-full text-xs">
                      {priceRanges.find(r => r.value === priceRange)?.label}
                    </span>
                  )}
                  {selectedStore !== 'all' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                      {getUniqueStores().find(s => s.id === selectedStore)?.name}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FiClock className="w-4 h-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {localProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-12 shadow-xl">
              <FiPackage className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Products Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">No products are currently available in your inventory.</p>
            </div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-12 shadow-xl">
              <FiSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products match your filters</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search terms or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setPriceRange('all');
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
                {currentProducts.map(product => (
                  <div
                    key={product._id}
                    onClick={() => handleCardClick(product)}
                    className="bg-white/80 backdrop-blur-sm rounded-3xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2 group shadow-xl overflow-hidden border border-gray-200/50"
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}
                        alt={product.ItemName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                      {/* Status Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.frozen === 'tYES' && (
                          <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-blue-500 text-white border border-blue-400 flex items-center shadow-lg">
                            <FaSnowflake className="w-3 h-3 mr-1" />
                            Frozen
                          </span>
                        )}
                        {product.valid === 'tYES' && (
                          <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-green-500 text-white border border-green-400 flex items-center shadow-lg">
                            <FiCheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        )}
                        {product.valid === 'tNO' && (
                          <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-gray-500 text-white border border-gray-400 flex items-center shadow-lg">
                            <FiXCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Price Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg">
                          {formatPrice(product)}
                        </span>
                      </div>

                      {/* Stock Badge */}
                      <div className="absolute bottom-4 right-4">
                        <span className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center shadow-lg ${(product.stock || 0) > 0
                            ? 'bg-green-500 text-white border border-green-400'
                            : 'bg-red-500 text-white border border-red-400'
                          }`}>
                          <FiBox className="w-3 h-3 mr-1" />
                          {(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                            {product.ItemName}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 gap-3 mb-2">
                            <span className="font-medium">Code: {product.ItemCode}</span>
                          </div>
                          {product.store_name && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="flex items-center text-sm text-gray-700 mb-1">
                                <FiHome className="w-4 h-4 mr-2 text-red-600" />
                                <span className="font-medium truncate">{product.store_name}</span>
                              </div>
                              {product.store_address_city && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <FiMapPin className="w-3 h-3 mr-1" />
                                  <span className="truncate">
                                    {product.store_address_city}, {product.store_address_country}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2 transition-all duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(product);
                            }}
                            className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-green-700 bg-green-50 rounded-xl hover:bg-green-100 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 group/btn transform hover:scale-105 border border-green-200"
                          >
                            <FiEye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(product);
                            }}
                            className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group/btn transform hover:scale-105 border border-blue-200"
                          >
                            <FiEdit3 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteRequest(product);
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
                {currentProducts.map(product => (
                  <div
                    key={product._id}
                    onClick={() => handleCardClick(product)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:scale-102 group shadow-lg border border-gray-200/50 overflow-hidden"
                  >
                    <div className="flex items-center p-6">
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 mr-6">
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}
                          alt={product.ItemName}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300">
                              {product.ItemName}
                            </h3>
                            <div className="flex items-center gap-6 text-sm text-gray-500 mb-2">
                              <div className="flex items-center">
                                <FiTag className="w-4 h-4 mr-1" />
                                {product.ItemCode}
                              </div>
                              <div className="flex items-center">
                                <FiDollarSign className="w-4 h-4 mr-1" />
                                {formatPrice(product)}
                              </div>
                              <div className="flex items-center">
                                <FiBox className="w-4 h-4 mr-1" />
                                {product.stock || 0} in stock
                              </div>
                            </div>
                            {/* Store Information - Consistent with CategoryList */}
                            {/* Store Information - Consistent with CategoryList */}
                            {product.store_name && (
                              <div className="mb-2">
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                  <FiHome className="w-4 h-4 mr-2 text-red-600" />
                                  <span className="font-medium">{product.store_name}</span>
                                </div>
                                {product.store_address_city && (
                                  <div className="flex items-center text-xs text-gray-500 ml-6">
                                    <FiMapPin className="w-3 h-3 mr-1" />
                                    <span>{product.store_address_city}, {product.store_address_country}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              {product.frozen === 'tYES' && (
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
                                  <FaSnowflake className="w-3 h-3 inline mr-1" />
                                  Frozen
                                </span>
                              )}
                              {product.valid === 'tYES' && (
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                                  <FiCheckCircle className="w-3 h-3 inline mr-1" />
                                  Active
                                </span>
                              )}
                              {product.valid === 'tNO' && (
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                                  <FiXCircle className="w-3 h-3 inline mr-1" />
                                  Inactive
                                </span>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(product.stock || 0) > 0
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : 'bg-red-100 text-red-700 border border-red-300'
                                }`}>
                                {(product.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 transition-all duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(product);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 hover:scale-110"
                              title="View Product"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(product);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-110"
                              title="Edit Product"
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteRequest(product);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
                              title="Delete Product"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
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
                    Showing {startIndex + 1}-{Math.min(endIndex, sortedProducts.length)} of {sortedProducts.length} products
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
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300 ${currentPage === pageNum
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

export default ProductList;