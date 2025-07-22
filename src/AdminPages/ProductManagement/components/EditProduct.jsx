import React, { useState } from 'react';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiImage, FiCheck, FiSettings } from 'react-icons/fi';
import productService from '../../../services/Admin/productService';
import LoaderOverlay from '../../../components/LoaderOverlay';

const EditProduct = ({ product, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(product?.image || '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState(product?.description || product?.Description || '');
  const [errors, setErrors] = useState({});

  const handleImageChange = (file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({ image: 'Please select a valid image file' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ image: 'Image size should be less than 5MB' });
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setErrors({});
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleImageChange(file);
  };

  const removeImage = () => {
    setImagePreview('');
    setSelectedImage(null);
    setErrors({ image: 'Product image is required' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage && description === product?.Description) {
      setErrors({ image: 'Please select an image or update the description.' });
      return;
    }
    setLoading(true);
    try {
      const productId = product && (product._id || product.id);
      await productService.updateProductImageAndDescription(productId, selectedImage, description);
      if (onSuccess) onSuccess();
      if (onBack) onBack();
    } catch (error) {
      setErrors({ submit: 'Failed to update product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-50/20 p-4">
      {loading && <LoaderOverlay text="Updating Product Image..." />}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-600/3 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="group px-4 py-2 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/10"
          >
            <FiArrowLeft className="w-4 h-4 inline mr-2 transition-transform group-hover:-translate-x-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-800 via-red-600 to-pink-600 bg-clip-text text-transparent">
            Update Product Image
          </h1>
        </div>
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
            <FiX className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-600">{errors.submit}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
              <FiImage className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Product Image</h3>
          </div>
          {imagePreview ? (
            <div className="relative group mb-6">
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
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 rounded-full bg-green-500">
                      <FiCheck className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-800">
                      {selectedImage ? 'New image ready' : 'Current image'}
                    </span>
                  </div>
                  {selectedImage && (
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer group mb-6 bg-gradient-to-br from-gray-50 to-red-50/30 hover:shadow-lg"
              onClick={() => document.getElementById('product-upload').click()}
            >
              <div className="p-6 rounded-full bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 group-hover:scale-110">
                <FiUpload className="w-12 h-12 text-red-500 group-hover:text-red-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-700">
                Upload Product Image
              </h4>
              <p className="text-gray-600 text-center mb-4 max-w-md text-sm">
                Click to browse and upload a new product image
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="px-2 py-1 bg-white rounded-full border text-xs">JPG, PNG, WebP</span>
                <span className="px-2 py-1 bg-white rounded-full border text-xs">Max 5MB</span>
                <span className="px-2 py-1 bg-white rounded-full border text-xs">Square preferred</span>
              </div>
              <input
                id="product-upload"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}
          {errors.image && (
            <p className="mt-2 text-sm text-red-600">{errors.image}</p>
          )}
          <div className="flex items-center space-x-3 mb-6 mt-8">
            <div className="p-2 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
              <FiSettings className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Product Description</h3>
          </div>
          <textarea
            className="w-full min-h-[100px] rounded-xl border border-gray-300 p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all mb-2"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Enter product description..."
            maxLength={1000}
          />
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
              disabled={loading}
              className="group relative px-8 py-3 bg-gradient-to-r from-red-600 via-red-500 to-pink-500 text-white rounded-xl hover:from-red-700 hover:via-red-600 hover:to-pink-600 transition-all duration-500 font-medium flex items-center gap-3 shadow-xl hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="relative z-10 flex items-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating Image...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span>Update Image</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;