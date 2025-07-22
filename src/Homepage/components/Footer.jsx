import React, { useState, useEffect } from 'react';

// Floating Particles Component
const FooterParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const createParticle = () => {
      const colors = ['#8e191c', '#ef4444', '#f87171', '#dc2626', '#b91c1c'];
      const newParticle = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: 100,
        size: Math.random() * 3 + 2,
        speed: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      setParticles(prev => [...prev.slice(-10), newParticle]);
    };
    const interval = setInterval(createParticle, 1800);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="pointer-events-none absolute inset-0 w-full h-full z-0">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
        />
      ))}
    </div>
  );
};

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return (
    <footer className="bg-gradient-to-b from-white to-[#8e191c] text-neutral-800 py-8 px-2 sm:py-12 sm:px-4 relative overflow-hidden">
      <FooterParticles />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Our Company Section */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold mb-4 sm:mb-6 uppercase tracking-wide text-neutral-800">
              Premier Quality Foods
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="hover:text-[#8e191c] transition-colors duration-200 block">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#8e191c] transition-colors duration-200 block">
                  Our stores
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#8e191c] transition-colors duration-200 block">
                  Halal certification
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#8e191c] transition-colors duration-200 block">
                  Delivery
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#8e191c] transition-colors duration-200 block">
                  General Terms and Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#8e191c] transition-colors duration-200 block">
                  Legal notices
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#8e191c] transition-colors duration-200 block">
                  Personal Data
                </a>
              </li>
            </ul>
          </div>

          {/* Products Section */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold mb-4 sm:mb-6 uppercase tracking-wide text-neutral-800">
              Explore Products
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="hover:text-[#8e191c] transition-colors duration-200 block">
                  Promotions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#8e191c] transition-colors duration-200 block">
                  What's new
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#8e191c] transition-colors duration-200 block">
                  Best Sellers
                </a>
              </li>
            </ul>
          </div>

          {/* Your Account Section */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold mb-4 sm:mb-6 uppercase tracking-wide text-neutral-800">
              Customer Area
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="hover:text-[#8e191c] transition-colors duration-200 block">
                  Shopping lists
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#8e191c] transition-colors duration-200 block">
                  Orders
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#8e191c] transition-colors duration-200 block">
                  Personal information
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold mb-4 sm:mb-6 uppercase tracking-wide text-black">
              Get in Touch
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <p className="font-semibold text-black">
                Halal Food Service
              </p>
              <p className="text-black">
                32 Rue Raspail 93120 La Courneuve
              </p>
              <p className="text-black">
                <span className="font-medium text-black">Telephone: </span>
                <a href="tel:01.79.64.84.05" className="text-black hover:text-[#8e191c] transition-colors duration-200">
                  01.79.64.84.05
                </a>
              </p>
              <p className="text-black">
                <span className="font-medium text-black">Email: </span>
                <a href="mailto:commande@halalfs.com" className="text-black hover:text-[#8e191c] transition-colors duration-200">
                  commande@halalfs.com
                </a>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom border line */}
        <div className="border-t border-premier mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left text-white text-xs sm:text-sm">
              <p className="text-white">&copy; 2025 Halal Food Service. All rights reserved.</p>
            </div>
            {/* Payment Icons */}
            <div className="flex items-center justify-center space-x-3 sm:space-x-4">
              {/* Modern Payment Logos */}
              <div className="flex items-center space-x-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-5 w-auto sm:h-6 bg-white rounded shadow" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard" className="h-5 w-auto sm:h-6 bg-white rounded shadow" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 w-auto sm:h-6 bg-white rounded shadow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 bg-premier-gradient hover:bg-premier-light text-white p-2 sm:p-3 rounded-full shadow-premier hover:shadow-premier-hover transition-all duration-300 transform hover:scale-110 z-50 group"
          aria-label="Scroll to top"
        >
          {/* Inline Arrow Up SVG */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-y-1">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      )}
    </footer>
  );
};

export default Footer;