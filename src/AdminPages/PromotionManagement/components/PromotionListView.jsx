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

const PromotionListView = ({ promotions, onEdit, onView, onDelete, formatDate, formatUsage }) => {
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
        color: 'bg-red-100 text-red-700 border-red-300',
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
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Promotion
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Rule
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Validity
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/50 divide-y divide-gray-200">
            {promotions.map((promotion) => {
              const statusInfo = getStatusInfo(promotion);
              const typeInfo = getTypeInfo(promotion.type);
              const StatusIcon = statusInfo.icon;
              const TypeIcon = typeInfo.icon;

              return (
                <tr key={promotion._id} className="hover:bg-gray-50/80 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{promotion.name}</div>
                      {promotion.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {promotion.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                      <span className="text-sm font-medium text-gray-900">{typeInfo.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {promotion.code ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {promotion.code}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {getRuleSummary(promotion)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(promotion.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">{formatDate(promotion.endDate)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {formatUsage(promotion.currentUsage || 0, promotion.maxUsage || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onView(promotion)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => onEdit(promotion)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <FiEdit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onDelete(promotion)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PromotionListView; 