import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Eye, Star, ChevronLeft, ChevronRight, Filter, Grid, List, Snowflake, Loader2, X, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import webService from '../../services/Website/WebService';
import LoaderOverlay from '../../components/LoaderOverlay';
import { useCart } from '../../context/CartContext';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import LoginModal from '../../components/LoginModal';

// Add CSS for fade-in animation
const fadeInStyle = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }
`;

// Inject the CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = fadeInStyle;
document.head.appendChild(styleSheet);

const HalalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="#22c55e"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">حلال</text>
  </svg>
);

// Simple Product Card Component (matching FeatureProduct design)
const ProductCard = React.memo(({ product, onAddToCart, onToggleWishlist, index, isInWishlist, triggerLoginModal }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, getCartItem, updateCartItem, removeFromCart } = useCart();
  
  // Get price for selected price list
  const getPrice = (product) => {
    if (!product) return 0;
    if (product.prices && Array.isArray(product.prices)) {
      const priceItem = product.prices.find(p => p.PriceList === 2); // Default to Delivery Price
      return priceItem ? priceItem.Price : 0;
    } else if (product.ItemPrices && Array.isArray(product.ItemPrices)) {
      const priceItem = product.ItemPrices.find(p => p.PriceList === 2);
      return priceItem ? priceItem.Price : 0;
    }
    // fallback for old structure
    if (product.price) {
      let priceNum = parseFloat((product.price + '').replace('€', ''));
      return isNaN(priceNum) ? 0 : priceNum;
    }
    return 0;
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAuthenticated()) {
      triggerLoginModal();
      return;
    }
    setIsAddingToCart(true);
    addToCart(product._id || product.id, 1);
    setTimeout(() => setIsAddingToCart(false), 1000);
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    if (!isAuthenticated()) {
      triggerLoginModal();
      return;
    }
    onToggleWishlist(product._id || product.id);
  };

  const productName = product.ItemName || product.name || '';
  const productImage = product.image || 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80';
  const price = getPrice(product);
  
  // Get cart item quantity
  const cartItem = getCartItem(product._id || product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  
  return (
    <div 
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      <div className="relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={productImage}
            alt={productName}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80';
            }}
          />
          
          {/* Wishlist Button - Show on hover */}
          {isHovered && (
            <button
              onClick={handleToggleWishlist}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} style={{ color: '#8e191c' }} />
            </button>
          )}
        </div>
        
        {/* Product Info */}
        <div className="relative p-4">
          {/* Product Name */}
          <h3 className="text-sm font-semibold text-gray-800 text-center truncate mb-2">
            {productName}
          </h3>
          
          {/* Price */}
          <div className="text-center mb-3">
            {/* Main Price */}
            <span className="text-sm font-medium" style={{ color: '#8e191c' }}>
              AED {price ? price.toFixed(2) : '0.00'}
            </span>
          </div>
          
          {/* Add to Cart Section */}
          <div className="flex items-center gap-2">
            {quantityInCart > 0 ? (
              <div className="flex items-center gap-2 w-full py-2 px-4 rounded-lg font-medium" style={{ backgroundColor: '#8e191c', color: 'white' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (quantityInCart === 1) {
                      removeFromCart(product._id || product.id);
                    } else {
                      updateCartItem(product._id || product.id, quantityInCart - 1);
                    }
                  }}
                  className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                >
                  -
                </button>
                <span className="flex-1 text-center font-medium">{quantityInCart}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product._id || product.id, 1);
                  }}
                  className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`
                  w-full py-2 px-4 rounded-lg font-medium
                  ${isAddingToCart 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'text-white'
                  }
                `}
                style={{
                  backgroundColor: isAddingToCart ? undefined : '#8e191c'
                }}
              >
                {isAddingToCart ? (
                  <span className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

const ProductListPage = () => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showNotification, setShowNotification] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPriceList, setSelectedPriceList] = useState(2); // 2 = Delivery Price by default
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 30;
  // Add filter states after useState declarations
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const statusOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'halal', label: 'Halal' },
    { value: 'frozen', label: 'Frozen' },
    { value: 'inStock', label: 'In Stock' },
    { value: 'outOfStock', label: 'Out of Stock' },
    { value: 'available', label: 'Available' }
  ];
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-10', label: '€0 - €10' },
    { value: '10-25', label: '€10 - €25' },
    { value: '25-50', label: '€25 - €50' },
    { value: '50+', label: '€50+' }
  ];
  const [showLoginModal, setShowLoginModal] = useState(false);
  // Function to trigger login modal from child
  const triggerLoginModal = () => setShowLoginModal(true);
  // Cart summary collapsed state
  const [isCartCollapsed, setIsCartCollapsed] = useState(false);

  const { isAuthenticated } = useAuth();

  // Wishlist logic
  useEffect(() => {
    const loadWishlist = async () => {
      if (isAuthenticated()) {
        try {
          const res = await userService.getWishlist();
          // The useWishlist context will handle merging guest wishlist
        } catch {}
      } else {
        // Guest: load from localStorage
        const guestWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        // The useWishlist context will handle merging guest wishlist
      }
    };
    loadWishlist();
  }, [isAuthenticated]);

  // Utility to get cached products (same logic as in productService)
  const getCachedProducts = () => {
    const cache = localStorage.getItem('all_products_cache');
    const timestamp = localStorage.getItem('all_products_cache_timestamp');
    const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
    if (cache && timestamp) {
      const age = Date.now() - Number(timestamp);
      if (age < CACHE_TTL_MS) {
        try {
          return JSON.parse(cache);
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams(location.search);
        const category = params.get('category');
        let response;
        if (category) {
          response = await webService.getActiveProductsByStoreAndCategory(category);
        } else {
          response = await webService.getActiveProductsByStore();
        }
        const productsData = response.data?.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.search]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Scroll to top when currentPage changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Price list options (same as admin)
  const priceListOptions = [
    { value: 1, label: 'On-Site Price' },
    { value: 2, label: 'Delivery Price' },
    { value: 3, label: 'Pallet Complete Onsite' },
    { value: 5, label: 'Pallet Complete Delivery' }
  ];

  // Get price for selected price list
  const getPrice = (product, priceListId = selectedPriceList) => {
    if (!product) return 0;
    if (product.prices && Array.isArray(product.prices)) {
      const priceItem = product.prices.find(p => p.PriceList === priceListId);
      return priceItem ? priceItem.Price : 0;
    } else if (product.ItemPrices && Array.isArray(product.ItemPrices)) {
      const priceItem = product.ItemPrices.find(p => p.PriceList === priceListId);
      return priceItem ? priceItem.Price : 0;
    }
    // fallback for old structure
    if (product.price) {
      let priceNum = parseFloat((product.price + '').replace('€', ''));
      return isNaN(priceNum) ? 0 : priceNum;
    }
    return 0;
  };

  // Filtering logic
  const filteredProducts = products.filter(product => {
    // Status filter
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'halal' && product.halal !== 'tYES' && product.Properties1 !== 'tYES') return false;
      if (selectedStatus === 'frozen' && product.frozen !== 'tYES' && product.Frozen !== 'tYES') return false;
      if (selectedStatus === 'inStock' && (product.stock ?? product.QuantityOnStock ?? 0) <= 0) return false;
      if (selectedStatus === 'outOfStock' && (product.stock ?? product.QuantityOnStock ?? 0) > 0) return false;
      if (selectedStatus === 'available' && !product.isAvailable) return false;
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
      const productName = (product.ItemName || product.name || '').toLowerCase();
      const productCode = (product.ItemCode || product.code || '').toLowerCase();
      return productName.includes(searchText) || productCode.includes(searchText);
    }
    return true;
  });
  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.ItemName || '').localeCompare(b.ItemName || '');
      case 'price-low':
        return getPrice(a) - getPrice(b);
      case 'price-high':
        return getPrice(b) - getPrice(a);
      case 'stock':
        return (b.stock ?? b.QuantityOnStock ?? 0) - (a.stock ?? a.QuantityOnStock ?? 0);
      case 'code':
        return (a.ItemCode || '').localeCompare(b.ItemCode || '');
      case 'newest':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });
  // Pagination logic (use sortedProducts instead of filteredProducts)
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const { addToCart, getCartItem, isInCart, updateCartItem, removeFromCart, cart } = useCart();

  // Format price display
  const formatPrice = (product) => {
    if (!isAuthenticated()) return '';
    const price = getPrice(product);
    return price ? `د.إ${price.toFixed(2)}` : '';
  };

  // Get badges (halal, frozen, etc.)
  const getBadges = (product) => {
    const badges = [];
    if (product.halal === 'tYES' || product.Properties1 === 'tYES') badges.push('Halal');
    if (product.frozen === 'tYES' || product.Frozen === 'tYES') badges.push('Frozen');
    if (product.isAvailable) badges.push('Available');
    if (product.badges && Array.isArray(product.badges)) badges.push(...product.badges);
    return badges;
  };

  // Get stock
  const getStock = (product) => {
    return product.stock ?? product.QuantityOnStock ?? 0;
  };

  // Get product name
  const getProductName = (product) => {
    return product.ItemName || product.name || '';
  };

  // Get product code
  const getProductCode = (product) => {
    return product.ItemCode || product.code || '';
  };

  // Get product images
  const getProductImages = (product) => {
    if (product.images && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    ];
  };

  // When user types in the search box, update the URL
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Loading Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 w-full">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto">
              {/* Search skeleton */}
              <div className="h-10 bg-gray-200 rounded-xl w-64 animate-pulse"></div>
              {/* Filter skeletons */}
              <div className="h-10 bg-gray-200 rounded-xl w-36 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-40 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-44 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-4 ml-auto mt-2 md:mt-0">
              <div className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
          
          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-pulse" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center h-64">
            <span className="text-lg text-red-600">{error}</span>
          </div>
        )}
        {/* Only show controls and products if no error */}
        {!error && (
          <>
        {/* Filter & View Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 w-full">
              {/* Left: Filters */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search products by name or code..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-800 bg-white shadow-sm min-w-[220px]"
                />
                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-800 bg-white shadow-sm min-w-[140px]"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {/* Price Range Filter */}
                <select
                  value={priceRange}
                  onChange={e => setPriceRange(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-800 bg-white shadow-sm min-w-[120px]"
                >
                  {priceRanges.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-800 bg-white shadow-sm min-w-[130px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="name">By Name</option>
                  <option value="code">By Code</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="stock">By Stock</option>
                </select>
                {/* Price List Selector */}
                <select
                  value={selectedPriceList}
                  onChange={e => setSelectedPriceList(Number(e.target.value))}
                  className="px-4 py-2 rounded-xl border border-red-200 text-red-800 font-medium bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 min-w-[140px]"
                >
                  {priceListOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
            </div>
              {/* Right: View mode and count */}
              <div className="flex items-center gap-4 ml-auto mt-2 md:mt-0">
            <div className="flex bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-red-500 text-white' : 'text-gray-600'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-red-500 text-white' : 'text-gray-600'
                }`}
              >
                <List size={18} />
              </button>
            </div>
                <span className="text-gray-600 whitespace-nowrap">
                  Showing {sortedProducts.length} products
                </span>
          </div>
        </div>
        {/* Products Grid */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
            : 'grid-cols-1'
        }`}>
          {paginatedProducts.map((product, index) => (
            <div 
              key={product._id || product.id}
              className="animate-fade-in"
              style={{ 
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both'
              }}
            >
              <ProductCard 
                product={product}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist(product._id || product.id)}
                index={index}
                triggerLoginModal={triggerLoginModal}
              />
            </div>
          ))}
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg font-medium border transition-colors ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}
            >
              Previous
            </button>
            {/* Smart Pagination Numbers */}
            {(() => {
              const pageButtons = [];
              const pageNeighbors = 1; // how many pages to show on each side
              const minPage = 1;
              const maxPage = totalPages;
              const startPage = Math.max(minPage, currentPage - pageNeighbors);
              const endPage = Math.min(maxPage, currentPage + pageNeighbors);

              // Always show first page
              if (minPage < startPage) {
                pageButtons.push(
                  <button
                    key={minPage}
                    onClick={() => setCurrentPage(minPage)}
                    className={`px-3 py-1 rounded-lg font-medium border transition-colors ${
                      currentPage === minPage
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                    }`}
                  >
                    {minPage}
                  </button>
                );
                if (startPage > minPage + 1) {
                  pageButtons.push(
                    <span key="start-ellipsis" className="px-2 text-gray-400">...</span>
                  );
                }
              }

              // Main page range
              for (let page = startPage; page <= endPage; page++) {
                if (page === minPage || page === maxPage) continue; // already rendered
                pageButtons.push(
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg font-medium border transition-colors ${
                      currentPage === page
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              }

              // Always show last page
              if (endPage < maxPage) {
                if (endPage < maxPage - 1) {
                  pageButtons.push(
                    <span key="end-ellipsis" className="px-2 text-gray-400">...</span>
                  );
                }
                pageButtons.push(
                  <button
                    key={maxPage}
                    onClick={() => setCurrentPage(maxPage)}
                    className={`px-3 py-1 rounded-lg font-medium border transition-colors ${
                      currentPage === maxPage
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                    }`}
                  >
                    {maxPage}
                  </button>
                );
              }
              return pageButtons;
            })()}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-lg font-medium border transition-colors ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}
            >
              Next
            </button>
          </div>
        )}
        {/* Cart Summary - Fixed Version */}
        {cart.items && cart.items.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl border-2" style={{ borderColor: '#8e191c' }}>
            {/* Collapsed Mode */}
            {isCartCollapsed ? (
              <div className="p-3">
                <button
                  onClick={() => setIsCartCollapsed(false)}
                  className="flex items-center justify-center w-full"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" style={{ color: '#8e191c' }} />
                    <span className="font-bold text-sm" style={{ color: '#8e191c' }}>
                      {cart.items.length} items
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="p-4 min-w-[250px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">Cart Summary</h3>
                  <button
                    onClick={() => setIsCartCollapsed(true)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {/* Improved cart items display */}
                  {Object.values(
                    cart.items.reduce((acc, item) => {
                      const key = item.product._id || item.product.id || item.product;
                      if (!acc[key]) {
                        acc[key] = { ...item };
                      } else {
                        acc[key].quantity += item.quantity;
                      }
                      return acc;
                    }, {})
                  ).map((item) => {
                    // Better product resolution logic
                    let product = null;
                    let productName = 'Unknown Product';
                    let productPrice = 0;

                    // Try to find product in current products list first
                    const productId = item.product._id || item.product.id || item.product;
                    product = products.find(p => 
                      (p._id === productId) || 
                      (p.id === productId) || 
                      (String(p._id) === String(productId)) || 
                      (String(p.id) === String(productId))
                    );

                    if (product) {
                      // Product found in current list
                      productName = getProductName(product);
                      productPrice = getPrice(product);
                    } else if (item.product && typeof item.product === 'object') {
                      // Product data is embedded in cart item
                      productName = item.product.ItemName || item.product.name || 'Unknown Product';
                      productPrice = item.price || getPrice(item.product) || 0;
                    } else {
                      // Fallback: use item data directly
                      productName = item.name || item.productName || `Product ${productId}`;
                      productPrice = item.price || 0;
                    }

                    return item.quantity > 0 ? (
                      <div key={String(productId)} className="flex justify-between items-center text-sm p-2 rounded-lg bg-gray-50">
                        <span className="truncate max-w-[150px]" title={productName}>
                          {productName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs" style={{ color: '#8e191c' }}>
                            د.إ{productPrice.toFixed(2)}
                          </span>
                          <span className="font-medium">×{item.quantity}</span>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-bold text-gray-800">
                    Total: د.إ{cart.items.reduce((total, item) => {
                      let itemPrice = 0;
                      
                      // Use item.price if available and valid
                      if (typeof item.price === 'number' && !isNaN(item.price) && item.price > 0) {
                        itemPrice = item.price;
                      } else {
                        // Try to find product and get its price
                        const productId = item.product._id || item.product.id || item.product;
                        const product = products.find(p => 
                          (p._id === productId) || 
                          (p.id === productId) || 
                          (String(p._id) === String(productId)) || 
                          (String(p.id) === String(productId))
                        );
                        
                        if (product) {
                          itemPrice = getPrice(product);
                        } else if (item.product && typeof item.product === 'object') {
                          itemPrice = getPrice(item.product) || 0;
                        }
                      }
                      
                      return total + (itemPrice * item.quantity);
                    }, 0).toFixed(2)}
                  </span>
                  <button 
                    onClick={() => navigate('/cart')}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: '#8e191c' }}
                  >
                    View Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>
      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => { setShowLoginModal(false); navigate('/login'); }}
      />
    </div>
  );
};

export default ProductListPage;