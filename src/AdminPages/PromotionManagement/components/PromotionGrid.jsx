import React from 'react';
import { 
  FiEye, 
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiClock,
  FiGift,
  FiPercent,
  FiShoppingCart,
  FiTag,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi';

const PromotionGrid = ({ promotions, onEdit, onView, onDelete, formatDate, formatUsage }) => {
  // Get status color and icon
  const getStatusInfo = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (!promotion.isActive) {
      return {
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: FiXCircle,
        label: 'Inactive'
      };
    }
    
    if (now < startDate) {
      return {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: FiClock,
        label: 'Upcoming'
      };
    }
    
    if (now > endDate) {
      return {
        color: 'bg-[#8e191c]/10 text-[#8e191c] border-[#8e191c]/30',
        icon: FiAlertCircle,
        label: 'Expired'
      };
    }
    
    return {
      color: 'bg-green-100 text-green-700 border-green-300',
      icon: FiCheckCircle,
      label: 'Active'
    };
  };

  // Get type icon and color
  const getTypeInfo = (type) => {
    switch (type) {
      case 'buyXGetY':
        return { icon: FiGift, color: 'text-purple-600', label: 'Buy X Get Y' };
      case 'quantityDiscount':
        return { icon: FiPercent, color: 'text-blue-600', label: 'Quantity Discount' };
      case 'cartTotal':
        return { icon: FiShoppingCart, color: 'text-green-600', label: 'Cart Total' };
      default:
        return { icon: FiTag, color: 'text-gray-600', label: type };
    }
  };

  // Get rule summary
  const getRuleSummary = (promotion) => {
    switch (promotion.type) {
      case 'buyXGetY':
        const { buyQuantity, getQuantity, sameItem } = promotion.rule?.buyXGetY || {};
        return `Buy ${buyQuantity} Get ${getQuantity} Free${sameItem ? ' (Same Item)' : ''}`;
      case 'quantityDiscount':
        const { minQuantity, discountPercentage, discountAmount } = promotion.rule?.quantityDiscount || {};
        const discount = discountPercentage > 0 ? `${discountPercentage}%` : `$${discountAmount}`;
        return `Min ${minQuantity} items - ${discount} off`;
      case 'cartTotal':
        const { minAmount, discountPercentage: cartDiscountPercentage, discountAmount: cartDiscountAmount } = promotion.rule?.cartTotal || {};
        const cartDiscount = cartDiscountPercentage > 0 ? `${cartDiscountPercentage}%` : `$${cartDiscountAmount}`;
        return `Min $${minAmount} - ${cartDiscount} off`;
      default:
        return 'N/A';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {promotions.map(promotion => {
        const statusInfo = getStatusInfo(promotion);
        const typeInfo = getTypeInfo(promotion.type);
        const StatusIcon = statusInfo.icon;
        const TypeIcon = typeInfo.icon;

        return (
          <div 
            key={promotion._id} 
            className="bg-white/80 backdrop-blur-sm rounded-3xl cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#8e191c]/20 hover:-translate-y-2 group shadow-xl overflow-hidden border border-gray-200/50"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                  <span className="text-sm font-medium text-gray-600">{typeInfo.label}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                  <div className="flex items-center gap-1">
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                  </div>
                </span>
              </div>

              {/* Promotion Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#8e191c] transition-colors duration-300">
                    {promotion.name}
                  </h3>
                  {promotion.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {promotion.description}
                    </p>
                  )}
                </div>

                {/* Code */}
                {promotion.code && (
                  <div className="flex items-center gap-2">
                    <FiTag className="w-4 h-4 text-gray-400" />
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {promotion.code}
                    </span>
                  </div>
                )}

                {/* Rule Summary */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600 mb-2">Rule:</div>
                  <div className="text-sm font-medium text-gray-900">
                    {getRuleSummary(promotion)}
                  </div>
                </div>

                {/* Dates */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Start Date</span>
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{formatDate(promotion.startDate)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">End Date</span>
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{formatDate(promotion.endDate)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Usage</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatUsage(promotion.currentUsage || 0, promotion.maxUsage || 0)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(promotion);
                      }}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FiEye className="w-4 h-4" />
                      <span className="text-sm font-medium">View</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(promotion);
                      }}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <FiEdit className="w-4 h-4" />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(promotion);
                      }}
                      className="flex items-center gap-2 text-[#8e191c] hover:text-[#6b1416] transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PromotionGrid; 