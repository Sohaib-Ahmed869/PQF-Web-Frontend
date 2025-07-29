import api from '../api';

/**
 * Get all abandoned carts
 * @returns {Promise<Object>} Response with abandoned carts data
 */
const getAbandonedCarts = async () => {
  try {
    const response = await api.get('/cart/abandoned');
    return response.data;
  } catch (error) {
    console.error('Error fetching abandoned carts:', error);
    throw error;
  }
};

/**
 * Send reminder email for abandoned cart
 * @param {string} cartId - The cart ID
 * @param {Object} reminderData - Reminder data
 * @param {string} reminderData.email - Customer email
 * @param {string} reminderData.message - Custom message (optional)
 * @returns {Promise<Object>} Response with reminder status
 */
const sendReminder = async (cartId, reminderData) => {
  try {
    if (!cartId) {
      throw new Error('Cart ID is required');
    }
    
    const response = await api.post(`/cart/${cartId}/reminder`, reminderData);
    return response.data;
  } catch (error) {
    console.error('Error sending reminder:', error);
    throw error;
  }
};

/**
 * Get abandoned cart details
 * @param {string} cartId - The cart ID
 * @returns {Promise<Object>} Response with cart details
 */
const getAbandonedCartDetails = async (cartId) => {
  try {
    if (!cartId) {
      throw new Error('Cart ID is required');
    }
    
    const response = await api.get(`/cart/${cartId}/abandoned`);
    return response.data;
  } catch (error) {
    console.error('Error fetching abandoned cart details:', error);
    throw error;
  }
};

/**
 * Delete abandoned cart
 * @param {string} cartId - The cart ID
 * @returns {Promise<Object>} Response with deletion status
 */
const deleteAbandonedCart = async (cartId) => {
  try {
    if (!cartId) {
      throw new Error('Cart ID is required');
    }
    
    const response = await api.delete(`/cart/${cartId}/abandoned`);
    return response.data;
  } catch (error) {
    console.error('Error deleting abandoned cart:', error);
    throw error;
  }
};

/**
 * Get abandoned cart analytics
 * @param {Object} params - Query parameters
 * @param {string} params.dateRange - Date range filter
 * @param {string} params.storeId - Store ID filter
 * @returns {Promise<Object>} Response with analytics data
 */
const getAbandonedCartAnalytics = async (params = {}) => {
  try {
    const response = await api.get('/cart/abandoned/analytics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching abandoned cart analytics:', error);
    throw error;
  }
};

/**
 * Export abandoned carts data
 * @param {Object} filters - Filter parameters
 * @param {string} format - Export format ('csv' or 'excel')
 * @returns {Promise<Object>} Response with export data
 */
const exportAbandonedCarts = async (filters = {}, format = 'csv') => {
  try {
    const params = {
      ...filters,
      format
    };
    
    const response = await api.get('/cart/abandoned/export', { params });
    return response.data;
  } catch (error) {
    console.error('Error exporting abandoned carts:', error);
    throw error;
  }
};

/**
 * Bulk send reminders
 * @param {Array} cartIds - Array of cart IDs
 * @param {Object} reminderData - Reminder data
 * @returns {Promise<Object>} Response with bulk reminder status
 */
const bulkSendReminders = async (cartIds, reminderData) => {
  try {
    if (!cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
      throw new Error('Cart IDs array is required');
    }
    
    const response = await api.post('/cart/abandoned/bulk-reminder', {
      cartIds,
      ...reminderData
    });
    return response.data;
  } catch (error) {
    console.error('Error sending bulk reminders:', error);
    throw error;
  }
};

const abandonedCartService = {
  getAbandonedCarts,
  sendReminder,
  getAbandonedCartDetails,
  deleteAbandonedCart,
  getAbandonedCartAnalytics,
  exportAbandonedCarts,
  bulkSendReminders
};

export default abandonedCartService;