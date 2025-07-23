import React, { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import WebService from '../services/Website/WebService';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';

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
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Cart state updated:', cart);
  }, [cart]);

  // Calculate cart total
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);
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
          cartData.total = calculateTotal(Array.isArray(cartData.items) ? cartData.items : []);
          setCart(cartData);
        } else {
          // Load from localStorage for guests
          const localCart = localStorage.getItem('guest_cart');
          if (localCart) {
            try {
              const parsedCart = JSON.parse(localCart);
              parsedCart.total = calculateTotal(parsedCart.items || []);
              setCart(parsedCart);
            } catch (e) {
              console.error('Error parsing local cart:', e);
              setCart({ items: [], total: 0 });
            }
          } else {
            setCart({ items: [], total: 0 });
          }
        }
      } catch (err) {
        console.error('Error loading cart:', err);
        setError('Failed to load cart');
        setCart({ items: [], total: 0 });
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

  // Remove all guest cart logic and syncing

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
      cartData.total = calculateTotal(Array.isArray(cartData.items) ? cartData.items : []);
      setCart(cartData);
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
        cartData.total = calculateTotal(Array.isArray(cartData.items) ? cartData.items : []);
        setCart(cartData);
      } else {
        const newCart = { 
          ...cart, 
          items: cart.items.filter(
            item => {
              const itemProductId = item.product?._id || item.product?.id || item.product;
              return String(itemProductId) !== String(productId);
            }
          ) 
        };
        newCart.total = calculateTotal(newCart.items);
        setCart(newCart);
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
        cartData.total = calculateTotal(Array.isArray(cartData.items) ? cartData.items : []);
        setCart(cartData);
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
          newCart.total = calculateTotal(newCart.items);
          setCart(newCart);
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
        setCart({ items: [], total: 0 });
      } catch (err) {
        setError('Failed to clear cart');
        console.error('Error clearing cart:', err);
      }
    } else {
      setCart({ items: [], total: 0 });
      localStorage.removeItem('guest_cart');
    }
  };

  const checkout = async (orderData = {}) => {
    setError(null);
    
    try {
      if (isAuthenticated() && token) {
        const res = await cartService.checkout(token, orderData);
        setCart({ items: [], total: 0 });
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
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};