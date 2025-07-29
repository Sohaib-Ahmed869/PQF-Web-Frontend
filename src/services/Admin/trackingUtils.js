/**
 * Utility functions for order tracking management
 */

// Valid tracking statuses
export const TRACKING_STATUSES = {
  PENDING: 'pending',
  SHIPPED: 'shipped',
  IN_TRANSIT: 'in transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Status display information
export const STATUS_INFO = {
  [TRACKING_STATUSES.PENDING]: {
    label: 'Pending',
    color: 'yellow',
    icon: 'FiClock',
    description: 'Order is being processed'
  },
  [TRACKING_STATUSES.SHIPPED]: {
    label: 'Shipped',
    color: 'blue',
    icon: 'FiTruck',
    description: 'Order has been shipped'
  },
  [TRACKING_STATUSES.IN_TRANSIT]: {
    label: 'In Transit',
    color: 'purple',
    icon: 'FiPackage',
    description: 'Order is in transit'
  },
  [TRACKING_STATUSES.DELIVERED]: {
    label: 'Delivered',
    color: 'green',
    icon: 'FiCheckCircle',
    description: 'Order has been delivered'
  },
  [TRACKING_STATUSES.CANCELLED]: {
    label: 'Cancelled',
    color: 'red',
    icon: 'FiAlertCircle',
    description: 'Order has been cancelled'
  }
};

/**
 * Get status information for a given status
 * @param {string} status - The tracking status
 * @returns {Object} Status information
 */
export const getStatusInfo = (status) => {
  return STATUS_INFO[status] || STATUS_INFO[TRACKING_STATUSES.PENDING];
};

/**
 * Check if a status transition is valid
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - New status
 * @returns {boolean} Whether the transition is valid
 */
export const isValidStatusTransition = (fromStatus, toStatus) => {
  const validTransitions = {
    [TRACKING_STATUSES.PENDING]: [
      TRACKING_STATUSES.SHIPPED,
      TRACKING_STATUSES.CANCELLED
    ],
    [TRACKING_STATUSES.SHIPPED]: [
      TRACKING_STATUSES.IN_TRANSIT,
      TRACKING_STATUSES.DELIVERED,
      TRACKING_STATUSES.CANCELLED
    ],
    [TRACKING_STATUSES.IN_TRANSIT]: [
      TRACKING_STATUSES.DELIVERED,
      TRACKING_STATUSES.CANCELLED
    ],
    [TRACKING_STATUSES.DELIVERED]: [
      TRACKING_STATUSES.CANCELLED
    ],
    [TRACKING_STATUSES.CANCELLED]: []
  };

  const allowedTransitions = validTransitions[fromStatus] || [];
  return allowedTransitions.includes(toStatus);
};

/**
 * Get available status options for a current status
 * @param {string} currentStatus - Current tracking status
 * @returns {Array} Array of available status options
 */
export const getAvailableStatusOptions = (currentStatus) => {
  const allStatuses = Object.values(TRACKING_STATUSES);
  
  if (!currentStatus) {
    return allStatuses;
  }

  return allStatuses.filter(status => 
    status === currentStatus || isValidStatusTransition(currentStatus, status)
  );
};

/**
 * Format tracking history for display
 * @param {Array} trackingHistory - Array of tracking history entries
 * @returns {Array} Formatted tracking history
 */
export const formatTrackingHistory = (trackingHistory = []) => {
  return trackingHistory.map(entry => ({
    ...entry,
    statusInfo: getStatusInfo(entry.status),
    formattedTimestamp: new Date(entry.timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }));
};

/**
 * Validate tracking data before submission
 * @param {Object} trackingData - Tracking data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateTrackingData = (trackingData) => {
  const errors = [];

  if (!trackingData.trackingStatus) {
    errors.push('Tracking status is required');
  } else if (!Object.values(TRACKING_STATUSES).includes(trackingData.trackingStatus)) {
    errors.push('Invalid tracking status');
  }

  if (trackingData.trackingNote && trackingData.trackingNote.length > 500) {
    errors.push('Tracking note must be less than 500 characters');
  }

  if (trackingData.trackingNumber && trackingData.trackingNumber.length > 100) {
    errors.push('Tracking number must be less than 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create a tracking history entry
 * @param {string} status - New status
 * @param {string} note - Optional note
 * @param {string} updatedBy - Who made the update
 * @param {string} previousStatus - Previous status (optional)
 * @returns {Object} Tracking history entry
 */
export const createTrackingHistoryEntry = (status, note = '', updatedBy = '', previousStatus = null) => {
  return {
    status,
    timestamp: new Date(),
    note,
    updatedBy,
    previousStatus
  };
}; 