import React from 'react';
import { FiPackage } from 'react-icons/fi';

const OrderItems = ({ order, formatPrice }) => {
  // Calculate the total price for an item considering free quantities
  const calculateItemTotalPrice = (item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 0;
    
    // If item is free or has free quantity, only charge for the non-free portion
    if (item.isFreeItem) {
      // If the entire item is free, don't add anything to total
      return 0;
    } else if (item.freeQuantity && item.freeQuantity > 0) {
      // If item has free quantity, only charge for the non-free portion
      const chargeableQuantity = quantity - item.freeQuantity;
      return price * Math.max(0, chargeableQuantity);
    } else {
      // Regular item, charge full price
      return price * quantity;
    }
  };

  // Helper function to format price in AED
  const formatPriceAED = (price) => {
    return `AED ${price.toFixed(2)}`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
          <FiPackage className="w-5 h-5 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Order Items</h3>
      </div>

      <div className="space-y-4">
        {order.orderItems.map((item, index) => {
          // Check if this is a free item (same logic as Cart.jsx)
          const isFreeItem = item.isFreeItem || item.freeQuantity > 0 || item.discountAmount > 0;
          const freeQuantity = item.freeQuantity || 0;
          const regularQuantity = item.quantity - freeQuantity;
          const itemTotalPrice = calculateItemTotalPrice(item);
          
          return (
            <div key={item._id} className={`flex items-center space-x-4 p-4 border rounded-2xl hover:border-red-200 transition-all duration-300 ${
              isFreeItem ? 'border-2 border-green-200 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {/* Free item badge - same as Cart.jsx */}
                {isFreeItem && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {freeQuantity > 0 ? `${freeQuantity} FREE` : 'FREE'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">
                  {item.name}
                  {isFreeItem && (
                    <span className="ml-2 text-green-600 text-sm font-medium">
                      (Free Item)
                    </span>
                  )}
                </h4>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      {isFreeItem && freeQuantity > 0 ? (
                        <>
                          <span className="text-gray-500 text-sm">
                            {formatPriceAED(item.price)} each
                          </span>
                          <span className="text-green-600 text-sm font-medium">
                            ({freeQuantity} free)
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          {isFreeItem ? 'FREE' : `${formatPriceAED(item.price)} each`}
                        </span>
                      )}
                    </div>
                    <span>
                      Qty: {item.quantity}
                      {freeQuantity > 0 && regularQuantity > 0 && (
                        <span className="text-green-600 ml-1 font-medium">
                          ({regularQuantity} paid + {freeQuantity} free)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="text-right">
                    {isFreeItem && freeQuantity > 0 ? (
                      <div className="flex flex-col items-end">
                        {regularQuantity > 0 ? (
                          <>
                            <span className="text-lg font-bold text-gray-800">
                              {formatPriceAED(item.price * regularQuantity)}
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
                        {formatPriceAED(item.price * item.quantity)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Total with Discount Breakdown */}
      <div className="border-t border-gray-200 pt-6 mt-6 space-y-3">
        {/* Original Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold text-gray-900">
            {formatPriceAED(order.originalTotal || order.price)}
          </span>
        </div>
        
        {/* Show individual promotion discounts if available - only show if discount > 0 */}
        {order.appliedPromotions && order.appliedPromotions.length > 0 && (
          <div className="space-y-2">
            {order.appliedPromotions
              .filter(promotion => (promotion.discountAmount || 0) > 0)
              .map((promotion, index) => (
                <div key={index} className="flex justify-between items-center text-green-600">
                  <span className="text-sm">{promotion.name || `Promotion ${index + 1}`}</span>
                  <span className="text-sm font-semibold">-{formatPriceAED(promotion.discountAmount || 0)}</span>
                </div>
              ))}
          </div>
        )}
        
        {/* Total discount if no individual promotions shown */}
        {(order.totalDiscount > 0) && (!order.appliedPromotions || order.appliedPromotions.length === 0) && (
          <div className="flex justify-between items-center text-green-600">
            <span className="text-sm">Total Discount</span>
            <span className="text-sm font-semibold">-{formatPriceAED(order.totalDiscount)}</span>
          </div>
        )}
        
        {/* Final Total */}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-green-600">{formatPriceAED(order.price)}</span>
          </div>
          
          {/* Savings message */}
          {(order.totalDiscount > 0) && (
            <div className="text-right mt-2">
              <span className="text-sm text-green-600 font-medium">
                Customer saved {formatPriceAED(order.totalDiscount)}!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderItems;