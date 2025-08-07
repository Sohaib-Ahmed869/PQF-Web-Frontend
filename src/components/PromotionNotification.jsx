import React, { useState } from 'react';
import { usePromotion } from '../context/PromotionContext';
import { Gift, X, ArrowRight, Clock, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PromotionNotification = () => {
  const { promotions } = usePromotion();
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  // Filter for featured/priority promotions
  const featuredPromotions = promotions
    .filter(promotion => promotion.priority >= 3 || promotion.type === 'buyXGetY')
    .slice(0, 3);

  if (isDismissed || featuredPromotions.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPromotionColor = (type) => {
    switch (type) {
      case 'buyXGetY':
        return 'from-green-500 to-emerald-600';
      case 'quantityDiscount':
        return 'from-blue-500 to-indigo-600';
      case 'cartTotal':
        return 'from-purple-500 to-violet-600';
      default:
        return 'from-red-500 to-red-600';
    }
  };

  const isExpiringSoon = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  return (
    <div className="relative bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 border border-orange-200 rounded-xl p-4 mb-6 shadow-sm">
      {/* Dismiss button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            🎉 Special Offers Available!
          </h3>
          
          <div className="space-y-2 mb-4">
            {featuredPromotions.map((promotion) => (
              <div key={promotion._id} className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getPromotionColor(promotion.type)}`}></div>
                <span className="font-medium text-gray-800">{promotion.name}</span>
                {isExpiringSoon(promotion.endDate) && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-medium">Ends {formatDate(promotion.endDate)}</span>
                  </div>
                )}
              </div>
            ))}
            
            {promotions.length > 3 && (
              <div className="text-sm text-gray-600">
                +{promotions.length - 3} more promotions available
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Don't miss out on these limited-time deals. Save on your favorite products today!
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/promotions')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-sm"
            >
              <Tag className="w-4 h-4" />
              View All Promotions
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-200/30 to-orange-200/30 rounded-full -ml-12 -mb-12 pointer-events-none"></div>
    </div>
  );
};

export default PromotionNotification;
