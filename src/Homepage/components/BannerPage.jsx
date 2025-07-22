import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import webService from '../../services/Website/WebService';
import LoaderOverlay from '../../components/LoaderOverlay';
import { useStore } from '../../context/StoreContext';

const PromotionalBanners = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bannerData, setBannerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedStore } = useStore();

  // Fallback banner data
  const fallbackBanners = [
    {
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    },
    {
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    },
    {
      image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await webService.getActiveBannersByStore();
        // The API returns { success, count, data: [...] }
        setBannerData(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (err) {
        setError('Failed to load banners. Showing default banners.');
        setBannerData(fallbackBanners);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [selectedStore]);

  // Auto-advance carousel
  useEffect(() => {
    if (bannerData.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerData.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerData.length) % bannerData.length);
  };

  if (loading) {
    return <LoaderOverlay text="Loading banners..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 h-80 md:h-[28rem] lg:h-[32rem]">
        <span className="text-lg text-red-500">{error}</span>
      </div>
    );
  }

  if (bannerData.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 h-80 md:h-[28rem] lg:h-[32rem]">
        <span className="text-lg text-gray-500">No banners available.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="max-w-7xl mx-auto w-full">
        {/* Main Carousel Container */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl shadow-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {bannerData.map((banner, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  <div className="flex items-center justify-center h-80 md:h-[28rem] lg:h-[32rem] bg-gray-200 bg-opacity-40">
                    <img 
                      src={banner.image} 
                      alt={`Banner ${index + 1}`} 
                      className="object-cover h-full w-full rounded-3xl"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="group absolute top-1/2 left-4 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-all z-20"
            disabled={bannerData.length <= 1}
          >
            <ChevronLeft className="w-6 h-6 text-white group-hover:text-[#8e191c] transition-colors duration-300" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="group absolute top-1/2 right-4 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-all z-20"
            disabled={bannerData.length <= 1}
          >
            <ChevronRight className="w-6 h-6 text-white group-hover:text-[#8e191c] transition-colors duration-300" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {bannerData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                style={index === currentSlide ? { backgroundColor: '#8e191c' } : {}}
                disabled={bannerData.length <= 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanners;