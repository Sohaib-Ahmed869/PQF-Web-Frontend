import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, FileText, Eye, Lock, Users, Globe, Mail, Phone, MapPin, Calendar, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom'; 

const PremierLegalPages = () => {
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const [currentPage, setCurrentPage] = useState(location.pathname.includes('privacy') ? 'privacy' : 'terms');
  const [particles, setParticles] = useState([]);
  const [activeSection, setActiveSection] = useState('');

  // Create floating particles effect with enhanced visuals (from login)
  useEffect(() => {
    const createParticle = () => {
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#8b5cf6'];
      const newParticle = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: 100,
        size: Math.random() * 6 + 2,
        speed: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.4 + 0.4 // 0.4 to 0.8
      };
      setParticles(prev => [...prev.slice(-30), newParticle]);
    };
    const interval = setInterval(createParticle, 500);
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

  // Keep currentPage in sync with the route
  useEffect(() => {
    setCurrentPage(location.pathname.includes('privacy') ? 'privacy' : 'terms');
  }, [location.pathname]);

  const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-600 text-sm">{subtitle}</p>
      </div>
    </div>
  );

  const TermsContent = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-red-500" />
          Terms and Conditions
        </h1>
        <p className="text-gray-600 text-lg">Last updated: June 24, 2025</p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <CheckCircle2 className="w-4 h-4 inline mr-2" />
            These terms govern your use of Premier Quality Foods services
          </p>
        </div>
      </div>

      <SectionHeader 
        icon={Users} 
        title="1. Agreement to Terms" 
        subtitle="Your acceptance of these terms"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-4">
          By accessing and using Premier Quality Foods' services, mobile application, or website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
        </p>
        <p className="text-gray-700 leading-relaxed">
          These Terms and Conditions ("Terms") apply to all users of our platform, including customers, restaurant partners, delivery personnel, and any other visitors to our service.
        </p>
      </div>

      <SectionHeader 
        icon={Globe} 
        title="2. Service Description" 
        subtitle="What Premier Quality Foods provides"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-4">
          Premier Quality Foods operates an online food ordering and delivery platform that connects customers with local restaurants and food establishments. Our services include:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Online food ordering through our website and mobile application</li>
          <li>Payment processing for food orders</li>
          <li>Coordination of food delivery services</li>
          <li>Customer support and order tracking</li>
          <li>Restaurant partner management and support</li>
        </ul>
      </div>

      <SectionHeader 
        icon={Users} 
        title="3. User Accounts and Registration" 
        subtitle="Creating and managing your account"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-4">
          To use certain features of our service, you must register for an account. When creating an account, you agree to:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain and update your account information</li>
          <li>Keep your password secure and confidential</li>
          <li>Accept responsibility for all activities under your account</li>
          <li>Notify us immediately of any unauthorized use</li>
        </ul>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            You must be at least 18 years old to create an account
          </p>
        </div>
      </div>

      <SectionHeader 
        icon={Lock} 
        title="4. Payment Terms" 
        subtitle="Billing, payments, and refunds"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-4">
          Payment for orders must be made at the time of purchase through our accepted payment methods. We reserve the right to:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Modify pricing at any time</li>
          <li>Add or remove payment methods</li>
          <li>Process refunds according to our refund policy</li>
          <li>Charge additional fees for special services</li>
        </ul>
      </div>

      <SectionHeader 
        icon={Shield} 
        title="5. User Conduct" 
        subtitle="Acceptable use of our platform"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-4">
          Users must not engage in any activity that:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Violates any applicable laws or regulations</li>
          <li>Infringes on intellectual property rights</li>
          <li>Harasses, threatens, or discriminates against others</li>
          <li>Attempts to gain unauthorized access to our systems</li>
          <li>Submits false or misleading information</li>
          <li>Interferes with the proper functioning of the platform</li>
        </ul>
      </div>

      <SectionHeader 
        icon={AlertTriangle} 
        title="6. Limitation of Liability" 
        subtitle="Our responsibility and your protection"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed">
          Premier Quality Foods shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our service. Our total liability shall not exceed the amount paid by you for the specific service that gave rise to the claim.
        </p>
      </div>

      <SectionHeader 
        icon={Calendar} 
        title="7. Modifications to Terms" 
        subtitle="How we update these terms"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed">
          We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through our platform. Continued use of our service after changes constitutes acceptance of the new terms.
        </p>
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-xl border">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
        <div className="space-y-2 text-gray-600">
          <p className="flex items-center"><Mail className="w-4 h-4 mr-2" /> legal@premierfoods.com</p>
          <p className="flex items-center"><Phone className="w-4 h-4 mr-2" /> +92 (321) 555-0123</p>
          <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Islamabad, Pakistan</p>
        </div>
      </div>
    </div>
  );

  const PrivacyContent = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
          <Shield className="w-8 h-8 text-red-500" />
          Privacy Policy
        </h1>
        <p className="text-gray-600 text-lg">Last updated: June 24, 2025</p>
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            <CheckCircle2 className="w-4 h-4 inline mr-2" />
            Your privacy is important to us and we are committed to protecting it
          </p>
        </div>
      </div>

      <SectionHeader 
        icon={Eye} 
        title="1. Information We Collect" 
        subtitle="What data we gather and why"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-4">
          We collect several types of information to provide and improve our services:
        </p>
        
        <h4 className="font-semibold text-gray-800 mb-2">Personal Information:</h4>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
          <li>Name, email address, and phone number</li>
          <li>Delivery addresses and location data</li>
          <li>Payment information (processed securely by third parties)</li>
          <li>Account preferences and settings</li>
        </ul>

        <h4 className="font-semibold text-gray-800 mb-2">Usage Information:</h4>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
          <li>Order history and food preferences</li>
          <li>App usage patterns and feature interactions</li>
          <li>Device information and IP addresses</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
      </div>

      <SectionHeader 
        icon={Lock} 
        title="2. How We Use Your Information" 
        subtitle="Our purposes for data processing"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-4">
          We use your information to:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Process and fulfill your food orders</li>
          <li>Provide customer support and respond to inquiries</li>
          <li>Send order confirmations and delivery updates</li>
          <li>Improve our services and user experience</li>
          <li>Personalize content and recommendations</li>
          <li>Prevent fraud and ensure platform security</li>
          <li>Comply with legal obligations</li>
          <li>Send promotional communications (with your consent)</li>
        </ul>
      </div>

      <SectionHeader 
        icon={Users} 
        title="3. Information Sharing" 
        subtitle="When and with whom we share data"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-4">
          We may share your information with:
        </p>
        
        <h4 className="font-semibold text-gray-800 mb-2">Restaurant Partners:</h4>
        <p className="text-gray-700 mb-3">Order details, delivery addresses, and contact information necessary to fulfill your orders.</p>
        
        <h4 className="font-semibold text-gray-800 mb-2">Delivery Personnel:</h4>
        <p className="text-gray-700 mb-3">Your name, phone number, and delivery address to complete deliveries.</p>
        
        <h4 className="font-semibold text-gray-800 mb-2">Service Providers:</h4>
        <p className="text-gray-700 mb-3">Third-party companies that help us operate our platform, process payments, or provide customer support.</p>
        
        <h4 className="font-semibold text-gray-800 mb-2">Legal Requirements:</h4>
        <p className="text-gray-700 mb-3">When required by law, court order, or to protect our rights and safety.</p>
      </div>

      <SectionHeader 
        icon={Shield} 
        title="4. Data Security" 
        subtitle="How we protect your information"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-4">
          We implement appropriate technical and organizational measures to protect your personal information:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Encryption of sensitive data in transit and at rest</li>
          <li>Regular security assessments and updates</li>
          <li>Access controls and employee training</li>
          <li>Secure payment processing through certified providers</li>
          <li>Regular data backups and disaster recovery procedures</li>
        </ul>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <Lock className="w-4 h-4 inline mr-2" />
            We never store complete payment card information on our servers
          </p>
        </div>
      </div>

      <SectionHeader 
        icon={Eye} 
        title="5. Your Privacy Rights" 
        subtitle="Control over your personal data"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-4">
          You have the right to:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>Access:</strong> Request a copy of your personal information</li>
          <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
          <li><strong>Deletion:</strong> Request deletion of your personal information</li>
          <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
          <li><strong>Restriction:</strong> Limit how we process your information</li>
          <li><strong>Objection:</strong> Object to processing for marketing purposes</li>
          <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
        </ul>
      </div>

      <SectionHeader 
        icon={Globe} 
        title="6. Cookies and Tracking" 
        subtitle="How we use cookies and similar technologies"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-4">
          We use cookies and similar technologies to:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Remember your preferences and login status</li>
          <li>Analyze website traffic and user behavior</li>
          <li>Provide personalized content and advertisements</li>
          <li>Improve site performance and functionality</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          You can control cookies through your browser settings, but some features may not work properly if cookies are disabled.
        </p>
      </div>

      <SectionHeader 
        icon={Calendar} 
        title="7. Data Retention" 
        subtitle="How long we keep your information"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed">
          We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Order history is typically retained for 7 years for tax and accounting purposes, while account information is kept until you request deletion or close your account.
        </p>
      </div>

      <SectionHeader 
        icon={Mail} 
        title="8. Contact Us" 
        subtitle="Questions about this privacy policy"
      />
      <div className="prose prose-gray max-w-none">
        <p className="text-gray-700 leading-relaxed mb-4">
          If you have any questions about this Privacy Policy or our data practices, please contact us:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2 text-gray-700">
            <p className="flex items-center"><Mail className="w-4 h-4 mr-2" /> privacy@premierfoods.com</p>
            <p className="flex items-center"><Phone className="w-4 h-4 mr-2" /> +92 (321) 555-0123</p>
            <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Data Protection Officer, Premier Quality Foods, Islamabad, Pakistan</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Enhanced Animated Background with Multiple Layers (exactly from login) */}
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

      {/* Enhanced Floating Particles (exactly from login) */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `linear-gradient(45deg, ${particle.color}, ${particle.color}80)`,
            transition: 'top 0.05s linear',
            boxShadow: `0 0 15px ${particle.color}40`,
            opacity: particle.opacity
          }}
        />
      ))}

      {/* Navigation Header */}
      <div className="relative z-10 bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/register')}
                className="flex items-center text-gray-600 hover:text-red-500 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Registration
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 border-2 border-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-red-500 font-bold text-sm">✕</span>
                </div>
                <span className="font-bold text-gray-800">PREMIER QUALITY FOODS</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => { navigate('/terms'); setCurrentPage('terms'); }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 'terms'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Terms
              </button>
              <button
                onClick={() => { navigate('/privacy'); setCurrentPage('privacy'); }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 'privacy'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Privacy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 overflow-hidden">
          <div className="p-8 lg:p-12">
            {currentPage === 'terms' ? <TermsContent /> : <PrivacyContent />}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-gray-600 font-medium">Premier Quality Foods</span>
              <Sparkles className="w-5 h-5 text-red-500 ml-2" />
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 Premier Quality Foods. All rights reserved. | Made with ❤️ in Islamabad, Pakistan
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-20px); 
          }
        }
      `}</style>
    </div>
  );
};

export default PremierLegalPages;