import React from 'react';
import { FiUser, FiMail, FiPhone } from 'react-icons/fi';

const CustomerInfo = ({ order }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 mb-8 shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
          <FiUser className="w-5 h-5 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Customer Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Customer Name</label>
          <p className="text-lg font-semibold text-gray-900">{order.cardName || order.user?.name}</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Email</label>
          <div className="flex items-center space-x-2">
            <FiMail className="w-4 h-4 text-gray-500" />
            <p className="text-gray-700">{order.user?.email}</p>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Phone</label>
          <div className="flex items-center space-x-2">
            <FiPhone className="w-4 h-4 text-gray-500" />
            <p className="text-gray-700">{order.user?.phone}</p>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Customer Code</label>
          <p className="text-lg font-semibold text-purple-700 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 inline-block">
            {order.cardCode}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;