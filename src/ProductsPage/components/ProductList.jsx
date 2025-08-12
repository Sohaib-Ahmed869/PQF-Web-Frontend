import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Heart, Eye, Star, ChevronLeft, ChevronRight, Filter, Grid, List, Snowflake, Loader2, X, AlertCircle, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import webService from '../../services/Website/WebService';
import LoaderOverlay from '../../components/LoaderOverlay';
import { useCart } from '../../context/CartContext';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import LoginModal from '../../components/LoginModal';

// Add CSS for fade-in animation and line-clamp
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
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  select option:checked {
    background-color: #8e191c !important;
    color: white !important;
  }
  select option:hover {
    background-color: #8e191c !important;
    color: white !important;
  }
  select option:focus {
    background-color: #8e191c !important;
    color: white !important;
  }
  select option {
    background-color: white !important;
    color: #374151 !important;
    padding: 8px 12px;
    border-radius: 8px;
    margin: 2px;
  }
  select option:hover,
  select option:focus,
  select option:active {
    background-color: #8e191c !important;
    color: white !important;
  }
  select:focus option:hover {
    background-color: #8e191c !important;
    color: white !important;
  }
  select:focus option:checked {
    background-color: #8e191c !important;
    color: white !important;
  }
`;

// Inject the CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = fadeInStyle;
document.head.appendChild(styleSheet);

// Editable Quantity Components
const EditableQuantity = ({ quantity, onQuantityChange, onIncrement, onDecrement, productId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(quantity.toString());
  const inputRef = useRef(null);

  // Reset edit value when quantity changes externally
  useEffect(() => {
    setEditValue(quantity.toString());
  }, [quantity]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleQuantityClick = () => {
    setIsEditing(true);
    setEditValue(quantity.toString());
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setEditValue(value);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSubmit = () => {
    const newQuantity = parseInt(editValue) || 0;
    if (newQuantity >= 0 && newQuantity <= 999) { // Set reasonable limits
      onQuantityChange(newQuantity);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(quantity.toString());
    setIsEditing(false);
  };

  const handleInputBlur = () => {
    handleSubmit();
  };

  return (
    <div className="flex items-center gap-2 w-full py-2 px-4 rounded-lg font-medium" style={{ backgroundColor: '#8e191c', color: 'white' }}>
      <button
        onClick={onDecrement}
        className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        -
      </button>
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          className="w-12 text-center bg-white/20 rounded px-1 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white"
          maxLength="3"
          placeholder="0"
        />
      ) : (
        <span 
          className="w-12 text-center font-medium cursor-pointer hover:bg-white/10 rounded px-1 py-1 transition-colors"
          onClick={handleQuantityClick}
          title="Click to edit quantity"
        >
          {quantity}
        </span>
      )}
      
      <button
        onClick={onIncrement}
        className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
      >
        +
      </button>
    </div>
  );
};

// For the list view version (smaller)
const EditableQuantitySmall = ({ quantity, onQuantityChange, onIncrement, onDecrement, productId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(quantity.toString());
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(quantity.toString());
  }, [quantity]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleQuantityClick = () => {
    setIsEditing(true);
    setEditValue(quantity.toString());
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setEditValue(value);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSubmit = () => {
    const newQuantity = parseInt(editValue) || 0;
    if (newQuantity >= 0 && newQuantity <= 999) {
      onQuantityChange(newQuantity);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(quantity.toString());
    setIsEditing(false);
  };

  const handleInputBlur = () => {
    handleSubmit();
  };

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg font-medium" style={{ backgroundColor: '#8e191c', color: 'white' }}>
      <button
        onClick={onDecrement}
        className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-xs hover:bg-white/30 transition-colors"
      >
        -
      </button>
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          className="w-12 text-center bg-white/20 rounded px-1 text-white text-xs placeholder-white/70 border border-white/30 focus:outline-none focus:border-white"
          maxLength="3"
          placeholder="0"
        />
      ) : (
        <span 
          className="w-12 text-center text-xs font-medium cursor-pointer hover:bg-white/10 rounded px-1 transition-colors"
          onClick={handleQuantityClick}
          title="Click to edit quantity"
        >
          {quantity}
        </span>
      )}
      
      <button
        onClick={onIncrement}
        className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-xs hover:bg-white/30 transition-colors"
      >
        +
      </button>
    </div>
  );
};

// Custom Dropdown Component
const CustomSelect = ({ value, onChange, options, placeholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  
  useEffect(() => {
    const selected = options.find(opt => opt.value === value);
    setSelectedLabel(selected ? selected.label : placeholder);
  }, [value, options, placeholder]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.relative')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-xl border-2 border-white bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#8e191c] min-w-[120px] sm:min-w-[140px] shadow-md text-sm text-left flex items-center justify-between"
      >
        <span>{selectedLabel}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="#8e191c" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left hover:bg-[#8e191c] hover:text-white transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                value === option.value ? 'bg-[#8e191c] text-white' : 'text-gray-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const HalalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="#22c55e"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">حلال</text>
  </svg>
);

// Grid Product Card Component
const ProductCard = React.memo(({ product, onAddToCart, onToggleWishlist, index, isInWishlist, triggerLoginModal, selectedPriceList = 2 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, getCartItem, updateCartItem, removeFromCart } = useCart();
  
  // Get price for selected price list
  const getPrice = (product) => {
    if (!product) return 0;
    
    // Handle new price structure with prices array
    if (product.prices && Array.isArray(product.prices)) {
      const priceItem = product.prices.find(p => p.PriceList === selectedPriceList);
      return priceItem ? parseFloat(priceItem.Price) : 0;
    }
    
    // Handle ItemPrices structure
    if (product.ItemPrices && Array.isArray(product.ItemPrices)) {
      const priceItem = product.ItemPrices.find(p => p.PriceList === selectedPriceList);
      return priceItem ? parseFloat(priceItem.Price) : 0;
    }
    
    // Handle direct price field
    if (product.price) {
      const priceNum = parseFloat(String(product.price).replace(/[^\d.-]/g, ''));
      return isNaN(priceNum) ? 0 : priceNum;
    }
    
    // Handle price by type
    if (product.priceType && product.price) {
      const priceNum = parseFloat(String(product.price).replace(/[^\d.-]/g, ''));
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
      onClick={() => navigate(`/product/${product._id || product.id}?priceType=${selectedPriceList}`)}
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
            {/* Main Price - Only show if authenticated */}
            {isAuthenticated() && (
              <span className="text-sm font-medium" style={{ color: '#8e191c' }}>
                {`AED ${price ? price.toFixed(2) : '0.00'}`}
              </span>
            )}
          </div>
          
          {/* Add to Cart Section */}
          <div className="flex items-center gap-2">
            {quantityInCart > 0 ? (
              <div onClick={(e) => e.stopPropagation()}>
                <EditableQuantity
                  quantity={quantityInCart}
                  onQuantityChange={(newQuantity) => {
                    if (newQuantity === 0) {
                      removeFromCart(product._id || product.id);
                    } else {
                      updateCartItem(product._id || product.id, newQuantity);
                    }
                  }}
                  onIncrement={() => addToCart(product._id || product.id, 1)}
                  onDecrement={() => {
                    if (quantityInCart === 1) {
                      removeFromCart(product._id || product.id);
                    } else {
                      updateCartItem(product._id || product.id, quantityInCart - 1);
                    }
                  }}
                  productId={product._id || product.id}
                />
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

// List Product Card Component
const ProductListCard = React.memo(({ product, onAddToCart, onToggleWishlist, index, isInWishlist, triggerLoginModal, selectedPriceList = 2 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, getCartItem, updateCartItem, removeFromCart } = useCart();
  
  // Get price for selected price list
  const getPrice = (product) => {
    if (!product) return 0;
    
    // Handle new price structure with prices array
    if (product.prices && Array.isArray(product.prices)) {
      const priceItem = product.prices.find(p => p.PriceList === selectedPriceList);
      return priceItem ? parseFloat(priceItem.Price) : 0;
    }
    
    // Handle ItemPrices structure
    if (product.ItemPrices && Array.isArray(product.ItemPrices)) {
      const priceItem = product.ItemPrices.find(p => p.PriceList === selectedPriceList);
      return priceItem ? parseFloat(priceItem.Price) : 0;
    }
    
    // Handle direct price field
    if (product.price) {
      const priceNum = parseFloat(String(product.price).replace(/[^\d.-]/g, ''));
      return isNaN(priceNum) ? 0 : priceNum;
    }
    
    // Handle price by type
    if (product.priceType && product.price) {
      const priceNum = parseFloat(String(product.price).replace(/[^\d.-]/g, ''));
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
      className="group cursor-pointer animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${product._id || product.id}?priceType=${selectedPriceList}`)}
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      <div className="relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="flex">
          {/* Small Image Container */}
          <div className="relative w-20 h-20 flex-shrink-0">
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
                className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Heart className={`w-2.5 h-2.5 ${isInWishlist ? 'fill-current' : ''}`} style={{ color: '#8e191c' }} />
              </button>
            )}
          </div>
          
          {/* Product Info */}
          <div className="flex-1 p-3">
            <div className="flex justify-between items-start h-full">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">
                  {productName}
                </h3>
                
                {/* Price */}
                <div className="mb-2">
                  {isAuthenticated() && (
                    <span className="text-lg font-bold" style={{ color: '#8e191c' }}>
                      {`AED ${price ? price.toFixed(2) : '0.00'}`}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Add to Cart Section */}
              <div className="flex items-center ml-3">
                {quantityInCart > 0 ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <EditableQuantitySmall
                      quantity={quantityInCart}
                      onQuantityChange={(newQuantity) => {
                        if (newQuantity === 0) {
                          removeFromCart(product._id || product.id);
                        } else {
                          updateCartItem(product._id || product.id, newQuantity);
                        }
                      }}
                      onIncrement={() => addToCart(product._id || product.id, 1)}
                      onDecrement={() => {
                        if (quantityInCart === 1) {
                          removeFromCart(product._id || product.id);
                        } else {
                          updateCartItem(product._id || product.id, quantityInCart - 1);
                        }
                      }}
                      productId={product._id || product.id}
                    />
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className={`
                      py-1.5 px-3 rounded-lg font-medium text-xs
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
                        <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                        Adding...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        Add to Cart
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductListCard.displayName = 'ProductListCard';

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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchFocused, setSearchFocused] = useState(false);
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    priceRange: true,
    sortBy: true,
    priceList: true
  });
  const [priceSliderRange, setPriceSliderRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState('newest');
  const priceRanges = [
    { value: 'all', label: 'All Prices', min: 0, max: null },
    { value: '0-25', label: 'AED 0 - AED 25', min: 0, max: 25 },
    { value: '25-50', label: 'AED 25 - AED 50', min: 25, max: 50 },
    { value: '50-100', label: 'AED 50 - AED 100', min: 50, max: 100 },
    { value: '100-200', label: 'AED 100 - AED 200', min: 100, max: 200 },
    { value: '200+', label: 'AED 200+', min: 200, max: null }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: '🆕' },
    { value: 'name', label: 'Name A-Z', icon: '📝' },
    { value: 'price-low', label: 'Price: Low to High', icon: '💰' },
    { value: 'price-high', label: 'Price: High to Low', icon: '💎' },
    { value: 'stock', label: 'Most Stock', icon: '📦' }
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

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        // Close all dropdowns when clicking outside
        // This will be handled by the CustomSelect component's internal state
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    
    // Handle new price structure with prices array
    if (product.prices && Array.isArray(product.prices)) {
      const priceItem = product.prices.find(p => p.PriceList === priceListId);
      return priceItem ? parseFloat(priceItem.Price) : 0;
    }
    
    // Handle ItemPrices structure
    if (product.ItemPrices && Array.isArray(product.ItemPrices)) {
      const priceItem = product.ItemPrices.find(p => p.PriceList === priceListId);
      return priceItem ? parseFloat(priceItem.Price) : 0;
    }
    
    // Handle direct price field
    if (product.price) {
      const priceNum = parseFloat(String(product.price).replace(/[^\d.-]/g, ''));
      return isNaN(priceNum) ? 0 : priceNum;
    }
    
    // Handle price by type
    if (product.priceType && product.price) {
      const priceNum = parseFloat(String(product.price).replace(/[^\d.-]/g, ''));
      return isNaN(priceNum) ? 0 : priceNum;
    }
    
    return 0;
  };

  // Memoized filtering logic for better performance
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      // Price range filter
      if (priceRange !== 'all') {
        const price = getPrice(product);
        const selectedRange = priceRanges.find(range => range.value === priceRange);
        if (selectedRange) {
          if (selectedRange.min !== null && price < selectedRange.min) return false;
          if (selectedRange.max !== null && price > selectedRange.max) return false;
        }
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
  }, [products, priceRange, searchTerm, getPrice, priceRanges]);
  // Memoized sorting logic for better performance
  const sortedProducts = React.useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
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
  }, [filteredProducts, sortBy, getPrice]);
  // Pagination logic (use sortedProducts instead of filteredProducts)
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const { addToCart, getCartItem, isInCart, updateCartItem, removeFromCart, cart } = useCart();


  // Get product name
  const getProductName = (product) => {
    return product.ItemName || product.name || '';
  };
  // Get product images
  const getProductImages = (product) => {
    if (product.images && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    ];
  };



  // Update URL only when search is submitted (not on every keystroke)
  const handleSearchSubmit = () => {
    setShowSuggestions(false);
    const params = new URLSearchParams(location.search);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    navigate({ search: params.toString() }, { replace: true });
  };



  // Fetch product name suggestions as user types with debouncing
  useEffect(() => {
    let active = true;
    let timeoutId;
    
    if (searchTerm && searchFocused && searchTerm.length >= 2) {
      // Debounce the API call to prevent excessive requests
      timeoutId = setTimeout(() => {
        setSuggestionLoading(true);
        webService.suggestProductNames(searchTerm).then(res => {
          if (active) {
            const suggestions = res.data?.data || [];
            setSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
          }
        }).catch((err) => {
          if (active) {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }).finally(() => {
          if (active) setSuggestionLoading(false);
        });
      }, 300); // 300ms debounce delay
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setHighlightedIndex(-1);
    
    return () => { 
      active = false; 
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchTerm, searchFocused]);

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
  };



  // Handle suggestion click
  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    setShowSuggestions(false);
    
    // Find the product by name and navigate to it
    const product = products.find(p => 
      (p.ItemName || p.name || '').toLowerCase().includes(name.toLowerCase())
    );
    
    if (product) {
      navigate(`/product/${product._id || product.id}`);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[highlightedIndex]);
      } else {
        handleSearchSubmit();
      }
    }
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
                                    {/* Top Filter Bar */}
            <div className="bg-gradient-to-r from-[#8e191c] to-[#8e191c] p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between flex-wrap gap-2 md:gap-4">
                {/* Left Side - Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  {/* Filters Icon and Label */}
                  <div className="flex items-center gap-2 text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                    <span className="font-medium">Filters:</span>
                  </div>

                  {/* Price Range Dropdown */}
                  <CustomSelect
                    value={priceRange}
                    onChange={setPriceRange}
                    options={priceRanges}
                    placeholder="All Prices"
                    className="min-w-[120px] sm:min-w-[140px]"
                  />

                  {/* Sort By Dropdown */}
                  <CustomSelect
                    value={sortBy}
                    onChange={setSortBy}
                    options={sortOptions}
                    placeholder="Sort By"
                    className="min-w-[120px] sm:min-w-[140px]"
                  />

                  {/* Price List Dropdown */}
                  <CustomSelect
                    value={selectedPriceList}
                    onChange={(val) => setSelectedPriceList(Number(val))}
                    options={priceListOptions}
                    placeholder="Price List"
                    className="min-w-[140px] sm:min-w-[160px]"
                  />
                </div>

                {/* Right Side - Search */}
                <div className="flex-1 w-full sm:max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={handleSearchInputChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => { setSearchFocused(true); setShowSuggestions(true); }}
                      onBlur={() => { setSearchFocused(false); setTimeout(() => setShowSuggestions(false), 200); }}
                      className="w-full px-3 py-2 rounded-xl border-2 border-white bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8e191c] shadow-md text-sm"
                    />
                    <button
                      onClick={handleSearchSubmit}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8e191c] hover:text-[#8e191c]"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && searchFocused && (
                      <div className="absolute left-0 right-0 top-full bg-white border border-gray-200 rounded-lg shadow-lg z-[1200] mt-1 max-h-60 overflow-y-auto transition-all duration-200 ease-in-out animate-fade-in">
                        {suggestionLoading ? (
                          <div className="p-3 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                          </div>
                        ) : suggestions.length === 0 && searchTerm ? (
                          <div className="p-3 text-center text-gray-400 text-sm">No results found</div>
                        ) : (
                          suggestions.map((name, idx) => (
                            <div
                              key={idx}
                              className={`px-4 py-2 flex items-center gap-2 cursor-pointer text-gray-800 text-sm transition-all duration-150 ${highlightedIndex === idx ? 'bg-[#8e191c] text-white font-semibold' : 'hover:bg-[#8e191c]/10'}`}
                              onMouseDown={() => handleSuggestionClick(name)}
                              onMouseEnter={() => setHighlightedIndex(idx)}
                            >
                              <Search className={`w-4 h-4 ${highlightedIndex === idx ? 'text-white' : 'text-[#8e191c]'}`} />
                              {name}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex bg-white rounded-xl p-1 shadow-md border border-gray-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'grid' ? 'text-white shadow-md' : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={{
                      backgroundColor: viewMode === 'grid' ? '#8e191c' : 'transparent',
                      border: viewMode === 'grid' ? '2px solid white' : '2px solid transparent'
                    }}
                  >
                    <Grid size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === 'list' ? 'text-white shadow-md' : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={{
                      backgroundColor: viewMode === 'list' ? '#8e191c' : 'transparent',
                      border: viewMode === 'list' ? '2px solid white' : '2px solid transparent'
                    }}
                  >
                    <List size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Products Grid/List */}
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6' 
                : 'grid grid-cols-1 md:grid-cols-2 gap-4'
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
                  {viewMode === 'grid' ? (
                    <ProductCard 
                      product={product}
                      onAddToCart={addToCart}
                      onToggleWishlist={toggleWishlist}
                      isInWishlist={isInWishlist(product._id || product.id)}
                      index={index}
                      triggerLoginModal={triggerLoginModal}
                      selectedPriceList={selectedPriceList}
                    />
                  ) : (
                    <ProductListCard 
                      product={product}
                      onAddToCart={addToCart}
                      onToggleWishlist={toggleWishlist}
                      isInWishlist={isInWishlist(product._id || product.id)}
                      index={index}
                      triggerLoginModal={triggerLoginModal}
                      selectedPriceList={selectedPriceList}
                    />
                  )}
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
                          {isAuthenticated() && (
                            <span className="font-medium text-xs" style={{ color: '#8e191c' }}>
                              {`AED ${productPrice.toFixed(2)}`}
                            </span>
                          )}
                          <span className="font-medium">×{item.quantity}</span>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  {isAuthenticated() && (
                    <span className="font-bold text-gray-800">
                      {`Total: AED ${cart.items.reduce((total, item) => {
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
                      }, 0).toFixed(2)}`}
                    </span>
                  )}
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