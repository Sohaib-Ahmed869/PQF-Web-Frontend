import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { X, Gift, Zap, CheckCircle } from 'lucide-react';

const AutoPromotionNotification = () => {
  const { cart } = useCart();
  const [notifications, setNotifications] = useState([]);
  const [lastPromotionCount, setLastPromotionCount] = useState(0);

  useEffect(() => {
    if (!cart?.appliedPromotions) return;

    const autoPromotions = cart.appliedPromotions.filter(ap => ap.isAutoApplied);
    const currentCount = autoPromotions.length;

    // Check if new auto-promotions were applied
    if (currentCount > lastPromotionCount) {
      const newPromotions = autoPromotions.slice(lastPromotionCount);
      
      newPromotions.forEach((promo, index) => {
        const notificationId = `auto-promo-${Date.now()}-${index}`;
        const notification = {
          id: notificationId,
          type: 'auto-promotion',
          promotion: promo,
          timestamp: Date.now(),
          dismissed: false
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, dismissed: true } : n)
          );
        }, 5000);

        // Remove from DOM after animation
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notificationId));
        }, 5500);
      });
    }

    setLastPromotionCount(currentCount);
  }, [cart?.appliedPromotions, lastPromotionCount]);

  const dismissNotification = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300);
  };

  const getPromotionMessage = (promotion) => {
    const promoData = promotion.promotion;
    if (!promoData) return 'Promotion automatically applied!';

    switch (promoData.type) {
      case 'buyXGetY':
        return 'Free items added to your cart!';
      case 'quantityDiscount':
        return 'Quantity discount applied!';
      default:
        return 'Promotion automatically applied!';
    }
  };

  const activeNotifications = notifications.filter(n => !n.dismissed);

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {activeNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            bg-white border-l-4 border-emerald-500 rounded-lg shadow-lg p-4
            transform transition-all duration-300 ease-in-out
            animate-slide-in-right
          `}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <p className="text-sm font-semibold text-gray-900">
                  Auto-Applied!
                </p>
              </div>
              
              <p className="text-sm text-gray-700 mb-1">
                {getPromotionMessage(notification.promotion)}
              </p>
              
              <p className="text-xs text-gray-500">
                {notification.promotion.promotion?.name || 'Special Promotion'}
              </p>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => dismissNotification(notification.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar for auto-dismiss */}
          <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full animate-shrink-width"
              style={{ animationDuration: '5s' }}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shrink-width {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-shrink-width {
          animation: shrink-width linear;
        }
      `}</style>
    </div>
  );
};

export default AutoPromotionNotification;
