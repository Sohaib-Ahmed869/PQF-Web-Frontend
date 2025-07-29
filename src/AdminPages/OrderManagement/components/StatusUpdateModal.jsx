import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FiX, 
  FiCheckCircle, 
  FiTruck, 
  FiPackage, 
  FiClock,
  FiAlertCircle,
  FiEdit3,
  FiSend,
  FiActivity,
  FiUser
} from 'react-icons/fi';

const StatusUpdateModal = ({ 
  isOpen, 
  onClose, 
  order, 
  onUpdate, 
  loading = false 
}) => {
  const [selectedStatus, setSelectedStatus] = useState(order?.trackingStatus || 'pending');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [trackingNote, setTrackingNote] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  // Check if order is in final state (delivered or cancelled)
  const isFinalState = order?.trackingStatus === 'delivered' || order?.trackingStatus === 'cancelled';

  // Reset form when order changes
  useEffect(() => {
    if (order) {
      setSelectedStatus(order.trackingStatus || 'pending');
      setTrackingNumber(order.trackingNumber || '');
      setTrackingNote('');
      setSendNotification(true);
    }
  }, [order]);

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: FiClock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { value: 'shipped', label: 'Shipped', icon: FiTruck, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { value: 'in transit', label: 'In Transit', icon: FiPackage, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { value: 'delivered', label: 'Delivered', icon: FiCheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
    { value: 'cancelled', label: 'Cancelled', icon: FiAlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updateData = {
      trackingStatus: selectedStatus,
      trackingNumber: trackingNumber.trim() || undefined,
      trackingNote: trackingNote.trim() || `Status updated to ${selectedStatus}`,
      sendNotification
    };

    onUpdate(order.orderId, updateData);
  };

  const handleClose = () => {
    // Reset form
    setSelectedStatus(order?.trackingStatus || 'pending');
    setTrackingNumber(order?.trackingNumber || '');
    setTrackingNote('');
    setSendNotification(true);
    setShowHistory(false);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    if (statusOption) {
      const Icon = statusOption.icon;
      return <Icon className={`w-4 h-4 ${statusOption.color}`} />;
    }
    return <FiClock className="w-4 h-4 text-gray-500" />;
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Update Order Status</h2>
            <p className="text-gray-600 mt-1">Order #{order?.orderId}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Update Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Order Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Customer:</span>
                      <p className="font-medium">{order?.cardName || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Status:</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order?.trackingStatus)}
                        <span className="font-medium capitalize">{order?.trackingStatus || 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Order Type:</span>
                      <p className="font-medium capitalize">{order?.orderType || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <p className="font-medium">د.إ{order?.price?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select New Status
                  </label>
                  
                  {isFinalState && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <FiAlertCircle className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          This order is {order?.trackingStatus} and cannot be updated further.
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {statusOptions.map((status) => {
                      const Icon = status.icon;
                      return (
                        <button
                          key={status.value}
                          type="button"
                          onClick={() => setSelectedStatus(status.value)}
                          disabled={isFinalState}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            selectedStatus === status.value
                              ? `${status.bgColor} border-${status.color.split('-')[1]}-300`
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          } ${isFinalState ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Icon className={`w-6 h-6 ${status.color}`} />
                            <span className="text-sm font-medium text-gray-900">
                              {status.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tracking Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tracking Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number..."
                    disabled={isFinalState}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Tracking Note */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={trackingNote}
                    onChange={(e) => setTrackingNote(e.target.value)}
                    placeholder="Add any additional notes about this status update..."
                    rows={3}
                    disabled={isFinalState}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Notification Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sendNotification"
                    checked={sendNotification}
                    onChange={(e) => setSendNotification(e.target.checked)}
                    disabled={isFinalState}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="sendNotification" className="text-sm text-gray-700">
                    Send notification to customer about this status update
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || isFinalState}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="w-4 h-4" />
                        Update Status
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column - Tracking History */}
            <div>
              <div className="bg-gray-50 rounded-xl p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FiActivity className="w-5 h-5" />
                    Tracking History
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    {showHistory ? 'Hide' : 'Show'} History
                  </button>
                </div>

                {showHistory && order?.trackingHistory && order.trackingHistory.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {order.trackingHistory.slice().reverse().map((entry, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(entry.status)}
                            <span className="font-medium capitalize text-sm">{entry.status}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-sm text-gray-600 mt-2">{entry.note}</p>
                        )}
                        {entry.updatedBy && (
                          <div className="flex items-center gap-1 mt-2">
                            <FiUser className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{entry.updatedBy}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : showHistory ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiActivity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No tracking history available</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default StatusUpdateModal; 