import React, { useEffect, useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import userService from '../../services/userService';
import WebService from '../../services/Website/WebService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import LoaderOverlay from '../../components/LoaderOverlay';

const WishlistPage = () => {
  const { wishlistItems, toggleWishlist, loading: wishlistLoading, error } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [removingItems, setRemovingItems] = useState(new Set());
  const navigate = useNavigate();
  const { addToCart, getCartItem, updateCartItem, removeFromCart } = useCart();

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      setLoading(true);
      try {
        if (isAuthenticated()) {
          // For authenticated users, get products from backend
          const res = await userService.getWishlist();
          console.log('WishlistPage - API response:', res);
          
          // Handle different possible response structures safely
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
          
          // Filter out null/undefined items and ensure we have valid product objects
          const validProducts = wishlistData.filter(item => 
            item != null && 
            typeof item === 'object' && 
            (item._id || item.id)
          );
          
          console.log('WishlistPage - Valid products:', validProducts);
          setProducts(validProducts);
        } else {
          // For guest users, fetch individual products
          const wishlistArray = Array.from(wishlistItems);
          if (wishlistArray.length > 0) {
            const productPromises = wishlistArray.map(async (productId) => {
              try {
                const res = await WebService.getProductById(productId);
                const product = res.data?.data || res.data;
                if (product && (product._id || product.id)) {
                  // Ensure prices and ItemPrices are arrays to prevent UI errors
                  if (!Array.isArray(product.prices)) product.prices = [];
                  if (!Array.isArray(product.ItemPrices)) product.ItemPrices = [];
                  return product;
                }
                return null;
              } catch (error) {
                console.error(`Error fetching product ${productId}:`, error);
                return null;
              }
            });

            const fetchedProducts = await Promise.all(productPromises);
            const validProducts = fetchedProducts.filter(product => product !== null);
            console.log('WishlistPage - Guest products:', validProducts);
            setProducts(validProducts);
          } else {
            setProducts([]);
          }
        }
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlistProducts();
  }, [isAuthenticated, wishlistItems]);

  const handleRemoveFromWishlist = async (itemId) => {
    const stringItemId = String(itemId);
    
    // Prevent multiple clicks
    if (removingItems.has(stringItemId) || wishlistLoading) return;
    
    setRemovingItems(prev => new Set([...prev, stringItemId]));
    
    try {
      await toggleWishlist(stringItemId);
      setNotification('Removed from wishlist');
      setTimeout(() => setNotification(''), 2000);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setNotification('Failed to remove from wishlist');
      setTimeout(() => setNotification(''), 2000);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(stringItemId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (itemId) => {
    try {
      await addToCart(itemId, 1);
      
      // Keep the item in wishlist - no automatic removal
      setNotification('Added to cart!');
      setTimeout(() => setNotification(''), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification('Failed to add to cart');
      setTimeout(() => setNotification(''), 2000);
    }
  };

  const getProductPrice = (product) => {
    // Extract price for default price list (2 = Delivery Price)
    if (Array.isArray(product.prices)) {
      const priceItem = product.prices.find(p => p.PriceList === 2);
      return priceItem ? priceItem.Price : 0;
    } else if (Array.isArray(product.ItemPrices)) {
      const priceItem = product.ItemPrices.find(p => p.PriceList === 2);
      return priceItem ? priceItem.Price : 0;
    } else if (product.price) {
      return typeof product.price === 'string'
        ? parseFloat(product.price.replace(/[^0-9.]/g, ''))
        : product.price;
    }
    return 0;
  };

  const formatPrice = (price) => {
    return `€${parseFloat(price || 0).toFixed(2)}`;
  };

  if (loading) {
    return <LoaderOverlay text="Loading wishlist..." />;
  }

  if (!products.length) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <Heart size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Start adding products you love!</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
          <p className="text-gray-600 mt-1">{products.length} item{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Continue Shopping
        </button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <div className="w-5 h-5 text-red-600 flex-shrink-0">⚠</div>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg ${
          notification.includes('Failed') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {notification}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => {
          const itemId = String(product._id || product.id);
          const inCart = !!getCartItem(itemId);
          const isRemoving = removingItems.has(itemId);
          const productPrice = getProductPrice(product);
          
          return (
            <div key={itemId} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                  alt={product.ItemName || product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => navigate(`/products/${itemId}`)}
                />
                
                {/* Remove button overlay */}
                <button
                  onClick={() => handleRemoveFromWishlist(itemId)}
                  disabled={isRemoving || wishlistLoading}
                  className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-200 ${
                    isRemoving 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-white hover:bg-red-50 hover:scale-110'
                  }`}
                  title="Remove from wishlist"
                >
                  {isRemoving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  ) : (
                    <Trash2 size={16} className="text-red-500" />
                  )}
                </button>
                
                {/* Stock status */}
                {product.QuantityOnStock !== undefined && (
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${
                    product.QuantityOnStock > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.QuantityOnStock > 0 ? 'In Stock' : 'Out of Stock'}
                  </div>
                )}
              </div>
              
              {/* Product Details */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 
                    className="font-semibold text-lg text-gray-800 line-clamp-2 cursor-pointer hover:text-red-600 transition-colors"
                    onClick={() => navigate(`/products/${itemId}`)}
                  >
                    {product.ItemName || product.name}
                  </h3>
                  {product.ItemCode && (
                    <p className="text-gray-500 text-sm">Code: {product.ItemCode}</p>
                  )}
                </div>
                
                {/* Price */}
                {productPrice > 0 && (
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(productPrice)}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  {/* Remove button removed, only trash icon overlay remains */}
                  {inCart ? (
                    <div className="flex items-center gap-2 bg-red-500 text-white rounded-xl px-3 py-2 flex-1">
                      <button
                        onClick={() => {
                          if ((getCartItem(itemId)?.quantity || 1) === 1) {
                            removeFromCart(itemId);
                          } else {
                            updateCartItem(itemId, (getCartItem(itemId)?.quantity || 1) - 1);
                          }
                        }}
                        disabled={getCartItem(itemId)?.quantity <= 0 || product.QuantityOnStock === 0}
                        className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-medium">{getCartItem(itemId)?.quantity || 1}</span>
                      <button
                        onClick={() => updateCartItem(itemId, (getCartItem(itemId)?.quantity || 1) + 1)}
                        disabled={product.QuantityOnStock !== undefined && getCartItem(itemId)?.quantity >= product.QuantityOnStock}
                        className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(itemId)}
                      disabled={product.QuantityOnStock !== undefined && product.QuantityOnStock === 0}
                      className={`flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium py-2.5 px-4 rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      {product.QuantityOnStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;