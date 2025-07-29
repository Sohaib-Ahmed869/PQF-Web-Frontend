import React from 'react';
import { 
  FiEye, 
  FiCalendar,
  FiTruck,
  FiHome,
  FiClock,
  FiTruck as FiTruckIcon,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiShoppingCart,
  FiMail,
  FiPhone
} from 'react-icons/fi';

const OrderGrid = ({ orders, onOrderDetails, formatPrice, formatDate }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orders.map(order => (
        <div 
          key={order.orderId} 
          onClick={() => onOrderDetails(order.orderId)}
          className="bg-white/80 backdrop-blur-sm rounded-3xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2 group shadow-xl overflow-hidden border border-gray-200/50"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FiShoppingCart className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-600">Order #{order.orderId.slice(-8)}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.trackingStatus)}`}>
                {order.trackingStatus}
              </span>
            </div>

            <div className="space-y-4">
              {/* Customer Info */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300">
                  {order.cardName || order.user?.name}
                </h3>
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <FiMail className="w-4 h-4" />
                  <span>{order.user?.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 gap-2 mt-1">
                  <FiPhone className="w-4 h-4" />
                  <span>{order.user?.phone}</span>
                </div>
              </div>

              {/* Order Details */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Order Type</span>
                  <div className="flex items-center gap-1">
                    {order.orderType === 'delivery' ? <FiTruck className="w-4 h-4 text-blue-600" /> : <FiHome className="w-4 h-4 text-green-600" />}
                    <span className="text-sm font-medium capitalize">{order.orderType}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Items</span>
                  <span className="text-sm font-medium">{order.orderItems.length} items</span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-lg font-bold text-green-600">{formatPrice(order.price)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600 mb-2">Items:</div>
                <div className="flex -space-x-2">
                  {order.orderItems.slice(0, 3).map((item, index) => (
                    <div key={item._id} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                      +{order.orderItems.length - 3}
                    </div>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiCalendar className="w-4 h-4" />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 transition-all duration-300 pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOrderDetails(order.orderId);
                  }}
                  className="flex items-center justify-center px-3 py-2 text-sm font-semibold text-green-700 bg-green-50 rounded-xl hover:bg-green-100 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 group/btn transform hover:scale-105 border border-green-200"
                >
                  <FiEye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderGrid;