import React, { useState } from 'react';
import { 
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import StatusUpdateModal from '../StatusUpdateModal';

const ActionButtons = ({ order, loading, onTrackingUpdate, onSendNotification }) => {
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Check if order is in final state (delivered or cancelled)
  const isFinalState = order?.trackingStatus === 'delivered' || order?.trackingStatus === 'cancelled';

  const handleStatusUpdate = (orderId, updateData) => {
    onTrackingUpdate(orderId, updateData);
    setShowStatusModal(false);
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 shadow-xl">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions</h4>
        
        {isFinalState && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Order is {order?.trackingStatus} - no further updates allowed
              </span>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <button 
            onClick={() => setShowStatusModal(true)}
            disabled={loading || isFinalState}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiCheckCircle className="w-4 h-4" />
            {loading ? 'Updating...' : isFinalState ? 'Cannot Update' : 'Update Status'}
          </button>
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        order={order}
        onUpdate={handleStatusUpdate}
        loading={loading}
      />
    </>
  );
};

export default ActionButtons;