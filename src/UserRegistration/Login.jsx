import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Check, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PQFLogo from '../assets/PQF-22.png';

// Move InputField component outside to prevent re-creation
const InputField = React.memo(({ type, name, label, icon: Icon, value, onChange, showPassword, onTogglePassword }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative mb-6">
      <div className="relative">
        <input
          type={name === 'password' && showPassword ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-4 py-4 pl-12 bg-gray-50 border-2 rounded-xl transition-all duration-300 outline-none ${
            isFocused || value 
              ? 'bg-white shadow-lg' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          style={{
            borderColor: isFocused || value ? '#8e191c' : undefined,
            boxShadow: isFocused || value ? '0 10px 15px -3px rgba(142, 25, 28, 0.1)' : undefined
          }}
          placeholder=" "
          required
        />
        
        <label className={`absolute left-12 transition-all duration-300 pointer-events-none ${
          isFocused || value
            ? '-top-2 text-xs bg-white px-2 ml-1'
            : 'top-4 text-gray-500'
        }`}
        style={{
          color: isFocused || value ? '#8e191c' : undefined
        }}>
          {label}
        </label>
        
        <Icon className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${
          isFocused || value ? 'text-gray-400' : 'text-gray-400'
        }`} 
        style={{
          color: isFocused || value ? '#8e191c' : undefined
        }} />
        
        {name === 'password' && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            style={{
              color: showPassword ? '#8e191c' : undefined
            }}
          >
            {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
});

const PremierLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Create floating particles effect with enhanced visuals
  useEffect(() => {
    const createParticle = () => {
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#8b5cf6'];
      const newParticle = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: 100,
        size: Math.random() * 6 + 2,
        speed: Math.random() * 2 + 0.5,
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

    const interval = setInterval(animateParticles, 100);
    return () => clearInterval(interval);
  }, []);

  // Stable callback using useCallback
  const handleInputChange = React.useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Stable callback for password toggle
  const handleTogglePassword = React.useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    // Validate form
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the login API using AuthContext
      const response = await login({
        email: formData.email,
        password: formData.password
      });
      
      console.log("Full login response:", response);
      
      setSuccess('Login successful!');
      
      // Get user data from the response (now correctly accessing nested data)
      const loggedInUser = response?.data?.user;
      const token = response?.data?.token;
      console.log("Logged in user:", loggedInUser);
      console.log("Token:", token); // Log the token
      
      if (!loggedInUser) {
        console.error("No user data in response");
        setError('Login failed: No user data received');
        return;
      }
      
      const role = loggedInUser.role;
      console.log("User role:", role);

      // Redirect based on role after a short delay
      setTimeout(() => {
        // Check for admin roles (including superAdmin)
        if (role === 'superAdmin') {
          console.log("Redirecting to super admin panel for role:", role);
          navigate('/superAdmin/stores');
        } else if (role === 'admin') {
          console.log("Redirecting to admin panel for role:", role);
          navigate('/admin/categories');
        } else if (role === 'customer') {
          console.log("Redirecting to home for customer");
          navigate('/');
        } else {
          console.log("Unknown role, redirecting to home:", role);
          navigate('/');
        }
      }, 1500); // Reduced timeout for better UX
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Extract the specific error message from the backend response
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (error.response && error.response.data) {
        // If the backend returns a specific error message
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        // If it's a direct error message
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 via-purple-50 to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced Animated Background with Multiple Layers */}
      <div className="absolute inset-0">
        {/* Primary Pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)`,
          backgroundSize: '60px 60px',
          animation: 'float 8s ease-in-out infinite'
        }} />
        
        {/* Secondary Pattern */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #8b5cf6 1px, transparent 0)`,
          backgroundSize: '80px 80px',
          animation: 'float 12s ease-in-out infinite reverse'
        }} />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-32 right-20 w-96 h-96 bg-gradient-to-r from-indigo-300/15 to-pink-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-blue-400/30 rounded-full animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-indigo-400/40 rounded-full animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.8s' }} />
      </div>

      {/* Enhanced Floating Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-60 pointer-events-none animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `linear-gradient(45deg, ${particle.color}, ${particle.color}80)`,
            transition: 'top 0.05s linear',
            boxShadow: `0 0 15px ${particle.color}40`
          }}
        />
      ))}

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>

      {/* Main Container with Enhanced Styling */}
      <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden w-full max-w-5xl min-h-[600px] flex flex-col lg:flex-row relative border border-white/50 shadow-blue-500/10">
        
        {/* Enhanced Left Panel */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #8e191c 0%, #a52a2a 50%, #8e191c 100%)'
        }}>
          {/* Enhanced Animated Background Circle */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border-2 border-white rounded-full animate-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/50 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          
          {/* Floating Elements in Red Panel */}
          <div className="absolute top-8 right-8 w-3 h-3 bg-white/30 rounded-full animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          <div className="absolute bottom-12 left-8 w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }} />
          <div className="absolute top-1/3 left-12 w-4 h-4 bg-white/20 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
          
          <div className="relative z-10 text-center">
            {/* Enhanced Logo */}
            <img src={PQFLogo} alt="PQF Logo" className="w-28 lg:w-36 h-28 lg:h-36 object-contain mb-6 mx-auto animate-pulse" style={{ filter: 'brightness(0) invert(1)' }} />
            
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-wider drop-shadow-lg text-white">PREMIER</h1>
            <p className="text-lg lg:text-xl opacity-90 mb-6 lg:mb-8 drop-shadow text-white">QUALITY FOODS</p>
            
            {/* Enhanced Grocery Icons */}
            <div className="flex justify-center space-x-4 lg:space-x-6 mb-6 lg:mb-8">
              {['🛒', '🥬', '🥩'].map((emoji, index) => (
                <div 
                  key={index}
                  className="w-10 lg:w-12 h-10 lg:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl lg:text-2xl animate-bounce shadow-lg border border-white/30"
                  style={{ animationDelay: `${index * 0.2}s`, animationDuration: '2s' }}
                >
                  {emoji}
                </div>
              ))}
            </div>
            
            <p className="text-base lg:text-lg opacity-90 leading-relaxed px-4 drop-shadow text-white">
              Join our community and experience the future of culinary excellence
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-6 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-6 lg:mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-3">Welcome Back!</h2>
              <p className="text-gray-600 text-base lg:text-lg">Sign in to your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 border rounded-xl flex items-center gap-3 animate-fade-in" style={{
                backgroundColor: 'rgba(142, 25, 28, 0.1)',
                borderColor: 'rgba(142, 25, 28, 0.2)'
              }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#8e191c' }} />
                <span className="text-sm font-medium" style={{ color: '#8e191c' }}>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-green-700 text-sm font-medium">{success}</span>
              </div>
            )}

            {/* Login Form */}
            <div className="space-y-2">
              <InputField
                type="email"
                name="email"
                label="Email Address"
                icon={Mail}
                value={formData.email}
                onChange={handleInputChange}
                showPassword={showPassword}
                onTogglePassword={handleTogglePassword}
              />

              <InputField
                type="password"
                name="password"
                label="Password"
                icon={Lock}
                value={formData.password}
                onChange={handleInputChange}
                showPassword={showPassword}
                onTogglePassword={handleTogglePassword}
              />

              {/* Extra spacing added here */}
              <div className="mt-8 mb-8">
                {/* Options */}
                <div className="flex items-center justify-between mb-8 lg:mb-10">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded transition-all duration-300 ${
                        formData.rememberMe 
                          ? 'border-gray-300' 
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}
                      style={{
                        backgroundColor: formData.rememberMe ? '#8e191c' : undefined,
                        borderColor: formData.rememberMe ? '#8e191c' : undefined
                      }}>
                        {formData.rememberMe && (
                          <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                        )}
                      </div>
                    </div>
                    <span className="ml-3 text-sm lg:text-base text-gray-700 group-hover:text-gray-900 transition-colors">
                      Remember me
                    </span>
                  </label>
                  
                  <button type="button" className="text-sm lg:text-base transition-colors font-medium" 
                    style={{ color: '#8e191c' }}
                    onMouseEnter={(e) => e.target.style.color = '#a52a2a'}
                    onMouseLeave={(e) => e.target.style.color = '#8e191c'}
                    onClick={() => navigate('/forgot-password')}>
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full text-white py-4 rounded-2xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, #8e191c 0%, #a52a2a 100%)',
                    boxShadow: '0 10px 15px -3px rgba(142, 25, 28, 0.25)'
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </span>
                  <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" 
                    style={{
                      background: 'linear-gradient(135deg, #a52a2a 0%, #8e191c 100%)'
                    }} />
                </button>
              </div>
            </div>

            {/* Signup Link */}
            <div className="text-center mt-6 lg:mt-8">
              <p className="text-sm lg:text-base text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="font-bold transition-colors"
                  style={{ color: '#8e191c' }}
                  onMouseEnter={(e) => e.target.style.color = '#a52a2a'}
                  onMouseLeave={(e) => e.target.style.color = '#8e191c'}
                  onClick={handleSignUp}
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremierLogin;