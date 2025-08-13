import React, { useState, useEffect, useMemo } from 'react';
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
import { usePromotion } from '../context/PromotionContext';

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
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [editQuantity, setEditQuantity] = useState(Math.max(0, item.quantity - (item.freeQuantity || 0)).toString());
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

  // Update edit quantity when item quantity changes - use paid quantity only for editing
  useEffect(() => {
    const paidQuantity = Math.max(0, item.quantity - (item.freeQuantity || 0));
    setEditQuantity(paidQuantity.toString());
  }, [item.quantity, item.freeQuantity]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleQuantityClick = () => {
    setIsEditingQuantity(true);
    // Set editable quantity to paid quantity only
    const paidQuantity = Math.max(0, item.quantity - (item.freeQuantity || 0));
    setEditQuantity(paidQuantity.toString());
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setEditQuantity(value);
    }
  };

  const handleQuantityKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleQuantitySubmit();
    } else if (e.key === 'Escape') {
      handleQuantityCancel();
    }
  };

  const handleQuantitySubmit = () => {
    const newPaidQuantity = parseInt(editQuantity) || 0;
    if (newPaidQuantity >= 0 && newPaidQuantity <= 999) {
      // Send the new paid quantity (backend will recalculate free items)
      onQuantityChange(productId, newPaidQuantity);
    }
    setIsEditingQuantity(false);
  };

  const handleQuantityCancel = () => {
    // Reset to paid quantity only
    const paidQuantity = Math.max(0, item.quantity - (item.freeQuantity || 0));
    setEditQuantity(paidQuantity.toString());
    setIsEditingQuantity(false);
  };

  const handleQuantityBlur = () => {
    handleQuantitySubmit();
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
                onClick={() => {
                  const currentPaidQuantity = Math.max(0, item.quantity - (item.freeQuantity || 0));
                  onQuantityChange(productId, Math.max(0, currentPaidQuantity - 1));
                }}
                disabled={isUpdating}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              
              {isEditingQuantity ? (
                <input
                  type="text"
                  value={editQuantity}
                  onChange={handleQuantityChange}
                  onKeyDown={handleQuantityKeyDown}
                  onBlur={handleQuantityBlur}
                  className="w-12 text-center font-semibold text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="3"
                  autoFocus
                />
              ) : (
                <div className="flex flex-col items-center">
                  <span 
                    className="text-center font-semibold text-gray-800 cursor-pointer hover:bg-gray-100 rounded transition-colors px-2 py-1"
                    onClick={handleQuantityClick}
                    title="Click to edit paid quantity"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      Math.max(0, item.quantity - (item.freeQuantity || 0))
                    )}
                  </span>
                  {freeQuantity > 0 && (
                    <span className="text-xs text-green-600 font-medium">
                      +{freeQuantity} FREE
                    </span>
                  )}
                </div>
              )}
              
              <button
                onClick={() => {
                  const currentPaidQuantity = Math.max(0, item.quantity - (item.freeQuantity || 0));
                  onQuantityChange(productId, currentPaidQuantity + 1);
                }}
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
  const { 
    cart, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    refreshCart,
    setCart,
    loading,
    error
  } = useCart();
  const { token, isAuthenticated, user } = useAuth();
  const { selectedStore } = useStore();
  const { 
    calculatePotentialSavings, 
    isPromotionValidForCart,
    getPromotionPriority 
  } = usePromotion();
  const navigate = useNavigate();
  
  const [updateLoading, setUpdateLoading] = useState({});
  const [checkoutMessage, setCheckoutMessage] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [appliedPromotions, setAppliedPromotions] = useState([]);
  const [promotionCode, setPromotionCode] = useState('');
  const [applyingPromotion, setApplyingPromotion] = useState(false);
  const [promotionError, setPromotionError] = useState(null);
  const [availablePromotions, setAvailablePromotions] = useState([]);

  // Separate manual and auto promotions
  const manualPromotions = cart.appliedPromotions?.filter(ap => !ap.isAutoApplied) || [];
  const autoPromotions = cart.appliedPromotions?.filter(ap => ap.isAutoApplied) || [];
  const hasManualPromo = manualPromotions.length > 0;
  const currentManualPromo = hasManualPromo ? manualPromotions[0] : null;

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

  // Create a stable reference for applied promotions
  const appliedPromotionsStable = useMemo(() => {
    return cart.appliedPromotions || [];
  }, [cart.appliedPromotions]);

  // Fetch applicable promotions for the cart
  useEffect(() => {
    const fetchPromotions = async () => {
      if (cart.items.length > 0 && selectedStore && token) {
        try {
          const response = await promotionService.getCartApplicablePromotions(selectedStore._id, token);
          if (response.data.success) {
            // Filter promotions to only include those that are actually valid for the current cart
            const validPromotions = response.data.data.filter(promotion => {
              return isPromotionValidForCart(promotion, cart);
            });
            
            // Sort promotions by priority (higher priority first, then by savings)
            const sortedPromotions = validPromotions.sort((a, b) => {
              // 1) prioritize by type (cartTotal first)
              const typeDiff = getPromotionPriority(b) - getPromotionPriority(a);
              if (typeDiff !== 0) return typeDiff;

              // 2) tie-breaker: higher savings first
              const aDiscount = calculatePotentialSavings(a, cart) || 0;
              const bDiscount = calculatePotentialSavings(b, cart) || 0;
              return bDiscount - aDiscount;
            });
            
            setAvailablePromotions(sortedPromotions);
            setPromotions(sortedPromotions);
            
            // Filter out already applied promotions and set the highest priority promotion code
            const appliedPromotionIds = appliedPromotionsStable.map(ap => {
              const appliedPromotionId = ap.promotion?._id || ap.promotion;
              return appliedPromotionId ? appliedPromotionId.toString() : null;
            }).filter(Boolean);
            
            const availablePromotions = sortedPromotions.filter(promotion => {
              const promotionId = promotion._id || promotion.id;
              return !appliedPromotionIds.includes(promotionId?.toString());
            });
            
            // Set the highest priority available promotion code in the input field, or clear if none available
            if (availablePromotions.length > 0 && availablePromotions[0].code) {
              setPromotionCode(availablePromotions[0].code);
            } else {
              setPromotionCode(''); // Clear if no available promotions
            }
          } else {
            // If the response is not successful, clear the promotion code
            setPromotionCode('');
            setAvailablePromotions([]);
            setPromotions([]);
          }
        } catch (error) {
          console.error('Error fetching promotions:', error);
          // If there's an error, clear the promotion code
          setPromotionCode('');
          setAvailablePromotions([]);
          setPromotions([]);
        }
      } else {
        setPromotionCode(''); // Clear if no items in cart
        setAvailablePromotions([]);
        setPromotions([]);
      }
    };

    fetchPromotions();
  }, [cart.items, appliedPromotionsStable, selectedStore, token, calculatePotentialSavings, isPromotionValidForCart, getPromotionPriority]);

  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getPaidItemCount = () => {
    return cart.items.reduce((total, item) => {
      if (item.isFreeItem) return total;
      const paidQuantity = Math.max(0, item.quantity - (item.freeQuantity || 0));
      return total + paidQuantity;
    }, 0);
  };

  const getFreeItemCount = () => {
    return cart.items.reduce((total, item) => {
      if (item.isFreeItem) return total + item.quantity;
      return total + (item.freeQuantity || 0);
    }, 0);
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
      // Clear promotion code when cart is cleared
      setPromotionCode('');
      setAppliedPromotions([]);
      setAvailablePromotions([]);
      setPromotions([]);
      setPromotionError(null);
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
      // If a manual promotion is applied, remove it first (single manual promo policy)
      if (hasManualPromo) {
        await promotionService.removePromotion(cart._id, currentManualPromo.promotion?._id || currentManualPromo.promotion, token);
      }

      // Now apply the new one
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
        
        // Clear the promotion code input temporarily
        setPromotionCode('');
        setPromotionError(null);
        
        // IMPORTANT: Refresh the cart data from backend to get updated items including free items
        if (refreshCart) {
          await refreshCart();
        } else {
          await refreshCartData();
        }
        
        // Re-fetch promotions to update the promotion code with the next highest priority
        const promotionResponse = await promotionService.getCartApplicablePromotions(selectedStore._id, token);
        if (promotionResponse.data.success) {
          const sortedPromotions = promotionResponse.data.data.sort((a, b) => {
            // 1) prioritize by type (cartTotal first)
            const typeDiff = getPromotionPriority(b) - getPromotionPriority(a);
            if (typeDiff !== 0) return typeDiff;

            // 2) tie-breaker: higher savings first
            const aDiscount = calculatePotentialSavings(a, cart) || 0;
            const bDiscount = calculatePotentialSavings(b, cart) || 0;
            return bDiscount - aDiscount;
          });
          
          // Filter out already applied promotions and set the next highest priority promotion code
          const appliedPromotionIds = (cart.appliedPromotions || []).map(ap => {
            const id = ap.promotion?._id || ap.promotion?.id || ap.promotion;
            return id ? id.toString() : null;
          }).filter(Boolean);
          
          const availablePromotions = sortedPromotions.filter(promotion => {
            const promotionId = promotion._id || promotion.id;
            return !appliedPromotionIds.includes(promotionId?.toString());
          });
          
          // Set the next highest priority available promotion code, or clear if none available
          if (availablePromotions.length > 0 && availablePromotions[0].code) {
            setPromotionCode(availablePromotions[0].code);
          } else {
            setPromotionCode(''); // Clear if no available promotions
          }
        } else {
          // If the promotion response fails, clear the promotion code
          setPromotionCode('');
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

  const handleRemovePromotion = async (promotionId) => {
    setAppliedPromotions(prev => prev.filter(p => p.id !== promotionId));
    
    // Re-fetch promotions to potentially set a new promotion code
    if (cart.items.length > 0 && selectedStore && token) {
      try {
        const response = await promotionService.getCartApplicablePromotions(selectedStore._id, token);
        if (response.data.success) {
          // Filter promotions to only include those that are actually valid for the current cart
          const validPromotions = response.data.data.filter(promotion => {
            return isPromotionValidForCart(promotion, cart);
          });
          
          // Sort promotions by priority (higher priority first, then by savings)
          const sortedPromotions = validPromotions.sort((a, b) => {
            // 1) prioritize by type (cartTotal first)
            const typeDiff = getPromotionPriority(b) - getPromotionPriority(a);
            if (typeDiff !== 0) return typeDiff;

            // 2) tie-breaker: higher savings first
            const aDiscount = calculatePotentialSavings(a, cart) || 0;
            const bDiscount = calculatePotentialSavings(b, cart) || 0;
            return bDiscount - aDiscount;
          });
          
          setAvailablePromotions(sortedPromotions);
          setPromotions(sortedPromotions);
          
          // Filter out already applied promotions and set the highest priority promotion code
          const appliedPromotionIds = appliedPromotionsStable.map(ap => {
            const appliedPromotionId = ap.promotion?._id || ap.promotion;
            return appliedPromotionId ? appliedPromotionId.toString() : null;
          }).filter(Boolean);
          
          const availablePromotions = sortedPromotions.filter(promotion => {
            const promotionId = promotion._id || promotion.id;
            return !appliedPromotionIds.includes(promotionId?.toString());
          });
          
          // Set the highest priority available promotion code in the input field, or clear if none available
          if (availablePromotions.length > 0 && availablePromotions[0].code) {
            setPromotionCode(availablePromotions[0].code);
          } else {
            setPromotionCode(''); // Clear if no available promotions
          }
        } else {
          // If the response is not successful, clear the promotion code
          setPromotionCode('');
          setAvailablePromotions([]);
          setPromotions([]);
        }
      } catch (error) {
        console.error('Error fetching promotions after removal:', error);
        // If there's an error, clear the promotion code
        setPromotionCode('');
        setAvailablePromotions([]);
        setPromotions([]);
      }
    } else {
      setPromotionCode(''); // Clear if no items in cart
      setAvailablePromotions([]);
      setPromotions([]);
    }
  };

  // Remove applied manual promotion handler
  const handleRemoveAppliedPromotion = async () => {
    try {
      if (currentManualPromo) {
        // Remove the specific manual promotion
        await promotionService.removePromotion(cart._id, currentManualPromo.promotion?._id || currentManualPromo.promotion, token);
      } else {
        // Remove all manual promotions as fallback
        await promotionService.removeAllPromotions(cart._id, token);
      }
      await refreshCart();
      setPromotionCode(''); // Allow entering a new code
      setPromotionError(null);
      setCheckoutMessage({
        type: 'success',
        text: 'Promotion removed successfully.'
      });
      setTimeout(() => setCheckoutMessage(null), 4000);
    } catch (err) {
      console.error('Failed removing promotion:', err);
      setCheckoutMessage({ type: 'error', text: 'Failed to remove promotion.' });
    }
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
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#8e191c' }}>
                    {getPaidItemCount()} items
                  </span>
                  {getFreeItemCount() > 0 && (
                    <span className="text-white text-sm px-3 py-1 rounded-full bg-green-600">
                      +{getFreeItemCount()} FREE
                    </span>
                  )}
                </div>
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
              {(availablePromotions.length > 0 || appliedPromotions.length > 0) && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5" style={{ color: '#8e191c' }} />
                    Promotions & Discounts
                  </h3>

                  {/* Auto-Applied Promotions */}
                  {autoPromotions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        ✨ Auto-Applied Promotions
                      </h4>
                      {autoPromotions.map((promo, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200 mb-2">
                          <div className="text-sm">
                            <div className="font-semibold text-blue-700">
                              {promo.promotion?.name || promo.name || 'Auto-Applied Promotion'}
                            </div>
                            <div className="text-blue-600 text-xs">
                              Automatically applied • {promo.discountAmount > 0 ? `Saved ${formatPrice(promo.discountAmount)}` : 'Free items added'}
                            </div>
                          </div>
                          <div className="text-blue-600 text-xs font-medium">
                            AUTO
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Manual Promotion Application */}
                  {hasManualPromo ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200 mb-4">
                      <div className="text-sm">
                        <div className="font-semibold text-green-700">
                          {currentManualPromo.promotion?.name || currentManualPromo.name}
                        </div>
                        <div className="text-green-600">
                          Code: {currentManualPromo.code}
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveAppliedPromotion}
                        className="flex items-center gap-1 px-3 py-1 rounded-md border text-sm hover:bg-gray-50"
                      >
                        <X className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  ) : null}

                  {/* Manual Promotion Code Input */}
                  {!hasManualPromo && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Apply Promotion Code</h4>
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
                          className="px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
                          style={{ backgroundColor: '#8e191c' }}
                        >
                          {applyingPromotion ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {promotionError && (
                    <p className="text-red-600 text-sm mt-2">{promotionError}</p>
                  )}
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
                    <div className="text-gray-600">
                      <span>Subtotal ({getPaidItemCount()} items</span>
                      {getFreeItemCount() > 0 && (
                        <span className="text-green-600 ml-1">+ {getFreeItemCount()} FREE</span>
                      )}
                      <span>)</span>
                    </div>
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