import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import webService from '../../services/Website/WebService';
import { Star, Heart, ShoppingCart, Truck, Shield, Clock, ChevronLeft, ChevronRight, Plus, Minus, Share2, Eye, Snowflake, Loader2, X, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import LoaderOverlay from '../../components/LoaderOverlay';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../../components/LoginModal';

// Editable Quantity Component
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
    <div className="flex items-center gap-2 py-2 px-4 rounded-lg font-medium" style={{ backgroundColor: '#8e191c', color: 'white' }}>
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
          className="w-24 text-center bg-white/20 rounded px-1 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white"
          maxLength="3"
          placeholder="0"
        />
      ) : (
        <span 
          className="w-24 text-center font-medium cursor-pointer hover:bg-white/10 rounded px-1 py-1 transition-colors"
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

// Custom Dropdown Component for Price List Selection
const PriceListSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#8e191c] shadow-md text-left flex items-center justify-between"
      >
        <span>{options.find(opt => opt.value === value)?.label || 'Select Price'}</span>
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-[#8e191c] hover:text-white transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
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

// Add global keyframes for animations
if (typeof document !== 'undefined' && !document.getElementById('product-keyframes')) {
  const style = document.createElement('style');
  style.id = 'product-keyframes';
  style.innerHTML = `
    @keyframes float-gentle {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(2deg); }
    }
    
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(230, 0, 18, 0.3); }
      50% { box-shadow: 0 0 30px rgba(230, 0, 18, 0.5); }
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// Add HalalIcon SVG component
const HalalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="#22c55e"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">حلال</text>
  </svg>
);

// Related Product Card Component
const RelatedProductCard = React.memo(({ product, onAddToCart, onToggleWishlist, isInWishlist, triggerLoginModal, selectedPriceList = 2 }) => {
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
    >
      <div className="relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={productImage}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
            <span className="text-sm font-medium" style={{ color: '#8e191c' }}>
              {isAuthenticated() ? (
                `AED ${price ? price.toFixed(2) : '0.00'}`
              ) : (
                'Login to see price'
              )}
            </span>
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

RelatedProductCard.displayName = 'RelatedProductCard';

const IndividualProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedProductsLoading, setRelatedProductsLoading] = useState(false);

  // Get price type from URL parameters, default to 2 (Delivery Price)
  const urlParams = new URLSearchParams(location.search);
  const urlPriceType = urlParams.get('priceType');
  const [selectedPriceList, setSelectedPriceList] = useState(
    urlPriceType ? parseInt(urlPriceType) : 2
  );
  
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showNotification, setShowNotification] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const { addToCart, getCartItem, updateCartItem, removeFromCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState(null);
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Price list options
  const priceListOptions = [
    { value: 1, label: 'On-Site Price' },
    { value: 2, label: 'Delivery Price' },
    { value: 3, label: 'Pallet Complete Onsite' },
    { value: 5, label: 'Pallet Complete Delivery' }
  ];

  // Update URL when price type changes
  const updateURLWithPriceType = (priceType) => {
    const params = new URLSearchParams(location.search);
    params.set('priceType', priceType);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  // Handle price type change
  const handlePriceTypeChange = (newPriceType) => {
    setSelectedPriceList(newPriceType);
    updateURLWithPriceType(newPriceType);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await webService.getProductById(id);
        // Support both .data.data and .data
        const prod = response.data?.data || response.data || null;
        setProduct(prod);
      } catch (err) {
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;
      
      setRelatedProductsLoading(true);
      try {
        const response = await webService.getActiveProductsByStore();
        const allProducts = response.data?.data || [];
        
        // Get the current product's item group code
        const currentProductGroupCode = product.ItemGroupCode || product.itemGroupCode || product.groupCode || product.GroupCode;
        
        // Filter products by the same item group code and exclude the current product
        let filteredProducts = allProducts.filter(p => {
          const productId = p._id || p.id;
          const currentProductId = product._id || product.id;
          
          // Exclude the current product
          if (productId === currentProductId) return false;
          
          // Check if products have the same item group code
          const productGroupCode = p.ItemGroupCode || p.itemGroupCode || p.groupCode || p.GroupCode;
          return productGroupCode === currentProductGroupCode;
        });
        
        // If not enough products in the same group, get some from other groups
        if (filteredProducts.length < 6) {
          const otherProducts = allProducts.filter(p => {
            const productId = p._id || p.id;
            const currentProductId = product._id || product.id;
            
            // Exclude the current product and products already in filteredProducts
            if (productId === currentProductId) return false;
            
            const productGroupCode = p.ItemGroupCode || p.itemGroupCode || p.groupCode || p.GroupCode;
            const isInFiltered = filteredProducts.some(fp => (fp._id || fp.id) === productId);
            
            return !isInFiltered;
          });
          
          // Add other products to reach 6 total
          const remainingSlots = 6 - filteredProducts.length;
          filteredProducts = [...filteredProducts, ...otherProducts.slice(0, remainingSlots)];
        }
        
        // Limit to 6 products
        filteredProducts = filteredProducts.slice(0, 6);
        
        setRelatedProducts(filteredProducts);
      } catch (err) {
        console.error('Failed to load related products:', err);
      } finally {
        setRelatedProductsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  // Helper functions for price, badges, images, etc.
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

  const formatPrice = (product, priceListId = selectedPriceList) => {
    const price = getPrice(product, priceListId);
    return `AED ${price.toFixed(2)}`;
  };

  const getBadges = (product) => {
    if (!product) return [];
    const badges = [];
    if (product.halal === 'tYES' || product.Properties1 === 'tYES') badges.push('Halal');
    if (product.frozen === 'tYES' || product.Frozen === 'tYES') badges.push('Frozen');
    if (product.badges && Array.isArray(product.badges)) badges.push(...product.badges);
    return badges;
  };
  
  const getImages = (product) => {
    if (!product) return [];
    if (product.images && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    ];
  };
  
  const getStock = (product) => {
    if (!product) return 0;
    return product.stock ?? product.QuantityOnStock ?? 0;
  };
  
  const getProductName = (product) => {
    return product?.ItemName || product?.name || '';
  };
  
  const getProductCode = (product) => {
    return product?.ItemCode || product?.code || '';
  };

  const getPriceTypeLabel = (priceListId) => {
    const priceType = priceListOptions.find(opt => opt.value === priceListId);
    return priceType ? priceType.label : 'Price';
  };

  // Handle cart operations
  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }
    setAddingToCart(true);
    setAddToCartError(null);
    try {
      const cartItem = getCartItem(product._id || product.id);
      if (cartItem) {
        // Update existing item quantity
        await updateCartItem(product._id || product.id, cartItem.quantity + 1);
      } else {
        // Add new item
        await addToCart(product._id || product.id, 1);
      }
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setAddToCartError(error.message || 'Failed to add item to cart');
      setTimeout(() => setAddToCartError(null), 5000);
    } finally {
      setAddingToCart(false);
    }
  };

  // Get current cart quantity for this product
  const getCurrentCartQuantity = () => {
    const cartItem = getCartItem(product._id || product.id);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCartClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }
    handleAddToCart();
  };

  if (loading) return <LoaderOverlay text="Loading product..." />;
  if (error) return (
    <div className="flex justify-center items-center h-96">
      <span className="text-lg text-red-600">{error}</span>
    </div>
  );
  if (!product) return null;

  const productId = product._id || product.id;

  // Fallbacks for features, description, etc.
  const features = product.features || [
    { icon: <Truck size={20} />, title: "Free Delivery", desc: "Orders over €25" },
    { icon: <Shield size={20} />, title: "Quality Guaranteed", desc: "100% fresh guarantee" },
    { icon: <Clock size={20} />, title: "Ready in 30 mins", desc: "Quick preparation" }
  ];
  const description = product.description || 'No description available.';
  const ingredients = product.ingredients || [];
  const nutritionalInfo = product.nutritionalInfo || {};
  const reviews = product.reviews || 0;
  const rating = product.rating || 0;
  const images = getImages(product);
  const badges = getBadges(product);
  const stock = getStock(product);
  const productName = getProductName(product);
  const productCode = getProductCode(product);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300"
             style={{ animation: 'slideInUp 0.3s ease-out' }}>
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} />
            <span className="font-medium">Added to cart!</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Product Images Section */}
          <div className="relative">
            {/* Main Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <img
                src={images[0]}
                alt={productName}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
              
              {/* Wishlist Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated()) {
                    setShowLoginModal(true);
                    return;
                  }
                  toggleWishlist(productId);
                }}
                className="absolute top-4 right-4 z-10 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all duration-300"
              >
                <Heart
                  size={20}
                  className={`transition-colors duration-300 ${
                    isInWishlist(productId)
                      ? 'fill-[#8e191c] text-[#8e191c]'
                      : 'text-[#8e191c]'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-8">
            {/* Product Title & Rating */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-800 leading-tight">
                {productName}
                <span className="block text-2xl font-medium mt-2" style={{ color: '#8e191c' }}>
                  {product.weight}
                </span>
              </h1>
            </div>

            {/* Price List Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Price Type</h3>
              <PriceListSelect
                value={selectedPriceList}
                onChange={handlePriceTypeChange}
                options={priceListOptions}
              />
            </div>

            {/* Pricing */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-700">
                    {getPriceTypeLabel(selectedPriceList)}:
                  </span>
                  {isAuthenticated() ? (
                    <span className="text-3xl font-bold" style={{ color: '#8e191c' }}>
                      {formatPrice(product, selectedPriceList)}
                    </span>
                  ) : (
                    <span className="text-3xl font-bold opacity-60">Login to see price</span>
                  )}
                </div>
                
                {/* Show all available prices if user is authenticated */}
                {isAuthenticated() && product.prices && Array.isArray(product.prices) && product.prices.length > 1 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">All Available Prices:</h4>
                    <div className="space-y-2">
                      {priceListOptions.map(option => {
                        const price = getPrice(product, option.value);
                        if (price > 0) {
                          return (
                            <div key={option.value} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{option.label}:</span>
                              <span className="font-medium" style={{ color: '#8e191c' }}>
                                AED {price.toFixed(2)}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Add to Cart Section */}
            <div className="flex flex-col gap-4">
              {/* Show Editable Quantity if product is in cart, otherwise show Add to Cart Button */}
              {getCurrentCartQuantity() > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="text-base font-bold text-gray-600">Quantity in cart:</span>
                    <EditableQuantity
                      quantity={getCurrentCartQuantity()}
                      onQuantityChange={(newQuantity) => {
                        if (newQuantity === 0) {
                          removeFromCart(productId);
                        } else {
                          updateCartItem(productId, newQuantity);
                        }
                      }}
                      onIncrement={() => updateCartItem(productId, getCurrentCartQuantity() + 1)}
                      onDecrement={() => {
                        if (getCurrentCartQuantity() === 1) {
                          removeFromCart(productId);
                        } else {
                          updateCartItem(productId, getCurrentCartQuantity() - 1);
                        }
                      }}
                      productId={productId}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAddToCartClick}
                  disabled={addingToCart || getStock(product) === 0}
                  className={`w-full text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${!isAuthenticated() ? 'bg-gray-300 text-gray-700' : ''}`}
                  style={{ 
                    background: !isAuthenticated() ? undefined : (getStock(product) === 0 ? '#gray-400' : '#8e191c')
                  }}
                >
                  {!isAuthenticated() ? (
                    <>
                      <ShoppingCart size={20} />
                      Login to Add to Cart
                    </>
                  ) : addingToCart ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding...
                    </>
                  ) : getStock(product) === 0 ? (
                    <>
                      <X className="w-5 h-5" />
                      Out of Stock
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Add to Cart
                    </>
                  )}
                </button>
              )}
              
              {addToCartError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {addToCartError}
                  </p>
                </div>
              )}
            </div>

            {/* Product Description */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Product Description</h3>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="mt-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
          
          {relatedProductsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8e191c' }} />
              <span className="ml-3 text-gray-600">Loading related products...</span>
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedProducts.map((relatedProduct, index) => (
                <RelatedProductCard
                  key={relatedProduct._id || relatedProduct.id || index}
                  product={relatedProduct}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist(relatedProduct._id || relatedProduct.id)}
                  triggerLoginModal={() => setShowLoginModal(true)}
                  selectedPriceList={selectedPriceList}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No related products available</p>
            </div>
          )}
        </div>
      </div>
      
      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => { setShowLoginModal(false); navigate('/login'); }}
      />
    </div>
  );
};

export default IndividualProductPage;