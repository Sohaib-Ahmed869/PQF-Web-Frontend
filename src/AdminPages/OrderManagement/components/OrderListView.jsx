import React from 'react';
import { 
  FiEye, 
  FiShoppingCart,
  FiTag,
  FiDollarSign,
  FiBox,
  FiCalendar,
  FiTruck,
  FiHome,
  FiCreditCard
} from 'react-icons/fi';

const OrderListView = ({ orders, onOrderDetails, formatPrice, formatDate }) => {
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div 
          key={order.orderId} 
          onClick={() => onOrderDetails(order.orderId)}
          className="bg-white/80 backdrop-blur-sm rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:scale-102 group shadow-lg border border-gray-200/50 overflow-hidden"
        >
          <div className="flex items-center p-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mr-6 flex-shrink-0">
              <FiShoppingCart className="w-8 h-8 text-red-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                      {order.cardName || order.user?.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.trackingStatus)}`}>
                      {order.trackingStatus}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-2">
                    <div className="flex items-center">
                      <FiTag className="w-4 h-4 mr-1" />
                      #{order.orderId.slice(-8)}
                    </div>
                    <div className="flex items-center">
                      <FiDollarSign className="w-4 h-4 mr-1" />
                      {formatPrice(order.price)}
                    </div>
                    <div className="flex items-center">
                      <FiBox className="w-4 h-4 mr-1" />
                      {order.orderItems.length} items
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 mr-1" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.orderType === 'delivery' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-green-100 text-green-700 border border-green-300'
                    }`}>
                      {order.orderType === 'delivery' ? <FiTruck className="w-3 h-3 inline mr-1" /> : <FiHome className="w-3 h-3 inline mr-1" />}
                      {order.orderType}
                    </span>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    }`}>
                      <FiCreditCard className="w-3 h-3 inline mr-1" />
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 transition-all duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOrderDetails(order.orderId);
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 hover:scale-110"
                    title="View Order"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderListView;