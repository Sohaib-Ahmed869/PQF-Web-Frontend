import api from './api';

const promotionService = {
  // Create a new promotion (Admin/SuperAdmin only)
  createPromotion: async (promotionData, token) => {
    try {
      const response = await api.post('/promotions/create', promotionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  },

  // Get all promotions for a store
  getPromotions: async (token, params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      
      // If token is provided, use authenticated endpoint, otherwise use public endpoint
      if (token) {
        const response = await api.get(`/promotions?${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response;
      } else {
        // Use public endpoint for unauthenticated access
        const response = await api.get(`/promotions/public?${queryParams}`);
        return response;
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  },

  // Get public promotions for a store (no authentication required)
  getPublicPromotions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/promotions/public?${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error fetching public promotions:', error);
      throw error;
    }
  },

  // Get a specific promotion
  getPromotion: async (promotionId, token) => {
    try {
      const response = await api.get(`/promotions/${promotionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Error fetching promotion:', error);
      throw error;
    }
  },

  // Update a promotion (Admin/SuperAdmin only)
  updatePromotion: async (promotionId, updateData, token) => {
    try {
      const response = await api.put(`/promotions/${promotionId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  },

  // Delete a promotion (Admin/SuperAdmin only)
  deletePromotion: async (promotionId, token) => {
    try {
      const response = await api.delete(`/promotions/${promotionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  },

  // Apply promotion to cart
  applyPromotionToCart: async (promotionId, cartId, token) => {
    try {
      const response = await api.post('/promotions/apply-to-cart', {
        promotionId,
        cartId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Error applying promotion to cart:', error);
      throw error;
    }
  },

  // Get applicable promotions for a cart
  getApplicablePromotions: async (cartId, storeId, token) => {
    try {
      const response = await api.get(`/promotions/applicable/cart?cartId=${cartId}&storeId=${storeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Error fetching applicable promotions:', error);
      throw error;
    }
  },

  // Validate promotion code
  validatePromotionCode: async (code, cartId, storeId, token) => {
    try {
      const response = await api.post('/promotions/validate-code', {
        code,
        cartId,
        storeId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Error validating promotion code:', error);
      throw error;
    }
  },

  // Get promotion statistics (Admin/SuperAdmin only)
  getPromotionStats: async (promotionId, token) => {
    try {
      const response = await api.get(`/promotions/${promotionId}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Error fetching promotion stats:', error);
      throw error;
    }
  },

  // Apply promotion using code (for cart)
  applyPromotionByCode: async (code, cartId, storeId, token) => {
    try {
      const response = await api.post('/cart/apply-promotion', {
        promotionCode: code
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Error applying promotion by code:', error);
      throw error;
    }
  },

  // Get applicable promotions for current cart
  getCartApplicablePromotions: async (storeId, token) => {
    try {
      const response = await api.get(`/cart/applicable-promotions?storeId=${storeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Error fetching cart applicable promotions:', error);
      throw error;
    }
  },

  // Get consumed promotions for a user
  getUserConsumedPromotions: async (token, params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/promotions/user/consumed?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Error fetching user consumed promotions:', error);
      throw error;
    }
  },

  // Remove a specific promotion from cart
  removePromotion: async (cartId, promotionId, token) => {
    try {
      const response = await api.delete(`/cart/promotions/${promotionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Error removing promotion from cart:', error);
      throw error;
    }
  },

  // Remove all promotions from cart
  removeAllPromotions: async (cartId, token) => {
    try {
      const response = await api.delete('/cart/promotions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('Error removing all promotions from cart:', error);
      throw error;
    }
  }
};

export default promotionService; 