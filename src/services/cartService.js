import api from './api';

const cartService = {
  // Get user's cart
  getCart: async (token) => {
    try {
      const response = await api.get('/cart', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      return response;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add item to cart
  addItem: async (productId, quantity, token, store) => {
    try {
      const response = await api.post('/cart/add', 
        { productId, quantity, store }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeItem: async (productId, token, store) => {
    try {
      const response = await api.post('/cart/remove', 
        { productId, store }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  },

  // Update item quantity
  updateItem: async (productId, quantity, token, store) => {
    try {
      const response = await api.post('/cart/update', 
        { productId, quantity, store }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Checkout cart
  checkout: async (token, orderData = {}) => {
    try {
      const response = await api.post('/cart/checkout', 
        orderData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response;
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async (token, store) => {
    try {
      const response = await api.post('/cart/clear', 
        { store }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Get abandoned carts (admin)
  getAbandonedCarts: async (token, hours = 24) => {
    try {
      const response = await api.get(`/cart/abandoned?hours=${hours}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response;
    } catch (error) {
      console.error('Error fetching abandoned carts:', error);
      throw error;
    }
  }
};

export default cartService;