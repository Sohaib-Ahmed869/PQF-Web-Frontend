import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiX, FiTrash2, FiImage, FiTag, FiHash } from 'react-icons/fi';
import LoaderOverlay from '../../../components/LoaderOverlay';

const DeleteCategory = ({ category, onClose, onDelete }) => {
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
      await onDelete(category._id); // Await the delete operation
      onClose(); // Close the modal after deletion
    } catch (error) {

    } finally {
      setLoading(false); // Hide loader (if modal is still open)
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {loading && <LoaderOverlay text="Deleting Category..." />}
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
              Delete Category
            </h3>
            
            <div className="mt-4 mb-6">
              {/* Category preview */}
              <div className="flex justify-center mb-4">
                <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-center space-x-3 bg-gray-50 rounded-xl p-4">
                  <FiTag className="w-5 h-5 text-gray-500" />
                  <span className="text-lg font-medium text-gray-800">
                    {category.name}
                  </span>
                </div>
                
                <div className="flex items-center justify-center space-x-3 bg-gray-50 rounded-xl p-4">
                  <FiHash className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Group Code: {category.ItemsGroupCode}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this category? This action cannot be undone and will permanently remove the category from your store.
              </p>
              
              {/* Warning about items */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> All items associated with this category will also be permanently deleted. This action cannot be undone.
                </p>
              </div>
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
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Delete Category</span>
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

export default DeleteCategory;