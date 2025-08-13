import React from 'react';
import { usePromotion } from '../context/PromotionContext';
import { Gift, Percent, Tag, Zap } from 'lucide-react';

const PromotionBadge = ({ product, className = "" }) => {
  const { promotions } = usePromotion();

  if (!product || !promotions || promotions.length === 0) {
    return null;
  }

  // Find promotions that apply to this specific product
  const applicablePromotions = promotions.filter(promotion => {
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
  });

  if (applicablePromotions.length === 0) {
    return null;
  }

  // Prioritize auto-apply promotions, then highest priority
  const autoApplyPromotions = applicablePromotions.filter(p => p.autoApply && !p.requiresCode);
  const bestPromotion = autoApplyPromotions.length > 0 
    ? autoApplyPromotions.reduce((best, current) => {
        return (current.priority || 1) > (best.priority || 1) ? current : best;
      })
    : applicablePromotions.reduce((best, current) => {
        return (current.priority || 1) > (best.priority || 1) ? current : best;
      });

  const getPromotionIcon = (type) => {
    switch (type) {
      case 'buyXGetY':
        return <Gift className="w-3 h-3" />;
      case 'quantityDiscount':
        return <Percent className="w-3 h-3" />;
      case 'cartTotal':
        return <Tag className="w-3 h-3" />;
      default:
        return <Zap className="w-3 h-3" />;
    }
  };

  const getPromotionText = (promotion) => {
    switch (promotion.type) {
      case 'buyXGetY':
        const buyXGetY = promotion.rule?.buyXGetY;
        if (buyXGetY) {
          return `Buy ${buyXGetY.buyQuantity} Get ${buyXGetY.getQuantity} FREE`;
        }
        break;
      case 'quantityDiscount':
        const quantityDiscount = promotion.rule?.quantityDiscount;
        if (quantityDiscount) {
          const discount = quantityDiscount.discountAmount 
            ? `$${quantityDiscount.discountAmount} OFF`
            : `${quantityDiscount.discountPercentage}% OFF`;
          return discount;
        }
        break;
      case 'cartTotal':
        return 'SPECIAL OFFER';
      default:
        return 'PROMO';
    }
    return 'OFFER';
  };

  const getPromotionColor = (type, isAutoApply) => {
    if (isAutoApply) {
      // Special styling for auto-apply promotions
      switch (type) {
        case 'buyXGetY':
          return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-white';
        case 'quantityDiscount':
          return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-2 border-white';
        default:
          return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-2 border-white';
      }
    }
    
    switch (type) {
      case 'buyXGetY':
        return 'bg-green-500 text-white';
      case 'quantityDiscount':
        return 'bg-blue-500 text-white';
      case 'cartTotal':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-red-500 text-white';
    }
  };

  const isAutoApply = bestPromotion.autoApply && !bestPromotion.requiresCode;

  return (
    <div className={`absolute top-2 left-2 z-10 ${className}`}>
      <div 
        className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold 
          ${getPromotionColor(bestPromotion.type, isAutoApply)}
          shadow-md ${isAutoApply ? 'animate-pulse' : ''}
        `}
        title={`${bestPromotion.name}${isAutoApply ? ' (Auto-Applied)' : ''}`}
      >
        {getPromotionIcon(bestPromotion.type)}
        <span>{getPromotionText(bestPromotion)}</span>
        {isAutoApply && (
          <span className="text-xs opacity-90">⚡</span>
        )}
      </div>
      
      {/* Auto-apply indicator */}
      {isAutoApply && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-yellow-900 text-xs rounded-full flex items-center justify-center font-bold">
          ⚡
        </div>
      )}
      
      {/* Multiple promotions indicator */}
      {applicablePromotions.length > 1 && !isAutoApply && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {applicablePromotions.length}
        </div>
      )}
    </div>
  );
};

export default PromotionBadge;
