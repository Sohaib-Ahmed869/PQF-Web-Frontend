import React, { useEffect } from 'react';
import { FiAlertTriangle, FiX, FiTrash2, FiImage } from 'react-icons/fi';

const DeleteBanner = ({ banner, onClose, onDelete }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleDelete = async () => {
    // Just call the parent's delete handler - don't make API call here
    // The parent component (BannerList) will handle the actual deletion
    onDelete(banner._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
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
              Delete Banner
            </h3>
            
            <div className="mt-4 mb-6">
              {/* Banner preview */}
              <div className="flex justify-center mb-4">
                <div className="w-32 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={banner.image}
                    alt="Banner to delete"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-3 bg-gray-50 rounded-xl p-4 mb-4">
                <FiImage className="w-6 h-6 text-gray-500" />
                <span className="text-lg font-medium text-gray-800">
                  Banner #{banner._id.slice(-6)}
                </span>
              </div>
              
              <p className="text-gray-600">
                Are you sure you want to delete this banner? This action cannot be undone and the banner will be permanently removed from your website.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
              >
                <span>Cancel</span>
              </button>
              
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 group"
              >
                <FiTrash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Delete Banner</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteBanner;