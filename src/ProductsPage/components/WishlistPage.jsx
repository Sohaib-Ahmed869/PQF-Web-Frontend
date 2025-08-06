import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import userService from '../../services/userService';
import WebService from '../../services/Website/WebService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

// Add CSS for fade-in animation and lazy loading
const fadeInStyle = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }
  .lazy-load {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
  }
  .lazy-load.loaded {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Inject the CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = fadeInStyle;
document.head.appendChild(styleSheet);

// Lazy Loading Component
const LazyProductCard = React.memo(({ product, index, onRemove, onAddToCart, inCart, isRemoving, productPrice, isAuthenticated, getCartItem, updateCartItem, removeFromCart, navigate, isLastProduct, lastProductRef }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const itemId = String(product._id || product.id);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, index * 100); // Stagger the loading

    return () => clearTimeout(timer);
  }, [index]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div 
      ref={isLastProduct ? lastProductRef : null}
      className={`group cursor-pointer lazy-load ${isLoaded ? 'loaded' : ''}`}
      onClick={() => navigate(`/product/${itemId}`)}
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      <div className="relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={product.image || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80'}
            alt={product.ItemName || product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80';
              setImageLoaded(true);
            }}
          />
          
          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-[#8e191c] rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Remove from Wishlist Button - Always visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(itemId);
            }}
            disabled={isRemoving || false}
            className={`absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm hover:scale-110 transition-all duration-200 ${
              isRemoving ? 'cursor-not-allowed' : ''
            }`}
            title="Remove from wishlist"
          >
            {isRemoving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            ) : (
              <Trash2 size={16} className="text-red-500" />
            )}
          </button>
        </div>
        
        {/* Product Info */}
        <div className="relative p-4">
          {/* Product Name */}
          <h3 className="text-sm font-semibold text-gray-800 text-center truncate mb-2">
            {product.ItemName || product.name}
          </h3>
          
          {/* Price */}
          <div className="text-center mb-3">
            <span className="text-sm font-medium" style={{ color: '#8e191c' }}>
              {isAuthenticated() ? (
                `AED ${productPrice ? productPrice.toFixed(2) : '0.00'}`
              ) : (
                'Login to see price'
              )}
            </span>
          </div>
          
          {/* Add to Cart Section */}
          <div className="flex items-center gap-2">
            {inCart ? (
              <div className="flex items-center gap-2 w-full py-2 px-4 rounded-lg font-medium" style={{ backgroundColor: '#8e191c', color: 'white' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if ((getCartItem(itemId)?.quantity || 1) === 1) {
                      removeFromCart(itemId);
                    } else {
                      updateCartItem(itemId, (getCartItem(itemId)?.quantity || 1) - 1);
                    }
                  }}
                  disabled={getCartItem(itemId)?.quantity <= 0 || product.QuantityOnStock === 0}
                  className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                >
                  -
                </button>
                <span className="flex-1 text-center font-medium">{getCartItem(itemId)?.quantity || 1}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateCartItem(itemId, (getCartItem(itemId)?.quantity || 1) + 1);
                  }}
                  disabled={product.QuantityOnStock !== undefined && getCartItem(itemId)?.quantity >= product.QuantityOnStock}
                  className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(itemId);
                }}
                disabled={product.QuantityOnStock !== undefined && product.QuantityOnStock === 0}
                className="w-full py-2 px-4 rounded-lg font-medium text-white"
                style={{
                  backgroundColor: product.QuantityOnStock === 0 ? '#gray-400' : '#8e191c'
                }}
              >
                <span className="flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.QuantityOnStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

LazyProductCard.displayName = 'LazyProductCard';

const WishlistPage = () => {
  const { wishlistItems, toggleWishlist, loading: wishlistLoading, error } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [removingItems, setRemovingItems] = useState(new Set());
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();
  const navigate = useNavigate();
  const { addToCart, getCartItem, updateCartItem, removeFromCart } = useCart();
  
  const ITEMS_PER_PAGE = 12;

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

  // Reset pagination when products change
  useEffect(() => {
    setCurrentPage(1);
    setVisibleProducts(products.slice(0, ITEMS_PER_PAGE));
    setHasMore(products.length > ITEMS_PER_PAGE);
  }, [products]);

  // Load more products
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newProducts = products.slice(startIndex, endIndex);
    
    setVisibleProducts(prev => [...prev, ...newProducts]);
    setCurrentPage(nextPage);
    setHasMore(endIndex < products.length);
    setLoadingMore(false);
  }, [currentPage, products, loadingMore, hasMore]);

  // Intersection Observer for infinite scroll
  const lastProductRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, loadMore]);

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
    return `د.إ${parseFloat(price || 0).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
            <p className="text-gray-600 mt-1">Loading...</p>
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
      
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
         {visibleProducts.map((product, index) => {
           const itemId = String(product._id || product.id);
           const inCart = !!getCartItem(itemId);
           const isRemoving = removingItems.has(itemId);
           const productPrice = getProductPrice(product);
           const isLastProduct = index === visibleProducts.length - 1;
           
           return (
             <LazyProductCard
               key={itemId}
               product={product}
               index={index}
               onRemove={handleRemoveFromWishlist}
               onAddToCart={handleAddToCart}
               inCart={inCart}
               isRemoving={isRemoving}
               productPrice={productPrice}
               isAuthenticated={isAuthenticated}
               getCartItem={getCartItem}
               updateCartItem={updateCartItem}
               removeFromCart={removeFromCart}
               navigate={navigate}
               isLastProduct={isLastProduct}
               lastProductRef={lastProductRef}
             />
           );
         })}
       </div>
       
       {/* Loading More Indicator */}
       {loadingMore && (
         <div className="flex justify-center items-center py-8">
           <div className="flex items-center gap-3">
             <div className="w-6 h-6 border-2 border-gray-300 border-t-[#8e191c] rounded-full animate-spin"></div>
             <span className="text-gray-600">Loading more products...</span>
           </div>
         </div>
       )}
       
       {/* No More Products Indicator */}
       {!hasMore && visibleProducts.length > 0 && (
         <div className="text-center py-8">
           <p className="text-gray-500">No more products to load</p>
         </div>
       )}
     </div>
   );
 };

export default WishlistPage;