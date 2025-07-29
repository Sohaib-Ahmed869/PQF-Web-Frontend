import React from 'react';

const OrderDetailsCard = ({ order, formatDateTime }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h4>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Order ID</span>
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{order.orderId}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Doc Entry</span>
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{order.docEntry}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Created</span>
          <span className="text-sm">{formatDateTime(order.createdAt)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Updated</span>
          <span className="text-sm">{formatDateTime(order.updatedAt)}</span>
        </div>
        
        {order.notes && (
          <div className="pt-3 border-t border-gray-200">
            <span className="text-gray-600 text-sm">Notes</span>
            <p className="text-sm text-gray-700 mt-1">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsCard;