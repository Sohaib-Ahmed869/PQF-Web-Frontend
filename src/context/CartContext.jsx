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

  // Sync guest cart with backend when user logs in
  useEffect(() => {
    const syncGuestCart = async () => {
      if (isAuthenticated() && token) {
        const localCart = localStorage.getItem('guest_cart');
        if (localCart) {
          try {
            const guestCart = JSON.parse(localCart);
            if (guestCart.items && guestCart.items.length > 0) {
              // Sync each item to backend
              for (const item of guestCart.items) {
                let productId = item.product;
                if (typeof productId === 'object' && productId !== null) {
                  productId = productId._id || productId.id || '';
                }
                if (typeof productId === 'string' && productId.length > 0) {
                  await addToCart(productId, item.quantity, false); // Don't reload cart for each item
                }
              }
              // Clear guest cart
              localStorage.removeItem('guest_cart');
              // Reload cart from backend
              const res = await cartService.getCart(token);
              const cartData = res.data?.data || res.data || { items: [] };
              cartData.total = calculateTotal(Array.isArray(cartData.items) ? cartData.items : []);
              setCart(cartData);
            }
          } catch (e) {
            console.error('Error syncing guest cart:', e);
          }
        }
      }
    };

    syncGuestCart();
  }, [isAuthenticated, token]);

  // Cart actions
  const addToCart = async (productId, quantity = 1, shouldReload = true) => {
    console.log('addToCart called with:', { productId, quantity });
    setError(null);
    
    try {
      if (isAuthenticated() && token) {
        // Add to backend for authenticated users
        const res = await cartService.addItem(productId, quantity, token, selectedStore?._id);
        const cartData = res.data?.data || res.data || { items: [] };
        cartData.total = calculateTotal(Array.isArray(cartData.items) ? cartData.items : []);
        setCart(cartData);
      } else {
        // Add to local storage for guests
        const newCart = { ...cart, items: Array.isArray(cart.items) ? [...cart.items] : [] };
        const existingItemIndex = newCart.items.findIndex(
          item => {
            const itemProductId = item.product?._id || item.product?.id || item.product;
            return String(itemProductId) === String(productId);
          }
        );
        
        if (existingItemIndex > -1) {
          // Update existing item
          newCart.items[existingItemIndex].quantity += quantity;
        } else {
          // Fetch product details for guests using WebService
          let productDetails = { _id: productId };
          let price = 0;
          try {
            const res = await WebService.getProductById(productId);
            productDetails = res.data?.data || res.data || { _id: productId };
            // Ensure prices and ItemPrices are arrays to prevent UI errors
            if (!Array.isArray(productDetails.prices)) productDetails.prices = [];
            if (!Array.isArray(productDetails.ItemPrices)) productDetails.ItemPrices = [];
            // Extract price for default price list (2 = Delivery Price)
            if (Array.isArray(productDetails.prices)) {
              const priceItem = productDetails.prices.find(p => p.PriceList === 2);
              price = priceItem ? priceItem.Price : 0;
            } else if (Array.isArray(productDetails.ItemPrices)) {
              const priceItem = productDetails.ItemPrices.find(p => p.PriceList === 2);
              price = priceItem ? priceItem.Price : 0;
            } else if (productDetails.price) {
              price = typeof productDetails.price === 'string'
                ? parseFloat(productDetails.price.replace(/[^0-9.]/g, ''))
                : productDetails.price;
            }
          } catch (e) {
            console.error('Error fetching product details for guest cart:', e);
          }
          // Check again for existing item (in case productDetails._id is different format)
          const idx = newCart.items.findIndex(
            item => {
              const itemProductId = item.product?._id || item.product?.id || item.product;
              const targetProductId = productDetails._id || productDetails.id || productId;
              return String(itemProductId) === String(targetProductId);
            }
          );
          if (idx > -1) {
            newCart.items[idx].quantity += quantity;
          } else {
            newCart.items.push({ 
              product: productDetails, 
              quantity,
              price
            });
          }
        }
        
        newCart.total = calculateTotal(newCart.items);
        setCart(newCart);
      }
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