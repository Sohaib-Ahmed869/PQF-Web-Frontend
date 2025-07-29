import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import webService from '../../services/Website/WebService';
import LoaderOverlay from '../../components/LoaderOverlay';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

// Add global keyframes for float-spin animation (only once)
const addFloatSpinKeyframes = (() => {
  let added = false;
  return () => {
    if (typeof document !== 'undefined' && !added && !document.getElementById('float-spin-keyframes')) {
      const style = document.createElement('style');
      style.id = 'float-spin-keyframes';
      style.innerHTML = `
        @keyframes float-spin {
          0% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(12px, -10px) rotate(72deg); }
          40% { transform: translate(-14px, 14px) rotate(144deg); }
          60% { transform: translate(16px, 18px) rotate(216deg); }
          80% { transform: translate(-10px, -12px) rotate(288deg); }
          100% { transform: translate(0, 0) rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
      added = true;
    }
  };
})();

// Memoized CategoryCard component to prevent unnecessary re-renders
const CategoryCard = React.memo(({ 
  category, 
  index, 
  isHovered, 
  isExpanded, 
  onMouseEnter, 
  onMouseLeave, 
  onToggle, 
  onSubcategoryClick 
}) => {
  return (
    <div className="w-full relative overflow-visible">
      {/* Main Category Card */}
      <div 
        className="relative overflow-hidden cursor-pointer transition-all duration-300 group h-32 mb-4 z-0"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onToggle}
      >
        {/* Main Card with Modern Shape */}
        <div className="relative h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
             style={{
               clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))',
               background: 'linear-gradient(to right, #8e191c, #8e191c)',
             }}>
          
          {/* Category Image */}
          <div className="absolute left-0 top-0 bottom-0 w-1/3 overflow-hidden">
            <img 
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[#8e191c]/20" />
          </div>

          {/* Category Name and Expand Button */}
          <div className="absolute right-0 top-0 bottom-0 w-2/3 flex items-center justify-between p-6">
            <h2 className={`translatable text-white text-xl font-bold leading-tight transition-all duration-300 ${isHovered ? 'scale-105' : ''}`}>
              {category.name}
            </h2>
            
            {/* Expand/Collapse Button */}
            <div className="ml-4 text-white transition-transform duration-300">
              {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </div>
          </div>

          {/* Decorative Floating Elements */}
          <div className="absolute right-2 top-0 bottom-0 w-24 opacity-30">
            <div className="relative w-full h-full">
              {/* Small Circle */}
              <div 
                className="w-6 h-6 bg-white/35 rounded-full absolute bottom-16 right-4"
                style={{
                  animation: isHovered ? 'float-spin 4s ease-in-out infinite' : 'none'
                }}
              />
              {/* Diamond Shape */}
              <div 
                className="w-8 h-8 bg-white/25 absolute top-20 right-8 transform rotate-45"
                style={{
                  animation: isHovered ? 'float-spin 3.5s ease-in-out infinite reverse' : 'none'
                }}
              />
              {/* Hexagon */}
              <div 
                className="w-12 h-12 bg-white/20 absolute bottom-8 right-10"
                style={{
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  animation: isHovered ? 'float-spin 2.8s ease-in-out infinite' : 'none'
                }}
              />
              {/* Triangle */}
              <div 
                className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-transparent border-b-white/30 absolute top-32 right-6"
                style={{
                  animation: isHovered ? 'float-spin 3.2s ease-in-out infinite reverse' : 'none'
                }}
              />
              {/* Star Shape */}
              <div 
                className="w-10 h-10 bg-white/25 absolute bottom-20 right-16"
                style={{
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  animation: isHovered ? 'float-spin 2.2s ease-in-out infinite' : 'none'
                }}
              />
              {/* Small Diamond */}
              <div 
                className="w-5 h-5 bg-white/20 absolute top-8 right-20 transform rotate-45"
                style={{
                  animation: isHovered ? 'float-spin 4.5s ease-in-out infinite reverse' : 'none'
                }}
              />
            </div>
          </div>

          {/* Subtle Accent Line */}
          <div className="absolute top-4 right-4 w-8 h-0.5 bg-white/40 transition-all duration-300 group-hover:w-12 group-hover:bg-white/60" />
        </div>

        {/* Modern Shadow Effect */}
        <div className="absolute inset-0 -z-10 bg-[#8e191c]/20 blur-lg transform transition-all duration-300 group-hover:scale-110" 
             style={{
               clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
             }} />
      </div>

      {/* Expandable Subcategories */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-screen opacity-100 mb-6' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {category.subcategories.map((subcategory) => (
              <div 
                key={subcategory.id}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-105 cursor-pointer border hover:shadow-lg"
                style={{ 
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))', 
                  boxShadow: '0 4px 16px 0 rgba(142, 25, 28, 0.15)',
                  borderColor: '#8e191c',
                  borderWidth: '1px'
                }}
                onClick={() => onSubcategoryClick(subcategory.id)}
              >
                <div
                  className="w-full h-20 mb-3 overflow-hidden rounded-lg"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))' }}
                >
                  <img 
                    src={subcategory.image}
                    alt={subcategory.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <h3 className="translatable text-sm font-medium text-gray-800 text-center leading-tight">
                  {subcategory.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

const Category = () => {
  // State management with minimal re-renders
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dropdownRef = useRef(null);
  const translationTimeoutRef = useRef(null);
  const { selectedStore } = useStore();
  const navigate = useNavigate();

  // Fallback categories data - memoized to prevent recreation
  const fallbackCategories = useMemo(() => [
    {
      id: '1',
      name: 'Fruits',
      image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80',
      subcategories: [
        { id: '1-1', name: 'Apples', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80' },
        { id: '1-2', name: 'Bananas', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80' },
        { id: '1-3', name: 'Oranges', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
        { id: '1-4', name: 'Grapes', image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80' },
      ],
    },
    {
      id: '2',
      name: 'Vegetables',
      image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
      subcategories: [
        { id: '2-1', name: 'Carrots', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80' },
        { id: '2-2', name: 'Broccoli', image: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80' },
        { id: '2-3', name: 'Spinach', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80' },
        { id: '2-4', name: 'Potatoes', image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80' },
      ],
    },
    {
      id: '3', 
      name: 'Bakery',
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
      subcategories: [
        { id: '3-1', name: 'Bread', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80' },
        { id: '3-2', name: 'Croissant', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
        { id: '3-3', name: 'Bagel', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80' },
        { id: '3-4', name: 'Muffin', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80' },
      ],
    },
    {
      id: '4',
      name: 'Dairy',
      image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
      subcategories: [
        { id: '4-1', name: 'Milk', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80' },
        { id: '4-2', name: 'Cheese', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80' },
        { id: '4-3', name: 'Yogurt', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
        { id: '4-4', name: 'Butter', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80' },
      ],
    },
    {
      id: '5',
      name: 'Meat',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
      subcategories: [
        { id: '5-1', name: 'Chicken', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80' },
        { id: '5-2', name: 'Beef', image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80' },
        { id: '5-3', name: 'Pork', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80' },
        { id: '5-4', name: 'Fish', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80' },
      ],
    },
    {
      id: '6',
      name: 'Beverages',
      image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80',
      subcategories: [
        { id: '6-1', name: 'Juice', image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80' },
        { id: '6-2', name: 'Soda', image: 'https://images.unsplash.com/photo-1506089676908-3592f7389d4d?auto=format&fit=crop&w=400&q=80' },
        { id: '6-3', name: 'Water', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80' },
        { id: '6-4', name: 'Tea', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80' },
      ],
    },
  ], []);

  // Initialize keyframes on mount
  useEffect(() => {
    addFloatSpinKeyframes();
  }, []);

  // Optimized category fetching with proper error handling
  useEffect(() => {
    let isMounted = true;

    async function fetchCategories() {
      if (!isMounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await webService.getActiveCategoriesByStore();
        
        if (!isMounted) return;
        
        let apiCategories = Array.isArray(response.data?.data) ? response.data.data : [];
        apiCategories = apiCategories
          .filter(cat => Array.isArray(cat.items) && cat.items.length > 4)
          .slice(0, 6);
        
        const formattedCategories = apiCategories.map(cat => ({
          id: cat._id,
          name: cat.name,
          image: cat.image,
          subcategories: Array.isArray(cat.items) 
            ? cat.items.slice(0, 4).map(item => ({
                id: item.id,
                name: item.ItemName,
                image: item.image
              })) 
            : []
        }));
        
        setCategories(formattedCategories);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load categories. Showing default categories.');
        setCategories(fallbackCategories);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, [selectedStore, fallbackCategories]);

  // Optimized click outside handler
  useEffect(() => {
    if (expandedCategory === null) return;

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setExpandedCategory(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedCategory]);

  // Debounced translation effect - only when category expands
  useEffect(() => {
    if (expandedCategory === null) return;

    // Clear previous timeout
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }

    // Debounce translation calls
    translationTimeoutRef.current = setTimeout(() => {
      const lang = window.translateWidget?.getCurrentLanguage?.();
      if (lang && lang.deepLCode !== "EN") {
        window.translateWidget?.translateNewContent?.();
      }
    }, 150);

    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [expandedCategory]);

  // Memoized event handlers to prevent recreation on each render
  const handleCategoryToggle = useCallback((categoryId) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  }, []);

  const handleSubcategoryClick = useCallback((subcategoryId) => {
    navigate(`/products/${subcategoryId}`);
  }, [navigate]);

  const handleMouseEnter = useCallback((categoryId) => {
    setHoveredCategory(categoryId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCategory(null);
  }, []);

  // Loading and error states
  if (loading) {
    return <LoaderOverlay text="Loading categories..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 h-80 md:h-[28rem] lg:h-[32rem]">
        <span className="text-lg text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div className="p-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <CategoryCard 
              key={category.id} 
              category={category}
              index={index}
              isHovered={hoveredCategory === category.id}
              isExpanded={expandedCategory === category.id}
              onMouseEnter={() => handleMouseEnter(category.id)}
              onMouseLeave={handleMouseLeave}
              onToggle={() => handleCategoryToggle(category.id)}
              onSubcategoryClick={handleSubcategoryClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;