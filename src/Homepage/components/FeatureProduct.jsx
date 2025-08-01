import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import webService from '../../services/Website/WebService';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNavigate } from 'react-router-dom';

// Simple Product Card Component
const ProductCard = React.memo(({ product, onAddToCart, onToggleWishlist, index, isInWishlist }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  return (
    <div 
      className="group cursor-pointer transform transition-all duration-300 ease-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      <div className={`
        relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden 
        transition-all duration-300 ease-out transform
        ${isHovered ? 'scale-105 shadow-2xl -translate-y-2' : 'hover:scale-102 hover:shadow-xl'}
      `}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={product.image}
            alt={product.ItemName}
            className={`
              w-full h-full object-cover transition-all duration-500 ease-out
              ${isHovered ? 'scale-110 brightness-110' : 'group-hover:scale-105'}
            `}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80';
            }}
          />
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id); // Pass only the ID
            }}
            className={`
              absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center
              transform transition-all duration-300 backdrop-blur-sm
              ${isHovered ? 'scale-110' : 'scale-0'}
            `}
          >
            <Heart className={`w-4 h-4 transition-colors duration-200 ${isInWishlist ? 'fill-current' : ''}`} style={{ color: '#8e191c' }} />
          </button>
        </div>
        
        {/* Product Info */}
        <div className="relative p-4">
          {/* Product Name */}
          <h3 className={`
            text-sm font-semibold text-gray-800 text-center truncate mb-2
            transition-all duration-300
            ${isHovered ? 'transform scale-105' : ''}
          `}>
            {product.ItemName}
          </h3>
          
          {/* Price */}
          <div className="text-center mb-3">
            {/* Main Price */}
            <span className="text-sm font-medium" style={{ color: '#8e191c' }}>
              AED {(() => {
                if (product.prices && product.prices.length > 0) {
                  const mainPrice = product.prices.find(p => p.PriceList === 1);
                  return mainPrice ? mainPrice.Price.toFixed(2) : '0.00';
                }
                return product.price ? product.price.toFixed(2) : '0.00';
              })()}
            </span>
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAddingToCart(true);
              onAddToCart(product);
              setTimeout(() => setIsAddingToCart(false), 1000);
            }}
            disabled={isAddingToCart}
            className={`
              w-full py-2 px-4 rounded-lg font-medium transition-all duration-300
              ${isAddingToCart 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'text-white hover:scale-105'
              }
            `}
            style={{
              backgroundColor: isAddingToCart ? undefined : '#8e191c',
              ':hover': {
                backgroundColor: isAddingToCart ? undefined : '#7a1518'
              }
            }}
          >
            {isAddingToCart ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Adding...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

const FeatureProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { selectedStore } = useStore();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  // Fallback products
  const fallbackProducts = useMemo(() => [
    { 
      id: '1', 
      ItemName: 'Fresh Organic Apples', 
      image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
      price: 12.99,
      ItemCode: 'APP001'
    },
    { 
      id: '2', 
      ItemName: 'Premium Whole Milk', 
      image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
      price: 8.50,
      ItemCode: 'MLK002'
    },
    { 
      id: '3', 
      ItemName: 'Artisan Sourdough Bread', 
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      price: 6.99,
      ItemCode: 'BRD003'
    },
    { 
      id: '4', 
      ItemName: 'Fresh Farm Eggs', 
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
      price: 15.99,
      ItemCode: 'EGG004'
    },
    { 
      id: '5', 
      ItemName: 'Organic Bananas', 
      image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
      price: 9.99,
      ItemCode: 'BAN005'
    },
    { 
      id: '6', 
      ItemName: 'Premium Olive Oil', 
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
      price: 24.99,
      ItemCode: 'OIL006'
    },
    { 
      id: '7', 
      ItemName: 'Fresh Tomatoes', 
      image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      price: 7.50,
      ItemCode: 'TOM007'
    },
    { 
      id: '8', 
      ItemName: 'Organic Honey', 
      image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=400&q=80',
      price: 18.99,
      ItemCode: 'HON008'
    },
    { 
      id: '9', 
      ItemName: 'Fresh Strawberries', 
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80',
      price: 14.99,
      ItemCode: 'STR009'
    },
    { 
      id: '10', 
      ItemName: 'Greek Yogurt', 
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
      price: 11.50,
      ItemCode: 'YOG010'
    },
    { 
      id: '11', 
      ItemName: 'Fresh Spinach', 
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80',
      price: 5.99,
      ItemCode: 'SPI011'
    },
    { 
      id: '12', 
      ItemName: 'Premium Coffee Beans', 
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80',
      price: 32.99,
      ItemCode: 'COF012'
    },
    { 
      id: '13', 
      ItemName: 'Fresh Avocados', 
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80',
      price: 8.99,
      ItemCode: 'AVO013'
    },
    { 
      id: '14', 
      ItemName: 'Organic Quinoa', 
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
      price: 16.50,
      ItemCode: 'QUI014'
    },
    { 
      id: '15', 
      ItemName: 'Fresh Bell Peppers', 
      image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=400&q=80',
      price: 6.50,
      ItemCode: 'PEP015'
    },
  ], []);

  // Fetch featured products from API
  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await webService.getFeaturedProducts();
        
        if (!isMounted) return;
        
        let apiProducts = Array.isArray(response.data?.data) ? response.data.data : [];
        
        const formattedProducts = apiProducts.map(product => ({
          id: product._id || product.id, // Ensure we have an ID
          ItemName: product.ItemName,
          image: product.image,
          price: product.price,
          prices: product.prices,
          ItemCode: product.ItemCode
        }));
        
        setProducts(formattedProducts);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load featured products. Showing default products.');
        setProducts(fallbackProducts);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [selectedStore, fallbackProducts]);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.ItemName,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  // Fixed wishlist toggle handler
  const handleToggleWishlist = async (productId) => {
    try {
      console.log('Toggling wishlist for product ID:', productId);
      await toggleWishlist(productId);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // You could add a toast notification here
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="px-3 py-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-gray-500">{error}</span>
      </div>
    );
  }

  return (
    <div className="px-3 py-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-3" style={{ background: 'linear-gradient(to right, #8e191c, #8e191c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Featured Products
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Discover our handpicked premium products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              isInWishlist={isInWishlist(product.id)}
              index={index}
            />
          ))}
        </div>

        {/* No products message */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No featured products</h3>
            <p className="text-gray-500">Check back later for new products</p>
          </div>
        )}

        {/* Explore All Products Button - Bottom */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-8 py-4 bg-white border-2 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            style={{ 
              backgroundColor: '#8e191c',
              borderColor: '#8e191c'
            }}
          >
            <span>Explore All Products</span>
            <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureProduct;