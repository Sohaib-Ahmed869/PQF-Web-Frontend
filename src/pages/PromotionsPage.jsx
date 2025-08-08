import React, { useState, useEffect } from 'react';
import { usePromotion } from '../context/PromotionContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import promotionService from '../services/promotionService';
import { 
  Gift, 
  Tag, 
  ShoppingCart, 
  Clock, 
  Percent, 
  Package, 
  Star,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
  Zap,
  TrendingUp,
  Copy,
  Check
} from 'lucide-react';

const PromotionsPage = () => {
  const { 
    promotions, 
    validPromotions, 
    loading, 
    error, 
    getPromotionDescription, 
    calculatePotentialSavings,
    isPromotionConsumed,
    hasUserReachedMaxUsage,
    isPromotionValidForCart,
    getPromotionPriority
  } = usePromotion();
  const { cart, getCartItemCount } = useCart();
  const { selectedStore } = useStore();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('valid');
  const [cartApplicablePromotions, setCartApplicablePromotions] = useState([]);
  const [loadingCartPromotions, setLoadingCartPromotions] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Single-promo behavior: check if a promotion is already applied
  const hasAppliedPromo = (cart.appliedPromotions?.length || 0) > 0;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Fetch cart applicable promotions (same logic as Cart component)
  useEffect(() => {
    const fetchCartApplicablePromotions = async () => {
      if (cart.items.length > 0 && selectedStore && token) {
        setLoadingCartPromotions(true);
        try {
          const response = await promotionService.getCartApplicablePromotions(selectedStore._id, token);
          if (response.data.success) {
            // Filter out promotions that the user has already used and ensure they're actually valid for cart
            const filteredPromotions = response.data.data.filter(promotion => {
              // Check if promotion has been consumed by the user
              if (isPromotionConsumed(promotion)) {
                console.log('Filtering out consumed promotion:', promotion.name);
                return false;
              }
              
              // Check if user has reached max usage for this promotion
              if (hasUserReachedMaxUsage(promotion)) {
                console.log('Filtering out promotion with max usage reached:', promotion.name);
                return false;
              }
              
              // Check if promotion is actually valid for the current cart
              if (!isPromotionValidForCart(promotion, cart)) {
                console.log('Filtering out promotion not valid for cart:', promotion.name);
                return false;
              }
              
              return true;
            });
            
            // Sort promotions by priority (same as Cart component)
            filteredPromotions.sort((a, b) => {
              // 1) prioritize by type (cartTotal first)
              const typeDiff = getPromotionPriority(b) - getPromotionPriority(a);
              if (typeDiff !== 0) return typeDiff;

              // 2) tie-breaker: higher savings first
              const aSave = calculatePotentialSavings(a, cart) || 0;
              const bSave = calculatePotentialSavings(b, cart) || 0;
              return bSave - aSave;
            });
            
            console.log('Filtered promotions:', filteredPromotions.length, 'out of', response.data.data.length);
            
            // Single-promo behavior: if a promotion is already applied, don't show other available promotions
            if (hasAppliedPromo) {
              setCartApplicablePromotions([]);
            } else {
              setCartApplicablePromotions(filteredPromotions);
            }
          }
        } catch (error) {
          console.error('Error fetching cart applicable promotions:', error);
          setCartApplicablePromotions([]);
        } finally {
          setLoadingCartPromotions(false);
        }
      } else {
        setCartApplicablePromotions([]);
      }
    };

    fetchCartApplicablePromotions();
  }, [cart.items, selectedStore, token, isPromotionConsumed, hasUserReachedMaxUsage, isPromotionValidForCart, getPromotionPriority, calculatePotentialSavings, hasAppliedPromo]);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPromotionIcon = (type) => {
    switch (type) {
      case 'buyXGetY':
        return <Gift className="w-5 h-5" />;
      case 'quantityDiscount':
        return <Package className="w-5 h-5" />;
      case 'cartTotal':
        return <ShoppingCart className="w-5 h-5" />;
      default:
        return <Tag className="w-5 h-5" />;
    }
  };

  const getPromotionColor = (type) => {
    switch (type) {
      case 'buyXGetY':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'quantityDiscount':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cartTotal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPromotionTypeLabel = (type) => {
    switch (type) {
      case 'buyXGetY':
        return 'Buy & Get Free';
      case 'quantityDiscount':
        return 'Quantity Discount';
      case 'cartTotal':
        return 'Order Total Discount';
      default:
        return type;
    }
  };

  const isPromotionExpiringSoon = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Return true if promotion expires within 3 days (including today)
    return diffDays >= 0 && diffDays <= 3;
  };

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Filter promotions based on activeTab and user usage
  const getFilteredPromotions = () => {
    let filteredPromotions = [];
    
    switch (activeTab) {
      case 'valid':
        // Use cartApplicablePromotions which are already filtered for usage
        filteredPromotions = cartApplicablePromotions;
        break;
      case 'all':
        // Filter all promotions to exclude consumed ones and currently applied ones
        filteredPromotions = promotions.filter(promotion => {
          if (isPromotionConsumed(promotion)) {
            console.log('Filtering out consumed promotion (all tab):', promotion.name);
            return false;
          }
          if (hasUserReachedMaxUsage(promotion)) {
            console.log('Filtering out promotion with max usage reached (all tab):', promotion.name);
            return false;
          }
          // Check if promotion is currently applied to the cart
          const isCurrentlyApplied = cart.appliedPromotions?.some(
            appliedPromo => {
              // Handle both populated and unpopulated promotion objects
              let appliedPromotionId;
              if (appliedPromo.promotion && typeof appliedPromo.promotion === 'object' && appliedPromo.promotion._id) {
                // If promotion is populated (has _id field)
                appliedPromotionId = appliedPromo.promotion._id;
              } else {
                // If promotion is just an ObjectId
                appliedPromotionId = appliedPromo.promotion;
              }
              
              const promotionId = promotion._id || promotion.id;
              const match = appliedPromotionId && promotionId && appliedPromotionId.toString() === promotionId.toString();
              
              if (match) {
                console.log('Filtering out currently applied promotion (all tab):', promotion.name);
              }
              
              return match;
            }
          );
          if (isCurrentlyApplied) {
            return false;
          }
          return true;
        });
        break;
      case 'expiring':
        // Filter expiring promotions to exclude consumed ones and currently applied ones
        filteredPromotions = promotions.filter(promotion => {
          if (isPromotionConsumed(promotion)) {
            console.log('Filtering out consumed promotion (expiring tab):', promotion.name);
            return false;
          }
          if (hasUserReachedMaxUsage(promotion)) {
            console.log('Filtering out promotion with max usage reached (expiring tab):', promotion.name);
            return false;
          }
          // Check if promotion is currently applied to the cart
          const isCurrentlyApplied = cart.appliedPromotions?.some(
            appliedPromo => {
              // Handle both populated and unpopulated promotion objects
              let appliedPromotionId;
              if (appliedPromo.promotion && typeof appliedPromo.promotion === 'object' && appliedPromo.promotion._id) {
                // If promotion is populated (has _id field)
                appliedPromotionId = appliedPromo.promotion._id;
              } else {
                // If promotion is just an ObjectId
                appliedPromotionId = appliedPromo.promotion;
              }
              
              const promotionId = promotion._id || promotion.id;
              const match = appliedPromotionId && promotionId && appliedPromotionId.toString() === promotionId.toString();
              
              if (match) {
                console.log('Filtering out currently applied promotion (expiring tab):', promotion.name);
              }
              
              return match;
            }
          );
          if (isCurrentlyApplied) {
            return false;
          }
          return isPromotionExpiringSoon(promotion.endDate);
        });
        break;
      default:
        filteredPromotions = cartApplicablePromotions;
    }
    
    console.log(`Filtered promotions for ${activeTab} tab:`, filteredPromotions.length);
    return filteredPromotions;
  };

  // Calculate counts for each tab
  const getValidPromotionsCount = () => {
    return cartApplicablePromotions.length;
  };

  const getAllPromotionsCount = () => {
    return promotions.filter(promotion => {
      if (isPromotionConsumed(promotion)) {
        return false;
      }
      if (hasUserReachedMaxUsage(promotion)) {
        return false;
      }
      // Check if promotion is currently applied to the cart
      const isCurrentlyApplied = cart.appliedPromotions?.some(
        appliedPromo => {
          // Handle both populated and unpopulated promotion objects
          let appliedPromotionId;
          if (appliedPromo.promotion && typeof appliedPromo.promotion === 'object' && appliedPromo.promotion._id) {
            // If promotion is populated (has _id field)
            appliedPromotionId = appliedPromo.promotion._id;
          } else {
            // If promotion is just an ObjectId
            appliedPromotionId = appliedPromo.promotion;
          }
          
          const promotionId = promotion._id || promotion.id;
          return appliedPromotionId && promotionId && appliedPromotionId.toString() === promotionId.toString();
        }
      );
      if (isCurrentlyApplied) {
        return false;
      }
      return true;
    }).length;
  };

  const getExpiringPromotionsCount = () => {
    return promotions.filter(promotion => {
      if (isPromotionConsumed(promotion)) {
        return false;
      }
      if (hasUserReachedMaxUsage(promotion)) {
        return false;
      }
      // Check if promotion is currently applied to the cart
      const isCurrentlyApplied = cart.appliedPromotions?.some(
        appliedPromo => {
          // Handle both populated and unpopulated promotion objects
          let appliedPromotionId;
          if (appliedPromo.promotion && typeof appliedPromo.promotion === 'object' && appliedPromo.promotion._id) {
            // If promotion is populated (has _id field)
            appliedPromotionId = appliedPromo.promotion._id;
          } else {
            // If promotion is just an ObjectId
            appliedPromotionId = appliedPromo.promotion;
          }
          
          const promotionId = promotion._id || promotion.id;
          return appliedPromotionId && promotionId && appliedPromotionId.toString() === promotionId.toString();
        }
      );
      if (isCurrentlyApplied) {
        return false;
      }
      return isPromotionExpiringSoon(promotion.endDate);
    }).length;
  };

  const filteredPromotions = getFilteredPromotions();

  if (loading || (activeTab === 'valid' && loadingCartPromotions)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading promotions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Tab Navigation */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('valid')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'valid'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Available for Your Cart ({getValidPromotionsCount()})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'all'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-2" />
                All Promotions ({getAllPromotionsCount()})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('expiring')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'expiring'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Expiring Soon ({getExpiringPromotionsCount()})
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Promotions List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredPromotions.length === 0 ? (
          <div className="text-center py-16">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {activeTab === 'valid' && hasAppliedPromo
                ? "A promotion is already applied to your cart"
                : activeTab === 'valid' 
                ? "No promotions available for your current cart"
                : activeTab === 'expiring'
                ? "No promotions expiring soon"
                : "No active promotions available"
              }
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {activeTab === 'valid' && hasAppliedPromo
                ? "Remove the current promotion in your cart to apply a different one."
                : activeTab === 'valid' 
                ? "Add more items to your cart to unlock available promotions!"
                : activeTab === 'expiring'
                ? "No promotions are expiring soon."
                : "You may have already used all available promotions or none are currently active."
              }
            </p>
            {activeTab === 'valid' && !hasAppliedPromo && (
              <button
                onClick={() => setActiveTab('all')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                View All Promotions
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
            {activeTab === 'valid' && hasAppliedPromo && (
              <button
                onClick={() => window.location.href = '/cart'}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Go to Cart
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPromotions.map((promotion) => {
              const isValid = cartApplicablePromotions.some(p => p._id === promotion._id || p.id === promotion.id);
              const isExpiring = isPromotionExpiringSoon(promotion.endDate);
              const potentialSavings = calculatePotentialSavings(promotion, cart);
              const promotionKey = promotion._id || promotion.id || `promotion-${Math.random()}`;
              
              return (
                <div
                  key={promotionKey}
                  className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-300 hover:shadow-md ${
                    isValid ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getPromotionIcon(promotion.type)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPromotionColor(promotion.type)}`}>
                            {getPromotionTypeLabel(promotion.type)}
                          </span>
                          {isExpiring && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                              <Clock className="w-3 h-3 mr-1" />
                              Ending Soon
                            </span>
                          )}
                          {isValid && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Available
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{promotion.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{getPromotionDescription(promotion)}</p>
                        
                        {/* Promotion Code */}
                        {promotion.code && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-medium text-gray-700">Promo Code:</span>
                            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md">
                              <code className="text-sm font-mono text-gray-800">{promotion.code}</code>
                              <button
                                onClick={() => copyToClipboard(promotion.code)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                {copiedCode === promotion.code ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Promotion Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Valid until {formatDate(promotion.endDate)}</span>
                          </div>
                          
                          {promotion.minOrderAmount > 0 && (
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>Min. order: {formatPrice(promotion.minOrderAmount)}</span>
                            </div>
                          )}
                          
                          {promotion.maxUsage > 0 && (
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              <span>{promotion.maxUsage - (promotion.currentUsage || 0)} uses remaining</span>
                            </div>
                          )}
                        </div>

                        {/* Potential Savings */}
                        {potentialSavings > 0 && isValid && (
                          <div className="mt-3 flex items-center text-sm font-medium text-green-600">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            <span>You can save: {formatPrice(potentialSavings)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {isValid ? (
                          <div className="text-right">
                            <div className="text-green-600 font-medium text-sm">Can be applied</div>
                            <div className="text-xs text-gray-500">to your cart</div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className="text-gray-500 font-medium text-sm">
                              {cart.items.length === 0 
                                ? "Add items to cart"
                                : "Conditions not met"
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom CTA section removed */}
    </div>
  );
};

export default PromotionsPage;
