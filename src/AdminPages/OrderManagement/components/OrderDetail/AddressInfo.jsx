import React from 'react';

const AddressInfo = ({ title, address, icon: Icon, iconColor, isPickup = false }) => {
  const getIconColorClass = (color) => {
    switch (color) {
      case 'blue': return 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 text-blue-600';
      case 'green': return 'bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 text-green-600';
      default: return 'bg-gradient-to-r from-gray-500/10 to-gray-600/10 border border-gray-500/20 text-gray-600';
    }
  };

  // Check if address exists and has required properties
  // For pickup orders (store address), check for street, city, country
  // For delivery orders (shipping/billing), check for address property
  const hasAddress = isPickup || title.toLowerCase().includes('pickup') 
    ? (address && address.street && address.city && address.country)
    : (address && address.address);
  
  // Determine if this is a pickup order based on the title or prop
  const isPickupOrder = isPickup || title.toLowerCase().includes('pickup');

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-xl ${getIconColorClass(iconColor)}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
             <div className="space-y-2 text-gray-700">
         {hasAddress ? (
           <>
             {isPickupOrder && (
               <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                 <div className="flex items-center space-x-2 mb-3">
                   <div className="w-4 h-4 text-green-600">
                     <svg fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                     </svg>
                   </div>
                   <span className="text-sm font-semibold text-green-800">Pickup Address</span>
                 </div>
                 <div className="space-y-1 text-sm text-gray-700">
                   <p className="font-medium">{address.street}</p>
                   <p>{address.city}{address.postalCode ? `, ${address.postalCode}` : ''}</p>
                   <p className="font-medium">{address.country}</p>
                 </div>
               </div>
             )}
                           {!isPickupOrder && (
                <>
                  <p className="font-medium">{address.address}</p>
                  {address.city && <p>{address.city}{address.postalCode ? `, ${address.postalCode}` : ''}</p>}
                  {address.country && <p className="font-medium">{address.country}</p>}
                </>
              )}
           </>
         ) : (
           <div className="text-gray-500 italic">
             <p>No address information available</p>
             <p className="text-sm">
               {isPickupOrder 
                 ? "Store address information not available" 
                 : "Address information not provided"
               }
             </p>
           </div>
         )}
       </div>
    </div>
  );
};

export default AddressInfo;