import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import promotionService from '../services/promotionService';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';
import { useCart } from './CartContext';

const PromotionContext = createContext();

export const usePromotion = () => {
  const context = useContext(PromotionContext);
  if (!context) {
    throw new Error('usePromotion must be used within a PromotionProvider');
  }
  return context;
};

export const PromotionProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const { selectedStore } = useStore();
  const { cart } = useCart();
  
  const [promotions, setPromotions] = useState([]);
  const [validPromotions, setValidPromotions] = useState([]);
  const [consumedPromotions, setConsumedPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all active promotions
  const fetchPromotions = async () => {
    if (!selectedStore?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Try to use public promotions endpoint first, fallback to authenticated if needed
      let response;
      try {
        // Use public endpoint - no authentication required
        response = await promotionService.getPublicPromotions({
          store: selectedStore._id,
          isActive: 'true'
        });
      } catch (publicError) {
        console.log('Public endpoint failed, trying authenticated endpoint:', publicError);
        // Fallback to authenticated endpoint if user is logged in
        if (token) {
          response = await promotionService.getPromotions(token, {
            store: selectedStore._id,
            isActive: 'true'
          });
        } else {
          throw publicError;
        }
      }
      
      if (response.data.success) {
        const activePromotions = response.data.data || [];
        // The public endpoint already filters for currently valid promotions
        // But we'll double-check here for safety
        const now = new Date();
        const currentlyValid = activePromotions.filter(promotion => {
          const startDate = new Date(promotion.startDate);
          const endDate = new Date(promotion.endDate);
          return startDate <= now && endDate >= now && promotion.isActive;
        });
        
        setPromotions(currentlyValid);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch consumed promotions for the current user
  const fetchConsumedPromotions = async () => {
    if (!isAuthenticated || !user?._id || !selectedStore?._id) {
      setConsumedPromotions([]);
      return;
    }

    try {
      // This would need to be implemented in the backend
      // For now, we'll check if there's an endpoint for this
      const response = await promotionService.getUserConsumedPromotions(token, {
        userId: user._id,
        store: selectedStore._id
      });
      
      if (response.data.success) {
        setConsumedPromotions(response.data.data || []);
      }
    } catch (err) {
      console.log('No consumed promotions endpoint available, continuing without consumed promotions check');
      setConsumedPromotions([]);
    }
  };

  // Check which promotions are valid for current cart (excluding consumed ones)
  const checkPromotionValidity = () => {
    if (!cart.items || cart.items.length === 0) {
      setValidPromotions([]);
      return;
    }

    const valid = promotions.filter(promotion => {
      try {
        // First check if promotion is valid for cart
        const isCartValid = isPromotionValidForCart(promotion, cart);
        if (!isCartValid) return false;

        // Then check if user has already consumed this promotion
        const isConsumed = isPromotionConsumed(promotion);
        if (isConsumed) return false;

        // Check if user has reached max usage per user
        const hasReachedMaxUsage = hasUserReachedMaxUsage(promotion);
        if (hasReachedMaxUsage) return false;

        return true;
      } catch (error) {
        console.error('Error checking promotion validity:', error);
        return false;
      }
    });

    setValidPromotions(valid);
  };

  // Check if promotion has been consumed by the user
  const isPromotionConsumed = useCallback((promotion) => {
    if (!isAuthenticated || !user?._id) return false;
    
    return consumedPromotions.some(consumed => {
      const consumedPromotionId = consumed.promotion?._id || consumed.promotion;
      const promotionId = promotion._id || promotion.id;
      
      if (!consumedPromotionId || !promotionId) return false;
      
      return consumedPromotionId.toString() === promotionId.toString();
    });
  }, [consumedPromotions, isAuthenticated, user?._id]);

  // Check if user has reached max usage for this promotion
  const hasUserReachedMaxUsage = useCallback((promotion) => {
    if (!isAuthenticated || !user?._id) return false;
    
    if (!promotion.maxUsagePerUser || promotion.maxUsagePerUser === 0) return false;
    
    const userUsageCount = consumedPromotions.filter(consumed => {
      const consumedPromotionId = consumed.promotion?._id || consumed.promotion;
      const promotionId = promotion._id || promotion.id;
      
      if (!consumedPromotionId || !promotionId) return false;
      
      return consumedPromotionId.toString() === promotionId.toString();
    }).length;
    
    return userUsageCount >= promotion.maxUsagePerUser;
  }, [consumedPromotions, isAuthenticated, user?._id]);

  const isProductApplicableForPromotion = useCallback((product, promotion) => {
    if (!product || !product._id) return false;

    const applicableProducts = promotion.applicableProducts || [];
    const applicableCategories = promotion.applicableCategories || [];
    const excludedProducts = promotion.excludedProducts || [];
    const excludedCategories = promotion.excludedCategories || [];

    // Check if product is excluded
    if (excludedProducts.some(p => p.toString() === product._id.toString())) {
      return false;
    }

    // Check if product's category is excluded
    if (excludedCategories.length > 0 && product.ItemsGroupCode) {
      const isCategoryExcluded = excludedCategories.some(cat => {
        if (cat.ItemsGroupCode !== undefined) {
          return cat.ItemsGroupCode === product.ItemsGroupCode;
        }
        return false;
      });
      if (isCategoryExcluded) return false;
    }

    // If no restrictions, all products are applicable
    if (applicableProducts.length === 0 && applicableCategories.length === 0) {
      return true;
    }

    // Check if product is in applicable products
    if (applicableProducts.some(p => p.toString() === product._id.toString())) {
      return true;
    }

    // Check if product's category is in applicable categories
    if (applicableCategories.length > 0 && product.ItemsGroupCode) {
      return applicableCategories.some(cat => {
        if (cat.ItemsGroupCode !== undefined) {
          return cat.ItemsGroupCode === product.ItemsGroupCode;
        }
        return false;
      });
    }

    return false;
  }, []);

  const validateBuyXGetY = useCallback((promotion, cartData) => {
    const rule = promotion.rule?.buyXGetY;
    if (!rule || !rule.buyQuantity || rule.buyQuantity <= 0) return false;

    // Check if any applicable product meets the buy requirement
    return cartData.items.some(item => {
      if (isProductApplicableForPromotion(item.product, promotion)) {
        return item.quantity >= rule.buyQuantity;
      }
      return false;
    });
  }, [isProductApplicableForPromotion]);

  const validateQuantityDiscount = useCallback((promotion, cartData) => {
    const rule = promotion.rule?.quantityDiscount;
    if (!rule || !rule.minQuantity || rule.minQuantity <= 0) return false;

    // Calculate total quantity of applicable items
    const totalQuantity = cartData.items.reduce((sum, item) => {
      if (isProductApplicableForPromotion(item.product, promotion)) {
        return sum + item.quantity;
      }
      return sum;
    }, 0);

    return totalQuantity >= rule.minQuantity;
  }, [isProductApplicableForPromotion]);

  const validateCartTotal = useCallback((promotion, cartData) => {
    const rule = promotion.rule?.cartTotal;
    if (!rule || rule.minAmount === undefined || rule.minAmount < 0) return false;

    // Calculate total of applicable items
    const applicableTotal = cartData.items.reduce((sum, item) => {
      if (isProductApplicableForPromotion(item.product, promotion)) {
        if (item.isFreeItem) return sum;
        if (item.freeQuantity && item.freeQuantity > 0) {
          const chargeableQuantity = item.quantity - item.freeQuantity;
          return sum + (item.price * Math.max(0, chargeableQuantity));
        }
        return sum + (item.price * item.quantity);
      }
      return sum;
    }, 0);

    return applicableTotal >= rule.minAmount;
  }, [isProductApplicableForPromotion]);

  // Helper function to check if promotion is valid for current cart
  const isPromotionValidForCart = useCallback((promotion, cartData) => {
    if (!promotion || !cartData.items) return false;

    // Check minimum order amount
    const cartTotal = cartData.items.reduce((sum, item) => {
      if (item.isFreeItem) return sum;
      if (item.freeQuantity && item.freeQuantity > 0) {
        const chargeableQuantity = item.quantity - item.freeQuantity;
        return sum + (item.price * Math.max(0, chargeableQuantity));
      }
      return sum + (item.price * item.quantity);
    }, 0);

    if (promotion.minOrderAmount && cartTotal < promotion.minOrderAmount) {
      return false;
    }

    // Check applicable products/categories
    const hasApplicableItems = cartData.items.some(item => {
      return isProductApplicableForPromotion(item.product, promotion);
    });

    if (!hasApplicableItems) return false;

    // Type-specific validation
    switch (promotion.type) {
      case 'buyXGetY':
        return validateBuyXGetY(promotion, cartData);
      case 'quantityDiscount':
        return validateQuantityDiscount(promotion, cartData);
      case 'cartTotal':
        return validateCartTotal(promotion, cartData);
      default:
        return false;
    }
  }, [isProductApplicableForPromotion, validateBuyXGetY, validateQuantityDiscount, validateCartTotal]);

  // Get promotion description for display
  const getPromotionDescription = (promotion) => {
    if (!promotion.rule) return promotion.description || '';

    switch (promotion.type) {
      case 'buyXGetY':
        const buyXGetY = promotion.rule.buyXGetY;
        if (buyXGetY) {
          return `Buy ${buyXGetY.buyQuantity} get ${buyXGetY.getQuantity} free`;
        }
        break;
      case 'quantityDiscount':
        const quantityDiscount = promotion.rule.quantityDiscount;
        if (quantityDiscount) {
          const discount = quantityDiscount.discountAmount 
            ? `$${quantityDiscount.discountAmount} off`
            : `${quantityDiscount.discountPercentage}% off`;
          return `${discount} when you buy ${quantityDiscount.minQuantity}+ items`;
        }
        break;
      case 'cartTotal':
        const cartTotal = promotion.rule.cartTotal;
        if (cartTotal) {
          const discount = cartTotal.discountAmount 
            ? `$${cartTotal.discountAmount} off`
            : `${cartTotal.discountPercentage}% off`;
          return `${discount} on orders over $${cartTotal.minAmount}`;
        }
        break;
      default:
        return promotion.description || '';
    }
    return promotion.description || '';
  };

  // Calculate savings for a promotion - Helper functions first
  const calculateBuyXGetYSavings = useCallback((promotion, cartData) => {
    const rule = promotion.rule.buyXGetY;
    if (!rule) return 0;

    let totalSavings = 0;
    cartData.items.forEach(item => {
      if (isProductApplicableForPromotion(item.product, promotion)) {
        const sets = Math.floor(item.quantity / rule.buyQuantity);
        const freeItems = sets * rule.getQuantity;
        totalSavings += freeItems * item.price;
      }
    });
    return totalSavings;
  }, [isProductApplicableForPromotion]);

  const calculateQuantityDiscountSavings = useCallback((promotion, cartData) => {
    const rule = promotion.rule.quantityDiscount;
    if (!rule) return 0;

    const applicableItems = cartData.items.filter(item => 
      isProductApplicableForPromotion(item.product, promotion)
    );

    const totalQuantity = applicableItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity < rule.minQuantity) return 0;

    if (rule.discountAmount) {
      return rule.discountAmount;
    } else if (rule.discountPercentage) {
      const applicableTotal = applicableItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      return applicableTotal * rule.discountPercentage / 100;
    }
    return 0;
  }, [isProductApplicableForPromotion]);

  const calculateCartTotalSavings = useCallback((promotion, cartData) => {
    const rule = promotion.rule.cartTotal;
    if (!rule) return 0;

    const applicableTotal = cartData.items.reduce((sum, item) => {
      if (isProductApplicableForPromotion(item.product, promotion)) {
        return sum + (item.price * item.quantity);
      }
      return sum;
    }, 0);

    if (applicableTotal < rule.minAmount) return 0;

    if (rule.discountAmount) {
      return rule.discountAmount;
    } else if (rule.discountPercentage) {
      return applicableTotal * rule.discountPercentage / 100;
    }
    return 0;
  }, [isProductApplicableForPromotion]);

  const calculatePotentialSavings = useCallback((promotion, cartData) => {
    if (!promotion.rule || !cartData.items) return 0;

    switch (promotion.type) {
      case 'buyXGetY':
        return calculateBuyXGetYSavings(promotion, cartData);
      case 'quantityDiscount':
        return calculateQuantityDiscountSavings(promotion, cartData);
      case 'cartTotal':
        return calculateCartTotalSavings(promotion, cartData);
      default:
        return 0;
    }
  }, [calculateBuyXGetYSavings, calculateQuantityDiscountSavings, calculateCartTotalSavings]);

  // Helper function to get promotion priority (DB priority first, then type-based fallback)
  const getPromotionPriority = useCallback((promotion) => {
    // Prefer DB priority; fall back to a sane default by type
    const byType = { cartTotal: 3, buyXGetY: 2, quantityDiscount: 1 };
    return (promotion?.priority ?? byType[promotion?.type] ?? 0);
  }, []);

  // Effects
  useEffect(() => {
    if (selectedStore?._id) {
      fetchPromotions();
      fetchConsumedPromotions();
    }
  }, [selectedStore, token, user]);

  useEffect(() => {
    checkPromotionValidity();
  }, [promotions, cart, consumedPromotions]);

  const value = {
    promotions,
    validPromotions,
    consumedPromotions,
    loading,
    error,
    fetchPromotions,
    fetchConsumedPromotions,
    getPromotionDescription,
    calculatePotentialSavings,
    isPromotionValidForCart,
    isPromotionConsumed,
    hasUserReachedMaxUsage,
    checkPromotionValidity,
    getPromotionPriority
  };

  return (
    <PromotionContext.Provider value={value}>
      {children}
    </PromotionContext.Provider>
  );
};
