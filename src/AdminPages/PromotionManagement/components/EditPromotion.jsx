import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import promotionService from '../../../services/promotionService';
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
  FiSave,
  FiEdit
} from 'react-icons/fi';

const EditPromotion = ({ promotion, onBack, onSuccess }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: promotion.name || '',
    description: promotion.description || '',
    code: promotion.code || '',
    type: promotion.type || 'buyXGetY',
    rule: promotion.rule || {
      buyXGetY: {
        buyQuantity: 1,
        getQuantity: 1,
        sameItem: true,
        freeItem: null
      },
      quantityDiscount: {
        minQuantity: 1,
        discountPercentage: 0,
        discountAmount: 0
      },
      cartTotal: {
        minAmount: 0,
        discountPercentage: 0,
        discountAmount: 0,
        freeItem: null,
        freeShipping: false
      }
    },
    applicableProducts: promotion.applicableProducts || [],
    applicableCategories: promotion.applicableCategories || [],
    store: promotion.store || '',
    startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
    endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
    maxUsage: promotion.maxUsage || 0,
    maxUsagePerUser: promotion.maxUsagePerUser || 1,
    priority: promotion.priority || 1,
    minOrderAmount: promotion.minOrderAmount || 0,
    excludedProducts: promotion.excludedProducts || [],
    excludedCategories: promotion.excludedCategories || [],
    isActive: promotion.isActive !== undefined ? promotion.isActive : true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRuleChange = (ruleType, field, value) => {
    setFormData(prev => ({
      ...prev,
      rule: {
        ...prev.rule,
        [ruleType]: {
          ...prev.rule[ruleType],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.type || !formData.endDate) {
        throw new Error('Please fill in all required fields');
      }

      // Validate rule based on type
      if (!validateRule(formData.type, formData.rule)) {
        throw new Error('Please fill in all required rule fields');
      }

      const response = await promotionService.updatePromotion(promotion._id, formData, token);
      
      if (response.data.success) {
        onSuccess();
      } else {
        setError(response.data.error || 'Failed to update promotion');
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Failed to update promotion');
    } finally {
      setLoading(false);
    }
  };

  const validateRule = (type, rule) => {
    switch (type) {
      case 'buyXGetY':
        return rule.buyXGetY.buyQuantity > 0 && rule.buyXGetY.getQuantity > 0;
      case 'quantityDiscount':
        return rule.quantityDiscount.minQuantity > 0 && 
               (rule.quantityDiscount.discountPercentage > 0 || rule.quantityDiscount.discountAmount > 0);
      case 'cartTotal':
        return rule.cartTotal.minAmount >= 0 && 
               (rule.cartTotal.discountPercentage > 0 || rule.cartTotal.discountAmount > 0);
      default:
        return false;
    }
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

  const renderRuleFields = () => {
    const typeInfo = getTypeInfo(formData.type);
    const TypeIcon = typeInfo.icon;

    switch (formData.type) {
      case 'buyXGetY':
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Buy Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.rule.buyXGetY.buyQuantity}
                  onChange={(e) => handleRuleChange('buyXGetY', 'buyQuantity', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Get Quantity Free *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.rule.buyXGetY.getQuantity}
                  onChange={(e) => handleRuleChange('buyXGetY', 'getQuantity', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 hover:border-purple-300 transition-all duration-300">
                <input
                  type="checkbox"
                  checked={formData.rule.buyXGetY.sameItem}
                  onChange={(e) => handleRuleChange('buyXGetY', 'sameItem', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Same item (if unchecked, specify free item below)</span>
              </label>
            </div>
          </div>
        );

      case 'quantityDiscount':
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
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.rule.quantityDiscount.minQuantity}
                  onChange={(e) => handleRuleChange('quantityDiscount', 'minQuantity', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.rule.quantityDiscount.discountPercentage}
                    onChange={(e) => handleRuleChange('quantityDiscount', 'discountPercentage', parseFloat(e.target.value))}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rule.quantityDiscount.discountAmount}
                    onChange={(e) => handleRuleChange('quantityDiscount', 'discountAmount', parseFloat(e.target.value))}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'cartTotal':
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
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Cart Amount *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.rule.cartTotal.minAmount}
                  onChange={(e) => handleRuleChange('cartTotal', 'minAmount', parseFloat(e.target.value))}
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.rule.cartTotal.discountPercentage}
                    onChange={(e) => handleRuleChange('cartTotal', 'discountPercentage', parseFloat(e.target.value))}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rule.cartTotal.discountAmount}
                    onChange={(e) => handleRuleChange('cartTotal', 'discountAmount', parseFloat(e.target.value))}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 hover:border-green-300 transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={formData.rule.cartTotal.freeShipping}
                    onChange={(e) => handleRuleChange('cartTotal', 'freeShipping', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Free Shipping</span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 right-4 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 bg-red-500/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-4 sm:left-10 w-32 h-32 sm:w-40 sm:h-40 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors duration-300 p-3 rounded-2xl hover:bg-gray-100"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Promotions</span>
          </button>
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiEdit className="w-8 h-8 text-red-600" />
            Edit Promotion
          </h1>
          <p className="text-gray-600 mt-2">Update promotion details and settings</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-xl">
              <FiAlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Error Updating Promotion</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-100 rounded-2xl">
              <FiTag className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
              <p className="text-gray-600">Update the basic details of your promotion</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Promotion Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                placeholder="e.g., Summer Sale 20% Off"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Promotion Code (Optional)</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                placeholder="e.g., SAVE20"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
              placeholder="Describe your promotion..."
            />
          </div>
        </div>

        {/* Promotion Type */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <FiGift className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Promotion Type</h2>
              <p className="text-gray-600">Select the type of promotion you want to create</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'buyXGetY', label: 'Buy X Get Y Free', icon: FiGift, color: 'purple' },
              { value: 'quantityDiscount', label: 'Quantity Discount', icon: FiPercent, color: 'blue' },
              { value: 'cartTotal', label: 'Cart Total Discount', icon: FiShoppingCart, color: 'green' }
            ].map((type) => {
              const TypeIcon = type.icon;
              const isSelected = formData.type === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  className={`p-6 rounded-3xl border-2 transition-all duration-300 ${
                    isSelected
                      ? `border-${type.color}-500 bg-${type.color}-50 shadow-lg`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${
                      isSelected ? `bg-${type.color}-100` : 'bg-gray-100'
                    }`}>
                      <TypeIcon className={`w-6 h-6 ${
                        isSelected ? `text-${type.color}-600` : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-left">
                      <h3 className={`font-semibold ${
                        isSelected ? `text-${type.color}-900` : 'text-gray-900'
                      }`}>
                        {type.label}
                      </h3>
                    </div>
                  </div>
                </button>
              );
            })}
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
              <p className="text-gray-600">Configure the specific rules for your promotion</p>
            </div>
          </div>
          
          {renderRuleFields()}
        </div>

        {/* Date and Usage Settings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-100 rounded-2xl">
              <FiCalendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Date and Usage Settings</h2>
              <p className="text-gray-600">Set the validity period and usage limits</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Usage (0 = unlimited)</label>
              <input
                type="number"
                min="0"
                name="maxUsage"
                value={formData.maxUsage}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Usage Per User</label>
              <input
                type="number"
                min="1"
                name="maxUsagePerUser"
                value={formData.maxUsagePerUser}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <input
                type="number"
                min="1"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gray-100 rounded-2xl">
              <FiCheckCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Status</h2>
              <p className="text-gray-600">Set the promotion status</p>
            </div>
          </div>
          
          <div>
            <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-200 hover:border-green-300 transition-all duration-300">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Active (Enable this promotion immediately)</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3 border border-gray-300 rounded-2xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                Update Promotion
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPromotion; 