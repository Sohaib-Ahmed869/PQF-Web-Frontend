import React, { useState } from 'react';
import { 
  FiArrowLeft, 
  FiEdit3, 
  FiTrash2, 
  FiImage,
  FiCalendar,
  FiZoomIn,
  FiX,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
  FiBox,
  FiTag,
  FiShoppingCart,
  FiTrendingUp,
  FiClock,
  FiMapPin,
  FiHeart
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import LoaderOverlay from '../../../components/LoaderOverlay';
import DeleteProduct from './DeleteProduct';
import { FaSnowflake, FaEuroSign } from 'react-icons/fa';

const ViewProduct = ({ product, onBack, onDelete, onEdit, onToggleFeatured, selectedPriceList = 1 }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);

  // --- Price List Options (same as ProductList) ---
  const priceListOptions = [
    { value: 1, label: 'On-Site Price' },
    { value: 2, label: 'Delivery Price' },
    { value: 3, label: 'Pallet Complete Onsite' },
    { value: 5, label: 'Pallet Complete Delivery' }
  ];

  // --- Get price for selected price list (same logic as ProductList) ---
  const getPrice = (product, priceListId = selectedPriceList) => {
    if (product.prices && Array.isArray(product.prices)) {
      const priceItem = product.prices.find(p => p.PriceList === priceListId);
      return priceItem ? priceItem.Price : 0;
    } else if (product.ItemPrices && Array.isArray(product.ItemPrices)) {
      const priceItem = product.ItemPrices.find(p => p.PriceList === priceListId);
      return priceItem ? priceItem.Price : 0;
    }
    return 0;
  };

  // --- Format price display (same as ProductList) ---
  const formatPrice = (price) => `د.إ${(price || 0).toFixed(2)}`;

  // --- Get price list label ---
  const getPriceListLabel = (priceListId) => {
    const option = priceListOptions.find(opt => opt.value === priceListId);
    return option ? option.label : `Price List ${priceListId}`;
  };

  // --- Get stock value for selected price list ---
  const getStockValue = () => {
    return getPrice(product) * (product.stock || 0);
  };

  const handleDelete = async () => {
    try {
      toast.success('Product deleted successfully');
      onDelete(product._id);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const InfoCard = ({ title, value, icon: Icon, color = "red", subtitle }) => (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 hover:border-red-200 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Icon className={`w-5 h-5 mr-2 text-${color}-600`} />
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Image Zoom Modal Component
  const ImageZoomModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm">
      <div className="relative max-w-screen-lg max-h-screen p-4">
        <button
          onClick={() => setShowImageZoom(false)}
          className="absolute top-4 right-4 z-10 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all duration-200"
        >
          <FiX className="w-6 h-6" />
        </button>
        
        <div className="relative group">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}
            alt="Product"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </div>
  );

  if (!product) {
    return (
      <LoaderOverlay text="Loading product..." />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-600/3 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/10"
            >
              <FiArrowLeft className="w-4 h-4 mr-2 inline" />
              Back
            </button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-800 via-red-600 to-pink-600 bg-clip-text text-transparent">Product Details</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Product Image and Basic Info */}
          <div className="col-span-12 lg:col-span-8">
            {/* Product Image Card */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 hover:border-red-200 transition-all duration-500 mb-8 shadow-xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
                      <FiImage className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Product Preview</h3>
                  </div>
                  
                  {/* Zoom Button */}
                  <button
                    onClick={() => setShowImageZoom(true)}
                    className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Zoom image"
                  >
                    <FiZoomIn className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative group/image cursor-pointer" onClick={() => setShowImageZoom(true)}>
                  <div className="aspect-video rounded-2xl overflow-hidden border-2 border-blue-200">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}
                      alt="Product"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <FiZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
                  <FiPackage className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Product Information</h3>
              </div>

              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Product Name</label>
                  <p className="text-2xl font-bold text-gray-900">{product.ItemName}</p>
                </div>

                {/* Product Description */}
                {product.description && (
                  <div className="mt-2 mb-4">
                    <label className="text-sm font-medium text-gray-600 mb-1 block">Description</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 text-base whitespace-pre-line">
                      {product.description}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Item Code */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 block">Item Code</label>
                    <p className="text-lg font-semibold text-purple-700 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 inline-block">
                      {product.ItemCode}
                    </p>
                  </div>
                  {/* Items Group Code */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 block">Items Group Code</label>
                    <p className="text-lg font-semibold text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 inline-block">
                      {product.ItemsGroupCode}
                    </p>
                  </div>
                  {/* Stock */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 block">Stock Level</label>
                    <div className="flex items-center space-x-2">
                      <FiBox className="w-6 h-6 text-orange-600" />
                      <p className={`text-2xl font-bold px-4 py-2 rounded-lg border ${
                        (product.stock || 0) > 0 
                          ? 'text-white bg-green-500 border-green-400' 
                          : 'text-white bg-red-500 border-red-400'
                      }`}>
                        {product.stock || 0} units
                      </p>
                    </div>
                  </div>
                  {/* Price (use selected price list) */}
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-1 block">Price ({getPriceListLabel(selectedPriceList)})</label>
                    <div className="flex items-center space-x-2">
                      <FaEuroSign className="w-6 h-6 text-green-600" />
                      <p className="text-2xl font-bold text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                        {formatPrice(getPrice(product))}
                      </p>
                    </div>
                  </div>
                  {/* Store */}
                  {product.store && (
                    <div className="col-span-1 md:col-span-2">
                      <label className="text-sm font-medium text-gray-600 mb-1 block">Store</label>
                      <div className="flex items-center space-x-2">
                        <FiMapPin className="w-5 h-5 text-blue-600" />
                        <p className="text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                          {product.store.name}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Special Attributes (badges) */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-600 mb-3 block">Special Attributes</label>
                    <div className="flex flex-wrap gap-3">
                      {product.featured === true && (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-50 to-orange-100 text-pink-700 border border-pink-200 flex items-center shadow-sm hover:shadow-md transition-all duration-200">
                          <FiHeart className="w-4 h-4 mr-1.5" />
                          Featured
                        </span>
                      )}
                      {product.frozen === 'tYES' && (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 flex items-center shadow-sm hover:shadow-md transition-all duration-200">
                          <FaSnowflake className="w-4 h-4 mr-1.5" />
                          Frozen
                        </span>
                      )}
                      {product.valid === 'tYES' && (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 flex items-center shadow-sm hover:shadow-md transition-all duration-200">
                          <FiCheckCircle className="w-4 h-4 mr-1.5" />
                          Active
                        </span>
                      )}
                      {product.valid === 'tNO' && (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 flex items-center shadow-sm hover:shadow-md transition-all duration-200">
                          <FiXCircle className="w-4 h-4 mr-1.5" />
                          Inactive
                        </span>
                      )}
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center shadow-sm hover:shadow-md transition-all duration-200 ${
                        (product.stock || 0) > 0 
                          ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border border-orange-200'
                      }`}>
                        <FiBox className="w-4 h-4 mr-1.5" />
                        {(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price List Information (show all price lists) */}
                {product.prices && product.prices.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 mb-3 block">Price Lists</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {product.prices.map((price, index) => (
                        <div key={index} className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200 hover:border-purple-300 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <FiTag className="w-4 h-4 text-indigo-600 mr-2" />
                                <span className="text-sm font-medium text-indigo-800">
                                  {getPriceListLabel(price.PriceList)}
                                </span>
                              </div>
                              <div className="text-xs text-indigo-600 mb-2">{price.Currency}</div>
                              <div className="text-2xl font-bold text-indigo-900">
                                {formatPrice(price.Price)}
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className={`p-2 rounded-full ${
                                price.Price > 0 ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                              }`}>
                                <FaEuroSign className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Information and Actions */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Product Stats */}
              <div className="space-y-4">
                <InfoCard
                  title="Availability"
                  value={product.isAvailable ? "Available" : "Not Available"}
                  icon={product.isAvailable ? FiCheckCircle : FiXCircle}
                  color={product.isAvailable ? "green" : "red"}
                  subtitle={`${product.stock || 0} units in stock`}
                />
                
                <InfoCard
                  title="Stock Value"
                  value={formatPrice(getStockValue())}
                  icon={FiTrendingUp}
                  color="green"
                  subtitle={`${product.stock || 0} units × ${formatPrice(getPrice(product))}`}
                />
              </div>

              {/* Technical Details */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-500/30">
                      {formatPrice(getPrice(product))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stock Status</span>
                    <div className="flex items-center space-x-2">
                      {(product.stock || 0) > 0 ? (
                        <FiCheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <FiXCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        (product.stock || 0) > 0
                          ? 'bg-green-500 text-white border-green-400'
                          : 'bg-red-500 text-white border-red-400'
                      }`}>
                        {(product.stock || 0) > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Frozen</span>
                    <div className="flex items-center space-x-2">
                      {product.frozen === 'tYES' ? (
                        <FaSnowflake className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FiXCircle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        product.frozen === 'tYES'
                          ? 'bg-blue-500 text-white border-blue-400'
                          : 'bg-gray-400 text-gray-600 border-gray-400'
                      }`}>
                        {product.frozen === 'tYES' ? 'Frozen' : 'Fresh'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available</span>
                    <div className="flex items-center space-x-2">
                      {product.isAvailable ? (
                        <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <FiXCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        product.isAvailable
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-red-500 text-white border-red-400'
                      }`}>
                        {product.isAvailable ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
                
                <div className="space-y-3">
                  <button
                    onClick={() => onEdit(product)}
                    className="w-full p-4 bg-gradient-to-r from-red-600 to-pink-500 border border-red-500/30 rounded-xl hover:from-red-700 hover:to-pink-600 transition-all duration-200 text-center group flex items-center justify-center"
                  >
                    <FiEdit3 className="w-5 h-5 text-white mr-2 group-hover:scale-110 transition-transform" />
                    <span className="text-white font-medium">Edit Product</span>
                  </button>
                  
                  <button
                    onClick={() => onToggleFeatured(product)}
                    className={`w-full p-4 border rounded-xl transition-all duration-200 text-center group flex items-center justify-center ${
                      product.featured === true
                        ? 'bg-white border-pink-300 text-pink-700 hover:bg-pink-50 hover:border-pink-400'
                        : 'bg-gradient-to-r from-pink-500 to-orange-500 border-pink-500/30 text-white hover:from-pink-600 hover:to-orange-600'
                    }`}
                  >
                    <FiHeart className={`w-5 h-5 mr-2 group-hover:scale-110 transition-transform ${
                      product.featured === true ? 'text-pink-600' : 'text-white'
                    }`} />
                    <span className="font-medium">
                      {product.featured === true ? 'Unmark as Featured' : 'Mark as Featured'}
                    </span>
                  </button>
                  
                  <button
                    onClick={onBack}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-200 text-center group flex items-center justify-center"
                  >
                    <FiShoppingCart className="w-5 h-5 text-red-600 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="text-red-600 font-medium">All Products</span>
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full p-4 bg-red-600/20 border border-red-500/30 rounded-xl hover:bg-red-600/30 transition-all duration-200 text-center group flex items-center justify-center"
                  >
                    <FiTrash2 className="w-5 h-5 text-red-600 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="text-red-600 font-medium">Delete Product</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {showImageZoom && <ImageZoomModal />}

      {/* Delete Product Modal */}
      {showDeleteModal && (
        <DeleteProduct
          product={product}
          onClose={() => setShowDeleteModal(false)}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

export default ViewProduct;