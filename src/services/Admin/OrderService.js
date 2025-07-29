import api from '../api';

const getAllOrders = async (params = {}) => {
  try {
    const response = await api.get('/orders', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

const getOrderDetails = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

const updateOrderTracking = async (orderId, trackingData) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    if (!trackingData || typeof trackingData !== 'object') {
      throw new Error('Tracking data is required');
    }
    
    const response = await api.patch(`/orders/${orderId}/tracking`, trackingData);
    return response.data;
  } catch (error) {
    console.error('Error updating order tracking:', error);
    throw error;
  }
};

const getOrdersWithFilters = async (filters = {}, pagination = {}, sorting = {}) => {
  try {
    const params = {
      // Filters
      ...(filters.status && filters.status !== 'all' && { status: filters.status }),
      ...(filters.orderType && filters.orderType !== 'all' && { orderType: filters.orderType }),
      ...(filters.paymentStatus && filters.paymentStatus !== 'all' && { paymentStatus: filters.paymentStatus }),
      ...(filters.dateRange && filters.dateRange !== 'all' && { dateRange: filters.dateRange }),
      ...(filters.search && { search: filters.search }),
      ...(filters.storeId && { storeId: filters.storeId }),
      
      // Pagination
      ...(pagination.page && { page: pagination.page }),
      ...(pagination.limit && { limit: pagination.limit }),
      
      // Sorting
      ...(sorting.field && { sortBy: sorting.field }),
      ...(sorting.order && { sortOrder: sorting.order }),
    };
    
    console.log('Fetching orders with params:', params);
    const response = await api.get('/orders', { params });
    console.log('Orders response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders with filters:', error);
    throw error;
  }
};

const getOrderStatistics = async (storeId = null) => {
  try {
    const params = storeId ? { storeId } : {};
    const response = await api.get('/orders/stats', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
};

const exportOrders = async (filters = {}, format = 'csv') => {
  try {
    const params = {
      ...filters,
      format,
    };
    
    const response = await api.get('/orders/export', { 
      params,
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error exporting orders:', error);
    throw error;
  }
};
const bulkUpdateOrderStatus = async (orderIds, status, note = '') => {
  try {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new Error('Order IDs array is required and must not be empty');
    }
    
    if (!status) {
      throw new Error('Status is required');
    }
    
    const response = await api.patch('/orders/bulk-status', {
      orderIds,
      status,
      note
    });
    
    return response.data;
  } catch (error) {
    console.error('Error bulk updating order statuses:', error);
    throw error;
  }
};

const getOrderAnalytics = async (params = {}) => {
  try {
    // TODO: Implement analytics endpoint in backend
    console.warn('Analytics endpoint not implemented yet');
    return { success: true, data: {} };
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    throw error;
  }
};

const sendOrderNotification = async (orderId, notificationType, message = '') => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    if (!notificationType) {
      throw new Error('Notification type is required');
    }
    
    const response = await api.post(`/orders/${orderId}/notify`, {
      type: notificationType,
      message
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending order notification:', error);
    throw error;
  }
};

const getOrderTimeline = async (orderId) => {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    const response = await api.get(`/orders/${orderId}/timeline`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order timeline:', error);
    throw error;
  }
};

const validateOrderData = async (orderData) => {
  try {
    // TODO: Implement validation endpoint in backend
    console.warn('Validation endpoint not implemented yet');
    return { success: true, data: { isValid: true } };
  } catch (error) {
    console.error('Error validating order data:', error);
    throw error;
  }
};

const orderService = {
  getAllOrders,
  getOrderDetails,
  updateOrderTracking,
  getOrdersWithFilters,
  getOrderStatistics,
  exportOrders,
  bulkUpdateOrderStatus,
  getOrderAnalytics,
  sendOrderNotification,
  getOrderTimeline,
  validateOrderData,
};

export default orderService;
