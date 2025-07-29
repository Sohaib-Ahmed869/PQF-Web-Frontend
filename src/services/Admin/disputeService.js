import api from '../api';

const adminDisputeService = {
  // Get all disputes for admin
  getAllDisputes: async (params = {}) => {
    console.log('🔍 Admin Dispute Service: getAllDisputes called with params:', params);
    try {
      // Ensure params is properly formatted
      let requestParams = {};
      
      if (typeof params === 'string') {
        // If params is a string (URLSearchParams), convert it to object
        const urlParams = new URLSearchParams(params);
        requestParams = Object.fromEntries(urlParams.entries());
      } else if (typeof params === 'object' && params !== null) {
        requestParams = params;
      }
      
      console.log('🔍 Admin Dispute Service: Processed params:', requestParams);
      
      const response = await api.get('/orderdispute/admin/all-disputes', { 
        params: requestParams 
      });
      
      console.log('✅ Admin Dispute Service: getAllDisputes success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin Dispute Service: getAllDisputes error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  },

  // Get dispute statistics
  getDisputeStats: async () => {
    console.log('🔍 Admin Dispute Service: getDisputeStats called');
    try {
      const response = await api.get('/orderdispute/admin/stats');
      console.log('✅ Admin Dispute Service: getDisputeStats success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin Dispute Service: getDisputeStats error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Get dispute chat history
  getDisputeChat: async (disputeId) => {
    console.log('🔍 Admin Dispute Service: getDisputeChat called with disputeId:', disputeId);
    try {
      const response = await api.get(`/orderdispute/${disputeId}/chat`);
      console.log('✅ Admin Dispute Service: getDisputeChat success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin Dispute Service: getDisputeChat error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Send admin response to dispute
  sendDisputeResponse: async (disputeId, responseData) => {
    console.log('🔍 Admin Dispute Service: sendDisputeResponse called with:', { disputeId, responseData });
    try {
      const response = await api.post(`/orderdispute/${disputeId}/response`, responseData);
      console.log('✅ Admin Dispute Service: sendDisputeResponse success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin Dispute Service: sendDisputeResponse error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Update dispute status
  updateDisputeStatus: async (disputeId, status) => {
    console.log('🔍 Admin Dispute Service: updateDisputeStatus called with:', { disputeId, status });
    try {
      const response = await api.put(`/orderdispute/admin/${disputeId}/status`, { disputeStatus: status });
      console.log('✅ Admin Dispute Service: updateDisputeStatus success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin Dispute Service: updateDisputeStatus error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Get dispute by ID
  getDisputeById: async (disputeId) => {
    console.log('🔍 Admin Dispute Service: getDisputeById called with disputeId:', disputeId);
    try {
      const response = await api.get(`/orderdispute/${disputeId}`);
      console.log('✅ Admin Dispute Service: getDisputeById success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin Dispute Service: getDisputeById error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Resolve dispute
  resolveDispute: async (disputeId, resolutionData = {}) => {
    console.log('🔍 Admin Dispute Service: resolveDispute called with:', { disputeId, resolutionData });
    try {
      const response = await api.put(`/orderdispute/admin/${disputeId}/status`, { 
        disputeStatus: 'resolved',
        ...(resolutionData && typeof resolutionData === 'object' ? resolutionData : {})
      });
      console.log('✅ Admin Dispute Service: resolveDispute success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin Dispute Service: resolveDispute error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Close dispute
  closeDispute: async (disputeId, reason) => {
    console.log('🔍 Admin Dispute Service: closeDispute called with:', { disputeId, reason });
    try {
      const response = await api.put(`/orderdispute/admin/${disputeId}/status`, { 
        disputeStatus: 'closed',
        reason 
      });
      console.log('✅ Admin Dispute Service: closeDispute success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin Dispute Service: closeDispute error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Reject dispute
  rejectDispute: async (disputeId, reason) => {
    console.log('🔍 Admin Dispute Service: rejectDispute called with:', { disputeId, reason });
    try {
      const response = await api.put(`/orderdispute/admin/${disputeId}/status`, { 
        disputeStatus: 'rejected',
        reason 
      });
      console.log('✅ Admin Dispute Service: rejectDispute success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin Dispute Service: rejectDispute error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Get dispute analytics
  getDisputeAnalytics: async (dateRange) => {
    console.log('🔍 Admin Dispute Service: getDisputeAnalytics called with dateRange:', dateRange);
    try {
      const response = await api.get('/orderdispute/admin/stats', { params: dateRange });
      console.log('✅ Admin Dispute Service: getDisputeAnalytics success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Admin Dispute Service: getDisputeAnalytics error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Export disputes
  exportDisputes: async (filters = {}) => {
    console.log('🔍 Admin Dispute Service: exportDisputes called with filters:', filters);
    try {
      const response = await api.get('/orderdispute/admin/all-disputes', { 
        params: filters,
        responseType: 'blob'
      });
      console.log('✅ Admin Dispute Service: exportDisputes success');
      return response.data;
    } catch (error) {
      console.error('❌ Admin Dispute Service: exportDisputes error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      throw error;
    }
  }
};

export default adminDisputeService;