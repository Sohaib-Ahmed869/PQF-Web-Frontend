import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiX, FiTrash2, FiImage, FiBox, FiHeart, FiZap } from 'react-icons/fi';
import { FaEuroSign, FaSnowflake } from 'react-icons/fa';
import LoaderOverlay from '../../../components/LoaderOverlay';

const DeleteProduct = ({ product, onClose, onDelete }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(product._id); // Await the delete operation
      onClose(); // Close the modal after deletion
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setLoading(false); // Hide loader (if modal is still open)
    }
  };

  // Helper to get price (like in ProductList/ViewProduct)
  const getPrice = (product) => {
    if (product.prices && Array.isArray(product.prices)) {
      return product.prices[0]?.Price || 0;
    } else if (product.ItemPrices && Array.isArray(product.ItemPrices)) {
      return product.ItemPrices[0]?.Price || 0;
    }
    return 0;
  };

  const formatPrice = (price) => `€${(price || 0).toFixed(2)}`;

  // Helper to get units/stock
  const getUnits = (product) => {
    if (typeof product.stock !== 'undefined') return product.stock;
    if (typeof product.QuantityOnStock !== 'undefined') return product.QuantityOnStock;
    return 0;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {loading && <LoaderOverlay text="Deleting Product..." />}
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="relative transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
          
          {/* Warning icon with pulse animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-red-50 p-4 rounded-full">
                <FiAlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Delete Product
            </h3>
            
            <div className="mt-4 mb-6">
              {/* Product preview */}
              <div className="flex justify-center mb-4">
                <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={product.image || '/api/placeholder/400/400'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-center space-x-3 bg-gray-50 rounded-xl p-4">
                  <FiImage className="w-5 h-5 text-gray-500" />
                  <span className="text-lg font-medium text-gray-800">
                    {product.ItemName}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-center space-x-2 bg-gray-50 rounded-xl p-3">
                    <FaEuroSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatPrice(getPrice(product))}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 bg-gray-50 rounded-xl p-3">
                    <FiBox className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {getUnits(product)} units
                    </span>
                  </div>
                </div>
                
                {/* Special attributes */}
                <div className="flex justify-center space-x-2">
                  {product.Properties1 === 'tYES' && (
                    <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      <FiHeart className="w-3 h-3 mr-1" />
                      Halal
                    </div>
                  )}
                  {product.Frozen === 'tYES' && (
                    <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      <FiZap className="w-3 h-3 mr-1" />
                      Frozen
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this product? This action cannot be undone and will permanently remove the product from your inventory.
              </p>
              
              {/* Warning about stock */}
              {getUnits(product) > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This product has {getUnits(product)} units in stock with a total value of {formatPrice(getPrice(product) * getUnits(product))}. Deleting this product will remove it from your inventory.
                  </p>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete Product</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom styles for animations */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DeleteProduct;