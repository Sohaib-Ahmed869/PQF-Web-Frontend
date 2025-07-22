import React, { useState } from 'react';
import { 
  FiArrowLeft, 
  FiEdit3, 
  FiTrash2, 
  FiImage,
  FiCalendar,
  FiEye,
  FiZoomIn,
  FiX,
  FiShare2,
  FiDownload,
  FiCopy
} from 'react-icons/fi';
import LoaderOverlay from '../../../components/LoaderOverlay';

const ViewBanner = ({ banner, onBack, onDelete, onEdit, onDeleteRequest }) => {
  const [showImageZoom, setShowImageZoom] = useState(false);



  const InfoCard = ({ title, value, icon: Icon, color = "lime", subtitle }) => (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 hover:border-lime-200 transition-all duration-300">
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
            src={banner.image}
            alt="Banner"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </div>
  );

  if (!banner) {
    return (
      <LoaderOverlay text="Loading banner..." />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-50/20 p-4">
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
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/10"
            >
              Back
            </button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-800 via-red-600 to-pink-600 bg-clip-text text-transparent">Banner Details</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Banner Image and Basic Info */}
          <div className="col-span-12 lg:col-span-8">
            {/* Banner Image Card */}
            <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 hover:border-red-200 transition-all duration-500 mb-8 shadow-xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
                      <FiImage className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Banner Preview</h3>
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
                  <div className="aspect-video rounded-2xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={banner.image}
                      alt="Banner"
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
          </div>

          {/* Right Column - Information and Actions */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Banner Info */}
              <div className="space-y-4">
                <InfoCard
                  title="Upload Date"
                  value={new Date(banner.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  icon={FiCalendar}
                  color="red"
                  subtitle={new Date(banner.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                />
              </div>

              {/* Technical Details */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Type</span>
                    <span className="text-gray-900 font-medium">Image</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Banner Type</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white border border-red-500/30">{banner.bannerType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visibility</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border 
                      ${banner.isVisible === true ? 'bg-red-500/20 text-red-700 border-red-500/30' : 
                        'bg-gray-400/20 text-gray-600 border-gray-400/30'}`}
                    >
                      {banner.isVisible === true ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
                
                <div className="space-y-3">
                  <button
                    onClick={() => onEdit(banner)}
                    className="w-full p-4 bg-gradient-to-r from-red-600 to-pink-500 border border-red-500/30 rounded-xl hover:from-red-700 hover:to-pink-600 transition-all duration-200 text-center group flex items-center justify-center"
                  >
                    <FiEdit3 className="w-5 h-5 text-white mr-2 group-hover:scale-110 transition-transform" />
                    <span className="text-white font-medium">Edit Banner</span>
                  </button>
                  
                  <button
                    onClick={onBack}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-200 text-center group flex items-center justify-center"
                  >
                    <FiImage className="w-5 h-5 text-red-600 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="text-red-600 font-medium">All Banners</span>
                  </button>
                  
                  <button
                    onClick={() => onDeleteRequest(banner)}
                    className="w-full p-4 bg-red-600/20 border border-red-500/30 rounded-xl hover:bg-red-600/30 transition-all duration-200 text-center group flex items-center justify-center"
                  >
                    <FiTrash2 className="w-5 h-5 text-red-600 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="text-red-600 font-medium">Delete Banner</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {showImageZoom && <ImageZoomModal />}
    </div>
  );
};

export default ViewBanner;