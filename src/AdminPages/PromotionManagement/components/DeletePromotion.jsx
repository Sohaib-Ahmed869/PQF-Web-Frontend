import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import promotionService from '../../../services/promotionService';

const DeletePromotion = ({ promotion, onBack, onSuccess }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await promotionService.deletePromotion(promotion._id, token);
      
      if (response.data.success) {
        onSuccess();
      } else {
        setError(response.data.error || 'Failed to delete promotion');
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'Failed to delete promotion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-500 hover:text-blue-600"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Promotions
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Delete Promotion</h2>
      </div>

      {error && (
        <div className="bg-[#8e191c]/10 border border-[#8e191c]/30 text-[#8e191c] px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
        </div>
        
        <div className="px-6 py-4">
          <div className="mb-4">
            <p className="text-gray-600">
              Are you sure you want to delete the promotion <strong>"{promotion.name}"</strong>?
            </p>
            <p className="text-gray-500 text-sm mt-2">
              This action cannot be undone. All promotion data will be permanently removed.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Warning
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>This promotion will be permanently deleted</li>
                    <li>Any active usage of this promotion will be affected</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-[#8e191c] text-white rounded-md hover:bg-[#6b1416] disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete Promotion'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePromotion; 