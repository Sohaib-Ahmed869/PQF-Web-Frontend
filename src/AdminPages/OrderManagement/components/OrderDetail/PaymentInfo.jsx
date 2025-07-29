import React from 'react';

const PaymentInfo = ({ order, formatPrice, formatDateTime }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Amount</span>
          <span className="text-lg font-bold text-green-600">{formatPrice(order.payment.amount)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Currency</span>
          <span className="text-sm font-medium uppercase">{order.payment.currency}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            order.payment.status === 'succeeded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {order.payment.status}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Method</span>
          <span className="text-sm font-medium capitalize">{order.payment.paymentMethod}</span>
        </div>
        
        {order.payment.paymentIntentId && (
          <div className="pt-3 border-t border-gray-200">
            <span className="text-gray-600 text-sm">Payment Intent ID</span>
            <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded mt-1 break-all">{order.payment.paymentIntentId}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Date</span>
          <span className="text-sm">{formatDateTime(order.payment.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;