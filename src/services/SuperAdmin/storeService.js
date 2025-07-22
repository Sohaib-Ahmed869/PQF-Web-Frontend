import api from "../api";

const storeService = {
  // Create new store
  createStore: async (storeData) => {
    const response = await api.post('/superAdmin/stores/create', storeData);
    return response.data;
  },

  // Get all stores
  getAllStores: async (params = {}) => {
    const response = await api.get('/superAdmin/stores/getAllStores', { params });
    return response.data;
  },

  // Get individual store by ID
  getStoreById: async (storeId) => {
    const response = await api.get(`/superAdmin/stores/${storeId}`);
    return response.data;
  },

  // Update store details
  updateStore: async (storeId, storeData) => {
    const response = await api.put(`/superAdmin/stores/${storeId}`, storeData);
    return response.data;
  },

  // Update store status
  updateStoreStatus: async (storeId, status) => {
    const response = await api.put(`/superAdmin/stores/${storeId}/status`, { status });
    return response.data;
  },

  // Delete store
  deleteStore: async (storeId) => {
    const response = await api.delete(`/superAdmin/stores/${storeId}`);
    return response.data;
  },

  // Assign admin to store
  assignAdminToStore: async (storeId, adminId) => {
    const response = await api.put(`/superAdmin/stores/${storeId}/assign-admin`, { adminId });
    return response.data;
  },

  // Remove admin from store
  removeAdminFromStore: async (storeId, adminId) => {
    const response = await api.put(`/superAdmin/stores/${storeId}/remove-admin`, { adminId });
    return response.data;
  },

  // Get store statistics
  getStoreStats: async (storeId) => {
    const response = await api.get(`/superAdmin/stores/${storeId}/stats`);
    return response.data;
  },
};

export default storeService;