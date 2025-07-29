import api from './api';

const disputeService = {
  // Create a new dispute
  createDispute: async (disputeData) => {
    const response = await api.post('/orderdispute/create', disputeData);
    return response.data;
  },

  // Get all disputes for admin
  getAllDisputes: async (params = {}) => {
    const response = await api.get('/orderdispute/admin/all-disputes', { params });
    return response.data;
  },

  // Get disputes for current user
  getUserDisputes: async (params = {}) => {
    const response = await api.get('/orderdispute/user/me', { params });
    return response.data;
  },

  // Get disputes for a specific user (admin only)
  getUserDisputesById: async (userId, params = {}) => {
    const response = await api.get(`/orderdispute/user/${userId}`, { params });
    return response.data;
  },

  // Get dispute chat history
  getDisputeChat: async (disputeId) => {
    const response = await api.get(`/orderdispute/${disputeId}/chat`);
    return response.data;
  },

  // Send response to dispute
  sendDisputeResponse: async (disputeId, responseData) => {
    const response = await api.post(`/orderdispute/${disputeId}/response`, responseData);
    return response.data;
  },

  // Update dispute status (admin only)
  updateDisputeStatus: async (disputeId, status) => {
    const response = await api.put(`/orderdispute/admin/${disputeId}/status`, { disputeStatus: status });
    return response.data;
  },

  // Get dispute statistics
  getDisputeStats: async () => {
    const response = await api.get('/orderdispute/admin/stats');
    return response.data;
  }
};

export default disputeService;