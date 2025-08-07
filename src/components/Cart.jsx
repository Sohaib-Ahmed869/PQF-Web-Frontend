import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Loader2, 
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  CreditCard,
  Tag,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import promotionService from '../services/promotionService';
import cartService from '../services/cartService';
import PromotionBanner from './PromotionBanner';

// Add CSS for fade-in animation and lazy loading
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
  .lazy-load {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
  }
  .lazy-load.loaded {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Inject the CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = fadeInStyle;
document.head.appendChild(styleSheet);

// Lazy Loading Cart Item Component
const LazyCartItem = React.memo(({ item, index, onQuantityChange, onRemove, updateLoading, getProductName, getProductImage, getProductPrice, formatPrice }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const productId = item.product?._id || item.product?.id || item.product || `item-${index}`;
  const isUpdating = updateLoading[productId];
  
  // Check if this is a free item (added due to promotion)
  const isFreeItem = item.isFreeItem || (item.freeQuantity && item.freeQuantity > 0);
  const freeQuantity = item.freeQuantity || 0;
  const regularQuantity = item.quantity - freeQuantity;
  
  // Debug: Log item properties for development
  // console.log('🛒 Cart item display:', {
  //   productName: item.product?.ItemName || item.product?.name,
  //   isFreeItem,
  //   freeQuantity,
  //   regularQuantity,
  //   totalQuantity: item.quantity,
  //   price: item.price
  // });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, index * 100); // Stagger the loading

    return () => clearTimeout(timer);
  }, [index]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm p-6 lazy-load ${isLoaded ? 'loaded' : ''} ${
        isFreeItem ? 'border-2 border-green-200 bg-green-50' : ''
      }`}
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
          {getProductImage(item.product) ? (
            <img
              src={getProductImage(item.product)}
              alt={getProductName(item.product)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                setImageLoaded(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          {/* Free item badge */}
          {isFreeItem && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              FREE
            </div>
          )}
          
          {/* Loading placeholder */}
          {!imageLoaded && getProductImage(item.product) && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 rounded-full animate-spin" style={{ borderTopColor: '#8e191c' }}></div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">
                {getProductName(item.product)}
                {isFreeItem && (
                  <span className="ml-2 text-green-600 text-sm font-medium">
                    (Free Item)
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {isFreeItem && freeQuantity > 0 ? (
                  <>
                    <p className="text-gray-500 text-sm">
                      {formatPrice(getProductPrice(item))} each
                    </p>
                    <span className="text-green-600 text-sm font-medium">
                      ({freeQuantity} free)
                    </span>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">
                    {isFreeItem ? 'FREE' : `${formatPrice(getProductPrice(item))} each`}
                  </p>
                )}
              </div>
            </div>
            
            {/* Remove Button */}
            <button
              onClick={() => onRemove(productId)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors ml-2"
            >
              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
            </button>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onQuantityChange(productId, Math.max(0, item.quantity - 1))}
                disabled={isUpdating}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              
              <span className="w-12 text-center font-semibold text-gray-800">
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  item.quantity
                )}
              </span>
              
              <button
                onClick={() => onQuantityChange(productId, item.quantity + 1)}
                disabled={isUpdating}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            {/* Price Display */}
            <div className="text-right">
              {isFreeItem && freeQuantity > 0 ? (
                <div className="flex flex-col items-end">
                  {regularQuantity > 0 ? (
                    <>
                      <span className="text-lg font-bold text-gray-800">
                        {formatPrice(getProductPrice(item) * regularQuantity)}
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        + {freeQuantity} FREE
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-green-600">
                      FREE
                    </span>
                  )}
                </div>
              ) : isFreeItem ? (
                <span className="text-lg font-bold text-green-600">
                  FREE
                </span>
              ) : (
                <span className="text-lg font-bold text-gray-800">
                  {formatPrice(getProductPrice(item) * item.quantity)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, clearCart, loading, error, setCart, refreshCart } = useCart();
  const { user, token } = useAuth();
  const { selectedStore } = useStore();
  const navigate = useNavigate();
  
  const [updateLoading, setUpdateLoading] = useState({});
  const [checkoutMessage, setCheckoutMessage] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [appliedPromotions, setAppliedPromotions] = useState([]);
  const [promotionCode, setPromotionCode] = useState('');
  const [applyingPromotion, setApplyingPromotion] = useState(false);
  const [promotionError, setPromotionError] = useState(null);

  // Initialize applied promotions from cart data
  useEffect(() => {
    if (cart.appliedPromotions && Array.isArray(cart.appliedPromotions)) {
      setAppliedPromotions(cart.appliedPromotions.map(promo => ({
        id: promo._id || promo.id,
        name: promo.promotion?.name || promo.name,
        code: promo.code,
        discountAmount: promo.discountAmount || 0
      })));
    }
  }, [cart.appliedPromotions]);

  // Fetch applicable promotions
  useEffect(() => {
    const fetchPromotions = async () => {
      if (cart.items.length > 0 && selectedStore && token) {
        try {
          const response = await promotionService.getCartApplicablePromotions(selectedStore._id, token);
          if (response.data.success) {
            setPromotions(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching promotions:', error);
        }
      }
    };

    fetchPromotions();
  }, [cart.items, selectedStore, token]);

  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getProductName = (product) => {
    return product?.ItemName || product?.name || 'Unknown Product';
  };

  const getProductImage = (product) => {
    return product?.image || product?.imagePath || product?.Picture || null;
  };

  const getProductPrice = (item) => {
    return item.price || 0;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED'
    }).format(price || 0);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    setUpdateLoading(prev => ({ ...prev, [productId]: true }));
    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemove = async (productId) => {
    setUpdateLoading(prev => ({ ...prev, [productId]: true }));
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      // Debug: Log cart data before checkout
      console.log('🛒 Cart data before checkout:', {
        cart: cart,
        appliedPromotions: appliedPromotions,
        totalDiscount: cart.totalDiscount,
        finalTotal: cart.finalTotal,
        originalTotal: cart.originalTotal
      });

      // Navigate to checkout with complete cart data including promotions
      const orderSummary = {
        items: cart.items,
        subtotal: cart.originalTotal || cart.total,
        originalTotal: cart.originalTotal || cart.total,
        finalTotal: cart.finalTotal || getFinalTotal(),
        totalDiscount: cart.totalDiscount || calculateDiscount(),
        appliedPromotions: cart.appliedPromotions || appliedPromotions,
        appliedDiscounts: cart.appliedDiscounts || []
      };
      
      // Debug: Log order summary being passed
      console.log('📦 Order summary being passed to checkout:', orderSummary);
      
      navigate('/checkout', { 
        state: { 
          orderSummary: orderSummary
        } 
      });
    } catch (error) {
      console.error('Error during checkout:', error);
      setCheckoutMessage({
        type: 'error',
        text: 'An error occurred during checkout. Please try again.'
      });
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleProceedToCheckout = () => {
    if (user) {
      handleCheckout();
    } else {
      setShowAuthModal(true);
    }
  };

  // Promotion functions
  const handleApplyPromotion = async () => {
    if (!promotionCode.trim()) return;

    setApplyingPromotion(true);
    setPromotionError(null);

    try {
      const response = await promotionService.applyPromotionByCode(
        promotionCode.trim(),
        cart._id,
        selectedStore?._id,
        token
      );

      if (response.data.success) {
        const appliedPromotion = response.data.data.promotion;
        const appliedDiscounts = response.data.data.appliedDiscounts || [];
        const finalTotal = response.data.data.finalTotal;
        const totalDiscount = response.data.data.totalDiscount;
        const originalTotal = response.data.data.originalTotal;
        
        // Clear the promotion code input
        setPromotionCode('');
        setPromotionError(null);
        
        // IMPORTANT: Refresh the cart data from backend to get updated items including free items
        if (refreshCart) {
          await refreshCart();
        } else {
          await refreshCartData();
        }
        
        // Show success message
        let successMessage = `Promotion "${appliedPromotion.name}" applied successfully!`;
        if (totalDiscount > 0) {
          successMessage += ` You saved ${formatPrice(totalDiscount)}!`;
        } else if (appliedDiscounts.some(d => d.freeQuantity > 0)) {
          successMessage += ` Free items added to your cart!`;
        }
        
        setCheckoutMessage({
          type: 'success',
          text: successMessage
        });
        
        // Clear message after 5 seconds
        setTimeout(() => setCheckoutMessage(null), 5000);
      }
    } catch (error) {
      setPromotionError(error.response?.data?.error || 'Failed to apply promotion code');
    } finally {
      setApplyingPromotion(false);
    }
  };

  // Function to refresh cart data
  const refreshCartData = async () => {
    try {
      if (token) {
        const cartResponse = await cartService.getCart(token);
        const updatedCartData = cartResponse.data?.data || cartResponse.data || { items: [] };
        
        // Handle applied promotions from the backend response
        if (updatedCartData.appliedPromotions && Array.isArray(updatedCartData.appliedPromotions)) {
          setAppliedPromotions(updatedCartData.appliedPromotions.map(promo => ({
            id: promo._id || promo.id,
            name: promo.promotion?.name || promo.name,
            code: promo.code,
            discountAmount: promo.discountAmount || 0
          })));
        }
        
        // Use the backend-calculated totals if available
        if (updatedCartData.finalTotal !== undefined) {
          updatedCartData.total = updatedCartData.finalTotal;
        } else if (updatedCartData.originalTotal !== undefined) {
          updatedCartData.total = updatedCartData.originalTotal;
        } else {
          updatedCartData.total = calculateTotal(Array.isArray(updatedCartData.items) ? updatedCartData.items : []);
        }
        
        // Ensure we have the original total for display
        if (updatedCartData.originalTotal === undefined) {
          updatedCartData.originalTotal = updatedCartData.total;
        }
        
        // Update the cart context with new data
        if (typeof setCart === 'function') {
          setCart(updatedCartData);
        }
      }
    } catch (cartError) {
      console.error('Error refreshing cart after promotion:', cartError);
    }
  };

  const handleRemovePromotion = (promotionId) => {
    setAppliedPromotions(prev => prev.filter(p => p.id !== promotionId));
  };

  const calculateDiscount = () => {
    // First check if we have a backend-calculated discount
    if (cart.totalDiscount !== undefined) {
      return cart.totalDiscount;
    }
    
    // Fallback to calculating from applied promotions
    return appliedPromotions.reduce((total, promotion) => {
      const discountAmount = promotion.discountAmount || 0;
      
      // If it's a percentage discount, calculate it from the original total
      if (promotion.type === 'percentageDiscount' && promotion.percentage) {
        const originalTotal = cart.originalTotal || cart.total || 0;
        return total + (originalTotal * (promotion.percentage / 100));
      }
      
      // Fixed amount discount
      return total + discountAmount;
    }, 0);
  };

  const getFinalTotal = () => {
    // Use backend-calculated final total if available
    // if (cart.finalTotal !== undefined) {
    //   return cart.finalTotal;
    // }
    
    // Fallback to calculating from original total and discount
    const originalTotal = cart.originalTotal || cart.total || 0;
    const discount = calculateDiscount();
    return Math.max(0, originalTotal - discount);
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      
      // If item is free or has free quantity, only charge for the non-free portion
      if (item.isFreeItem) {
        // If the entire item is free, don't add anything to total
        return total;
      } else if (item.freeQuantity && item.freeQuantity > 0) {
        // If item has free quantity, only charge for the non-free portion
        const chargeableQuantity = quantity - item.freeQuantity;
        return total + (price * Math.max(0, chargeableQuantity));
      } else {
        // Regular item, charge full price
        return total + (price * quantity);
      }
    }, 0);
  };

  // Modal action handlers
  const handleLogin = () => {
    setShowAuthModal(false);
    navigate('/login');
  };
  const handleCancelModal = () => {
    setShowAuthModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>
          
          {/* Cart Items Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-8 bg-gray-200 rounded w-32"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8" style={{ color: '#8e191c' }} />
              Shopping Cart
              {getCartItemCount() > 0 && (
                <span className="text-white text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#8e191c' }}>
                  {getCartItemCount()} items
                </span>
              )}
            </h1>
          </div>
          
          {cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{ color: '#8e191c' }}
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Checkout Message */}
        {checkoutMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            checkoutMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
              checkoutMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`} />
            <p className={checkoutMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {checkoutMessage.text}
            </p>
          </div>
        )}

        {cart.items.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start adding some products to your cart!</p>
            <button
              onClick={handleContinueShopping}
              className="text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              style={{ backgroundColor: '#8e191c' }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, index) => (
                <LazyCartItem
                  key={`cart-item-${item.product?._id || item.product?.id || item.product || `item-${index}`}-${index}`}
                  item={item}
                  index={index}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  updateLoading={updateLoading}
                  getProductName={getProductName}
                  getProductImage={getProductImage}
                  getProductPrice={getProductPrice}
                  formatPrice={formatPrice}
                />
              ))}

              {/* Promotions Section */}
              {(promotions.length > 0 || appliedPromotions.length > 0) && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5" style={{ color: '#8e191c' }} />
                    Promotions & Discounts
                  </h3>

                  {/* Applied Promotions */}
                  {appliedPromotions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Applied Promotions:</h4>
                      <div className="space-y-2">
                        {appliedPromotions.map((promotion) => (
                          <div key={promotion.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                {promotion.name}
                              </span>
                              {promotion.code && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  {promotion.code}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemovePromotion(promotion.id)}
                              className="p-1 hover:bg-green-200 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4 text-green-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Promotion Code Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value)}
                      placeholder="Enter promotion code"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleApplyPromotion}
                      disabled={!promotionCode.trim() || applyingPromotion}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {applyingPromotion ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>

                  {promotionError && (
                    <p className="text-red-600 text-sm mt-2">{promotionError}</p>
                  )}

                  {/* Available Promotions */}
                  {/* {promotions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Available Promotions:</h4>
                      <div className="space-y-2">
                        {promotions.slice(0, 3).map((promotion) => (
                          <div key={promotion.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="text-sm font-medium text-gray-800">{promotion.name}</h5>
                                <p className="text-xs text-gray-600">{promotion.description}</p>
                              </div>
                              {promotion.code && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {promotion.code}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                
                {/* Promotion Banner */}
                <div className="mb-6">
                  <PromotionBanner />
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({getCartItemCount()} items)</span>
                    <span className="font-semibold">{formatPrice(cart.originalTotal || cart.total)}</span>
                  </div>
                  
                  {/* Discount Display - Enhanced */}
                  {(cart.totalDiscount > 0 || calculateDiscount() > 0) && (
                    <div className="space-y-2">
                      {/* Show individual promotion discounts if available */}
                      {appliedPromotions.length > 0 && appliedPromotions.map((promotion, index) => (
                        <div key={index} className="flex justify-between text-green-600">
                          <span className="text-sm">{promotion.name}</span>
                          <span className="font-semibold text-sm">-{formatPrice(promotion.discountAmount || 0)}</span>
                        </div>
                      ))}
                      
                      {/* Total discount */}
                      <div className="flex justify-between text-green-600 border-t border-green-200 pt-2">
                        <span className="font-semibold">Total Discount</span>
                        <span className="font-bold">-{formatPrice(cart.totalDiscount || calculateDiscount())}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span style={{ color: '#8e191c' }}>
                        {formatPrice(cart.finalTotal || getFinalTotal())}
                      </span>
                    </div>
                    
                    {/* Show savings if any */}
                    {(cart.totalDiscount > 0 || calculateDiscount() > 0) && (
                      <div className="mt-2 text-sm text-green-600 text-right">
                        You saved {formatPrice(cart.totalDiscount || calculateDiscount())}!
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  disabled={cart.items.length === 0}
                  className="w-full text-white py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#8e191c' }}
                >
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceed to Checkout
                  </>
                </button>

                <button
                  onClick={handleContinueShopping}
                  className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Proceed to Checkout</h2>
            <p className="mb-6 text-gray-700">You need to be logged in to checkout.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogin}
                className="w-full text-white py-2 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: '#8e191c' }}
              >
                Login
              </button>
              <button
                onClick={handleCancelModal}
                className="w-full mt-2 text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;