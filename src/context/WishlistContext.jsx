import React, { createContext, useContext, useState, useEffect } from 'react';
import userService from '../services/userService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Wishlist state updated:', Array.from(wishlistItems));
  }, [wishlistItems]);

  // Load wishlist from backend or localStorage
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (isAuthenticated() && token) {
          // Load from backend for authenticated users
          const res = await userService.getWishlist();
          console.log('Wishlist API response:', res);
          
          // Handle different possible response structures with safe fallbacks
          let wishlistData = [];
          
          if (res && typeof res === 'object') {
            if (Array.isArray(res.wishlist)) {
              wishlistData = res.wishlist;
            } else if (res.data && Array.isArray(res.data.wishlist)) {
              wishlistData = res.data.wishlist;
            } else if (Array.isArray(res.data)) {
              wishlistData = res.data;
            } else if (Array.isArray(res)) {
              wishlistData = res;
            }
          }
          
          // Safely convert wishlist items to strings
          const wishlistIds = wishlistData
            .filter(item => item != null) // Remove null/undefined items
            .map(p => {
              if (typeof p === 'string') return p;
              if (typeof p === 'object' && p !== null) {
                return String(p._id || p.id || '');
              }
              return String(p || '');
            })
            .filter(id => id !== ''); // Remove empty strings
          
          console.log('Processed wishlist IDs:', wishlistIds);
          setWishlistItems(new Set(wishlistIds));
        } else {
          // Load from localStorage for guests
          const localWishlist = localStorage.getItem('guest_wishlist');
          if (localWishlist) {
            try {
              const parsedWishlist = JSON.parse(localWishlist);
              const wishlistIds = Array.isArray(parsedWishlist) 
                ? parsedWishlist.map(String).filter(id => id !== '')
                : [];
              setWishlistItems(new Set(wishlistIds));
            } catch (e) {
              console.error('Error parsing local wishlist:', e);
              setWishlistItems(new Set());
            }
          } else {
            setWishlistItems(new Set());
          }
        }
      } catch (err) {
        console.error('Error loading wishlist:', err);
        setError('Failed to load wishlist');
        setWishlistItems(new Set());
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();

    // Listen for logout event to clear wishlist
    const handleLogout = () => {
      setWishlistItems(new Set());
      localStorage.removeItem('guest_wishlist');
    };
    window.addEventListener('user-logged-out', handleLogout);
    return () => {
      window.removeEventListener('user-logged-out', handleLogout);
    };
  }, [token, isAuthenticated]);

  // Persist guest wishlist to localStorage
  useEffect(() => {
    if (!isAuthenticated() && !loading) {
      const wishlistArray = Array.from(wishlistItems);
      localStorage.setItem('guest_wishlist', JSON.stringify(wishlistArray));
    }
  }, [wishlistItems, isAuthenticated, loading]);

  // Remove all guest wishlist logic and syncing

  // Add to wishlist
  const addToWishlist = async (itemId) => {
    const stringItemId = String(itemId);
    console.log('addToWishlist called with:', stringItemId);
    setError(null);
    
    try {
      if (isAuthenticated() && token) {
        // Add to backend for authenticated users
        await userService.addToWishlist(stringItemId);
        
        // Update local state immediately
        setWishlistItems(prev => new Set([...prev, stringItemId]));
      } else {
        // Add to local storage for guests
        const newWishlist = new Set([...wishlistItems, stringItemId]);
        setWishlistItems(newWishlist);
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError('Failed to add item to wishlist');
      throw err;
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (itemId) => {
    const stringItemId = String(itemId);
    console.log('removeFromWishlist called with:', stringItemId);
    setError(null);
    
    try {
      if (isAuthenticated() && token) {
        // Remove from backend for authenticated users
        await userService.removeFromWishlist(stringItemId);
        
        // Update local state immediately
        setWishlistItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(stringItemId);
          return newSet;
        });
      } else {
        // Remove from local storage for guests
        const newWishlist = new Set(wishlistItems);
        newWishlist.delete(stringItemId);
        setWishlistItems(newWishlist);
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item from wishlist');
      throw err;
    }
  };

  // Toggle wishlist item
  const toggleWishlist = async (itemId) => {
    const stringItemId = String(itemId);
    
    if (wishlistItems.has(stringItemId)) {
      await removeFromWishlist(stringItemId);
    } else {
      await addToWishlist(stringItemId);
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (itemId) => {
    return wishlistItems.has(String(itemId));
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlistItems.size;
  };

  // Clear wishlist
  const clearWishlist = async () => {
    if (isAuthenticated() && token) {
      try {
        // For authenticated users, you'd need a backend endpoint to clear wishlist
        // For now, we'll just clear locally and let the sync handle it
        setWishlistItems(new Set());
      } catch (err) {
        console.error('Error clearing wishlist:', err);
        setError('Failed to clear wishlist');
      }
    } else {
      // For guests, clear localStorage
      setWishlistItems(new Set());
      localStorage.removeItem('guest_wishlist');
    }
  };

  // Refresh wishlist from backend (for authenticated users)
  const refreshWishlist = async () => {
    if (isAuthenticated() && token) {
      try {
        const res = await userService.getWishlist();
        
        // Handle response structure
        let wishlistData = [];
        if (res && typeof res === 'object') {
          if (Array.isArray(res.wishlist)) {
            wishlistData = res.wishlist;
          } else if (res.data && Array.isArray(res.data.wishlist)) {
            wishlistData = res.data.wishlist;
          } else if (Array.isArray(res.data)) {
            wishlistData = res.data;
          } else if (Array.isArray(res)) {
            wishlistData = res;
          }
        }
        
        // Safely convert wishlist items to strings
        const wishlistIds = wishlistData
          .filter(item => item != null)
          .map(p => {
            if (typeof p === 'string') return p;
            if (typeof p === 'object' && p !== null) {
              return String(p._id || p.id || '');
            }
            return String(p || '');
          })
          .filter(id => id !== '');
        
        setWishlistItems(new Set(wishlistIds));
      } catch (error) {
        console.error('Error refreshing wishlist:', error);
        setError('Failed to refresh wishlist');
      }
    }
  };

  const value = {
    wishlistItems,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    getWishlistCount,
    clearWishlist,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};