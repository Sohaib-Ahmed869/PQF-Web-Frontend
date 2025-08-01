import React, { useState, useEffect, useMemo } from 'react';
import webService from '../../services/Website/WebService';
import LoaderOverlay from '../../components/LoaderOverlay';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

// Simple Category Card Component with enhanced interactivity
const CategoryCard = React.memo(({ category, onClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="group cursor-pointer transform transition-all duration-300 ease-out"
      onClick={() => onClick(category.id)}
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
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:to-black/10 before:opacity-0 before:transition-opacity before:duration-300
        ${isHovered ? 'before:opacity-100' : ''}
      `}>
        {/* Animated Background Gradient */}
        <div className={`
          absolute inset-0 transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          style={{
            background: 'linear-gradient(to bottom right, rgba(142, 25, 28, 0.1), rgba(142, 25, 28, 0.05))'
          }}
        />
        
        {/* Image Container - Smaller and more compact */}
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={category.image}
            alt={category.name}
            className={`
              w-full h-full object-cover transition-all duration-500 ease-out
              ${isHovered ? 'scale-110 brightness-110' : 'group-hover:scale-105'}
            `}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80';
            }}
          />
          
          {/* Overlay effect */}
          <div className={`
            absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
            transition-opacity duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `} />
          
          {/* Floating icon effect */}
          <div className={`
            absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center
            transform transition-all duration-300 backdrop-blur-sm
            ${isHovered ? 'scale-110 rotate-12' : 'scale-0'}
          `}>
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
        
        {/* Category Name - More compact */}
        <div className="relative p-3" style={{ backgroundColor: '#8e191c' }}>
          <h3 className={`
            text-xs font-semibold text-white text-center truncate
            transition-all duration-300
            ${isHovered ? 'transform scale-105' : ''}
          `}>
            {category.name}
          </h3>
          
          {/* Animated underline */}
          <div className={`
            absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-white/50
            transition-all duration-300 ease-out
            ${isHovered ? 'w-3/4' : 'w-0'}
          `} />
        </div>
        
        {/* Ripple effect */}
        <div className={`
          absolute inset-0 rounded-xl border-2 transition-all duration-300 ease-out pointer-events-none
          ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{ borderColor: '#8e191c' }}
        />
      </div>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  
  const { selectedStore } = useStore();
  const navigate = useNavigate();

  // Enhanced fallback categories with better variety and item counts
  const fallbackCategories = useMemo(() => [
    { id: '1', name: 'Fresh Fruits', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80', itemCount: 45 },
    { id: '2', name: 'Vegetables', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', itemCount: 38 },
    { id: '3', name: 'Bakery', image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', itemCount: 32 },
    { id: '4', name: 'Dairy', image: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80', itemCount: 28 },
    { id: '5', name: 'Meat & Fish', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80', itemCount: 25 },
    { id: '6', name: 'Beverages', image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=400&q=80', itemCount: 22 },
    { id: '7', name: 'Snacks', image: 'https://images.unsplash.com/photo-1626790680787-de5e9a07bcf2?auto=format&fit=crop&w=400&q=80', itemCount: 20 },
    { id: '8', name: 'Frozen', image: 'https://images.unsplash.com/photo-1520008776522-66c6799391b8?auto=format&fit=crop&w=400&q=80', itemCount: 18 },
    { id: '9', name: 'Pantry', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80', itemCount: 15 },
    { id: '10', name: 'Condiments', image: 'https://images.unsplash.com/photo-1506807803488-8eaac7aa8405?auto=format&fit=crop&w=400&q=80', itemCount: 12 },
    { id: '11', name: 'Pasta & Rice', image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=400&q=80', itemCount: 10 },
    { id: '12', name: 'Oils & Spices', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80', itemCount: 8 },
    { id: '13', name: 'Organic', image: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=400&q=80', itemCount: 6 },
    { id: '14', name: 'Health & Wellness', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80', itemCount: 5 },
    { id: '15', name: 'Baby Care', image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=400&q=80', itemCount: 4 },
    { id: '16', name: 'Pet Supplies', image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=400&q=80', itemCount: 3 },
    { id: '17', name: 'Household', image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&w=400&q=80', itemCount: 2 },
    { id: '18', name: 'Personal Care', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80', itemCount: 1 },
    { id: '19', name: 'Tea & Coffee', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80', itemCount: 1 },
    { id: '20', name: 'Chocolates', image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=400&q=80', itemCount: 1 },
  ], []);

  // Fetch categories from API
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
        
        const formattedCategories = apiCategories.map(cat => ({
          id: cat._id,
          name: cat.name,
          image: cat.image,
          ItemsGroupCode: cat.ItemsGroupCode, // Add this field for filtering
          itemCount: cat.itemCount || 0 // Add item count for sorting
        }));
        
        // Sort categories by item count (highest first)
        const sortedCategories = formattedCategories.sort((a, b) => b.itemCount - a.itemCount);
        
        setCategories(sortedCategories);
        setAnimateCards(true);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load categories. Showing default categories.');
        setCategories(fallbackCategories);
        setAnimateCards(true);
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

  const handleCategoryClick = (category) => {
    // Always use ItemsGroupCode (number) for filtering, just like in navbar
    const categoryCode = String(category.ItemsGroupCode);
    navigate(`/products?category=${encodeURIComponent(categoryCode)}`);
  };

  const toggleShowAllCategories = () => {
    setShowAllCategories(!showAllCategories);
  };

  // Determine which categories to show
  const displayedCategories = showAllCategories ? categories : categories.slice(0, 12);

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="px-3 py-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
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
        {/* Enhanced Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-3" style={{ background: 'linear-gradient(to right, #8e191c, #8e191c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Shop by Category
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Discover amazing products in every category
          </p>
        </div>

        {/* Categories Grid - Responsive and compact */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-8">
          {displayedCategories.map((category, index) => (
            <CategoryCard 
              key={category.id} 
              category={category}
              onClick={() => handleCategoryClick(category)}
              index={index}
            />
          ))}
        </div>

        {/* Enhanced View All Button */}
        {categories.length > 12 && (
          <div className="text-center">
            <button
              onClick={toggleShowAllCategories}
              className="group inline-flex items-center px-8 py-4 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              style={{ background: 'linear-gradient(to right, #8e191c, #8e191c)' }}
            >
              {showAllCategories ? (
                <>
                  <span>Show Less</span>
                  <svg className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>View All ({categories.length})</span>
                  <svg className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}


      </div>


    </div>
  );
};

export default Category;