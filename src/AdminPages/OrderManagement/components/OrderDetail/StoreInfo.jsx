import React from 'react';
import { FiMapPin, FiHome, FiClock } from 'react-icons/fi';

const StoreInfo = ({ order }) => {
  const isPickup = order.orderType === 'pickup';
  const storeAddress = order.store?.location?.address;
  const hasStoreAddress = storeAddress && storeAddress.street && storeAddress.city;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20">
          <FiHome className="w-5 h-5 text-green-600" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900">
          {isPickup ? 'Pickup Location' : 'Store Information'}
        </h4>
      </div>
      
      <div className="space-y-4">
        <div>
          <span className="text-gray-600 text-sm font-medium">Store Name</span>
          <p className="text-sm font-semibold text-gray-900 mt-1">{order.store?.name || 'Store name not available'}</p>
        </div>
        
                 {isPickup && hasStoreAddress && (
           <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
             <div className="flex items-center space-x-2 mb-2">
               <FiMapPin className="w-4 h-4 text-blue-600" />
               <span className="text-sm font-semibold text-blue-800">Pickup Location</span>
             </div>
             <p className="text-sm text-blue-700">
               Address is shown in the Pickup Location section above
             </p>
           </div>
         )}
        
        {!isPickup && (
          <div>
            <span className="text-gray-600 text-sm font-medium">Location</span>
            <div className="mt-1 space-y-1">
              <p className="text-sm text-gray-700">{storeAddress?.street || 'Address not available'}</p>
              <p className="text-sm text-gray-700">
                {storeAddress?.city && storeAddress?.country 
                  ? `${storeAddress.city}, ${storeAddress.country}`
                  : 'Location not available'
                }
              </p>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="text-gray-600 text-sm font-medium">Store Status</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            order.store?.status === 'active' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {order.store?.status || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StoreInfo;