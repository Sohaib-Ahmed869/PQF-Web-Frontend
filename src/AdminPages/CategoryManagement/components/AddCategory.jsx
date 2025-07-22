import React, { useState } from 'react';
import { 
  FiArrowLeft, 
  FiSave, 
  FiUpload, 
  FiX, 
  FiImage,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiTag,
  FiSettings,
  FiGrid,
  FiHash
} from 'react-icons/fi';
import categoryService from '../../../services/Admin/categoryService';
import { toast } from 'react-toastify';
import LoaderOverlay from '../../../components/LoaderOverlay';

const AddCategory = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [name, setName] = useState('');
  const [itemsGroupCode, setItemsGroupCode] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleImageChange = (file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleImageChange(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    if (!itemsGroupCode.trim()) {
      toast.error('Please enter an items group code');
      return;
    }

    if (!selectedImage) {
      toast.error('Please select an image to upload');
      return;
    }

    setLoading(true);

    try {
      const response = await categoryService.createCategory({
        name: name.trim(),
        ItemsGroupCode: itemsGroupCode.trim(),
        image: selectedImage,
        isActive
      });

      toast.success('Category created successfully! 🎉');
      if (onSuccess) {
        onSuccess(response.data);
      }
      if (onBack) onBack();
    } catch (error) {
      console.error('Error creating category:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create category. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-50/20 p-4">
      {loading && <LoaderOverlay text="Creating Category..." />}
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-600/3 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="group px-4 py-2 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/10"
            >
              <FiArrowLeft className="w-4 h-4 inline mr-2 transition-transform group-hover:-translate-x-1" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-800 via-red-600 to-pink-600 bg-clip-text text-transparent">
                Create New Category
              </h1>
              <p className="text-gray-600 mt-1 text-base">Add a new category to organize your products</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
                  <FiImage className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Category Image</h3>
              </div>

              {imagePreview ? (
                <div className="relative group">
                  <div className="aspect-video rounded-2xl overflow-hidden border-2 border-red-200 shadow-lg">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg border-2 border-white transform hover:scale-110"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  
                  {/* Image details */}
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 rounded-full bg-green-500">
                          <FiCheck className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-green-800">Ready for upload</span>
                      </div>
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`relative aspect-video rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group ${
                    dragActive 
                      ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50 scale-105 shadow-lg' 
                      : 'border-gray-300 hover:border-red-400 bg-gradient-to-br from-gray-50 to-red-50/30 hover:shadow-lg'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('category-upload').click()}
                >
                  <div className={`p-6 rounded-full bg-gradient-to-br transition-all duration-300 mb-4 ${
                    dragActive 
                      ? 'from-red-500/20 to-pink-500/20 border border-red-500/30 scale-110' 
                      : 'from-red-500/10 to-pink-500/10 border border-red-500/20 group-hover:scale-110'
                  }`}>
                    <FiUpload className={`w-12 h-12 transition-all duration-300 ${
                      dragActive ? 'text-red-600 animate-bounce' : 'text-red-500 group-hover:text-red-600'
                    }`} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2 transition-all duration-300 group-hover:text-red-700">
                    {dragActive ? 'Drop your image here' : 'Upload Category Image'}
                  </h4>
                  <p className="text-gray-600 text-center mb-4 max-w-md text-sm">
                    Drag and drop your category image here, or click to browse
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-white rounded-full border text-xs">JPG, PNG, WebP</span>
                    <span className="px-2 py-1 bg-white rounded-full border text-xs">Max 5MB</span>
                    <span className="px-2 py-1 bg-white rounded-full border text-xs">Square preferred</span>
                  </div>
                  
                  <input
                    id="category-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              )}

              {/* Upload Guidelines */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FiSettings className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-blue-900">Image Guidelines</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <FiCheck className="w-3 h-3 text-green-600 flex-shrink-0" />
                    <span className="text-blue-800">Clear product representation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCheck className="w-3 h-3 text-green-600 flex-shrink-0" />
                    <span className="text-blue-800">Good lighting & quality</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCheck className="w-3 h-3 text-green-600 flex-shrink-0" />
                    <span className="text-blue-800">Square aspect ratio</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCheck className="w-3 h-3 text-green-600 flex-shrink-0" />
                    <span className="text-blue-800">Consistent style</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Controls Sidebar */}
          <div className="space-y-6">
            {/* Category Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
                  <FiTag className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Category Details</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter category name..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Items Group Code
                  </label>
                  <div className="relative">
                    <FiHash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={itemsGroupCode}
                      onChange={(e) => setItemsGroupCode(e.target.value)}
                      placeholder="Enter group code..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
                  {isActive ? <FiEye className="w-5 h-5 text-red-600" /> : <FiEyeOff className="w-5 h-5 text-red-600" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Status</h3>
              </div>

              <div 
                onClick={() => setIsActive(!isActive)}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-500 border-2 overflow-hidden ${
                  isActive
                    ? 'bg-[#8e191c] text-white border-transparent shadow-lg transform hover:scale-102'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300 text-gray-600 hover:from-gray-200 hover:to-gray-300 transform hover:scale-102'
                }`}
              >
                <div className={`absolute inset-0 transition-all duration-500 ${
                  isActive 
                    ? 'bg-[#8e191c]/30' 
                    : 'bg-gradient-to-r from-gray-300/50 to-gray-400/50'
                }`}></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl transition-all duration-300 border-2 ${
                      isActive 
                        ? 'bg-white/20 border-white/30' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {isActive ? (
                        <FiEye className="w-6 h-6 text-white" />
                      ) : (
                        <FiEyeOff className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-lg">
                        {isActive ? 'Active' : 'Inactive'}
                      </div>
                      <div className={`text-sm mt-1 font-medium ${
                        isActive ? 'text-white/90' : 'text-gray-500'
                      }`}>
                        {isActive ? 'Category will be visible to customers' : 'Category will be hidden from customers'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`mt-4 px-3 py-2 rounded-lg text-xs font-bold text-center transition-all duration-300 ${
                  isActive
                    ? 'bg-white/80 text-[#8e191c]'
                    : 'bg-white/80 text-gray-700'
                }`}>
                  {isActive ? '✓ Active' : '⚫ Inactive'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="group px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            <span className="transition-transform group-hover:-translate-x-1 inline-block">Cancel</span>
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !selectedImage || !name.trim() || !itemsGroupCode.trim()}
            className="group relative px-8 py-3 bg-gradient-to-r from-red-600 via-red-500 to-pink-500 text-white rounded-xl hover:from-red-700 hover:via-red-600 hover:to-pink-600 transition-all duration-500 font-medium flex items-center gap-3 shadow-xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="relative z-10 flex items-center gap-3">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Category...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>Create Category</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCategory;