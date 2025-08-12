import React, { useState, useRef, useEffect } from 'react';
import { User, ShoppingCart, MapPin, ChevronDown, Menu, Truck, MousePointer, Package, Globe, Star, Heart, Clock, Sparkles, Plus, X, Zap, Loader2, ArrowRight, Grid3X3, Layers, Store, Tag, Search, AlertTriangle } from 'lucide-react';

import webService from '../services/Website/WebService';
import logo from "../assets/PQF-22.png"
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import StoreSelector from '../Homepage/components/StoreSelector';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { usePromotion } from '../context/PromotionContext';
import DeepLTranslateWidget from '../components/LanguageSelector';



const FuturisticNavbar = () => {
  // Move all hooks to the top
  const { cart } = useCart();
  const { selectedStore, setSelectedStore, orderType, deliveryAddress } = useStore();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlistItems } = useWishlist();
  const { validPromotions } = usePromotion() || { validPromotions: [] };

  // Check if we're on the products page to hide search bar
  const isOnProductsPage = location.pathname === '/products' || location.pathname.startsWith('/product/');

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    'Fresh Food': false,
    'Beverages': false,
    'Pantry Essentials': false,
    'Canned & Packaged': false,
    'Other Categories': false
  });
  const [particles, setParticles] = useState([]);
  const dropdownRef = useRef(null);
  const [dropdownAlign, setDropdownAlign] = useState('right');
  const dropdownContainerRef = useRef(null);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Category state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchFocused, setSearchFocused] = useState(false);


  // Replace local wishlistCount state with global context
  const wishlistCount = wishlistItems.size;

  // Fetch categories from backend (active only)
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoryError(null);
      try {
        const res = await webService.getActiveCategoriesByStore();
        setCategories(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err) {
        setCategoryError('Failed to load categories');
        console.error('Category fetch error:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [selectedStore]);

  // Derive topCategories and allCategories from fetched data
  const sortedCategories = [...categories].sort((a, b) => (b.itemCount || 0) - (a.itemCount || 0));
  const topCategories = sortedCategories.slice(0, 5);
  const allCategories = sortedCategories;

  // Group categories by type for better organization
  const groupedCategories = {
    'Fresh Food': allCategories.filter(cat => 
      ['Meat', 'Milk', 'Dairy', 'Eggs', 'Bread', 'Bakery'].includes(cat.name)
    ),
    'Pantry Essentials': allCategories.filter(cat => 
      ['Rice', 'Pasta', 'Oil', 'Flour', 'Lentil', 'Salt', 'Sugar', 'Spice'].includes(cat.name)
    ),
    'Beverages': allCategories.filter(cat => 
      ['Water', 'Beverage', 'Juice'].includes(cat.name)
    ),
    'Canned & Packaged': allCategories.filter(cat => 
      ['Can Fish', 'Can Fruit', 'Can Meat', 'Can Veg', 'Sauce'].includes(cat.name)
    ),
    'Snacks & Treats': allCategories.filter(cat => 
      ['Snacks', 'Dry fruit & nuts'].includes(cat.name)
    ),
    'Other': allCategories.filter(cat => 
      !['Meat', 'Milk', 'Dairy', 'Eggs', 'Bread', 'Bakery', 'Rice', 'Pasta', 'Oil', 'Flour', 'Lentil', 'Salt', 'Sugar', 'Spice', 'Water', 'Beverage', 'Juice', 'Can Fish', 'Can Fruit', 'Can Meat', 'Can Veg', 'Sauce', 'Snacks', 'Dry fruit & nuts'].includes(cat.name)
    )
  };

  // Create floating particles effect
  useEffect(() => {
    const createParticle = () => {
      const colors = ['#8e191c', '#ef4444', '#f87171', '#dc2626', '#b91c1c'];
      const newParticle = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.8 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      
      setParticles(prev => [...prev.slice(-8), newParticle]);
    };

    const interval = setInterval(createParticle, 2000);
    return () => clearInterval(interval);
  }, []);

  // Animate particles
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          y: particle.y - particle.speed
        })).filter(particle => particle.y > -10)
      );
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);



  // Outside click handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target) &&
        !event.target.closest('[data-all-categories-dropdown]') &&
        !event.target.closest('[data-all-categories-button]')
      ) {
        setActiveDropdown(null);
        setExpandedCategory(null);
      }
      
      // Clear search when clicking outside search area
      if (!event.target.closest('[data-search-container]')) {
        setSearchTerm('');
        setShowSuggestions(false);
        setSearchFocused(false);
        setSuggestions([]);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get category icon based on name
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Meat': '🥩',
      'Milk': '🥛',
      'Pasta': '🍝',
      'Rice': '🍚',
      'Oil': '🫒',
      'Spice': '🌶️',
      'Snacks': '🍿',
      'Bakery': '🥖',
      'Dairy': '🧀',
      'Eggs': '🥚',
      'Water': '💧',
      'Beverage': '🥤',
      'Juice': '🧃',
      'Salt': '🧂',
      'Sugar': '🍯',
      'Sauce': '🥫',
      'Breakfast': '🥞',
      'Frozen': '🧊',
      'Can Fish': '🐟',
      'Can Fruit': '🍑',
      'Can Meat': '🥫',
      'Can Veg': '🥕',
      'Dry fruit & nuts': '🥜',
      'Flour': '🌾',
      'Lentil': '🫘',
      'Non Food': '📦',
      'Olives': '🫒',
      'Packaging': '📦',
      'Bread': '🍞'
    };
    return iconMap[categoryName] || '🛒';
  };

  // Get group icon
  const getGroupIcon = (groupName) => {
    const groupIcons = {
      'Fresh Food': '🥬',
      'Pantry Essentials': '🏺',
      'Beverages': '🥤',
      'Canned & Packaged': '🥫',
      'Snacks & Treats': '🍿',
      'Other': '📦'
    };
    return groupIcons[groupName] || '📂';
  };



  // Handle section expand/collapse
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Store Selector Modal State
  const [showStoreSelector, setShowStoreSelector] = useState(false);

  // Show selector if no store is selected (on mount)
  useEffect(() => {
    if (!selectedStore) {
      setShowStoreSelector(true);
    }
  }, [selectedStore]);

  const handleStoreSelect = (store) => {
    console.log('Selected store object:', store);
    setSelectedStore(store);
    if (store && (store._id || store.id)) {
      const id = store._id || store.id;
      console.log('Saving store ID to localStorage:', id);
      localStorage.setItem('selected_store_id', id);
    }
    setShowStoreSelector(false);
  };

  const handleChangeStore = () => {
    setShowStoreSelector(true);
  };

  const getStoreAddress = (store) => {
    if (store?.location?.address) {
      const addr = store.location.address;
      const parts = [addr.street, addr.city, addr.state, addr.country].filter(Boolean);
      return parts.join(', ');
    }
    return 'Address not available';
  };

  // Clear search function
  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    setSearchFocused(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  // Handle category click
  const handleCategoryClick = (category) => {
    // Always use ItemsGroupCode (number) for filtering
    const categoryCode = String(category.ItemsGroupCode);
    clearSearch(); // Clear search when navigating to categories
    navigate(`/products?category=${encodeURIComponent(categoryCode)}`);
    setExpandedCategory(null);
    setActiveDropdown(null);
    setIsMenuOpen(false);
  };

  // Clear search when navigating to products page
  useEffect(() => {
    if (isOnProductsPage) {
      clearSearch();
    }
  }, [isOnProductsPage]);

  // Fetch product name suggestions as user types with debouncing
  useEffect(() => {
    let active = true;
    let timeoutId;
    
    // Don't fetch suggestions if on products page
    if (isOnProductsPage) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    if (searchTerm && searchFocused && searchTerm.length >= 2) {
      // Debounce the API call to prevent excessive requests
      timeoutId = setTimeout(() => {
        setSuggestionLoading(true);
        webService.suggestProductNames(searchTerm).then(res => {
          if (active) {
            const suggestions = res.data?.data || [];
            setSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
          }
        }).catch((err) => {
          if (active) {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }).finally(() => {
          if (active) setSuggestionLoading(false);
        });
      }, 300); // 300ms debounce delay
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setHighlightedIndex(-1);
    
    return () => { 
      active = false; 
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchTerm, searchFocused, isOnProductsPage]);

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Only show suggestions if not on products page
    if (!isOnProductsPage) {
      setShowSuggestions(true);
    }
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    setShowSuggestions(false);
    if (searchTerm.trim() && !isOnProductsPage) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    setShowSuggestions(false);
    
    // Don't navigate if already on products page
    if (isOnProductsPage) {
      return;
    }
    
    // Try to find the product by name in the current categories/products
    const foundProduct = categories.flatMap(cat => cat.items || []).find(item => 
      (item.ItemName || item.name || '').toLowerCase().includes(name.toLowerCase())
    );
    
    if (foundProduct) {
      // Navigate to individual product page
      navigate(`/product/${foundProduct._id || foundProduct.id}`);
    } else {
      // Fallback: navigate to products page with search
      navigate(`/products?search=${encodeURIComponent(name)}`);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0 || isOnProductsPage) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSuggestionClick(suggestions[highlightedIndex]);
      } else {
        handleSearchSubmit();
      }
    }
  };


  return (
    <div className="bg-white shadow-lg relative z-[1000]">
      {/* Store Selector Modal */}
      <StoreSelector
        isOpen={showStoreSelector}
        onClose={() => setShowStoreSelector(false)}
        selectedStore={selectedStore}
        onStoreSelect={handleStoreSelect}
        canClose={!!selectedStore}
      />

      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-50/30 via-transparent to-red-50/30"></div>
      
      {/* Floating Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-40 pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transition: 'top 0.05s linear',
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
        />
      ))}

      {/* Main Header */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button - Left */}
            <div className="md:hidden flex items-center">
              <button
                className="p-2 rounded-lg shadow-sm focus:outline-none hover:bg-white hover:bg-opacity-20 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Open menu"
              >
                {isMenuOpen ? <X className="w-6 h-6 text-[#8e191c]" /> : <Menu className="w-6 h-6 text-[#8e191c]" />}
              </button>
            </div>

            {/* Logo - Center */}
            <div className="flex items-center group cursor-pointer flex-shrink-0 flex-1 justify-center" onClick={() => { clearSearch(); navigate('/'); }}>
                <img src={logo} alt="Logo" className="w- h-16 object-contain" />
              <div className="ml-3">
                <div className="text-lg font-bold tracking-wider text-gray-800">PREMIER</div>
                <div className="text-xs text-gray-600 font-semibold tracking-widest">QUALITY FOODS</div>
              </div>
            </div>

            {/* Mobile Cart Icon - Right */}
            <div className="md:hidden flex items-center">
              <button
                className="relative p-2 rounded-lg shadow-sm focus:outline-none hover:bg-white hover:bg-opacity-20 transition-colors"
                onClick={() => { clearSearch(); navigate('/cart'); }}
                aria-label="Cart"
              >
                <ShoppingCart className="w-6 h-6 text-[#8e191c]" />
                {cart?.items && cart.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#8e191c] text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-bold">
                    {cart.items.reduce((total, item) => total + item.quantity, 0)}
                </span>
                )}
              </button>
            </div>

            {/* Desktop Right Actions */}
            <div className="flex items-center space-x-4 hidden md:flex">
              {/* User Profile or Auth Links */}
              {isAuthenticated() ? (
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-transparent hover:bg-gray-100 transition-all text-black font-semibold"
                    onClick={() => setUserDropdownOpen((open) => !open)}
                    onBlur={() => setTimeout(() => setUserDropdownOpen(false), 150)}
                  >
                    <User className="w-6 h-6 text-[#8e191c]" />
                    <span>{user?.name || user?.email || 'Account'}</span>
                    <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                        onMouseDown={() => { setUserDropdownOpen(false); clearSearch(); navigate('/user/addresses'); }}
                      >
                        Dashboard
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                        onMouseDown={() => { setUserDropdownOpen(false); clearSearch(); logout(); }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-transparent hover:bg-gray-100 transition-all text-black font-semibold"
                    onClick={() => setAuthDropdownOpen((open) => !open)}
                    onBlur={() => setTimeout(() => setAuthDropdownOpen(false), 150)}
                  >
                    <User className="w-6 h-6 text-[#8e191c]" />
                    <span>Login & Register</span>
                    <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
                  </button>
                  {authDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                        onMouseDown={() => { setAuthDropdownOpen(false); clearSearch(); navigate('/login'); }}
                      >
                        Login
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                        onMouseDown={() => { setAuthDropdownOpen(false); clearSearch(); navigate('/register'); }}
                      >
                        Register
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Location */}
              <button
                className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 transition cursor-pointer focus:outline-none"
                onClick={() => { clearSearch(); handleChangeStore(); }}
                aria-label="Change delivery or pickup location"
                type="button"
              >
                <MapPin className="w-4 h-4 text-[#8e191c]" />
                <div className="text-left">
                  <div className="text-xs text-gray-500">{orderType === 'pickup' ? 'Pick up from' : 'Deliver to'}</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {orderType === 'delivery' && (deliveryAddress.line1 || deliveryAddress.line2 || deliveryAddress.line3)
                      ? `${deliveryAddress.line1}${deliveryAddress.line1 && deliveryAddress.line2 ? ', ' : ''}${deliveryAddress.line2}${(deliveryAddress.line1 || deliveryAddress.line2) && deliveryAddress.line3 ? ', ' : ''}${deliveryAddress.line3}`
                      : selectedStore ? (selectedStore.name || selectedStore.storeName) : 'Select Location'}
                  </div>
                </div>
              </button>
              <DeepLTranslateWidget />

              {/* Wishlist Icon */}
              <button
                className="relative flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-all"
                onClick={() => { clearSearch(); navigate('/wishlist'); }}
                aria-label="Wishlist"
              >
                <Heart size={28} className={wishlistCount > 0 ? 'text-[#8e191c] text-[#8e191c]' : 'text-gray-700'} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#8e191c] text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Promotions */}
              <button
                className="relative flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-all group"
                onClick={() => { clearSearch(); navigate('/promotions'); }}
                aria-label="Promotions"
                title="View Available Promotions"
              >
                <Tag size={28} className={validPromotions?.length > 0 ? 'text-orange-600' : 'text-gray-700'} />
                {validPromotions?.length > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-bold animate-pulse">
                      {validPromotions.length}
                    </span>
                    {/* Pulse animation for active promotions */}
                    <div className="absolute inset-0 bg-orange-400 rounded-lg opacity-20 animate-ping"></div>
                  </>
                )}
                <div className="hidden md:block text-sm text-gray-600">
                  <div className={validPromotions?.length > 0 ? 'text-orange-600 font-medium' : ''}>
                    Offers
                  </div>
                  {validPromotions?.length > 0 && (
                    <div className="text-xs text-orange-500 font-bold">
                      {validPromotions.length} Available
                    </div>
                  )}
                </div>
              </button>

              {/* Cart */}
              <button
                className="relative flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-all"
                onClick={() => { clearSearch(); navigate('/cart'); }}
                aria-label="Cart"
              >
                <ShoppingCart size={28} className="text-gray-700" />
                {cart?.items && cart.items.length > 0 && (
                  <>
                    {/* Item count badge */}
                    <span className="absolute -top-1 -right-1 bg-[#8e191c] text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-bold">
                      {cart.items.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                    {/* Price display for desktop */}
                    <div className="hidden md:block text-sm">
                      <div className="text-gray-600">Cart</div>
                      <div className="font-semibold text-[#8e191c]">
                        AED {cart.total ? cart.total.toFixed(2) : '0.00'}
                      </div>
                    </div>
                  </>
                )}
                {(!cart?.items || cart.items.length === 0) && (
                  <div className="hidden md:block text-sm text-gray-600">
                    <div>Cart</div>
                    <div className="text-xs">Empty</div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="border-t border-gray-100 bg-white hidden md:block relative" style={{ backgroundColor: '#8e191c' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center py-3 relative">
            {/* All Categories Button */}
            <button
              data-all-categories-button
              onClick={() => {
                console.log('All Categories clicked, current state:', activeDropdown);
                setActiveDropdown(activeDropdown === 'all' ? null : 'all');
              }}
              className="bg-white bg-opacity-20 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-30 transition-all duration-300 font-medium shadow-sm border border-white border-opacity-20 group mr-6 text-white"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="text-sm">All Categories</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'all' ? 'rotate-180' : ''}`} />
            </button>

            {/* Top Categories */}
            <div className="flex items-center space-x-6 flex-1">
              {loadingCategories ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : categoryError ? (
                <p className="text-white text-sm">{categoryError}</p>
              ) : (
                topCategories.map((category, index) => (
                  <div
                    key={category._id}
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown(`cat-${index}`)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white hover:bg-opacity-20 text-white ${
                        activeDropdown === `cat-${index}` ? 'bg-white bg-opacity-20' : ''
                      }`}
                      onClick={() => handleCategoryClick(category)}
                    >
                      <span className="text-lg">{getCategoryIcon(category.name)}</span>
                      <span className="font-medium text-sm">{category.name}</span>
                      <span className="text-xs opacity-75">({category.itemCount})</span>
                    </div>

                    {/* Category Dropdown */}
                    {activeDropdown === `cat-${index}` && (
                      <div
                        ref={dropdownContainerRef}
                        className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg p-4 min-w-80 z-[1100] shadow-xl"
                        onMouseEnter={() => setActiveDropdown(`cat-${index}`)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-100">
                          <div className="w-10 h-10 bg-[#8e191c]/10 rounded-lg flex items-center justify-center">
                            <span className="text-xl">{getCategoryIcon(category.name)}</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{category.name}</h3>
                            <p className="text-sm text-gray-500">{category.itemCount} items available</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {category.items && category.items.slice(0, 4).map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200"
                            >
                              <span className="text-gray-800 font-medium text-sm flex-1 mr-2">
                                {item.ItemName}
                              </span>
                              <span className="text-xs text-gray-500">{item.ItemCode}</span>
                            </div>
                          ))}
                        </div>
                        <button 
                          className="w-full mt-4 bg-[#8e191c] text-white py-2 rounded-lg font-medium hover:bg-[#8e191c]/80 transition-all"
                          onClick={() => handleCategoryClick(category)}
                        >
                          View All {category.name} →
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Search Bar - Hidden on products page */}
            {!isOnProductsPage && (
              <div className="ml-6 max-w-2xl" data-search-container>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { setSearchFocused(true); setShowSuggestions(true); }}
                    onBlur={() => { setSearchFocused(false); setTimeout(() => setShowSuggestions(false), 200); }}
                    className="w-full px-3 py-2 rounded-xl border-2 border-white bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white shadow-md text-sm"
                  />
                  <button
                    onClick={handleSearchSubmit}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8e191c] hover:text-[#8e191c]"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && searchFocused && (
                    <div className="absolute left-0 right-0 top-full bg-white border border-gray-200 rounded-lg shadow-lg z-[1200] mt-1 max-h-60 overflow-y-auto transition-all duration-200 ease-in-out">
                      {suggestionLoading ? (
                        <div className="p-3 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                        </div>
                      ) : suggestions.length === 0 && searchTerm ? (
                        <div className="p-3 text-center text-gray-400 text-sm">No results found</div>
                      ) : (
                        suggestions.map((name, idx) => (
                          <div
                            key={idx}
                            className={`px-4 py-2 flex items-center gap-2 cursor-pointer text-gray-800 text-sm transition-all duration-150 ${highlightedIndex === idx ? 'bg-[#8e191c] text-white font-semibold' : 'hover:bg-[#8e191c]/10'}`}
                            onMouseDown={() => handleSuggestionClick(name)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                          >
                            <Search className={`w-4 h-4 ${highlightedIndex === idx ? 'text-white' : 'text-[#8e191c]'}`} />
                            {name}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Categories Dropdown - Union Coop Style */}
        {activeDropdown === 'all' && (
          <div 
            data-all-categories-dropdown
            className="absolute top-full left-0 w-80 bg-white shadow-2xl z-[1100] border border-gray-200"
          >
            {/* Header - single row, deep red/maroon gradient, white text/icons */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#8e191c] to-[#b91c1c] p-3">
              <div className="flex items-center space-x-2">
                <Grid3X3 className="w-5 h-5 text-white" />
                <span className="text-white font-semibold text-sm">All Categories</span>
              </div>
            </div>

            {/* Categories List */}
            <div className="max-h-96 overflow-y-auto">
              {loadingCategories ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-[#8e191c] animate-spin" />
                </div>
              ) : categoryError ? (
                <div className="text-center py-8 px-4">
                  <p className="text-[#8e191c] text-sm">{categoryError}</p>
                </div>
              ) : allCategories.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-[#8e191c] text-sm">No categories available</p>
                </div>
              ) : (
                <>
                  {/* Fresh Food Section */}
                  <div className="border-b border-gray-200">
                    <div 
                      className="p-3 bg-[#8e191c]/5 flex items-center justify-between cursor-pointer hover:bg-[#8e191c]/10 transition-colors"
                      onClick={() => toggleSection('Fresh Food')}
                    >
                      <span className="text-[#8e191c] font-medium text-sm">Fresh Food</span>
                      {expandedSections['Fresh Food'] ? 
                        <span className="text-[#8e191c] font-bold text-lg">–</span> :
                        <span className="text-[#8e191c] font-bold text-lg">+</span>
                      }
                    </div>
                    {expandedSections['Fresh Food'] && (
                      <div className="bg-white">
                        {allCategories.filter(cat => 
                          ['Meat', 'Milk', 'Dairy', 'Eggs', 'Bread', 'Bakery'].includes(cat.name)
                        ).map((category) => (
                          <div 
                            key={category._id}
                            className="p-3 hover:bg-[#8e191c]/5 cursor-pointer border-b border-gray-100 flex items-center justify-between group transition-colors"
                            onClick={() => handleCategoryClick(category)}
                          >
                            <span className="text-[#8e191c] text-sm pl-6">{category.name} <span className='text-gray-500 font-normal'>({category.itemCount || 0})</span></span>
                            <span className="text-[#8e191c] group-hover:text-[#b91c1c] transition-colors text-xs">&gt;</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Beverages Section */}
                  <div className="border-b border-gray-200">
                    <div 
                      className="p-3 bg-orange-50 flex items-center justify-between cursor-pointer hover:bg-orange-100 transition-colors"
                      onClick={() => toggleSection('Beverages')}
                    >
                      <span className="text-[#ef4444] font-medium text-sm">Beverages</span>
                      {expandedSections['Beverages'] ? 
                        <span className="text-[#ef4444] font-bold text-lg">–</span> :
                        <span className="text-[#ef4444] font-bold text-lg">+</span>
                      }
                    </div>
                    {expandedSections['Beverages'] && (
                      <div className="bg-white">
                        {allCategories.filter(cat => 
                          ['Water', 'Beverage', 'Juice'].includes(cat.name)
                        ).map((category) => (
                          <div 
                            key={category._id}
                            className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 flex items-center justify-between group transition-colors"
                            onClick={() => handleCategoryClick(category)}
                          >
                            <span className="text-[#ef4444] text-sm pl-6">{category.name} <span className='text-gray-500 font-normal'>({category.itemCount || 0})</span></span>
                            <span className="text-[#ef4444] group-hover:text-[#b91c1c] transition-colors text-xs">&gt;</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pantry Essentials */}
                  <div className="border-b border-gray-200">
                    <div 
                      className="p-3 bg-yellow-50 flex items-center justify-between cursor-pointer hover:bg-yellow-100 transition-colors"
                      onClick={() => toggleSection('Pantry Essentials')}
                    >
                      <span className="text-[#b91c1c] font-medium text-sm">Pantry Essentials</span>
                      {expandedSections['Pantry Essentials'] ? 
                        <span className="text-[#b91c1c] font-bold text-lg">–</span> :
                        <span className="text-[#b91c1c] font-bold text-lg">+</span>
                      }
                    </div>
                    {expandedSections['Pantry Essentials'] && (
                      <div className="bg-white">
                        {allCategories.filter(cat => 
                          ['Rice', 'Pasta', 'Oil', 'Flour', 'Lentil', 'Salt', 'Sugar', 'Spice'].includes(cat.name)
                        ).map((category) => (
                          <div 
                            key={category._id}
                            className="p-3 hover:bg-yellow-50 cursor-pointer border-b border-gray-100 flex items-center justify-between group transition-colors"
                            onClick={() => handleCategoryClick(category)}
                          >
                            <span className="text-[#b91c1c] text-sm pl-10">{category.name} <span className='text-gray-500 font-normal'>({category.itemCount || 0})</span></span>
                            <span className="text-[#b91c1c] group-hover:text-[#8e191c] transition-colors text-xs">&gt;</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Canned & Packaged */}
                  <div className="border-b border-gray-200">
                    <div 
                      className="p-3 bg-pink-50 flex items-center justify-between cursor-pointer hover:bg-pink-100 transition-colors"
                      onClick={() => toggleSection('Canned & Packaged')}
                    >
                      <span className="text-[#b91c1c] font-medium text-sm">Canned & Packaged</span>
                      {expandedSections['Canned & Packaged'] ? 
                        <span className="text-[#b91c1c] font-bold text-lg">–</span> :
                        <span className="text-[#b91c1c] font-bold text-lg">+</span>
                      }
                    </div>
                    {expandedSections['Canned & Packaged'] && (
                      <div className="bg-white">
                        {allCategories.filter(cat => 
                          ['Can Fish', 'Can Fruit', 'Can Meat', 'Can Veg', 'Sauce'].includes(cat.name)
                        ).map((category) => (
                          <div 
                            key={category._id}
                            className="p-3 hover:bg-pink-50 cursor-pointer border-b border-gray-100 flex items-center justify-between group transition-colors"
                            onClick={() => handleCategoryClick(category)}
                          >
                            <span className="text-[#b91c1c] text-sm pl-6">{category.name} <span className='text-gray-500 font-normal'>({category.itemCount || 0})</span></span>
                            <span className="text-[#b91c1c] group-hover:text-[#8e191c] transition-colors text-xs">&gt;</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Other Categories */}
                  <div>
                    <div 
                      className="p-3 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleSection('Other Categories')}
                    >
                      <span className="text-[#8e191c] font-medium text-sm">Other Categories</span>
                      {expandedSections['Other Categories'] ? 
                        <span className="text-[#8e191c] font-bold text-lg">–</span> :
                        <span className="text-[#8e191c] font-bold text-lg">+</span>
                      }
                    </div>
                    {expandedSections['Other Categories'] && (
                      <div className="bg-white">
                        {allCategories.filter(cat => 
                          !['Meat', 'Milk', 'Dairy', 'Eggs', 'Bread', 'Bakery', 'Water', 'Beverage', 'Juice', 'Rice', 'Pasta', 'Oil', 'Flour', 'Lentil', 'Salt', 'Sugar', 'Spice', 'Can Fish', 'Can Fruit', 'Can Meat', 'Can Veg', 'Sauce'].includes(cat.name)
                        ).map((category) => (
                          <div 
                            key={category._id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex items-center justify-between group transition-colors"
                            onClick={() => handleCategoryClick(category)}
                          >
                            <span className="text-[#8e191c] text-sm pl-6">{category.name} <span className='text-gray-500 font-normal'>({category.itemCount || 0})</span></span>
                            <span className="text-[#8e191c] group-hover:text-[#b91c1c] transition-colors text-xs">&gt;</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

            {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[1200] bg-black/40 md:hidden" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed top-0 left-0 w-4/5 max-w-xs h-full bg-white shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>


            {/* Mobile Navigation Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* User Account Section - TOP */}
              <div className="mb-6">
                {isAuthenticated() ? (
                  <div className="bg-gradient-to-r from-[#8e191c] to-[#b91c1c] rounded-xl p-4 text-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{user?.name || user?.email || 'Account'}</div>
                        <div className="text-xs opacity-80">Welcome back!</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-center mb-3">
                      <div className="text-sm text-gray-600 mb-2">Sign in to your account</div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="flex-1 bg-[#8e191c] hover:bg-[#b91c1c] text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300"
                        onClick={() => { setIsMenuOpen(false); clearSearch(); navigate('/login'); }}
                      >
                        Login
                      </button>
                      <button
                        className="flex-1 bg-white border border-[#8e191c] text-[#8e191c] hover:bg-[#8e191c] hover:text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300"
                        onClick={() => { setIsMenuOpen(false); clearSearch(); navigate('/register'); }}
                      >
                        Register
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Language Selector */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#8e191c]/10 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-[#8e191c]" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Language</span>
                  </div>
                  <DeepLTranslateWidget />
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-3">
                {/* Cart */}
                <button
                  className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#8e191c] hover:shadow-md transition-all duration-300"
                  onClick={() => { setIsMenuOpen(false); clearSearch(); navigate('/cart'); }}
                >
                  <div className="w-10 h-10 bg-[#8e191c]/10 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-[#8e191c]" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">Cart</span>
                  {cart?.items && cart.items.length > 0 && (
                    <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold">
                      {cart.items.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  )}
                </button>

                {/* Promotions */}
                <button
                  className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#8e191c] hover:shadow-md transition-all duration-300"
                  onClick={() => { setIsMenuOpen(false); clearSearch(); navigate('/promotions'); }}
                >
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Tag className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">Promotions</span>
                  {validPromotions?.length > 0 && (
                    <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold">
                      {validPromotions.length}
                    </span>
                  )}
                </button>

                {/* My Address */}
                <button
                  className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#8e191c] hover:shadow-md transition-all duration-300"
                  onClick={() => { setIsMenuOpen(false); clearSearch(); navigate('/addresses'); }}
                >
                  <div className="w-10 h-10 bg-[#8e191c]/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#8e191c]" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">My Address</span>
                </button>

                {/* My Orders */}
                <button
                  className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#8e191c] hover:shadow-md transition-all duration-300"
                  onClick={() => { setIsMenuOpen(false); clearSearch(); navigate('/orders'); }}
                >
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">My Orders</span>
                </button>

                {/* My Disputes */}
                <button
                  className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#8e191c] hover:shadow-md transition-all duration-300"
                  onClick={() => { setIsMenuOpen(false); clearSearch(); navigate('/disputes'); }}
                >
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">My Disputes</span>
                </button>

                {/* My Abandoned Carts */}
                <button
                  className="w-full flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#8e191c] hover:shadow-md transition-all duration-300"
                  onClick={() => { setIsMenuOpen(false); clearSearch(); navigate('/abandoned-carts'); }}
                >
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">My Abandoned Carts</span>
                </button>

                {/* Explore All Products */}
                <button
                  className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-[#8e191c] to-[#b91c1c] rounded-xl text-white hover:from-[#b91c1c] hover:to-[#8e191c] transition-all duration-300 shadow-lg"
                  onClick={() => { setIsMenuOpen(false); clearSearch(); navigate('/products'); }}
                >
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Grid3X3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">Explore All Products</span>
                </button>
              </div>

              {/* Logout Button - Bottom (Only for logged in users) */}
              {isAuthenticated() && (
                <div className="pt-6 border-t border-gray-100 mt-6">
                  <button
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg"
                    onClick={() => { setIsMenuOpen(false); clearSearch(); logout(); }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuturisticNavbar;