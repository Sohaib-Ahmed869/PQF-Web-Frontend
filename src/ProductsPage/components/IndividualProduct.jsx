import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import webService from '../../services/Website/WebService';
import { Star, Heart, ShoppingCart, Truck, Shield, Clock, ChevronLeft, ChevronRight, Plus, Minus, Share2, Eye, Snowflake, Loader2, X, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import LoaderOverlay from '../../components/LoaderOverlay';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../../components/LoginModal';

// Add global keyframes for animations
if (typeof document !== 'undefined' && !document.getElementById('product-keyframes')) {
  const style = document.createElement('style');
  style.id = 'product-keyframes';
  style.innerHTML = `
    @keyframes float-gentle {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(2deg); }
    }
    
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(230, 0, 18, 0.3); }
      50% { box-shadow: 0 0 30px rgba(230, 0, 18, 0.5); }
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// Add HalalIcon SVG component
const HalalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="#22c55e"/>
    <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">حلال</text>
  </svg>
);

const IndividualProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [showNotification, setShowNotification] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [activeTab, setActiveTab] = useState('Description');
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState(null);
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await webService.getProductById(id);
        // Support both .data.data and .data
        const prod = response.data?.data || response.data || null;
        setProduct(prod);
      } catch (err) {
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Helper functions for price, badges, images, etc.
  const getPrice = (product, priceListId = 2) => {
    if (!product) return 0;
    if (product.prices && Array.isArray(product.prices)) {
      const priceItem = product.prices.find(p => p.PriceList === priceListId);
      return priceItem ? priceItem.Price : 0;
    } else if (product.ItemPrices && Array.isArray(product.ItemPrices)) {
      const priceItem = product.ItemPrices.find(p => p.PriceList === priceListId);
      return priceItem ? priceItem.Price : 0;
    }
    if (product.price) {
      const priceNum = parseFloat(product.price.replace('€', ''));
      return isNaN(priceNum) ? 0 : priceNum;
    }
    return 0;
  };
  const formatPrice = (product, priceListId = 2) => {
    const price = getPrice(product, priceListId);
    return `د.إ${price.toFixed(2)}`;
  };
  const getBadges = (product) => {
    if (!product) return [];
    const badges = [];
    if (product.halal === 'tYES' || product.Properties1 === 'tYES') badges.push('Halal');
    if (product.frozen === 'tYES' || product.Frozen === 'tYES') badges.push('Frozen');
    if (product.isAvailable) badges.push('Available');
    if (product.badges && Array.isArray(product.badges)) badges.push(...product.badges);
    return badges;
  };
  const getImages = (product) => {
    if (!product) return [];
    if (product.images && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    ];
  };
  const getStock = (product) => {
    if (!product) return 0;
    return product.stock ?? product.QuantityOnStock ?? 0;
  };
  const getProductName = (product) => {
    return product?.ItemName || product?.name || '';
  };
  const getProductCode = (product) => {
    return product?.ItemCode || product?.code || '';
  };

  // Replace handleAddToCart with async version
  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    setAddToCartError(null);
    try {
      await addToCart(product._id || product.id, quantity);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setAddToCartError(error.message || 'Failed to add item to cart');
      setTimeout(() => setAddToCartError(null), 5000);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToCartClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }
    handleAddToCart();
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % getImages(product).length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + getImages(product).length) % getImages(product).length);
  };

  if (loading) return <LoaderOverlay text="Loading product..." />;
  if (error) return (
    <div className="flex justify-center items-center h-96">
      <span className="text-lg text-red-600">{error}</span>
    </div>
  );
  if (!product) return null;

  const productId = product._id || product.id;

  // Fallbacks for features, description, etc.
  const features = product.features || [
    { icon: <Truck size={20} />, title: "Free Delivery", desc: "Orders over €25" },
    { icon: <Shield size={20} />, title: "Quality Guaranteed", desc: "100% fresh guarantee" },
    { icon: <Clock size={20} />, title: "Ready in 30 mins", desc: "Quick preparation" }
  ];
  const description = product.description || 'No description available.';
  const ingredients = product.ingredients || [];
  const nutritionalInfo = product.nutritionalInfo || {};
  const reviews = product.reviews || 0;
  const rating = product.rating || 0;
  const images = getImages(product);
  const badges = getBadges(product);
  const stock = getStock(product);
  const productName = getProductName(product);
  const productCode = getProductCode(product);
  // Dynamic highlights
  const highlights = product.highlights && Array.isArray(product.highlights) && product.highlights.length > 0
    ? product.highlights
    : [
        product.frozen === 'tYES' || product.Frozen === 'tYES' ? 'Frozen Product' : null,
        'No Artificial Preservatives',
        'Fresh Daily Preparation',
        'Premium Quality Meat'
      ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: '#8e191c', opacity: 0.12 }} />
        <div className="absolute bottom-40 right-20 w-48 h-48 rounded-full blur-3xl animate-pulse delay-1000" style={{ backgroundColor: '#8e191c', opacity: 0.08 }} />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full blur-2xl animate-pulse delay-2000" style={{ backgroundColor: '#8e191c', opacity: 0.10 }} />
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300"
             style={{ animation: 'slideInUp 0.3s ease-out' }}>
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} />
            <span className="font-medium">Added to cart!</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Product Images Section */}
          <div className="relative">
            {/* Main Product Image */}
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl overflow-hidden mb-6"
                 style={{
                   clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))'
                 }}>
              
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {badges.map((badge, index) => (
                  <span
                    key={index}
                    className={
                      badge === 'Halal'
                        ? 'bg-green-500 rounded-full p-1 flex items-center justify-center shadow-lg'
                        : badge === 'Frozen'
                        ? 'bg-blue-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg'
                        : 'bg-red-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg'
                    }
                  >
                    {badge === 'Halal' ? <HalalIcon /> :
                     badge === 'Frozen' ? <Snowflake size={16} /> :
                     badge}
                  </span>
                ))}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated()) {
                    setShowLoginModal(true);
                    return;
                  }
                  toggleWishlist(productId);
                }}
                className="absolute top-4 right-4 z-10 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all duration-300"
              >
                <Heart
                  size={20}
                  className={`transition-colors duration-300 ${
                    isInWishlist(productId)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-600'
                  }`}
                />
              </button>

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all duration-300"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all duration-300"
              >
                <ChevronRight size={20} className="text-gray-700" />
              </button>

              {/* Main Image */}
              <div className="relative h-96 overflow-hidden rounded-2xl">
                <img
                  src={images[selectedImage]}
                  alt={productName}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Floating Decorative Elements */}
              <div className="absolute right-8 top-16 opacity-20">
                <div className="w-16 h-16 rounded-full" style={{ backgroundColor: '#8e191c', animation: 'float-gentle 4s ease-in-out infinite' }} />
              </div>
              <div className="absolute left-12 bottom-20 opacity-15">
                <div className="w-12 h-12" style={{ backgroundColor: '#8e191c', transform: 'rotate(45deg)', animation: 'float-gentle 5s ease-in-out infinite reverse' }} />
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-3 justify-center">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                    selectedImage === index 
                      ? 'ring-4 ring-red-500 scale-110 shadow-lg' 
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-8">
            {/* Product Title & Rating */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-800 leading-tight">
                {productName}
                <span className="block text-2xl font-medium mt-2" style={{ color: '#8e191c' }}>
                  {product.weight}
                </span>
              </h1>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={`${
                        i < Math.floor(rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-lg font-medium text-gray-700">
                    {rating}
                  </span>
                </div>
                <span className="text-gray-500">({reviews} reviews)</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r p-6 rounded-2xl text-white shadow-xl"
                 style={{
                   background: 'linear-gradient(90deg, #8e191c 0%, #8e191c 100%)',
                   clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
                 }}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg opacity-90">Delivery price:</span>
                  {isAuthenticated() ? (
                    <span className="text-3xl font-bold">{formatPrice(product, 2)}</span>
                  ) : (
                    <span className="text-3xl font-bold opacity-60">—</span>
                  )}
                </div>
                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#8e191c]">
                    {isAuthenticated() ? (product.price ? `د.إ${parseFloat(product.price).toFixed(2)}` : 'د.إ0.00') : 'Login to see price'}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/20">
                  <span className="text-sm opacity-80">excluding VAT/kilo</span>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 w-full">
              <div className="flex items-center gap-3">
                <span className="text-lg font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-red-500 hover:text-white transition-colors duration-200"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-3 font-bold text-lg min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-red-500 hover:text-white transition-colors duration-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <button
                onClick={handleAddToCartClick}
                disabled={addingToCart || getStock(product) === 0}
                className={`flex-1 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${!isAuthenticated() ? 'bg-gray-300 text-gray-700' : ''}`}
                style={{ 
                  background: !isAuthenticated() ? undefined : (getStock(product) === 0 ? '#gray-400' : 'linear-gradient(90deg, #8e191c 0%, #8e191c 100%)'), 
                  animation: getStock(product) > 0 && isAuthenticated() ? 'pulse-glow 2s ease-in-out infinite' : 'none'
                }}
              >
                {!isAuthenticated() ? (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                ) : addingToCart ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : getStock(product) === 0 ? (
                  <>
                    <X className="w-5 h-5" />
                    Out of Stock
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>
              {addToCartError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {addToCartError}
                  </p>
                </div>
              )}
            </div>

            {/* Detailed Product Information Tabs */}
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex gap-2 bg-gray-100 p-2 rounded-xl">
                {["Description", "Reviews"].map((tab, index) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex-1 text-sm ${
                      activeTab === tab
                        ? 'text-white shadow-lg scale-105'
                        : 'text-gray-600 hover:text-white hover:bg-white/50'
                    }`}
                    style={activeTab === tab ? { backgroundColor: '#8e191c' } : { color: activeTab === tab ? '#fff' : undefined }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 min-h-[400px]">
                {/* Description Tab */}
                {activeTab === 'Description' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800">Product Description</h3>
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {/* Product Highlights - now dynamic */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Product Highlights:</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          {highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                        {/* Improved Valid and Availability Status */}
                        <div className="mt-6 p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col gap-2 w-full max-w-xs">
                          <div className="font-semibold text-gray-800 mb-1 text-base">Product Status</div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-700 font-medium">Valid:</span>
                            {product.valid === 'tYES' || product.Valid === 'tYES' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 border border-green-300 text-green-700 text-sm font-semibold">
                                <CheckCircle size={16} className="text-green-500" /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 border border-red-300 text-red-700 text-sm font-semibold">
                                <XCircle size={16} className="text-red-500" /> No
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-700 font-medium">Available:</span>
                            {product.isAvailable ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 border border-green-300 text-green-700 text-sm font-semibold">
                                <CheckCircle size={16} className="text-green-500" /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 border border-red-300 text-red-700 text-sm font-semibold">
                                <XCircle size={16} className="text-red-500" /> No
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'Reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-800">Customer Reviews</h3>
                      <button className="px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-colors" style={{ backgroundColor: '#8e191c', color: '#fff' }}>
                        Write a Review
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <div className="text-3xl font-bold text-gray-800">{rating}</div>
                        <div className="flex justify-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${
                                i < Math.floor(rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Based on {reviews} reviews</div>
                      </div>
                      <div className="md:col-span-2 space-y-3">
                        {[5,4,3,2,1].map((stars) => (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm w-8">{stars}★</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : stars === 2 ? 3 : 2}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">
                              {stars === 5 ? 85 : stars === 4 ? 36 : stars === 3 ? 14 : stars === 2 ? 4 : 3}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800">Recent Reviews</h4>
                      {[
                        { name: "Ahmed K.", rating: 5, date: "2 days ago", comment: "Excellent quality kebab! The meat is tender and the spice blend is perfect. Will definitely order again." },
                        { name: "Sarah M.", rating: 4, date: "1 week ago", comment: "Good product overall. The red sauce complements the meat well. Delivery was quick and packaging was secure." },
                        { name: "Hassan A.", rating: 5, date: "2 weeks ago", comment: "Best kebab I've had! Fresh, authentic taste and great value for money. Highly recommended." }
                      ].map((review, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">{review.name}</span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={`${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => { setShowLoginModal(false); navigate('/login'); }}
      />
    </div>
  );
};

export default IndividualProductPage;