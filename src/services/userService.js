import api from './api';
import { GOOGLE_AUTH_URL } from './api';

class UserService {
  async register(userData) {
    // Check if userData is FormData (for file uploads)
    if (userData instanceof FormData) {
      return api.post('/users/register', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // Regular JSON data
    return api.post('/users/register', userData);
  }

  async login(credentials) {
    return api.post('/users/login', credentials);
  }

  async getProfile() {
    return api.get('/users/getProfile');
  }

  async updateProfile(profileData) {
    return api.put('/users/updateProfile', profileData);
  }

  async getAllUsers(params = {}) {
    return api.get('/users/getAllUsers', { params });
  }

  async getUserById(userId) {
    return api.get(`/users/getIndividual/${userId}`);
  }

  async updateUserStatus(userId, status) {
    return api.put(`/users/${userId}/status`, { status });
  }

  async deleteUser(userId) {
    return api.delete(`/users/delete/${userId}`);
  }

  async createAdmin(adminData) {
    return api.post('/users/create-admin', adminData);
  }

  async getAdmins(params = {}) {
    return api.get('/users/getAdmins', { params });
  }

  // Address management
  async addAddress(addressData) {
    return api.post('/users/Add', addressData);
  }

  async getAddresses() {
    return api.get('/users/getAll');
  }

  async updateAddress(addressId, addressData) {
    return api.put(`/users/update/${addressId}`, addressData);
  }

  async deleteAddress(addressId) {
    return api.delete(`/users/delete/address/${addressId}`);
  }

  async setDefaultAddress(type, addressId) {
    return api.put(`/users/address/default/${type}`, { addressId });
  }

  async setShippingAndBillingSame(addressId) {
    return api.put('/users/address/set-both', { addressId });
  }

  async getUserAddress(type) {
    const params = {};
    if (type) params.type = type;
    return api.get('/users/address', { params });
  }

  async updateDocumentVerification(userId, verificationData) {
    return api.put(`/users/${userId}/document-verification`, verificationData);
  }

  // Wishlist management
  async addToWishlist(itemId) {
    try {
      console.log('UserService - Adding to wishlist:', itemId);
      const response = await api.post('/users/wishlist/add', { 
        itemId: String(itemId) // Ensure it's a string
      });
      console.log('UserService - Add to wishlist response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService - Add to wishlist error:', error.response?.data || error.message);
      throw error;
    }
  }

  async removeFromWishlist(itemId) {
    try {
      console.log('UserService - Removing from wishlist:', itemId);
      const response = await api.post('/users/wishlist/remove', { 
        itemId: String(itemId) // Ensure it's a string
      });
      console.log('UserService - Remove from wishlist response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService - Remove from wishlist error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getWishlist() {
    try {
      console.log('UserService - Getting wishlist');
      const response = await api.get('/users/wishlist');
      console.log('UserService - Get wishlist full response:', response);
      
      // Handle different axios response structures
      let data;
      if (response && response.data !== undefined) {
        data = response.data;
      } else if (response) {
        data = response;
      } else {
        data = { success: false, wishlist: [] };
      }
      
      console.log('UserService - Processed response data:', data);
      return data;
    } catch (error) {
      console.error('UserService - Get wishlist error:', error.response?.data || error.message);
      
      // Return a safe default structure if the API fails
      return {
        success: false,
        wishlist: [],
        message: error.message || 'Failed to get wishlist'
      };
    }
  }

  getGoogleAuthUrl() {
    return GOOGLE_AUTH_URL;
  }
}

const userService = new UserService();
export default userService;