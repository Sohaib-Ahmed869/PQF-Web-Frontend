import api from './api';

class UserService {
  // CUSTOMER REGISTRATION - Single step
  async registerCustomer(userData) {
    return api.post('/users/register/customer', userData);
  }

  // BUSINESS REGISTRATION - Single API call with all data and files
  async registerBusiness(userData) {
    // Business registration always uses FormData for file uploads
    console.log('UserService - registerBusiness called with:', userData);
    
    // Log FormData contents for debugging
    if (userData instanceof FormData) {
      console.log('FormData contents:');
      for (let [key, value] of userData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, value.name, 'size:', value.size, 'type:', value.type);
        } else {
          console.log(`${key}:`, value);
        }
      }
    }
    
    return api.post('/users/register/business', userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // SUPER ADMIN REGISTRATION
  async registerSuperAdmin(userData) {
    return api.post('/users/register/super-admin', userData);
  }

  // ADMIN CREATION - By Super Admin
  async createAdmin(adminData) {
    return api.post('/users/create-admin', adminData);
  }

  // LOGIN
  async login(credentials) {
    return api.post('/users/login', credentials);
  }

  // PROFILE MANAGEMENT
  async getProfile() {
    return api.get('/users/profile');
  }

  async updateProfile(profileData) {
    return api.put('/users/profile', profileData);
  }

  async updateTermsAgreement(termsData) {
    return api.put('/users/terms-agreement', termsData);
  }

  // USER MANAGEMENT (Admin functions)
  async getAllUsers(params = {}) {
    return api.get('/users/users', { params });
  }

  async getUserById(userId) {
    return api.get(`/users/users/${userId}`);
  }

  async updateUserStatus(userId, status) {
    return api.put(`/users/users/${userId}/status`, { status });
  }

  async deleteUser(userId) {
    return api.delete(`/users/users/${userId}`);
  }

  async getAdmins(params = {}) {
    return api.get('/users/admins', { params });
  }

  async updateDocumentVerification(userId, verificationData) {
    return api.put(`/users/users/${userId}/document-verification`, verificationData);
  }

  // ADDRESS MANAGEMENT
  async addAddress(addressData) {
    return api.post('/users/address', addressData);
  }

  async getAddresses() {
    return api.get('/users/address');
  }

  async updateAddress(addressId, addressData) {
    return api.put(`/users/address/${addressId}`, addressData);
  }

  async deleteAddress(addressId) {
    return api.delete(`/users/address/${addressId}`);
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
    return api.get('/users/address/get', { params });
  }

  // WISHLIST MANAGEMENT
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

}

const userService = new UserService();
export default userService;