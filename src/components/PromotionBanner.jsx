import React from 'react';
import { usePromotion } from '../context/PromotionContext';
import { useCart } from '../context/CartContext';
import { Gift, Tag, Percent, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PromotionBanner = ({ showAll = false, className = "" }) => {
  const { validPromotions, getPromotionDescription, calculatePotentialSavings } = usePromotion();
  const { cart } = useCart();
  const navigate = useNavigate();

  if (!validPromotions || validPromotions.length === 0) {
    return null;
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPromotionIcon = (type) => {
    switch (type) {
      case 'buyXGetY':
        return <Gift className="w-4 h-4 flex-shrink-0" />;
      case 'quantityDiscount':
        return <Percent className="w-4 h-4 flex-shrink-0" />;
      case 'cartTotal':
        return <Tag className="w-4 h-4 flex-shrink-0" />;
      default:
        return <Tag className="w-4 h-4 flex-shrink-0" />;
    }
  };

  const displayPromotions = showAll ? validPromotions : validPromotions.slice(0, 2);
  const totalSavings = validPromotions.reduce((sum, promotion) => {
    return sum + calculatePotentialSavings(promotion, cart);
  }, 0);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-800">
            {validPromotions.length} Active Promotion{validPromotions.length !== 1 ? 's' : ''}
          </h3>
        </div>
        {totalSavings > 0 && (
          <div className="text-sm font-medium text-green-600">
            You save: {formatPrice(totalSavings)}
          </div>
        )}
      </div>

      {/* Promotion Cards */}
      <div className="space-y-2">
        {displayPromotions.map((promotion) => {
          const savings = calculatePotentialSavings(promotion, cart);
          return (
            <div
              key={promotion._id}
              className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5 text-green-600">
                  {getPromotionIcon(promotion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-green-800 text-sm">
                    {promotion.name}
                  </h4>
                  <p className="text-xs text-green-600 mt-1">
                    {getPromotionDescription(promotion)}
                  </p>
                  {savings > 0 && (
                    <div className="text-xs font-medium text-green-700 mt-1">
                      💰 Saves: {formatPrice(savings)}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Applied
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      {validPromotions.length > 2 && !showAll && (
        <button
          onClick={() => navigate('/promotions')}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-green-700 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
        >
          View All {validPromotions.length} Promotions
          <ArrowRight className="w-4 h-4" />
        </button>
      )}

      {/* No Promotions Message (if needed for empty state) */}
      {validPromotions.length === 0 && (
        <div className="text-center py-4 px-3 bg-gray-50 border border-gray-200 rounded-lg">
          <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">No promotions available for your cart</p>
          <button
            onClick={() => navigate('/promotions')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Browse All Promotions
          </button>
        </div>
      )}
    </div>
  );
};

export default PromotionBanner;
