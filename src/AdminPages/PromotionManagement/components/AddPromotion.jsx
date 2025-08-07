import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import promotionService from '../../../services/promotionService';
import webService from '../../../services/Website/WebService';
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
  FiPlus,
  FiSearch,
  FiX,
  FiPackage,
  FiGrid,
  FiRefreshCw
} from 'react-icons/fi';

const AddPromotion = ({ onBack, onSuccess }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [searchProductTerm, setSearchProductTerm] = useState('');
  const [searchCategoryTerm, setSearchCategoryTerm] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    type: 'buyXGetY',
    rule: {
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
    applicableProducts: [],
    applicableCategories: [],
    store: user?.assignedStore?._id || user?.assignedStore || localStorage.getItem('selected_store_id') || '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    maxUsage: 0,
    maxUsagePerUser: 1,
    priority: 1,
    minOrderAmount: 0,
    excludedProducts: [],
    excludedCategories: [],
    isActive: true
  });

  // Function to generate random 12-character promotion code based on type
  const generatePromotionCode = (type) => {
    const typePrefixes = {
      'buyXGetY': 'BXY',
      'quantityDiscount': 'QTY',
      'cartTotal': 'CTL'
    };
    
    const prefix = typePrefixes[type] || 'PROM';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const remainingLength = 12 - prefix.length;
    let randomPart = '';
    
    // Generate random characters for the remaining length
    for (let i = 0; i < remainingLength; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return prefix + randomPart;
  };

  // Fetch products and categories on component mount and generate initial promotion code
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    
    // Generate initial promotion code if not already set
    if (!formData.code) {
      const initialCode = generatePromotionCode(formData.type);
      setFormData(prev => ({
        ...prev,
        code: initialCode
      }));
    }

    // Update store ID from user data or localStorage
    const storeId = user?.assignedStore?._id || user?.assignedStore || localStorage.getItem('selected_store_id') || '';
    if (storeId && storeId !== formData.store) {
      setFormData(prev => ({
        ...prev,
        store: storeId
      }));
    }
  }, [user]);

  // Generate promotion code when type changes
  useEffect(() => {
    if (formData.type) {
      const newCode = generatePromotionCode(formData.type);
      setFormData(prev => ({
        ...prev,
        code: newCode
      }));
    }
  }, [formData.type]);

  // Filter products based on search term - using useMemo for better performance
  const filteredProducts = useMemo(() => {
    if (searchProductTerm.trim() === '') {
      return products;
    } else {
      return products.filter(product =>
        product.ItemName?.toLowerCase().includes(searchProductTerm.toLowerCase()) ||
        product.ItemCode?.toLowerCase().includes(searchProductTerm.toLowerCase())
      );
    }
  }, [searchProductTerm, products]);

  // Filter categories based on search term - using useMemo for better performance
  const filteredCategories = useMemo(() => {
    if (searchCategoryTerm.trim() === '') {
      return categories;
    } else {
      return categories.filter(category =>
        category.name?.toLowerCase().includes(searchCategoryTerm.toLowerCase()) ||
        category.ItemsGroupCode?.toString().includes(searchCategoryTerm)
      );
    }
  }, [searchCategoryTerm, categories]);

  // Memoized search handlers to prevent unnecessary re-renders
  const handleProductSearchChange = useCallback((e) => {
    setSearchProductTerm(e.target.value);
  }, []);

  const handleCategorySearchChange = useCallback((e) => {
    setSearchCategoryTerm(e.target.value);
  }, []);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      // Use web service to get only active products in stock
      const response = await webService.getActiveProductsByStore();
      const productsData = response.data?.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      // Use web service to get only active categories
      const response = await webService.getActiveCategoriesByStore();
      const categoriesData = response.data?.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

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

  // Category selection handlers - memoized to prevent unnecessary re-renders
  const handleCategorySelect = useCallback((category) => {
    setFormData(prev => {
      const isSelected = prev.applicableCategories.some(c => c._id === category._id);
      if (!isSelected) {
        // Add category to applicable categories
        const updatedCategories = [...prev.applicableCategories, category];
        
        // Get all products from this category
        const categoryProducts = products.filter(product => 
          product.ItemsGroupCode === category.ItemsGroupCode
        );
        
        // Add products from this category to applicable products (avoid duplicates)
        const updatedProducts = [...prev.applicableProducts];
        categoryProducts.forEach(product => {
          const productId = product._id || product.id;
          if (!updatedProducts.some(p => (p._id || p.id) === productId)) {
            updatedProducts.push(product);
          }
        });
        
        return {
          ...prev,
          applicableCategories: updatedCategories,
          applicableProducts: updatedProducts
        };
      }
      return prev;
    });
    setShowCategorySelector(false);
    setSearchCategoryTerm('');
  }, [products]);

  const handleCategoryRemove = useCallback((categoryId) => {
    setFormData(prev => {
      const categoryToRemove = prev.applicableCategories.find(c => c._id === categoryId);
      
      if (categoryToRemove) {
        // Remove category from applicable categories
        const updatedCategories = prev.applicableCategories.filter(c => c._id !== categoryId);
        
        // Remove products from this category from applicable products
        const updatedProducts = prev.applicableProducts.filter(product => 
          product.ItemsGroupCode !== categoryToRemove.ItemsGroupCode
        );
        
        return {
          ...prev,
          applicableCategories: updatedCategories,
          applicableProducts: updatedProducts
        };
      }
      return prev;
    });
  }, []);

  // Product selection handlers - memoized to prevent unnecessary re-renders
  const handleProductSelect = useCallback((product) => {
    setFormData(prev => {
      const productId = product._id || product.id;
      const isSelected = prev.applicableProducts.some(p => (p._id || p.id) === productId);
      if (!isSelected) {
        return {
          ...prev,
          applicableProducts: [...prev.applicableProducts, product]
        };
      }
      return prev;
    });
    setShowProductSelector(false);
    setSearchProductTerm('');
  }, []);

  const handleProductRemove = useCallback((productId) => {
    setFormData(prev => ({
      ...prev,
      applicableProducts: prev.applicableProducts.filter(p => (p._id || p.id) !== productId)
    }));
  }, []);

  // Auto-populate excluded items when form data changes (only for non-cartTotal types)
  useEffect(() => {
    // Skip auto-population for cartTotal promotions - they should apply to all products by default
    if (formData.type === 'cartTotal') {
      return;
    }

    const updateExcludedItems = () => {
      // Get all category IDs that are not in applicable categories
      const excludedCategoryIds = categories
        .filter(category => !formData.applicableCategories.some(c => c._id === category._id))
        .map(category => category._id)
        .filter(id => id); // Filter out any null/undefined values
      
      // Get all product IDs that are not in applicable products
      const excludedProductIds = products
        .filter(product => !formData.applicableProducts.some(p => (p._id || p.id) === (product._id || product.id)))
        .map(product => product._id || product.id)
        .filter(id => id); // Filter out any null/undefined values
      
      setFormData(prev => ({
        ...prev,
        excludedCategories: excludedCategoryIds,
        excludedProducts: excludedProductIds
      }));
    };

    if (categories.length > 0 && products.length > 0) {
      updateExcludedItems();
    }
  }, [formData.applicableCategories, formData.applicableProducts, categories, products, formData.type]);

  // Clear excluded items when switching to cartTotal type
  useEffect(() => {
    if (formData.type === 'cartTotal') {
      setFormData(prev => ({
        ...prev,
        excludedProducts: [],
        excludedCategories: [],
        applicableProducts: [],
        applicableCategories: []
      }));
    }
  }, [formData.type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.type || !formData.endDate || !formData.code) {
        throw new Error('Please fill in all required fields');
      }

      // Validate rule based on type
      if (!validateRule(formData.type, formData.rule)) {
        throw new Error('Please fill in all required rule fields');
      }

      // Prepare the data for submission
      const submissionData = {
        ...formData,
        applicableProducts: formData.applicableProducts.map(p => p._id || p.id),
        applicableCategories: formData.applicableCategories.map(c => c._id),
        excludedProducts: formData.excludedProducts, // Already an array of IDs
        excludedCategories: formData.excludedCategories // Already an array of IDs
      };

      const response = await promotionService.createPromotion(submissionData, token);
      
      if (response.data && response.data.success) {
        onSuccess(response.data.data);
      } else {
        throw new Error(response.data?.error || 'Failed to create promotion');
      }
    } catch (error) {
      console.error('Error creating promotion:', error);
      let errorMessage = 'Failed to create promotion';
      
      if (error.response && error.response.data) {
        // Handle axios error response
        errorMessage = error.response.data.error || error.response.data.message || errorMessage;
      } else if (error.message) {
        // Handle other error types
        errorMessage = error.message;
      }
      
      setError(errorMessage);
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

  // Product Selector Modal
  const ProductSelectorModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Individual Products</h3>
          <button
            onClick={() => setShowProductSelector(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchProductTerm}
              onChange={handleProductSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-96">
          {loadingProducts ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No products found
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => {
                const productId = product._id || product.id;
                const isSelected = formData.applicableProducts.some(p => (p._id || p.id) === productId);
                const isFromCategory = formData.applicableCategories.some(c => c.ItemsGroupCode === product.ItemsGroupCode);
                
                return (
                  <div
                    key={productId}
                    onClick={() => handleProductSelect(product)}
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden ${
                        isSelected ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {product.Picture || product.image ? (
                          <img 
                            src={product.Picture || product.image} 
                            alt={product.ItemName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <FiPackage className={`w-5 h-5 ${
                          isSelected ? 'text-blue-600' : 'text-gray-600'
                        }`} style={{ display: (product.Picture || product.image) ? 'none' : 'flex' }} />
                      </div>
                      <div>
                        <p className={`font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>{product.ItemName}</p>
                        <p className="text-sm text-gray-500">Code: {product.ItemCode}</p>
                        {isFromCategory && (
                          <p className="text-xs text-green-600">✓ From selected category</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-500">
                        {product.prices && product.prices.length > 0 ? `AED ${product.prices[0].Price}` : 'N/A'}
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <FiCheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Category Selector Modal
  const CategorySelectorModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Categories</h3>
          <button
            onClick={() => setShowCategorySelector(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchCategoryTerm}
              onChange={handleCategorySearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-96">
          {loadingCategories ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No categories found
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map((category) => {
                const isSelected = formData.applicableCategories.some(c => c._id === category._id);
                const categoryProducts = products.filter(product => product.ItemsGroupCode === category.ItemsGroupCode);
                
                return (
                  <div
                    key={category._id}
                    onClick={() => handleCategorySelect(category)}
                    className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden ${
                        isSelected ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <FiGrid className={`w-5 h-5 ${
                          isSelected ? 'text-green-600' : 'text-gray-600'
                        }`} style={{ display: category.image ? 'none' : 'flex' }} />
                      </div>
                      <div>
                        <p className={`font-medium ${
                          isSelected ? 'text-green-900' : 'text-gray-900'
                        }`}>{category.name}</p>
                        <p className="text-sm text-gray-500">Code: {category.ItemsGroupCode}</p>
                        <p className="text-xs text-gray-400">{categoryProducts.length} products</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-500">
                        {categoryProducts.length} items
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                          <FiCheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Amount (AED)</label>
                  <input
                    type="number"
                    min="0"
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
                <p className="text-sm text-gray-600">Discount based on cart total</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Cart Amount (AED) *</label>
                <input
                  type="number"
                  min="0"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Amount (AED)</label>
                  <input
                    type="number"
                    min="0"
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-3 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <FiArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Promotion</h1>
            <p className="text-gray-600">Set up a new promotion for your store</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-2xl">
                <FiTag className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                <p className="text-gray-600">Enter the basic details of your promotion</p>
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
                  placeholder="Enter promotion name..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Promotion Code *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-gray-50"
                    placeholder="Auto-generated based on promotion type"
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = generatePromotionCode(formData.type);
                      setFormData(prev => ({ ...prev, code: newCode }));
                    }}
                    className="px-3 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors"
                    title="Regenerate promotion code"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Auto-generated 12-character code based on promotion type</p>
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

          {/* Promotion Type - MOVED ABOVE */}
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

          {/* Rule Configuration - MOVED ABOVE CATEGORIES */}
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

          {/* Applicable Products and Categories - HIDDEN FOR CART TOTAL */}
          {formData.type !== 'cartTotal' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-2xl">
                  <FiPackage className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Applicable Categories & Products</h2>
                  <p className="text-gray-600">Select categories first, then products will be auto-selected. Non-selected items will be excluded.</p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                  <button
                    type="button"
                    onClick={() => setShowCategorySelector(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Categories
                  </button>
                </div>
                
                {formData.applicableCategories.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-2xl">
                    <FiGrid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No categories selected</p>
                    <p className="text-sm text-gray-400">Click "Add Categories" to select applicable categories</p>
                  </div>
                ) : (
                  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${
                    formData.applicableCategories.length > 9 ? 'max-h-96 overflow-y-auto pr-2' : ''
                  }`}>
                    {formData.applicableCategories.map((category) => {
                      const categoryProducts = products.filter(product => product.ItemsGroupCode === category.ItemsGroupCode);
                      const selectedProducts = formData.applicableProducts.filter(product => product.ItemsGroupCode === category.ItemsGroupCode);
                      
                      return (
                        <div key={category._id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {category.image ? (
                                <img 
                                  src={category.image} 
                                  alt={category.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <FiGrid className="w-4 h-4 text-green-600" style={{ display: category.image ? 'none' : 'flex' }} />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900">{category.name}</p>
                              <p className="text-xs text-gray-500">Code: {category.ItemsGroupCode}</p>
                              <p className="text-xs text-green-600">{selectedProducts.length}/{categoryProducts.length} products selected</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCategoryRemove(category._id)}
                            className="p-1 hover:bg-red-100 rounded-full text-red-600"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Products Section - SECOND */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Products (Auto-selected from categories)</h3>
                  <button
                    type="button"
                    onClick={() => setShowProductSelector(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Individual Products
                  </button>
                </div>
                
                {formData.applicableProducts.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-2xl">
                    <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No products selected</p>
                    <p className="text-sm text-gray-400">Products will be auto-selected when you choose categories</p>
                  </div>
                ) : (
                  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${
                    formData.applicableProducts.length > 9 ? 'max-h-96 overflow-y-auto pr-2' : ''
                  }`}>
                    {formData.applicableProducts.map((product) => {
                      const productId = product._id || product.id;
                      return (
                        <div key={productId} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {product.Picture || product.image ? (
                                <img 
                                  src={product.Picture || product.image} 
                                  alt={product.ItemName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <FiPackage className="w-4 h-4 text-blue-600" style={{ display: (product.Picture || product.image) ? 'none' : 'flex' }} />
                            </div>
                            <div>
                              <p className="font-medium text-sm text-gray-900">{product.ItemName}</p>
                              <p className="text-xs text-gray-500">{product.ItemCode}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleProductRemove(productId)}
                            className="p-1 hover:bg-red-100 rounded-full text-red-600"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Summary Section */}
              <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Selected Categories: <span className="font-medium text-gray-900">{formData.applicableCategories.length}</span></p>
                    <p className="text-gray-600">Selected Products: <span className="font-medium text-gray-900">{formData.applicableProducts.length}</span></p>
                  </div>
                  <div>
                    <p className="text-gray-600">Excluded Categories: <span className="font-medium text-gray-900">{formData.excludedCategories.length}</span></p>
                    <p className="text-gray-600">Excluded Products: <span className="font-medium text-gray-900">{formData.excludedProducts.length}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  Creating...
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  Create Promotion
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Modals */}
      {showProductSelector && <ProductSelectorModal />}
      {showCategorySelector && <CategorySelectorModal />}
    </div>
  );
};

export default AddPromotion; 