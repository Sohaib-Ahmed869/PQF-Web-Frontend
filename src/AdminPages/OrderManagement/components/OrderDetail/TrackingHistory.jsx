import React from 'react';
import {
  FiActivity,
  FiUser,
  FiClock,
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';

const TrackingHistory = ({ trackingHistory, getStatusColor, getStatusIcon, formatDateTime }) => {
  const statusIcons = {
    'pending': FiClock,
    'shipped': FiTruck,
    'in transit': FiPackage,
    'delivered': FiCheckCircle,
    'cancelled': FiAlertCircle
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

  if (!trackingHistory || trackingHistory.length === 0) {
    return (
      <div className="mt-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 border border-indigo-500/20">
              <FiActivity className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Tracking History</h3>
          </div>

          <div className="text-center py-8 text-gray-500">
            <FiClock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No tracking history available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 border border-indigo-500/20">
            <FiActivity className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Tracking History</h3>
        </div>

        <div className="space-y-4">
          {trackingHistory.slice().reverse().map((history, index) => {
            const Icon = statusIcons[history.status] || getStatusIcon(history.status);
            const isLast = index === 0; // Since we're using reverse()

            return (
              <div key={index} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                )}

                <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-2xl hover:border-indigo-200 transition-all duration-300">
                  <div className={`p-2 rounded-full ${getStatusColor(history.status)} flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 capitalize">{history.status}</h4>
                      <span className="text-sm text-gray-500">
                        {formatDateTime ? formatDateTime(history.timestamp) : formatDate(history.timestamp)}
                      </span>
                    </div>

                    {history.note && (
                      <p className="text-gray-600 text-sm mb-2">{history.note}</p>
                    )}

                    {history.updatedBy && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <FiUser className="w-3 h-3" />
                        <span>Updated by {history.updatedBy}</span>
                      </div>
                    )}

                    {history.previousStatus && (
                      <div className="text-xs text-gray-500">
                        Changed from <span className="font-medium">{history.previousStatus}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrackingHistory;