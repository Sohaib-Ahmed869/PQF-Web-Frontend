import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Calendar,
  User,
  Star,
  ChefHat,
  Home,
  ShoppingBag,
  Navigation,
  Timer,
  Gift,
  ArrowLeft
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

// Import your existing web service
import webService from '../services/Website/WebService';

const TRACKING_STATUSES = [
  { 
    key: 'pending', 
    label: 'Order Placed', 
    icon: <ShoppingBag className="w-5 h-5" />, 
    color: 'from-[#8e191c] to-[#b02a2e]',
    bgColor: 'bg-[#fbeaea]',
    textColor: 'text-[#8e191c]'
  },
  { 
    key: 'processing', 
    label: 'Processing', 
    icon: <Timer className="w-5 h-5" />, 
    color: 'from-[#8e191c] to-[#b02a2e]', 
    bgColor: 'bg-[#fbeaea]', 
    textColor: 'text-[#8e191c]'
  },
  { 
    key: 'shipped', 
    label: 'Shipped', 
    icon: <Package className="w-5 h-5" />,
    color: 'from-[#8e191c] to-[#b02a2e]',
    bgColor: 'bg-[#fbeaea]',
    textColor: 'text-[#8e191c]'
  },
  { 
    key: 'in transit', 
    label: 'On the Way', 
    icon: <Truck className="w-5 h-5" />, 
    color: 'from-[#8e191c] to-[#b02a2e]',
    bgColor: 'bg-[#fbeaea]',
    textColor: 'text-[#8e191c]'
  },
  { 
    key: 'delivered', 
    label: 'Delivered', 
    icon: <Home className="w-5 h-5" />, 
    color: 'from-[#8e191c] to-[#b02a2e]',
    bgColor: 'bg-[#fbeaea]',
    textColor: 'text-[#8e191c]'
  }
];

function getStatusIndex(status) {
  return TRACKING_STATUSES.findIndex(s => s.key === status);
}

