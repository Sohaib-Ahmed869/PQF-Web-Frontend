import React from 'react';
import { 
  FiArrowLeft, 
  FiGift, 
  FiTag, 
  FiCalendar, 
  FiClock, 
  FiPercent, 
  FiShoppingCart, 
  FiCheckCircle, 
  FiXCircle,
  FiAlertCircle,
  FiEye,
  FiActivity,
  FiUsers,
  FiTarget
} from 'react-icons/fi';

const ViewPromotion = ({ promotion, onBack }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

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

  const getTypeInfo = (type) => {
    switch (type) {
      case 'buyXGetY':
        return { icon: FiGift, color: 'text-purple-600', label: 'Buy X Get Y Free' };
      case 'quantityDiscount':
        return { icon: FiPercent, color: 'text-blue-600', label: 'Quantity Discount' };
      case 'cartTotal':
        return { icon: FiShoppingCart, color: 'text-green-600', label: 'Cart Total Discount' };
      default:
        return { icon: FiTag, color: 'text-gray-600', label: type };
    }
  };

  const renderRuleDetails = () => {
    const typeInfo = getTypeInfo(promotion.type);
    const TypeIcon = typeInfo.icon;

    switch (promotion.type) {
      case 'buyXGetY':
        const { buyQuantity, getQuantity, sameItem } = promotion.rule?.buyXGetY || {};
        return (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-2xl">
                <TypeIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{typeInfo.label}</h3>
                <p className="text-sm text-gray-600">Buy X items and get Y items free</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiTarget className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">Buy Quantity</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{buyQuantity}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiGift className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">Get Quantity Free</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{getQuantity}</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="bg-white rounded-2xl p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiCheckCircle className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-gray-700">Same Item</span>
                </div>
                <p className="text-lg font-medium text-gray-900">{sameItem ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        );

      case 'quantityDiscount':
        const { minQuantity, discountPercentage, discountAmount } = promotion.rule?.quantityDiscount || {};
        return (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <TypeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{typeInfo.label}</h3>
                <p className="text-sm text-gray-600">Discount based on quantity purchased</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiTarget className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">Minimum Quantity</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{minQuantity}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiPercent className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">Discount Percentage</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{discountPercentage}%</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiActivity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">Discount Amount</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">${discountAmount}</p>
              </div>
            </div>
          </div>
        );

      case 'cartTotal':
        const { minAmount, discountPercentage: cartDiscountPercentage, discountAmount: cartDiscountAmount, freeShipping } = promotion.rule?.cartTotal || {};
        return (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-2xl">
                <TypeIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{typeInfo.label}</h3>
                <p className="text-sm text-gray-600">Discount based on cart total amount</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiTarget className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">Minimum Cart Amount</span>
                </div>
                <p className="text-2xl font-bold text-green-600">${minAmount}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiPercent className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">Discount Percentage</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{cartDiscountPercentage}%</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-2xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiActivity className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">Discount Amount</span>
                </div>
                <p className="text-2xl font-bold text-green-600">${cartDiscountAmount}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FiShoppingCart className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-700">Free Shipping</span>
                </div>
                <p className="text-lg font-medium text-gray-900">{freeShipping ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="bg-gray-50 rounded-3xl p-6">No rule details available</div>;
    }
  };

  const statusInfo = getStatusInfo(promotion);
  const StatusIcon = statusInfo.icon;
  const typeInfo = getTypeInfo(promotion.type);
  const TypeIcon = typeInfo.icon;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 right-4 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 bg-[#8e191c]/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-4 sm:left-10 w-32 h-32 sm:w-40 sm:h-40 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-[#8e191c] transition-colors duration-300 p-3 rounded-2xl hover:bg-gray-100"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Promotions</span>
          </button>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiEye className="w-8 h-8 text-[#8e191c]" />
            Promotion Details
          </h1>
          <p className="text-gray-600 mt-2">View promotion information and settings</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#8e191c]/10 rounded-2xl">
              <FiTag className="w-6 h-6 text-[#8e191c]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
              <p className="text-gray-600">Promotion details and description</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Promotion Name</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <p className="text-lg font-semibold text-gray-900">{promotion.name}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Promotion Code</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                {promotion.code ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {promotion.code}
                  </span>
                ) : (
                  <span className="text-gray-500">No code assigned</span>
                )}
              </div>
            </div>
          </div>
          
          {promotion.description && (
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <p className="text-gray-900">{promotion.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Status and Type */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <FiActivity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Status and Type</h2>
              <p className="text-gray-600">Current status and promotion type</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo.color}`}>
                  <StatusIcon className="w-4 h-4 mr-2" />
                  {statusInfo.label}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <TypeIcon className={`w-5 h-5 ${typeInfo.color}`} />
                  <span className="font-semibold text-gray-900">{typeInfo.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rule Configuration */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-2xl">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Rule Configuration</h2>
              <p className="text-gray-600">Promotion rules and conditions</p>
            </div>
          </div>
          
          {renderRuleDetails()}
        </div>

        {/* Date and Usage Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-100 rounded-2xl">
              <FiCalendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Date and Usage Information</h2>
              <p className="text-gray-600">Validity period and usage limits</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">{formatDate(promotion.startDate)}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">{formatDate(promotion.endDate)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Usage</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <FiActivity className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {promotion.maxUsage === 0 ? 'Unlimited' : promotion.maxUsage}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Usage Per User</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <FiUsers className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">{promotion.maxUsagePerUser}</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Usage</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center gap-2">
                  <FiActivity className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">{promotion.currentUsage || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gray-100 rounded-2xl">
              <FiTarget className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Additional Information</h2>
              <p className="text-gray-600">Other promotion settings</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <span className="font-semibold text-gray-900">{promotion.priority}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Min Order Amount</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <span className="font-semibold text-gray-900">${promotion.minOrderAmount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPromotion;