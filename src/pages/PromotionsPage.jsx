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
  const { promotions, validPromotions, loading, error, getPromotionDescription, calculatePotentialSavings } = usePromotion();
  const { cart, getCartItemCount } = useCart();
  const { selectedStore } = useStore();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('valid');
  const [cartApplicablePromotions, setCartApplicablePromotions] = useState([]);
  const [loadingCartPromotions, setLoadingCartPromotions] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

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
            setCartApplicablePromotions(response.data.data);
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
  }, [cart.items, selectedStore, token]);

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
    return diffDays <= 3;
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

  // Only show valid promotions by default, or filter based on activeTab
  const filteredPromotions = activeTab === 'valid' 
    ? cartApplicablePromotions 
    : activeTab === 'all' 
    ? promotions 
    : activeTab === 'expiring' 
    ? promotions.filter(p => isPromotionExpiringSoon(p.endDate))
    : cartApplicablePromotions;

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
                Available for Your Cart ({cartApplicablePromotions.length})
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
                All Promotions ({promotions.length})
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
                Expiring Soon ({promotions.filter(p => isPromotionExpiringSoon(p.endDate)).length})
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
              {activeTab === 'valid' 
                ? "No promotions available for your current cart"
                : activeTab === 'expiring'
                ? "No promotions expiring soon"
                : "No active promotions"
              }
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {activeTab === 'valid' 
                ? "Add more items to your cart to unlock available promotions!"
                : "Check back later for new deals and offers."
              }
            </p>
            {activeTab === 'valid' && (
              <button
                onClick={() => setActiveTab('all')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                View All Promotions
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
              
              return (
                <div
                  key={promotion._id}
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
