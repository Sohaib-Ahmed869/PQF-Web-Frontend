import React from 'react';
import { FiPackage } from 'react-icons/fi';

const OrderItems = ({ order, formatPrice }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
          <FiPackage className="w-5 h-5 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Order Items</h3>
      </div>

      <div className="space-y-4">
        {order.orderItems.map((item, index) => (
          <div key={item._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-2xl hover:border-red-200 transition-all duration-300">
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <img 
                src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{item.name}</h4>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Price: {formatPrice(item.price)}</span>
                  <span>Qty: {item.quantity}</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Total */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total Amount</span>
          <span className="text-2xl font-bold text-green-600">{formatPrice(order.price)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderItems;