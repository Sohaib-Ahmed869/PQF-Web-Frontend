import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const items = location.state?.items || [];
  const total = location.state?.total;
  const email = location.state?.email || '';
  
  // Enhanced order data with promotion information
  const orderData = location.state?.orderData || {};
  const originalTotal = orderData.originalTotal || total;
  const finalTotal = orderData.finalTotal || total;
  const totalDiscount = orderData.totalDiscount || 0;
  const appliedPromotions = orderData.appliedPromotions || [];
  const appliedDiscounts = orderData.appliedDiscounts || [];

  const handleViewOrders = () => {
    navigate('/user/orders');
  };

  // Calculate the total price for an item considering free quantities
  const calculateItemTotalPrice = (item) => {
    const isFreeItem = item.isFreeItem || false;
    const freeQuantity = item.freeQuantity || 0;
    const regularQuantity = item.regularQuantity || (item.quantity - freeQuantity);
    
    // If item is entirely free
    if (isFreeItem && freeQuantity >= item.quantity) {
      return 0;
    } 
    // If item has some free quantities
    else if (freeQuantity > 0) {
      // Only charge for the non-free portion
      return item.price * Math.max(0, regularQuantity);
    } 
    // If marked as free item but no specific free quantity
    else if (isFreeItem) {
      return 0;
    } 
    // Regular item, charge full price
    else {
      return item.price * item.quantity;
    }
  };

  // Helper function to get item name
  const getItemName = (item) => {
    return item.title || item.name || item.ItemName || item.product?.name || item.product?.ItemName || "Product";
  };

  // Helper function to get item image
  const getItemImage = (item) => {
    return item.image || item.imageUrl || item.product?.image || item.product?.ImageUrl || item.product?.Picture || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#8e191c]/5 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-100">
        <FaCheckCircle className="mx-auto text-green-500 w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold text-[#8e191c] mb-2">Order Confirmed!</h1>
        <p className="text-lg text-gray-700 mb-4">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        {orderId && (
          <p className="text-gray-500 mb-4">Order ID: <span className="font-semibold">{orderId}</span></p>
        )}
        {/* Ordered Items */}
        {items.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
            <h3 className="text-lg font-semibold text-[#8e191c] mb-2">Ordered Items</h3>
            <ul className="divide-y divide-gray-200">
              {items.map((item, idx) => {
                const isFreeItem = item.isFreeItem || false;
                const freeQuantity = item.freeQuantity || 0;
                const regularQuantity = item.regularQuantity || (item.quantity - freeQuantity);
                const itemTotalPrice = calculateItemTotalPrice(item);
                const itemName = getItemName(item);
                const itemImage = getItemImage(item);
                
                return (
                  <li key={idx} className="py-3">
                    <div className="flex items-center space-x-3">
                      {/* Item Image */}
                      <div className="flex-shrink-0">
                        <img 
                          src={itemImage} 
                          alt={itemName}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300";
                          }}
                        />
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-800 block">
                              {itemName}
                              {(isFreeItem || freeQuantity > 0) && (
                                <span className="text-green-600 text-sm ml-2">
                                  ({freeQuantity > 0 ? `${freeQuantity} FREE` : ''})
                                </span>
                              )}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              Quantity: {item.quantity}
                              {freeQuantity > 0 && regularQuantity > 0 && (
                                <span className="text-green-600 ml-2">
                                  ({regularQuantity} paid + {freeQuantity} free)
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#8e191c] ml-2">
                            {itemTotalPrice === 0 ? 'FREE' : `AED ${itemTotalPrice.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {/* Order Summary with Discount Details */}
            <div className="border-t border-gray-200 mt-3 pt-3 space-y-2">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{originalTotal ? `AED ${originalTotal.toFixed(2)}` : ''}</span>
              </div>
              
              {/* Show individual promotion discounts if available - only show if discount > 0 */}
              {appliedPromotions.length > 0 && (
                <div className="space-y-1">
                  {appliedPromotions
                    .filter(promotion => (promotion.discountAmount || 0) > 0)
                    .map((promotion, index) => (
                      <div key={index} className="flex justify-between text-sm text-green-600">
                        <span>{promotion.name || `Promotion ${index + 1}`}</span>
                        <span>-AED {(promotion.discountAmount || 0).toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              )}
              
              {/* Total discount if no individual promotions shown */}
              {totalDiscount > 0 && appliedPromotions.length === 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Total Discount</span>
                  <span>-AED {totalDiscount.toFixed(2)}</span>
                </div>
              )}
              
              {/* Final Total */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-[#8e191c]">{finalTotal ? `AED ${finalTotal.toFixed(2)}` : ''}</span>
                </div>
                
                {/* Savings message */}
                {totalDiscount > 0 && (
                  <div className="text-right mt-1">
                    <span className="text-sm text-green-600 font-medium">
                      You saved AED {totalDiscount.toFixed(2)}!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Promotion Summary Card - only show if there are actual monetary discounts */}
        {totalDiscount > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center mb-2">
              <FaCheckCircle className="text-green-600 w-5 h-5 mr-2" />
              <h3 className="text-lg font-semibold text-green-800">Great Savings!</h3>
            </div>
            <div className="text-center space-y-1">
              <p className="text-green-700 text-sm">
                You saved <span className="font-bold text-lg">AED {totalDiscount.toFixed(2)}</span> on this order
              </p>
              {(() => {
                const discountPromotions = appliedPromotions.filter(promotion => (promotion.discountAmount || 0) > 0);
                return discountPromotions.length > 0 && (
                  <p className="text-green-600 text-xs">
                    Applied {discountPromotions.length} promotion{discountPromotions.length > 1 ? 's' : ''}
                  </p>
                );
              })()}
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-3 mt-6">
          <button
            className="w-full py-3 bg-[#8e191c] text-white font-semibold rounded-lg hover:bg-[#8e191c]/90 transition-all duration-200"
            onClick={handleViewOrders}
          >
            View My Orders
          </button>
          <button
            className="w-full py-3 bg-gray-200 text-[#8e191c] font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 