import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Eye, Snowflake, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import webService from '../../services/Website/WebService';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

// Fallback products in case API fails or returns no data
const fallbackProducts = [
  {
    _id: 'fallback1',
    ItemName: 'Premium Chicken Breast',
    images: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'],
    price: '€8.99',
    rating: 4.5,
    reviews: 120,
    CategoryName: 'Meat',
    halal: 'tYES',
    prices: [{ PriceList: 2, Price: 8.99 }],
  },
  {
    _id: 'fallback2',
    ItemName: 'Organic Frozen Peas',
    images: ['https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80'],
    price: '€3.49',
    rating: 4.2,
    reviews: 85,
    CategoryName: 'Vegetables',
    frozen: 'tYES',
    prices: [{ PriceList: 2, Price: 3.49 }],
  },
  {
    _id: 'fallback3',
    ItemName: 'Fresh Basmati Rice',
    images: ['https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80'],
    price: '€5.99',
    rating: 4.8,
    reviews: 200,
    CategoryName: 'Grains',
    prices: [{ PriceList: 2, Price: 5.99 }],
  },
];

const TopProductsPage = () => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addingToCart, setAddingToCart] = useState({});
  const [addToCartError, setAddToCartError] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedStore } = useStore();
  const { addToCart, isInCart, getCartItem, updateCartItem, removeFromCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await webService.getFeaturedProducts();
        // Try to extract products from various possible response shapes
        const productsData = response.data?.data?.products || response.data?.data || response.data || [];
        const productsArray = Array.isArray(productsData) ? productsData.slice(0, 3) : [];
        if (productsArray.length > 0) {
          setProducts(productsArray);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (err) {
        setError('Failed to load products. Showing featured products.');
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedStore]);

  const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const productId = product._id || product.id;
    const isFavorite = isInWishlist(productId);
    const inCart = isInCart(productId);
    const cartItem = getCartItem(productId);
    const quantity = cartItem ? cartItem.quantity : 0;
    const isAdding = addingToCart[productId] || false;
    const errorMsg = addToCartError[productId] || null;

    const HalalIcon = () => (
      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    );

    // Determine tag and tagType
    let tag = '';
    let tagType = '';
    if (product.halal === 'tYES' || product.Properties1 === 'tYES') {
      tag = 'HALAL';
      tagType = 'halal';
    } else if (product.frozen === 'tYES' || product.Frozen === 'tYES') {
      tag = 'FROZEN';
      tagType = 'frozen';
    }

    // Get product image
    let image = '';
    if (product.images && product.images.length > 0) image = product.images[0];
    else if (product.image) image = product.image;
    else image = 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1000&q=80';

    // Get product name
    const name = product.ItemName || product.name || '';
    // Get product price
    let price = '';
    if (product.prices && Array.isArray(product.prices)) {
      const priceItem = product.prices.find(p => p.PriceList === 2); // Delivery Price
      price = priceItem ? priceItem.Price : 0;
    } else if (product.ItemPrices && Array.isArray(product.ItemPrices)) {
      const priceItem = product.ItemPrices.find(p => p.PriceList === 2);
      price = priceItem ? priceItem.Price : 0;
    } else if (product.price) {
      const priceNum = parseFloat(product.price.replace('€', ''));
      price = isNaN(priceNum) ? 0 : priceNum;
    } else {
      price = 0;
    }
    // Get product rating and reviews
    const rating = product.rating || 0;
    const reviews = product.reviews || 0;
    // Get product category
    const category = product.CategoryName || product.category || '';

    // Add to Cart handler
    const handleAddToCart = async () => {
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      setAddToCartError(prev => ({ ...prev, [productId]: null }));
      try {
        await addToCart(productId, 1);
      } catch (err) {
        setAddToCartError(prev => ({ ...prev, [productId]: err.message || 'Failed to add to cart' }));
        setTimeout(() => setAddToCartError(prev => ({ ...prev, [productId]: null })), 4000);
      } finally {
        setAddingToCart(prev => ({ ...prev, [productId]: false }));
      }
    };

    // Quantity handlers
    const handleIncrement = async () => {
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      setAddToCartError(prev => ({ ...prev, [productId]: null }));
      try {
        await addToCart(productId, 1);
      } catch (err) {
        setAddToCartError(prev => ({ ...prev, [productId]: err.message || 'Failed to add to cart' }));
        setTimeout(() => setAddToCartError(prev => ({ ...prev, [productId]: null })), 4000);
      } finally {
        setAddingToCart(prev => ({ ...prev, [productId]: false }));
      }
    };
    const handleDecrement = async () => {
      if (quantity === 1) {
        setAddingToCart(prev => ({ ...prev, [productId]: true }));
        setAddToCartError(prev => ({ ...prev, [productId]: null }));
        try {
          await removeFromCart(productId);
        } catch (err) {
          setAddToCartError(prev => ({ ...prev, [productId]: err.message || 'Failed to remove from cart' }));
          setTimeout(() => setAddToCartError(prev => ({ ...prev, [productId]: null })), 4000);
        } finally {
          setAddingToCart(prev => ({ ...prev, [productId]: false }));
        }
      } else if (quantity > 1) {
        setAddingToCart(prev => ({ ...prev, [productId]: true }));
        setAddToCartError(prev => ({ ...prev, [productId]: null }));
        try {
          await updateCartItem(productId, quantity - 1);
        } catch (err) {
          setAddToCartError(prev => ({ ...prev, [productId]: err.message || 'Failed to update cart' }));
          setTimeout(() => setAddToCartError(prev => ({ ...prev, [productId]: null })), 4000);
        } finally {
          setAddingToCart(prev => ({ ...prev, [productId]: false }));
        }
      }
    };

    return (
      <div 
        className="card-premier transition-all duration-300 p-4 relative group transform hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Halal/Frozen Badge */}
        {tag && (
          <div className="absolute top-3 left-3 z-10">
            <div className={`text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 font-semibold transition-all duration-200 ${
              tagType === 'halal' 
                ? 'bg-premier hover:bg-premier-light' 
                : 'bg-blue-400 hover:bg-blue-500'
            }`}>
              {tagType === 'halal' ? (
                <HalalIcon />
              ) : (
                <Snowflake size={8} />
              )}
              {tag}
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={() => toggleWishlist(productId)}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-200 shadow-md"
        >
          <Heart
            size={16}
            className={`transition-all duration-200 ${
              isFavorite 
                ? 'text-premier fill-current transform scale-110' 
                : 'text-gray-400 hover:text-premier'
            }`}
          />
        </button>

        {/* Product Image */}
        <div className="relative overflow-hidden rounded-xl mb-4 bg-gray-50">
          <img
            src={image}
            alt={name}
            className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-4 transition-all duration-300">
              <button className="btn-premier flex items-center gap-2 font-medium">
                <Eye size={16} />
                Quick View
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <h3 className="line-clamp-2 leading-tight transition-colors duration-200 cursor-pointer" style={{ color: '#8e191c' }}>
            {name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={`transition-colors duration-200 ${
                    i < Math.floor(rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">{rating}</span>
            <span className="text-sm text-gray-400">({reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-xl" style={{ color: '#8e191c' }}>
              €{price}
            </span>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {category}
            </span>
          </div>

          {/* Add to Cart or Quantity Controls */}
         {quantity > 0 ? (
           <div className="flex items-center gap-2 bg-premier text-white rounded-xl px-3 py-2">
             <button
               onClick={handleDecrement}
               disabled={isAdding}
               className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
             >
               -
             </button>
             <span className="flex-1 text-center font-medium">{isAdding ? <span className="animate-pulse">{quantity}</span> : quantity}</span>
             <button
               onClick={handleIncrement}
               disabled={isAdding}
               className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
             >
               +
             </button>
           </div>
         ) : (
          <button 
            onClick={handleAddToCart}
            disabled={inCart || isAdding}
            style={{ background: '#8e191c', color: 'white' }}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${inCart ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <ShoppingCart size={16} />
            <span>{isAdding ? 'Adding...' : inCart ? 'Added to Cart!' : 'Add to Cart'}</span>
          </button>
         )}
          {errorMsg && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-xs flex items-center gap-2">
                {errorMsg}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-xl md:text-5xl font-bold mb-12 text-black">
            Top Products
          </h1>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center h-40">
            <span className="text-lg text-premier">Loading products...</span>
          </div>
        )}
        {error && (
          <div className="flex justify-center items-center h-40">
            <span className="text-lg" style={{ color: '#8e191c' }}>{error}</span>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <div
                key={product._id || product.id || index}
                className="opacity-0 animate-fade-in-up"
                style={{ 
                  animationDelay: `${index * 0.2}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Explore All Products Button */}
        <div className="text-center mt-16">
          <Link to="/products">
            <button 
              style={{ background: 'linear-gradient(90deg, #8e191c 0%, #b02a2d 100%)', color: 'white' }}
              className="text-lg py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 mx-auto group"
            >
              <span>Explore All Products</span>
              <svg 
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </Link>
          <p className="text-gray-500 mt-4 text-sm">
            Discover thousands more products in our complete catalog
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TopProductsPage;