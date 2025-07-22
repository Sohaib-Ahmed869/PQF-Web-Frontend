import React, { useEffect, useState } from 'react';
import LoaderOverlay from '../../../components/LoaderOverlay';
import { 
  FiAlertTriangle, 
  FiX, 
  FiTrash2, 
  FiHome,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUsers,
  FiCalendar,
  FiShield,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import storeService from '../../../services/SuperAdmin/storeService';

const DeleteStore = ({ store, onClose, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [step, setStep] = useState(1); // 1: Warning, 2: Confirmation, 3: Final confirmation
  const [deleteReason, setDeleteReason] = useState('');
  const [understood, setUnderstood] = useState(false);

  const deleteReasons = [
    'Store permanently closed',
    'Duplicate store entry',
    'Incorrect store information',
    'Business restructuring',
    'Other'
  ];

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleDelete = async () => {
    if (!understood) {
      toast.error('Please confirm that you understand the consequences');
      return;
    }

    if (confirmationText.toLowerCase() !== 'delete store') {
      toast.error('Please type "DELETE STORE" to confirm');
      return;
    }

    try {
      setLoading(true);
      await storeService.deleteStore(store._id);
      
      toast.success('Store deleted successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      onDelete(store._id);
      onClose();
    } catch (error) {
      console.error('Error deleting store:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete store';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!deleteReason) {
        toast.error('Please select a reason for deletion');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Store Information */}
            <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FiHome className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">{store.name}</h3>
                  <div className="space-y-1 text-sm text-red-700">
                    <div className="flex items-center space-x-2">
                      <FiMapPin className="w-4 h-4" />
                      <span>{store.location?.address?.city}, {store.location?.address?.country}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiMail className="w-4 h-4" />
                      <span>{store.contact?.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiPhone className="w-4 h-4" />
                      <span>{store.contact?.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiUsers className="w-4 h-4" />
                      <span>{store.admins?.length || 0} Admin(s) assigned</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4" />
                      <span>Created {new Date(store.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Messages */}
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <FiAlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Data Loss Warning</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      Deleting this store will permanently remove all associated data including:
                    </p>
                    <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
                      <li>Store configuration and settings</li>
                      <li>Business hours and location information</li>
                      <li>Admin assignments and permissions</li>
                      <li>All historical data and records</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <FiXCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900">Irreversible Action</h4>
                    <p className="text-sm text-red-800 mt-1">
                      This action cannot be undone. Once deleted, the store and all its data will be permanently removed from the system.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Reason for deletion <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {deleteReasons.map((reason) => (
                  <label key={reason} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="deleteReason"
                      value={reason}
                      checked={deleteReason === reason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Impact Assessment */}
            <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Impact Assessment</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FiUsers className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Admin Impact</h4>
                    <p className="text-sm text-red-800">
                      {store.admins?.length || 0} administrator(s) will lose access to this store and will need to be reassigned.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiShield className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Security Impact</h4>
                    <p className="text-sm text-red-800">
                      All permissions and access rights associated with this store will be revoked immediately.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiHome className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Business Impact</h4>
                    <p className="text-sm text-red-800">
                      Store operations will cease immediately and cannot be recovered after deletion.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Checkboxes */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="understand-data-loss"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-0.5"
                />
                <label htmlFor="understand-data-loss" className="text-sm text-gray-700">
                  I understand that this action will permanently delete all store data and cannot be undone.
                </label>
              </div>
            </div>

            {/* Selected Reason Display */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">Selected Reason:</h4>
              <p className="text-sm text-gray-700">{deleteReason}</p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Final Warning */}
            <div className="bg-red-100 border-2 border-red-300 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <FiAlertTriangle className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-900">Final Confirmation Required</h3>
                  <p className="text-red-800">This is your last chance to cancel this action.</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-red-200">
                <p className="text-sm text-red-900 font-medium mb-3">
                  Store to be deleted: <span className="font-bold">{store.name}</span>
                </p>
                <p className="text-sm text-red-800 mb-3">
                  Reason: <span className="font-medium">{deleteReason}</span>
                </p>
                <p className="text-sm text-red-800">
                  Deletion will occur immediately and cannot be reversed.
                </p>
              </div>
            </div>

            {/* Confirmation Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type <span className="font-bold text-red-600">"DELETE STORE"</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="DELETE STORE"
                className="w-full px-4 py-3 border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                This confirmation is case-insensitive
              </p>
            </div>

            {/* Final Checks */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {understood ? (
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <FiXCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm text-gray-700">
                    Consequences understood
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  {confirmationText.toLowerCase() === 'delete store' ? (
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <FiXCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="text-sm text-gray-700">
                    Confirmation text entered
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {loading && <LoaderOverlay text="Deleting Store..." />}
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="relative transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all w-full max-w-2xl animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 z-10 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FiTrash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Delete Store</h2>
                <p className="text-red-100">
                  Step {step} of 3 - {step === 1 ? 'Warning' : step === 2 ? 'Impact Assessment' : 'Final Confirmation'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-8 py-4 bg-gray-50">
            <div className="flex space-x-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    s <= step ? 'bg-red-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {renderStepContent()}
          </div>

          {/* Actions */}
          <div className="px-8 py-6 bg-gray-50 flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              {step < 3 ? (
                <button
                  onClick={handleNextStep}
                  disabled={step === 1 && !deleteReason}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Continue</span>
                  <FiAlertTriangle className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleDelete}
                  disabled={loading || !understood || confirmationText.toLowerCase() !== 'delete store'}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4" />
                      <span>Delete Store Permanently</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteStore;