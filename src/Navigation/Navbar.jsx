import React, { useState, useRef, useEffect } from 'react';
import { Search, User, ShoppingCart, MapPin, ChevronDown, Menu, Truck, MousePointer, Package, Globe, Star, Heart, Clock, Sparkles, Plus, X, Zap, Loader2, ArrowRight, Grid3X3, Layers, Store } from 'lucide-react';

import webService from '../services/Website/WebService';
import logo from "../assets/PQF-22.png"
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import StoreSelector from '../Homepage/components/StoreSelector';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import DeepLTranslateWidget from '../components/LanguageSelector';



const FuturisticNavbar = () => {
  // Move all hooks to the top
  const { cart } = useCart();
  const { selectedStore, setSelectedStore, orderType, deliveryAddress } = useStore();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { wishlistItems } = useWishlist();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    'Fresh Food': false,
    'Beverages': false,
    'Pantry Essentials': false,
    'Canned & Packaged': false,
    'Other Categories': false
  });
  const [particles, setParticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const [dropdownAlign, setDropdownAlign] = useState('right');
  const dropdownContainerRef = useRef(null);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Category state
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  // Product name suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // NEW: for keyboard navigation

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

  // Fetch product name suggestions as user types
  useEffect(() => {
    let active = true;
    if (searchQuery && searchFocused) {
      setSuggestionLoading(true);
      webService.suggestProductNames(searchQuery).then(res => {
        if (active) {
          const suggestions = res.data?.data || [];
          setSuggestions(suggestions);
          // Show suggestions dropdown if there are results
          setShowSuggestions(suggestions.length > 0);
          // Debug log
          console.log('Suggestions API result:', suggestions);
        }
      }).catch((err) => {
        if (active) {
          setSuggestions([]);
          setShowSuggestions(false);
          console.error('Suggestions API error:', err);
        }
      }).finally(() => {
        if (active) setSuggestionLoading(false);
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setHighlightedIndex(-1); // Reset highlight on new query
    return () => { active = false; };
  }, [searchQuery, searchFocused]);

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

  // Handle search
  const handleSearch = async () => {
    setShowSuggestions(false);
    if (searchQuery && searchQuery.trim()) {
      // Try to find an exact product match
      try {
        const res = await webService.searchProducts(searchQuery.trim());
        const products = res.data?.data || [];
        // Try to find an exact match by name or code
        const exact = products.find(
          p => (p.ItemName || p.name || '').toLowerCase() === searchQuery.trim().toLowerCase() ||
               (p.ItemCode || p.code || '').toLowerCase() === searchQuery.trim().toLowerCase()
        );
        if (exact && (exact._id || exact.id)) {
          navigate(`/products/${exact._id || exact.id}`);
          return;
        }
      } catch (err) {
        // fallback to normal search
      }
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (name) => {
    setSearchQuery(name);
    setShowSuggestions(false);
    handleSearch();
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

  // Handle category click
  const handleCategoryClick = (category) => {
    // Always use ItemsGroupCode (number) for filtering
    const categoryCode = String(category.ItemsGroupCode);
    navigate(`/products?category=${encodeURIComponent(categoryCode)}`);
    setExpandedCategory(null);
    setActiveDropdown(null);
    setIsMenuOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
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
        handleSearch();
      }
    }
  };

  // Helper to highlight matching text
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="bg-yellow-200 text-red-700 font-semibold rounded px-0.5">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
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
            {/* Logo */}
            <div className="flex items-center group cursor-pointer flex-shrink-0" onClick={() => navigate('/') }>
                <img src={logo} alt="Logo" className="w- h-16 object-contain" />
              <div className="ml-3">
                <div className="text-lg font-bold tracking-wider text-gray-800">PREMIER</div>
                <div className="text-xs text-gray-600 font-semibold tracking-widest">QUALITY FOODS</div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <div className="flex-1 max-w-xs">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                    onKeyPress={handleKeyPress}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-4 pr-10 py-2 bg-white border-2 border-gray-200 rounded-lg outline-none font-medium placeholder-gray-400 text-gray-800 text-sm focus:border-red-500"
                    onFocus={() => { setSearchFocused(true); setShowSuggestions(true); }}
                    onBlur={() => { setSearchFocused(false); setTimeout(() => setShowSuggestions(false), 200); }}
                  />
                  <button 
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  {/* Suggestions Dropdown (Mobile) */}
                  {showSuggestions && searchFocused && (
                    <div className="absolute left-0 right-0 top-full bg-white border border-gray-200 rounded-lg shadow-lg z-[1200] mt-1 max-h-60 overflow-y-auto transition-all duration-200 ease-in-out animate-fade-in">
                      {suggestionLoading ? (
                        <div className="p-3 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                        </div>
                      ) : suggestions.length === 0 && searchQuery ? (
                        <div className="p-3 text-center text-gray-400 text-sm">No results found</div>
                      ) : (
                        suggestions.map((name, idx) => (
                          <div
                            key={idx}
                            className={`px-4 py-2 flex items-center gap-2 cursor-pointer text-gray-800 text-sm transition-all duration-150 ${highlightedIndex === idx ? 'bg-red-50 text-red-700 font-semibold' : 'hover:bg-red-50'}`}
                            onMouseDown={() => handleSuggestionClick(name)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                          >
                            <Search className="w-4 h-4 text-red-400" />
                            {highlightMatch(name, searchQuery)}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Open menu"
              >
                {isMenuOpen ? <X className="w-6 h-6 text-red-600" /> : <Menu className="w-6 h-6 text-red-600" />}
              </button>
            </div>

            {/* Desktop Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div className="relative group">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for products, brands and more..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                    onKeyPress={handleKeyPress}
                    onKeyDown={handleKeyDown}
                    className="relative w-full pl-6 pr-14 py-3 bg-white border-2 border-gray-200 rounded-lg transition-all duration-300 outline-none font-medium placeholder-gray-400 text-gray-800 focus:border-red-600 focus:shadow-lg"
                    onFocus={() => { setSearchFocused(true); setShowSuggestions(true); }}
                    onBlur={() => { setSearchFocused(false); setTimeout(() => setShowSuggestions(false), 200); }}
                  />
                  <button 
                    onClick={handleSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  {/* Suggestions Dropdown (Desktop) */}
                  {showSuggestions && searchFocused && (
                    <div className="absolute left-0 right-0 top-full bg-white border border-gray-200 rounded-lg shadow-lg z-[1200] mt-1 max-h-72 overflow-y-auto transition-all duration-200 ease-in-out animate-fade-in">
                      {suggestionLoading ? (
                        <div className="p-4 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                        </div>
                      ) : suggestions.length === 0 && searchQuery ? (
                        <div className="p-4 text-center text-gray-400 text-sm">No results found</div>
                      ) : (
                        suggestions.map((name, idx) => (
                          <div
                            key={idx}
                            className={`px-6 py-3 flex items-center gap-2 cursor-pointer text-gray-800 text-base transition-all duration-150 ${highlightedIndex === idx ? 'bg-red-50 text-red-700 font-semibold' : 'hover:bg-red-50'}`}
                            onMouseDown={() => handleSuggestionClick(name)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                          >
                            <Search className="w-5 h-5 text-red-400" />
                            {highlightMatch(name, searchQuery)}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
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
                    <User className="w-6 h-6 text-red-600" />
                    <span>{user?.name || user?.email || 'Account'}</span>
                    <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                        onMouseDown={() => { setUserDropdownOpen(false); navigate('/user/addresses'); }}
                      >
                        Dashboard
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                        onMouseDown={() => { setUserDropdownOpen(false); logout(); }}
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
                    <User className="w-6 h-6 text-red-600" />
                    <span>Login & Register</span>
                    <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
                  </button>
                  {authDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                        onMouseDown={() => { setAuthDropdownOpen(false); navigate('/login'); }}
                      >
                        Login
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                        onMouseDown={() => { setAuthDropdownOpen(false); navigate('/register'); }}
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
                onClick={handleChangeStore}
                aria-label="Change delivery or pickup location"
                type="button"
              >
                <MapPin className="w-4 h-4 text-red-600" />
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
                onClick={() => navigate('/wishlist')}
                aria-label="Wishlist"
              >
                <Heart size={28} className={wishlistCount > 0 ? 'text-red-500 text-red-500' : 'text-gray-700'} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                className="relative flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-all"
                onClick={() => navigate('/cart')}
                aria-label="Cart"
              >
                <ShoppingCart size={28} className="text-gray-700" />
                {cart?.items && cart.items.length > 0 && (
                  <>
                    {/* Item count badge */}
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-bold">
                      {cart.items.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                    {/* Price display for desktop */}
                    <div className="hidden md:block text-sm">
                      <div className="text-gray-600">Cart</div>
                      <div className="font-semibold text-red-600">
                        د.إ{cart.total ? cart.total.toFixed(2) : '0.00'}
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
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
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
                          className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-all"
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

            {/* Express Delivery Badge */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-white bg-opacity-20 rounded-lg text-white text-sm">
              <Truck className="w-4 h-4" />
              <span>Express: 15min</span>
            </div>
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
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-medium">Express delivery</span>
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
                      className="p-3 bg-red-50 flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors"
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
                            className="p-3 hover:bg-red-50 cursor-pointer border-b border-gray-100 flex items-center justify-between group transition-colors"
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
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#8e191c] to-[#b91c1c]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Grid3X3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Categories</h2>
                  </div>
                </div>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              {/* Language Selector (Mobile) */}
              <div className="mb-4 flex justify-center">
                <DeepLTranslateWidget />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingCategories ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                </div>
              ) : categoryError ? (
                <div className="text-center py-8 px-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-gray-600">{categoryError}</p>
                </div>
              ) : allCategories.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No categories available</p>
                </div>
              ) : (
                <div className="p-4">
                  {/* Mobile Category Groups - Collapsible */}
                  {Object.entries(groupedCategories).map(([groupName, groupCategories]) => (
                    groupCategories.length > 0 && (
                      <div key={groupName} className="mb-6">
                        {/* Group Header - Collapsible */}
                        <div
                          className="flex items-center space-x-2 mb-3 pb-2 border-b border-gray-100 cursor-pointer select-none"
                          onClick={() => toggleSection(groupName)}
                        >
                          <span className="text-lg">{getGroupIcon(groupName)}</span>
                          <h3 className="font-bold text-gray-800 text-sm">{groupName}</h3>
                          <span className="text-xs text-gray-500">({groupCategories.length})</span>
                          <span className="ml-auto text-xl font-bold text-gray-400">{expandedSections[groupName] ? '–' : '+'}</span>
                        </div>
                        {/* Categories in Group - Only show if expanded */}
                        {expandedSections[groupName] && (
                          <div className="space-y-3">
                            {groupCategories.map((category) => (
                              <div
                                key={category._id}
                                className="flex items-center justify-between p-4 rounded-xl bg-white shadow border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all"
                                onClick={() => handleCategoryClick(category)}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <span className="text-xl">{getCategoryIcon(category.name)}</span>
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-bold text-gray-800 text-base pl-4">{category.name} <span className='text-gray-500 font-normal'>({category.itemCount || 0})</span></span>
                                    <div className="text-xs text-gray-500">{category.itemCount || 0} items</div>
                                  </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  ))}
                  {/* Mobile Footer Stats */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 text-white">
                      <div className="text-center">
                        <div className="text-red-100 text-sm mb-3">Products Available</div>
                        <button 
                          className="w-full bg-white text-red-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Start Shopping
                        </button>
                      </div>
                    </div>
                  </div>
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