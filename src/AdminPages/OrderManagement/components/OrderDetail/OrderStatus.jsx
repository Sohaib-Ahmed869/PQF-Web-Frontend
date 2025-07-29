import React from 'react';
import { FiTruck, FiHome } from 'react-icons/fi';

const OrderStatus = ({ order, getStatusColor, formatDateTime }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h4>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.trackingStatus)}`}>
            {order.trackingStatus}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Order Type</span>
          <div className="flex items-center gap-1">
            {order.orderType === 'delivery' ? <FiTruck className="w-4 h-4 text-blue-600" /> : <FiHome className="w-4 h-4 text-green-600" />}
            <span className="text-sm font-medium capitalize">{order.orderType}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Payment Status</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {order.paymentStatus}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Payment Method</span>
          <span className="text-sm font-medium capitalize">{order.paymentType}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Tracking Number</span>
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{order.trackingNumber}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;