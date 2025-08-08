import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PQFLogo from '../assets/PQF-22.png';

// Move InputField component outside to prevent re-creation
const InputField = React.memo(({ type, name, label, icon: Icon, value, onChange, showPassword, onTogglePassword }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative mb-2">
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

const PremierRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  });
  const [documents, setDocuments] = useState({
    tradeLicense: null,
    idDocument: null,
    bankStatement: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const [formStep, setFormStep] = useState('manual'); // Changed from 'social' to 'manual'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

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

  const handleFileChange = React.useCallback((e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [documentType]: file
      }));
    }
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
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    
    if (!formData.agreeToPrivacy) {
      setError('Please agree to the privacy policy');
      return;
    }
    
    // Validate required documents
    if (!documents.tradeLicense) {
      setError('Trade License is required');
      return;
    }
    
    if (!documents.idDocument) {
      setError('ID Document is required');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    // Validate phone number
    if (!formData.phone || formData.phone.trim().length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('role', 'customer');
      formDataToSend.append('agreeToTerms', formData.agreeToTerms);
      formDataToSend.append('agreeToPrivacy', formData.agreeToPrivacy);
      
      // Add required files
      formDataToSend.append('tradeLicense', documents.tradeLicense);
      formDataToSend.append('idDocument', documents.idDocument);
      
      // Add optional bank statement if provided
      if (documents.bankStatement) {
        formDataToSend.append('bankStatement', documents.bankStatement);
      }
      
      // Call the registration API using AuthContext
      const response = await register(formDataToSend);
      console.log('Registration response:', response);
      
      setSuccess('Registration successful! Please login to continue.');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Extract the specific error message from the backend response
      let errorMessage = 'Registration failed. Please try again.';
      
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
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-3">Create Account</h2>
              <p className="text-gray-600 text-base lg:text-lg flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: '#8e191c' }} />
                Join the Premier family today
                <Sparkles className="w-5 h-5" style={{ color: '#8e191c' }} />
              </p>
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

            {/* Manual Registration Form */}
            <div className="space-y-2">
              <InputField
                type="text"
                name="name"
                label="Full Name *"
                icon={User}
                value={formData.name}
                onChange={handleInputChange}
                showPassword={showPassword}
                onTogglePassword={handleTogglePassword}
              />

              <InputField
                type="email"
                name="email"
                label="Email Address *"
                icon={Mail}
                value={formData.email}
                onChange={handleInputChange}
                showPassword={showPassword}
                onTogglePassword={handleTogglePassword}
              />

              <InputField
                type="tel"
                name="phone"
                label="Phone Number *"
                icon={Phone}
                value={formData.phone}
                onChange={handleInputChange}
                showPassword={showPassword}
                onTogglePassword={handleTogglePassword}
              />

              <InputField
                type="password"
                name="password"
                label="Password *"
                icon={Lock}
                value={formData.password}
                onChange={handleInputChange}
                showPassword={showPassword}
                onTogglePassword={handleTogglePassword}
              />

              {/* Document Upload Fields */}
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trade License <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => handleFileChange(e, 'tradeLicense')}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-300 outline-none hover:border-gray-300 focus:bg-white"
                      style={{
                        borderColor: documents.tradeLicense ? '#8e191c' : documents.tradeLicense === null && formData.email ? '#ef4444' : undefined
                      }}
                      required
                    />
                    {documents.tradeLicense && (
                      <div className="mt-2 text-sm text-green-600 flex items-center">
                        <Check className="w-4 h-4 mr-1" />
                        {documents.tradeLicense.name}
                      </div>
                    )}
                    {!documents.tradeLicense && formData.email && (
                      <div className="mt-1 text-sm text-red-500">
                        Trade License is required for registration
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Document <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => handleFileChange(e, 'idDocument')}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-300 outline-none hover:border-gray-300 focus:bg-white"
                      style={{
                        borderColor: documents.idDocument ? '#8e191c' : documents.idDocument === null && formData.email ? '#ef4444' : undefined
                      }}
                      required
                    />
                    {documents.idDocument && (
                      <div className="mt-2 text-sm text-green-600 flex items-center">
                        <Check className="w-4 h-4 mr-1" />
                        {documents.idDocument.name}
                      </div>
                    )}
                    {!documents.idDocument && formData.email && (
                      <div className="mt-1 text-sm text-red-500">
                        ID Document is required for registration
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Statement (Last 6 Months) <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                      onChange={(e) => handleFileChange(e, 'bankStatement')}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-300 outline-none hover:border-gray-300 focus:bg-white"
                      style={{
                        borderColor: documents.bankStatement ? '#8e191c' : undefined
                      }}
                    />
                    {documents.bankStatement && (
                      <div className="mt-2 text-sm text-green-600 flex items-center">
                        <Check className="w-4 h-4 mr-1" />
                        {documents.bankStatement.name}
                      </div>
                    )}
                    {!documents.bankStatement && (
                      <div className="mt-1 text-sm text-gray-500">
                        Upload bank statement for the last 6 months (optional)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Extra spacing added here */}
              <div className="mt-8 mb-8">
                {/* Terms and Conditions */}
                <div className="flex items-start mb-4">
                  <label className="flex items-start cursor-pointer group">
                    <div className="relative mt-1">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded transition-all duration-300 ${
                        formData.agreeToTerms 
                          ? 'border-gray-300' 
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}
                      style={{
                        backgroundColor: formData.agreeToTerms ? '#8e191c' : undefined,
                        borderColor: formData.agreeToTerms ? '#8e191c' : undefined
                      }}>
                        {formData.agreeToTerms && (
                          <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                        )}
                      </div>
                    </div>
                    <span className="ml-3 text-sm lg:text-base text-gray-700 group-hover:text-gray-900 transition-colors leading-relaxed">
                      I agree to the{' '}
                      <button
                        type="button"
                        className="font-semibold underline transition-all"
                        style={{ 
                          color: '#8e191c',
                          textDecorationColor: 'rgba(142, 25, 28, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#a52a2a';
                          e.target.style.textDecorationColor = 'rgba(165, 42, 42, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#8e191c';
                          e.target.style.textDecorationColor = 'rgba(142, 25, 28, 0.3)';
                        }}
                        onClick={() => navigate('/terms')}
                      >
                        Terms and Conditions
                      </button>
                    </span>
                  </label>
                </div>

                {/* Privacy Policy */}
                <div className="flex items-start mb-8 lg:mb-10">
                  <label className="flex items-start cursor-pointer group">
                    <div className="relative mt-1">
                      <input
                        type="checkbox"
                        name="agreeToPrivacy"
                        checked={formData.agreeToPrivacy}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded transition-all duration-300 ${
                        formData.agreeToPrivacy 
                          ? 'border-gray-300' 
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}
                      style={{
                        backgroundColor: formData.agreeToPrivacy ? '#8e191c' : undefined,
                        borderColor: formData.agreeToPrivacy ? '#8e191c' : undefined
                      }}>
                        {formData.agreeToPrivacy && (
                          <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                        )}
                      </div>
                    </div>
                    <span className="ml-3 text-sm lg:text-base text-gray-700 group-hover:text-gray-900 transition-colors leading-relaxed">
                      I agree to the{' '}
                      <button
                        type="button"
                        className="font-semibold underline transition-all"
                        style={{ 
                          color: '#8e191c',
                          textDecorationColor: 'rgba(142, 25, 28, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#a52a2a';
                          e.target.style.textDecorationColor = 'rgba(165, 42, 42, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = '#8e191c';
                          e.target.style.textDecorationColor = 'rgba(142, 25, 28, 0.3)';
                        }}
                        onClick={() => navigate('/privacy')}
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </label>
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5 mr-2" />
                        Create Account
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" 
                    style={{
                      background: 'linear-gradient(135deg, #a52a2a 0%, #8e191c 100%)'
                    }} />
                </button>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center mt-6 lg:mt-8">
              <p className="text-sm lg:text-base text-gray-600">
                Already have an account?{' '}
                <button
                  className="font-bold transition-colors hover:underline"
                  style={{ color: '#8e191c' }}
                  onMouseEnter={(e) => e.target.style.color = '#a52a2a'}
                  onMouseLeave={(e) => e.target.style.color = '#8e191c'}
                  onClick={() => navigate('/login')}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremierRegistration;