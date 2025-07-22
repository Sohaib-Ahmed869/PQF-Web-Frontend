import api from './api';
import { GOOGLE_AUTH_URL } from './api';

class UserService {
  async register(userData) {
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

  async mergeGuestWishlist(wishlist) {
    try {
      console.log('UserService - Merging guest wishlist:', wishlist);
      const response = await api.post('/users/wishlist/merge', { 
        wishlist: wishlist.map(String) // Ensure all items are strings
      });
      console.log('UserService - Merge guest wishlist response:', response.data);
      return response.data;
    } catch (error) {
      console.error('UserService - Merge guest wishlist error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Guest wishlist management (localStorage)
  getGuestWishlist() {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      return wishlist.map(String); // Ensure consistency
    } catch (error) {
      console.error('Error reading guest wishlist:', error);
      return [];
    }
  }

  addToGuestWishlist(itemId) {
    try {
      const currentWishlist = this.getGuestWishlist();
      const stringItemId = String(itemId);
      
      if (!currentWishlist.includes(stringItemId)) {
        const updatedWishlist = [...currentWishlist, stringItemId];
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        return updatedWishlist;
      }
      
      return currentWishlist;
    } catch (error) {
      console.error('Error adding to guest wishlist:', error);
      return this.getGuestWishlist();
    }
  }

  removeFromGuestWishlist(itemId) {
    try {
      const currentWishlist = this.getGuestWishlist();
      const stringItemId = String(itemId);
      const updatedWishlist = currentWishlist.filter(id => id !== stringItemId);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      return updatedWishlist;
    } catch (error) {
      console.error('Error removing from guest wishlist:', error);
      return this.getGuestWishlist();
    }
  }

  clearGuestWishlist() {
    try {
      localStorage.removeItem('wishlist');
      return [];
    } catch (error) {
      console.error('Error clearing guest wishlist:', error);
      return [];
    }
  }

  getGoogleAuthUrl() {
    return GOOGLE_AUTH_URL;
  }
}

const userService = new UserService();
export default userService;