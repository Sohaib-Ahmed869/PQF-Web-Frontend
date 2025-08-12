import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Check, Sparkles, AlertCircle, ArrowLeft, Building2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import PQFLogo from '../assets/PQF-22.png';

// Enhanced InputField component with better mobile styling
const InputField = React.memo(({ type, name, label, icon: Icon, value, onChange, showPassword, onTogglePassword, required = true }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative mb-4">
      <div className="relative">
        <input
          type={name === 'password' && showPassword ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-4 py-4 pl-12 bg-gray-50 border-2 rounded-xl transition-all duration-300 outline-none text-base ${
            isFocused || value 
              ? 'bg-white shadow-lg border-[#8e191c]' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          placeholder=" "
          required={required}
        />
        
        <label className={`absolute left-12 transition-all duration-300 pointer-events-none ${
          isFocused || value
            ? '-top-2 text-xs bg-white px-2 ml-1 text-[#8e191c] font-medium'
            : 'top-4 text-gray-500'
        }`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        <Icon className={`absolute left-4 top-4 w-5 h-5 transition-colors duration-300 ${
          isFocused || value ? 'text-[#8e191c]' : 'text-gray-400'
        }`} />
        
        {name === 'password' && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-4 text-gray-400 hover:text-[#8e191c] transition-colors"
          >
            {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
});

const PremierRegistration = () => {
  const [registrationType, setRegistrationType] = useState(null);
  const [currentStep, setCurrentStep] = useState('type_selection');
  const [businessStep, setBusinessStep] = useState('basic_info'); // 'basic_info', 'mandatory_docs', 'optional_docs'
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
    bankStatement: null, // Single 6-month statement
    bankStatements: [] // Multiple monthly statements
  });
  const [bankStatementType, setBankStatementType] = useState('single'); // 'single' or 'multiple'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  // Create floating particles effect
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

  const handleInputChange = React.useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // File change handler for documents
  const handleFileChange = React.useCallback((e, documentType) => {
    const files = e.target.files;
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    for (let file of files) {
      if (file.size > maxSize) {
        setError(`File size too large. Maximum allowed size is 10MB. Your file: ${(file.originalname || file.name)} - ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
    }
    
    if (documentType === 'bankStatement' && bankStatementType === 'multiple') {
      // Handle multiple files for monthly statements
      const fileArray = Array.from(files);
      setDocuments(prev => ({
        ...prev,
        bankStatements: fileArray,
        bankStatement: null // Clear single statement if multiple are selected
      }));
    } else if (documentType === 'bankStatement' && bankStatementType === 'single') {
      // Handle single file for 6-month statement
      setDocuments(prev => ({
        ...prev,
        bankStatement: files[0],
        bankStatements: [] // Clear multiple statements if single is selected
      }));
    } else {
      // Handle other document types normally
      const file = files[0];
      if (file) {
        setDocuments(prev => ({
          ...prev,
          [documentType]: file
        }));
      }
    }
    setError(''); // Clear any previous errors
  }, [bankStatementType]);

  // Handle monthly file uploads for specific months
  const handleMonthlyFileChange = React.useCallback((e, month) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError(`File size too large. Maximum allowed size is 10MB. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
      
      // Create a proper file object with all properties
      const fileWithMonth = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified
      });
      
      // Add month property to the file object
      fileWithMonth.month = `month_${month}`;
      
      setDocuments(prev => {
        const newBankStatements = [
          ...prev.bankStatements.filter(f => f.month !== `month_${month}`),
          fileWithMonth
        ];
        console.log('Updated bankStatements:', newBankStatements);
        return {
          ...prev,
          bankStatements: newBankStatements
        };
      });
      setError(''); // Clear any previous errors
      console.log(`Added month ${month} statement:`, file.name, 'File object:', fileWithMonth);
    }
  }, []);

  const handleTogglePassword = React.useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleRegistrationTypeSelect = (type) => {
    setRegistrationType(type);
    setCurrentStep('details');
    setError('');
    setSuccess('');
  };

  // Customer Registration Handler
  const handleCustomerRegistration = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    // Validate form
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    // Validate phone number
    if (!formData.phone || formData.phone.trim().length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    // Validate terms agreement
    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      setError('You must agree to both Terms and Conditions and Privacy Policy to register');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await userService.registerCustomer({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        agreeToTerms: formData.agreeToTerms,
        agreeToPrivacy: formData.agreeToPrivacy
      });
      
      if (response.data && response.data.success) {
        setSuccess('Customer registration completed successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data?.message || 'Registration failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Customer registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Business Registration Handler
  const handleBusinessRegistration = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    // Validate form data
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    // Validate phone number
    if (!formData.phone || formData.phone.trim().length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    // Validate required documents
    if (!documents.tradeLicense) {
      setError('Trade License is required for business registration');
      return;
    }
    
    if (!documents.idDocument) {
      setError('ID Document is required for business registration');
      return;
    }

    // Validate file sizes before submission
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (documents.tradeLicense && documents.tradeLicense.size > maxSize) {
      setError('Trade License file is too large. Maximum size is 10MB.');
      return;
    }
    
    if (documents.idDocument && documents.idDocument.size > maxSize) {
      setError('ID Document file is too large. Maximum size is 10MB.');
      return;
    }
    
    if (documents.bankStatements && documents.bankStatements.length > 0) {
      for (let statement of documents.bankStatements) {
        if (statement.size > maxSize) {
          setError(`Bank statement for Month ${statement.month} is too large. Maximum size is 10MB.`);
          return;
        }
      }
    }
    
    if (documents.bankStatement && documents.bankStatement.size > maxSize) {
      setError('Bank statement file is too large. Maximum size is 10MB.');
      return;
    }

    // Validate terms agreement
    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      setError('You must agree to both Terms and Conditions and Privacy Policy to register');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add basic form data
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('agreeToTerms', formData.agreeToTerms);
      formDataToSend.append('agreeToPrivacy', formData.agreeToPrivacy);
      
      // Add required documents
      formDataToSend.append('tradeLicense', documents.tradeLicense);
      formDataToSend.append('idDocument', documents.idDocument);
      
      // Add optional bank statement(s)
      if (documents.bankStatements && documents.bankStatements.length > 0) {
        // Multiple monthly statements - now with month information
        console.log('Preparing to upload monthly statements:', documents.bankStatements);
        console.log('Documents state:', documents);
        documents.bankStatements.forEach((statement, index) => {
          console.log(`Adding statement ${index + 1}:`, statement.name, 'month:', statement.month, 'type:', statement.type, 'size:', statement.size);
          console.log('Full statement object:', statement);
          formDataToSend.append('bankStatement', statement);
          formDataToSend.append('bankStatementMonth', statement.month);
        });
        console.log('Uploading multiple monthly statements:', documents.bankStatements.length);
      } else if (documents.bankStatement) {
        // Single 6-month statement
        formDataToSend.append('bankStatement', documents.bankStatement);
        console.log('Uploading single bank statement');
      }
      
      const response = await userService.registerBusiness(formDataToSend);
      
      if (response.data && response.data.success) {
        setSuccess('Business registration completed successfully! Please wait for document verification. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data?.message || 'Registration failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Business registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific file upload errors
      if (errorMessage.includes('File too large') || errorMessage.includes('LIMIT_FILE_SIZE')) {
        errorMessage = 'One or more files are too large. Maximum file size is 10MB. Please compress your files or use smaller ones.';
      } else if (errorMessage.includes('File upload error')) {
        errorMessage = 'File upload failed. Please check file sizes and formats, then try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Business step navigation functions
  const nextBusinessStep = () => {
    if (businessStep === 'basic_info') {
      setBusinessStep('mandatory_docs');
    } else if (businessStep === 'mandatory_docs') {
      setBusinessStep('optional_docs');
    }
  };

  const prevBusinessStep = () => {
    if (businessStep === 'mandatory_docs') {
      setBusinessStep('basic_info');
    } else if (businessStep === 'optional_docs') {
      setBusinessStep('mandatory_docs');
    }
  };

  const canProceedToNextStep = () => {
    if (businessStep === 'basic_info') {
      return formData.name && formData.email && formData.password && formData.phone;
    } else if (businessStep === 'mandatory_docs') {
      return documents.tradeLicense && documents.idDocument;
    }
    return true;
  };

  const goBack = () => {
    if (currentStep === 'details') {
      if (registrationType === 'business' && businessStep !== 'basic_info') {
        prevBusinessStep();
      } else {
        setCurrentStep('type_selection');
        setRegistrationType(null);
        setBusinessStep('basic_info');
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          agreeToTerms: false,
          agreeToPrivacy: false
        });
        setDocuments({
          tradeLicense: null,
          idDocument: null,
          bankStatement: null,
          bankStatements: []
        });
        setError('');
        setSuccess('');
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'type_selection':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">Choose Your Account Type</h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                Select the type of account you want to create
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Customer Option */}
              <button
                onClick={() => handleRegistrationTypeSelect('customer')}
                className="p-6 sm:p-8 border-2 border-gray-200 rounded-2xl hover:border-[#8e191c] hover:shadow-lg transition-all duration-300 group text-left bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-4 group-hover:bg-blue-200 transition-colors">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-800">Customer Account</h3>
                    <p className="text-sm text-gray-600">For individual shoppers</p>
                  </div>
                </div>
              </button>

              {/* Business Option */}
              <button
                onClick={() => handleRegistrationTypeSelect('business')}
                className="p-6 sm:p-8 border-2 border-gray-200 rounded-2xl hover:border-[#8e191c] hover:shadow-lg transition-all duration-300 group text-left bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-4 group-hover:bg-green-200 transition-colors">
                    <Building2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-gray-800">Business Account</h3>
                    <p className="text-sm text-gray-600">For businesses & organizations</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case 'details':
        if (registrationType === 'business') {
          return renderBusinessSteps();
        }
        return renderCustomerForm();

      default:
        return null;
    }
  };

  const renderCustomerForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
          Customer Registration
        </h2>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: '#8e191c' }} />
          Complete your registration
          <Sparkles className="w-5 h-5" style={{ color: '#8e191c' }} />
        </p>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-2 text-gray-600 hover:text-[#8e191c] transition-colors duration-300 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Account Type Selection
        </button>
      </div>

      <form onSubmit={handleCustomerRegistration} className="space-y-4">
        <InputField
          type="text"
          name="name"
          label="Full Name"
          icon={User}
          value={formData.name}
          onChange={handleInputChange}
          showPassword={showPassword}
          onTogglePassword={handleTogglePassword}
        />

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
          type="tel"
          name="phone"
          label="Phone Number"
          icon={Phone}
          value={formData.phone}
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

        {/* Terms and Conditions */}
        <div className="space-y-4 mt-6">
          <div className="flex items-start">
            <label className="flex items-start cursor-pointer group">
              <div className="relative mt-1">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="sr-only"
                  required
                />
                <div className={`w-5 h-5 border-2 rounded transition-all duration-300 ${
                  formData.agreeToTerms 
                    ? 'border-[#8e191c] bg-[#8e191c]' 
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {formData.agreeToTerms && (
                    <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                  )}
                </div>
              </div>
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  className="font-semibold underline transition-all text-[#8e191c]"
                  onClick={() => navigate('/terms')}
                >
                  Terms and Conditions
                </button>
              </span>
            </label>
          </div>

          <div className="flex items-start">
            <label className="flex items-start cursor-pointer group">
              <div className="relative mt-1">
                <input
                  type="checkbox"
                  name="agreeToPrivacy"
                  checked={formData.agreeToPrivacy}
                  onChange={handleInputChange}
                  className="sr-only"
                  required
                />
                <div className={`w-5 h-5 border-2 rounded transition-all duration-300 ${
                  formData.agreeToPrivacy 
                    ? 'border-[#8e191c] bg-[#8e191c]' 
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {formData.agreeToPrivacy && (
                    <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                  )}
                </div>
              </div>
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  className="font-semibold underline transition-all text-[#8e191c]"
                  onClick={() => navigate('/privacy')}
                >
                  Privacy Policy
                </button>
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
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
                <Check className="w-5 h-5 mr-2" />
                Complete Registration
              </>
            )}
          </span>
          <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" 
            style={{
              background: 'linear-gradient(135deg, #a52a2a 0%, #8e191c 100%)'
            }} />
        </button>
      </form>
    </div>
  );

  const renderBusinessSteps = () => {
    const renderStepIndicator = () => (
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4 mb-6">
          {['basic_info', 'mandatory_docs', 'optional_docs'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                businessStep === step 
                  ? 'bg-[#8e191c] text-white shadow-lg scale-110' 
                  : businessStep === 'basic_info' && index === 0
                  ? 'bg-[#8e191c] text-white'
                  : businessStep === 'mandatory_docs' && index <= 1
                  ? 'bg-green-500 text-white'
                  : businessStep === 'optional_docs' && index <= 2
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {businessStep === 'basic_info' && index === 0 
                  ? '1' 
                  : businessStep === 'mandatory_docs' && index <= 1
                  ? '✓'
                  : businessStep === 'optional_docs' && index <= 2
                  ? '✓'
                  : index + 1
                }
              </div>
              {index < 2 && (
                <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                  businessStep === 'basic_info' && index === 0
                    ? 'bg-gray-200'
                    : businessStep === 'mandatory_docs' && index <= 1
                    ? 'bg-green-500'
                    : businessStep === 'optional_docs' && index <= 2
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {businessStep === 'basic_info' && 'Step 1: Basic Information'}
            {businessStep === 'mandatory_docs' && 'Step 2: Required Documents'}
            {businessStep === 'optional_docs' && 'Step 3: Optional Documents'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {businessStep === 'basic_info' && 'Enter your business details and contact information'}
            {businessStep === 'mandatory_docs' && 'Upload required business verification documents'}
            {businessStep === 'optional_docs' && 'Upload additional financial documents (optional)'}
          </p>
        </div>
      </div>
    );

    const renderBasicInfoStep = () => (
      <div className="space-y-6">
        <form className="space-y-4">
          <InputField
            type="text"
            name="name"
            label="Business Name"
            icon={User}
            value={formData.name}
            onChange={handleInputChange}
            showPassword={showPassword}
            onTogglePassword={handleTogglePassword}
          />
          <InputField
            type="email"
            name="email"
            label="Business Email"
            icon={Mail}
            value={formData.email}
            onChange={handleInputChange}
            showPassword={showPassword}
            onTogglePassword={handleTogglePassword}
          />
          <InputField
            type="tel"
            name="phone"
            label="Business Phone"
            icon={Phone}
            value={formData.phone}
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

          {/* Terms and Conditions */}
          <div className="space-y-4 mt-6">
            <div className="flex items-start">
              <label className="flex items-start cursor-pointer group">
                <div className="relative mt-1">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="sr-only"
                    required
                  />
                  <div className={`w-5 h-5 border-2 rounded transition-all duration-300 ${
                    formData.agreeToTerms 
                      ? 'border-[#8e191c] bg-[#8e191c]' 
                      : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    {formData.agreeToTerms && (
                      <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors leading-relaxed">
                  I agree to the{' '}
                  <button
                    type="button"
                    className="font-semibold underline transition-all text-[#8e191c]"
                    onClick={() => navigate('/terms')}
                  >
                    Terms and Conditions
                  </button>
                </span>
              </label>
            </div>

            <div className="flex items-start">
              <label className="flex items-start cursor-pointer group">
                <div className="relative mt-1">
                  <input
                    type="checkbox"
                    name="agreeToPrivacy"
                    checked={formData.agreeToPrivacy}
                    onChange={handleInputChange}
                    className="sr-only"
                    required
                  />
                  <div className={`w-5 h-5 border-2 rounded transition-all duration-300 ${
                    formData.agreeToPrivacy 
                      ? 'border-[#8e191c] bg-[#8e191c]' 
                      : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    {formData.agreeToPrivacy && (
                      <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                    )}
                  </div>
                </div>
                <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors leading-relaxed">
                  I agree to the{' '}
                  <button
                    type="button"
                    className="font-semibold underline transition-all text-[#8e191c]"
                    onClick={() => navigate('/privacy')}
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={nextBusinessStep}
            disabled={!canProceedToNextStep()}
            className="w-full text-white py-4 rounded-2xl font-semibold text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #8e191c 0%, #a52a2a 100%)',
              boxShadow: '0 10px 15px -3px rgba(142, 25, 28, 0.25)'
            }}
          >
            <span className="relative z-10 flex items-center justify-center">
              <Check className="w-5 h-5 mr-2" />
              Continue to Documents
            </span>
            <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" 
              style={{
                background: 'linear-gradient(135deg, #a52a2a 0%, #8e191c 100%)'
              }} />
          </button>
        </form>
      </div>
    );

    const renderMandatoryDocsStep = () => (
      <div className="space-y-6">
        <div className="space-y-4">
                              {/* Trade License - Required for Business */}
                    <div className="space-y-2 mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trade License <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                          onChange={(e) => handleFileChange(e, 'tradeLicense')}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-300 outline-none hover:border-gray-300 focus:bg-white focus:border-[#8e191c]"
                          required
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP
                        </div>
                        {documents.tradeLicense && (
                          <div className="mt-2 text-sm text-green-600 flex items-center">
                            <Check className="w-4 h-4 mr-1" />
                            {documents.tradeLicense.name} ({(documents.tradeLicense.size / (1024 * 1024)).toFixed(2)}MB)
                          </div>
                        )}
                      </div>
                    </div>

                              {/* ID Document - Required for All */}
                    <div className="space-y-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Document <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                          onChange={(e) => handleFileChange(e, 'idDocument')}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-300 outline-none hover:border-gray-300 focus:bg-white focus:border-[#8e191c]"
                          required
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP
                        </div>
                        {documents.idDocument && (
                          <div className="mt-2 text-sm text-green-600 flex items-center">
                            <Check className="w-4 h-4 mr-1" />
                            {documents.idDocument.name} ({(documents.idDocument.size / (1024 * 1024)).toFixed(2)}MB)
                          </div>
                        )}
                      </div>
                    </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={prevBusinessStep}
            className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-300 hover:border-gray-400 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={nextBusinessStep}
            disabled={!canProceedToNextStep()}
            className="flex-1 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #8e191c 0%, #a52a2a 100%)',
              boxShadow: '0 10px 15px -3px rgba(142, 25, 28, 0.25)'
            }}
          >
            <span className="relative z-10">Continue to Optional Documents</span>
          </button>
        </div>
      </div>
    );

    const renderOptionalDocsStep = () => (
      <div className="space-y-6">
        <div className="space-y-4">
          {/* Bank Statement Upload Type */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Statement Upload Type <span className="text-gray-400">(Optional)</span>
            </label>
            
            <div className="flex gap-4 mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="bankStatementType"
                  value="single"
                  checked={bankStatementType === 'single'}
                  onChange={(e) => {
                    setBankStatementType(e.target.value);
                    setDocuments(prev => ({ ...prev, bankStatement: null, bankStatements: [] }));
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Single Statement (Last 6 Months)</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="bankStatementType"
                  value="multiple"
                  checked={bankStatementType === 'multiple'}
                  onChange={(e) => {
                    setBankStatementType(e.target.value);
                    setDocuments(prev => ({ ...prev, bankStatement: null, bankStatements: [] }));
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">6 Monthly Statements (One per month)</span>
              </label>
            </div>

            {/* Bank Statement Upload */}
            <div className="space-y-2">
              {bankStatementType === 'single' ? (
                // Single file upload
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={(e) => handleFileChange(e, 'bankStatement')}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-300 outline-none hover:border-gray-300 focus:bg-white focus:border-[#8e191c]"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    Maximum file size: 10MB. Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, WEBP
                  </div>
                  
                  {documents.bankStatement && (
                    <div className="mt-2 text-sm text-green-600 flex items-center">
                      <Check className="w-4 h-4 mr-1" />
                      {documents.bankStatement.name} ({(documents.bankStatement.size / (1024 * 1024)).toFixed(2)}MB)
                    </div>
                  )}
                </div>
              ) : (
                // Multiple file upload with individual month inputs
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((month) => (
                      <div key={month} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Month {month} Statement <span className="text-gray-400">(Optional)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                            onChange={(e) => handleMonthlyFileChange(e, month)}
                            className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg transition-all duration-300 outline-none hover:border-gray-300 focus:bg-white focus:border-[#8e191c] text-xs"
                          />
                          <div className="mt-1 text-xs text-gray-500">
                            Max: 10MB
                          </div>
                          {documents.bankStatements.find(file => file.month === `month_${month}`) && (
                            <div className="mt-1 text-xs text-green-600 flex items-center">
                              <Check className="w-3 h-3 mr-1" />
                              {documents.bankStatements.find(file => file.month === `month_${month}`)?.name} ({(documents.bankStatements.find(file => file.month === `month_${month}`)?.size / (1024 * 1024)).toFixed(2)}MB)
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Summary of uploaded files */}
                  {documents.bankStatements.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-green-600 flex items-center mb-2">
                        <Check className="w-4 h-4 mr-1" />
                        {documents.bankStatements.length}/6 monthly statement(s) uploaded:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {documents.bankStatements.map((file) => (
                          <div key={file.month} className="text-xs text-gray-600">
                            • Month {file.month.replace('month_', '')}: {file.name}
                          </div>
                        ))}
                      </div>
                      {documents.bankStatements.length < 6 && (
                        <div className="mt-2 text-sm text-blue-600">
                          Please upload {6 - documents.bankStatements.length} more monthly statement(s) to complete the set
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {!documents.bankStatement && documents.bankStatements.length === 0 && (
                <div className="mt-1 text-sm text-gray-500">
                  {bankStatementType === 'single' 
                    ? 'Upload a single bank statement covering the last 6 months (optional)'
                    : 'Upload monthly bank statements for each month (optional)'
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={prevBusinessStep}
            className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-300 hover:border-gray-400 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, #8e191c 0%, #a52a2a 100%)',
              boxShadow: '0 10px 15px -3px rgba(142, 25, 28, 0.25)'
            }}
            onClick={handleBusinessRegistration}
          >
            <span className="relative z-10 flex items-center justify-center">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Registering Business...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Complete Registration
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
    );

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
            Business Registration
          </h2>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: '#8e191c' }} />
            Complete your registration step by step
            <Sparkles className="w-5 h-5" style={{ color: '#8e191c' }} />
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Back Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 text-gray-600 hover:text-[#8e191c] transition-colors duration-300 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            {businessStep === 'basic_info' ? 'Back to Account Type Selection' : 'Back to Previous Step'}
          </button>
        </div>

        {/* Step Content */}
        {businessStep === 'basic_info' && renderBasicInfoStep()}
        {businessStep === 'mandatory_docs' && renderMandatoryDocsStep()}
        {businessStep === 'optional_docs' && renderOptionalDocsStep()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 via-purple-50 to-pink-100 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
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
        <div className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-r from-blue-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-32 right-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-r from-indigo-300/15 to-pink-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-gradient-to-r from-purple-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/4 right-1/3 w-3 sm:w-4 h-3 sm:h-4 bg-blue-400/30 rounded-full animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-2 sm:w-3 h-2 sm:h-3 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '1.5s' }} />
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
        <div className="flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, #8e191c 0%, #a52a2a 50%, #8e191c 100%)'
        }}>
          {/* Enhanced Animated Background Circle */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 border-2 border-white rounded-full animate-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 sm:w-80 h-56 sm:h-80 border border-white rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 border border-white/50 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          
          {/* Floating Elements in Red Panel */}
          <div className="absolute top-8 right-8 w-2 sm:w-3 h-2 sm:h-3 bg-white/30 rounded-full animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          <div className="absolute bottom-12 left-8 w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }} />
          <div className="absolute top-1/3 left-12 w-3 sm:w-4 h-3 sm:h-4 bg-white/20 rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
          
          <div className="relative z-10 text-center">
            {/* Enhanced Logo */}
            <img src={PQFLogo} alt="PQF Logo" className="w-20 sm:w-28 lg:w-36 h-20 sm:h-28 lg:h-36 object-contain mb-4 sm:mb-6 mx-auto animate-pulse" style={{ filter: 'brightness(0) invert(1)' }} />
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 tracking-wider drop-shadow-lg text-white">PREMIER</h1>
            <p className="text-base sm:text-lg lg:text-xl opacity-90 mb-4 sm:mb-6 lg:mb-8 drop-shadow text-white">QUALITY FOODS</p>
            
            {/* Enhanced Grocery Icons */}
            <div className="flex justify-center space-x-3 sm:space-x-4 lg:space-x-6 mb-4 sm:mb-6 lg:mb-8">
              {['🛒', '🥬', '🥩'].map((emoji, index) => (
                <div 
                  key={index}
                  className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-lg sm:text-xl lg:text-2xl animate-bounce shadow-lg border border-white/30"
                  style={{ animationDelay: `${index * 0.2}s`, animationDuration: '2s' }}
                >
                  {emoji}
                </div>
              ))}
            </div>
            
            <p className="text-sm sm:text-base lg:text-lg opacity-90 leading-relaxed px-2 sm:px-4 drop-shadow text-white">
              Join our community and experience the future of culinary excellence
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-4 sm:p-6 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
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

            {/* Step Content */}
            {renderStepContent()}

            {/* Login Link */}
            {currentStep === 'type_selection' && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremierRegistration;