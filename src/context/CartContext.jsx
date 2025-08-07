import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import WebService from '../services/Website/WebService';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const { selectedStore } = useStore();
  const [cart, setCart] = useState({ 
    items: [], 
    total: 0,
    originalTotal: 0,
    finalTotal: 0,
    totalDiscount: 0,
    appliedPromotions: [],
    appliedDiscounts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Cart state updated:', cart);
  }, [cart]);

  // Enhanced calculate total with proper discount handling
  const calculateTotal = (items, appliedDiscounts = []) => {
    // Calculate the base total from items
    const itemsTotal = items.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      
      // If item is free or has free quantity, only charge for the non-free portion
      if (item.isFreeItem) {
        // If the entire item is free, don't add anything to total
        return sum;
      } else if (item.freeQuantity && item.freeQuantity > 0) {
        // If item has free quantity, only charge for the non-free portion
        const chargeableQuantity = quantity - item.freeQuantity;
        return sum + (price * Math.max(0, chargeableQuantity));
      } else {
        // Regular item, charge full price
        return sum + (price * quantity);
      }
    }, 0);

    // Calculate total discount from applied promotions
    const totalDiscount = appliedDiscounts.reduce((sum, discount) => {
      return sum + (discount.discountAmount || 0);
    }, 0);

    return {
      originalTotal: itemsTotal,
      totalDiscount: totalDiscount,
      finalTotal: Math.max(0, itemsTotal - totalDiscount)
    };
  };

  // Process cart data from backend
  const processCartData = (cartData) => {
    const items = Array.isArray(cartData.items) ? cartData.items : [];
    const appliedDiscounts = cartData.appliedDiscounts || [];
    const appliedPromotions = cartData.appliedPromotions || [];

    // Calculate totals
    const totals = calculateTotal(items, appliedDiscounts);

    // Debug: Log cart processing for development
    // console.log('🛒 Processing cart data:', {
    //   itemsCount: items.length,
    //   appliedPromotions: appliedPromotions.length,
    //   appliedDiscounts: appliedDiscounts.length,
    //   backendTotals: {
    //     originalTotal: cartData.originalTotal,
    //     finalTotal: cartData.finalTotal,
    //     totalDiscount: cartData.totalDiscount
    //   },
    //   calculatedTotals: totals
    // });

    return {
      ...cartData,
      items,
      appliedDiscounts,
      appliedPromotions,
      originalTotal: cartData.originalTotal || totals.originalTotal,
      totalDiscount: cartData.totalDiscount || totals.totalDiscount,
      finalTotal: cartData.finalTotal || totals.finalTotal,
      total: cartData.finalTotal || totals.finalTotal, // Keep for backward compatibility
    };
  };

  // Load cart from backend or localStorage
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (isAuthenticated() && token) {
          // Load from backend for authenticated users
          const res = await cartService.getCart(token);
          const cartData = res.data?.data || res.data || { items: [] };
          const processedCart = processCartData(cartData);
          setCart(processedCart);
        } else {
          // Load from localStorage for guests
          const localCart = localStorage.getItem('guest_cart');
          if (localCart) {
            try {
              const parsedCart = JSON.parse(localCart);
              const processedCart = processCartData(parsedCart);
              setCart(processedCart);
            } catch (e) {
              console.error('Error parsing local cart:', e);
              setCart({ 
                items: [], 
                total: 0,
                originalTotal: 0,
                finalTotal: 0,
                totalDiscount: 0,
                appliedPromotions: [],
                appliedDiscounts: []
              });
            }
          } else {
            setCart({ 
              items: [], 
              total: 0,
              originalTotal: 0,
              finalTotal: 0,
              totalDiscount: 0,
              appliedPromotions: [],
              appliedDiscounts: []
            });
          }
        }
      } catch (err) {
        console.error('Error loading cart:', err);
        setError('Failed to load cart');
        setCart({ 
          items: [], 
          total: 0,
          originalTotal: 0,
          finalTotal: 0,
          totalDiscount: 0,
          appliedPromotions: [],
          appliedDiscounts: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [token, isAuthenticated]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated() && !loading) {
      localStorage.setItem('guest_cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated, loading]);

  // Cart actions
  const addToCart = async (productId, quantity = 1, shouldReload = true) => {
    if (!isAuthenticated() || !token) {
      setError('You must be logged in to add items to the cart.');
      throw new Error('You must be logged in to add items to the cart.');
    }
    setError(null);
    try {
      // Add to backend for authenticated users
      const res = await cartService.addItem(productId, quantity, token, selectedStore?._id);
      const cartData = res.data?.data || res.data || { items: [] };
      const processedCart = processCartData(cartData);
      setCart(processedCart);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart');
      throw err;
    }
  };

  const removeFromCart = async (productId, storeId) => {
    setError(null);
    
    try {
      if (isAuthenticated() && token) {
        const res = await cartService.removeItem(productId, token, storeId || selectedStore?._id);
        const cartData = res.data?.data || res.data || { items: [] };
        const processedCart = processCartData(cartData);
        setCart(processedCart);
      } else {
        const newItems = cart.items.filter(
          item => {
            const itemProductId = item.product?._id || item.product?.id || item.product;
            return String(itemProductId) !== String(productId);
          }
        );
        const processedCart = processCartData({ ...cart, items: newItems });
        setCart(processedCart);
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart');
      throw err;
    }
  };

  const updateCartItem = async (productId, quantity) => {
    if (quantity < 1) {
      return removeFromCart(productId);
    }
    
    setError(null);
    
    try {
      if (isAuthenticated() && token) {
        const res = await cartService.updateItem(productId, quantity, token, selectedStore?._id);
        const cartData = res.data?.data || res.data || { items: [] };
        const processedCart = processCartData(cartData);
        setCart(processedCart);
      } else {
        const newCart = { ...cart };
        const itemIndex = newCart.items.findIndex(
          item => {
            const itemProductId = item.product?._id || item.product?.id || item.product;
            return String(itemProductId) === String(productId);
          }
        );
        
        if (itemIndex > -1) {
          newCart.items[itemIndex].quantity = quantity;
          const processedCart = processCartData(newCart);
          setCart(processedCart);
        }
      }
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError('Failed to update cart item');
      throw err;
    }
  };

  const clearCart = async () => {
    if (isAuthenticated() && token) {
      try {
        await cartService.clearCart(token, selectedStore?._id);
        setCart({ 
          items: [], 
          total: 0,
          originalTotal: 0,
          finalTotal: 0,
          totalDiscount: 0,
          appliedPromotions: [],
          appliedDiscounts: []
        });
      } catch (err) {
        setError('Failed to clear cart');
        console.error('Error clearing cart:', err);
      }
    } else {
      setCart({ 
        items: [], 
        total: 0,
        originalTotal: 0,
        finalTotal: 0,
        totalDiscount: 0,
        appliedPromotions: [],
        appliedDiscounts: []
      });
      localStorage.removeItem('guest_cart');
    }
  };

  const checkout = async (orderData = {}) => {
    setError(null);
    
    try {
      if (isAuthenticated() && token) {
        const res = await cartService.checkout(token, orderData);
        setCart({ 
          items: [], 
          total: 0,
          originalTotal: 0,
          finalTotal: 0,
          totalDiscount: 0,
          appliedPromotions: [],
          appliedDiscounts: []
        });
        return res.data;
      } else {
        // For guests, you might want to redirect to login or handle guest checkout
        throw new Error('Please log in to checkout');
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      setError('Checkout failed');
      throw err;
    }
  };

  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const isInCart = (productId) => {
    return cart.items.some(item => {
      const itemProductId = item.product?._id || item.product?.id || item.product;
      return String(itemProductId) === String(productId);
    });
  };

  const getCartItem = (productId) => {
    return cart.items.find(item => {
      const itemProductId = item.product?._id || item.product?.id || item.product;
      return String(itemProductId) === String(productId);
    });
  };

  // Add reorderItems method
  const reorderItems = async (orderId) => {
    if (!isAuthenticated() || !token) {
      setError('You must be logged in to reorder items.');
      throw new Error('You must be logged in to reorder items.');
    }
    setError(null);
    try {
      // Use axios instance to ensure correct baseURL and proxy
      const response = await api.post(`/web/orders/${orderId}/reorder`);
      if (!response.data || !response.data.success) {
        throw new Error('Failed to reorder items');
      }
      // Refresh the cart to get the updated state
      const cartRes = await cartService.getCart(token);
      const cartData = cartRes.data?.data || cartRes.data || { items: [] };
      const processedCart = processCartData(cartData);
      setCart(processedCart);
      return response.data.data;
    } catch (err) {
      console.error('Error reordering items:', err);
      setError('Failed to reorder items');
      throw err;
    }
  };

  // Add reorderAbandonedCart method
  const reorderAbandonedCart = async (cartId) => {
    if (!isAuthenticated() || !token) {
      setError('You must be logged in to reorder items.');
      throw new Error('You must be logged in to reorder items.');
    }
    setError(null);
    try {
      const response = await api.post(`/web/cart/abandoned/${cartId}/reorder`);
      if (!response.data || !response.data.success) {
        throw new Error('Failed to reorder items from abandoned cart');
      }
      // Refresh the cart to get the updated state
      const cartRes = await cartService.getCart(token);
      const cartData = cartRes.data?.data || cartRes.data || { items: [] };
      const processedCart = processCartData(cartData);
      setCart(processedCart);
      return response.data.data;
    } catch (err) {
      console.error('Error reordering items from abandoned cart:', err);
      setError('Failed to reorder items from abandoned cart');
      throw err;
    }
  };

  // Method to refresh cart data (useful after promotions)
  const refreshCart = async () => {
    if (isAuthenticated() && token) {
      try {
        const res = await cartService.getCart(token);
        const cartData = res.data?.data || res.data || { items: [] };
        const processedCart = processCartData(cartData);
        setCart(processedCart);
        return processedCart;
      } catch (err) {
        console.error('Error refreshing cart:', err);
        setError('Failed to refresh cart');
        throw err;
      }
    }
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    checkout,
    getCartItemCount,
    isInCart,
    getCartItem,
    setCart,
    refreshCart,
    reorderItems,
    reorderAbandonedCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};