const OrderTracking = ({ trackingNumber: trackingNumberProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get tracking number from query param if not provided as prop
  const queryTrackingNumber = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('trackingNumber') || '';
  }, [location.search]);
  const initialTrackingNumber = trackingNumberProp !== undefined ? trackingNumberProp : queryTrackingNumber;
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [realTimeInterval, setRealTimeInterval] = useState(null);

  // Keep state in sync if prop changes
  useEffect(() => {
    setTrackingNumber(trackingNumberProp !== undefined ? trackingNumberProp : queryTrackingNumber);
  }, [trackingNumberProp, queryTrackingNumber]);

  // Auto-refresh tracking data every 30 seconds when tracking is active
  useEffect(() => {
    if (trackingData && trackingData.trackingStatus !== 'delivered' && trackingData.trackingStatus !== 'cancelled') {
      const interval = setInterval(() => {
        refreshTrackingData();
      }, 30000); // Refresh every 30 seconds
      
      setRealTimeInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (realTimeInterval) {
      clearInterval(realTimeInterval);
      setRealTimeInterval(null);
    }
  }, [trackingData]);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (realTimeInterval) {
        clearInterval(realTimeInterval);
      }
    };
  }, [realTimeInterval]);

  const refreshTrackingData = async () => {
    if (!trackingNumber) return;
    
    try {
      const response = await webService.getOrderTracking(trackingNumber);
      setTrackingData(response.data.data);
    } catch (err) {
      // Silently handle refresh errors to avoid disrupting UX
      console.error('Failed to refresh tracking data:', err);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    setError('');
    setTrackingData(null);
    setLoading(true);
    try {
      const response = await webService.getOrderTracking(trackingNumber);
      setTrackingData(response.data.data);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Tracking information not found. Please check your tracking/order number.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatus = () => {
    if (!trackingData) return null;
    return TRACKING_STATUSES.find(s => s.key === trackingData.trackingStatus);
  };



  const renderProgress = (status) => {
    const currentIdx = getStatusIndex(status);
    const total = TRACKING_STATUSES.length;
    // Calculate percentage for progress line (center to center of circles)
    const progressPercent = currentIdx > 0 ? (currentIdx / (total - 1)) * 100 : 0;

    return (
      <div className="relative">
        {/* Desktop Progress Bar */}
        <div className="hidden md:flex items-center justify-between mb-8 relative">
          {/* Background connecting line */}
          <div className="absolute left-8 right-8 h-1 bg-gray-200 z-0" style={{ top: '40%', transform: 'translateY(-50%)' }} />
          {/* Progress connecting line */}
          <div
            className="absolute left-8 h-1 bg-gradient-to-r from-[#8e191c] to-[#b02a2e] z-0 transition-all duration-1000"
            style={{
              top: '40%',
              width: progressPercent + '%',
              transform: 'translateY(-50%)',
              maxWidth: 'calc(100% - 4rem)',
            }}
          />
          {TRACKING_STATUSES.map((stat, idx) => (
            <motion.div
              key={stat.key}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.2, type: "spring", stiffness: 200 }}
              className="flex flex-col items-center relative z-10"
            >
              {/* Status Circle */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 ${
                  idx <= currentIdx 
                    ? `bg-gradient-to-br ${stat.color} border-white text-white shadow-xl` 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {idx < currentIdx ? (
                  <CheckCircle className="w-6 h-6" />
                ) : idx === currentIdx ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    {stat.icon}
                  </motion.div>
                ) : (
                  stat.icon
                )}
                
                {/* Pulse animation for current status */}
                {idx === currentIdx && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${stat.color}`}
                  />
                )}
              </motion.div>
              
              {/* Status Label */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.2 + 0.3 }}
                className="mt-3 text-center"
              >
                <p className={`text-sm font-semibold ${
                  idx <= currentIdx ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  {stat.label}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden space-y-4 mb-8">
          {TRACKING_STATUSES.map((stat, idx) => (
            <motion.div
              key={stat.key}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.15 }}
              className={`relative flex items-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                idx <= currentIdx 
                  ? `${stat.bgColor} border-transparent shadow-md` 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="relative mr-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  idx <= currentIdx 
                    ? `bg-gradient-to-br ${stat.color} text-white shadow-lg` 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {idx < currentIdx ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : idx === currentIdx ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      {stat.icon}
                    </motion.div>
                  ) : (
                    stat.icon
                  )}
                </div>
                {idx < (TRACKING_STATUSES.length - 1) && (
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 top-12 w-1 rounded-full ${
                      idx < currentIdx ? 'bg-[#8e191c]' : 'bg-gray-200'
                    } h-10`}
                  />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${idx <= currentIdx ? stat.textColor : 'text-gray-500'}`}>{stat.label}</p>
                {idx === currentIdx && (
                  <p className="text-sm text-gray-600 mt-1">Currently in progress...</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbeaea] via-white to-[#fbeaea] relative overflow-hidden">
      {/* Back to Orders Button */}
      <button
        className="fixed top-4 left-4 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/70 backdrop-blur-md hover:bg-white/80 text-zinc-800 font-semibold border border-zinc-200 shadow-lg transition-all duration-200 z-30"
        onClick={() => {
          const stateOrderId = location.state?.fromOrderId;
          const orderId = stateOrderId || trackingData?.orderId;
          if (orderId) return navigate(`/user/orders/${orderId}`);
          navigate('/user/orders');
        }}
        disabled={!(location.state?.fromOrderId || (trackingData && trackingData.orderId))}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Order Details
      </button>
      {/* Background animations removed for a cleaner look */}

      <div className="relative z-10 container mx-auto px-4 pt-16 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 mt-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-3 bg-gradient-to-br from-[#8e191c] to-[#b02a2e] rounded-2xl text-white shadow-xl"
            >
              <Package className="w-8 h-8" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8e191c] to-[#b02a2e] bg-clip-text text-transparent">
              Track Your Order
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Enter your tracking number to see real-time updates</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 mb-8"
        >
          <div onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8e191c]" />
              <input
                type="text"
                placeholder="Enter Order ID or Tracking Number (e.g., TRK-789456123)"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-2xl border-2 border-gray-200 focus:border-[#8e191c] focus:outline-none transition-all duration-200 text-base sm:text-lg"
              />
            </div>
            <motion.button
              type="button"
              disabled={loading || !trackingNumber}
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#8e191c] hover:opacity-90 text-white rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Tracking...
                </div>
              ) : (
                'Track Order'
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 flex items-center gap-4"
            >
              <AlertCircle className="w-6 h-6 text-[#8e191c] flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-[#8e191c] mb-1">Oops! Something went wrong</h3>
                <p className="text-[#b02a2e]">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tracking Results */}
        <AnimatePresence>
          {trackingData && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-8"
            >
              {/* Order Summary Card */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Gift className="w-6 h-6 text-[#8e191c]" />
                      <h2 className="text-2xl font-bold text-gray-800">
                        Order #{trackingData.orderId?.toString().slice(-8).toUpperCase() || 'N/A'}
                      </h2>
                      {realTimeInterval && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-3 h-3 bg-green-500 rounded-full"
                          title="Live tracking active"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Current Status Banner */}
                {getCurrentStatus() && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`${getCurrentStatus().bgColor} rounded-2xl p-6 mb-8 border-2 border-transparent`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-gradient-to-br ${getCurrentStatus().color} text-white rounded-xl shadow-lg`}>
                        {getCurrentStatus().icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold ${getCurrentStatus().textColor} mb-1`}>
                          {getCurrentStatus().label}
                        </h3>
                        <p className="text-gray-700">
                          {getCurrentStatus().key === 'pending' && 'Your order has been received and is being prepared'}
                          {getCurrentStatus().key === 'processing' && 'Your order is being processed by our team'}
                          {getCurrentStatus().key === 'shipped' && 'Your delicious food is being prepared with care'}
                          {getCurrentStatus().key === 'in transit' && 'Your order is on its way to you!'}
                          {getCurrentStatus().key === 'delivered' && 'Your order has been successfully delivered'}
                        </p>
                      </div>
                      {getCurrentStatus().key === 'in transit' && (
                        <motion.div
                          animate={{ x: [0, 10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-2xl"
                        >
                          🚚💨
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Progress Bar */}
                {renderProgress(trackingData.trackingStatus)}
              </motion.div>

              {/* Tracking History */}
              {/* Removed Tracking History section as requested */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call to Action */}
        {!trackingData && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12"
          >
            <div className="mb-6 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[#8e191c]/10 flex items-center justify-center shadow-lg">
                <Search className="w-12 h-12 text-[#8e191c]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-4">Ready to track your order?</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              Enter your tracking number above to see real-time updates and estimated delivery time.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;