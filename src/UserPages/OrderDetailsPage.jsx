import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  Truck, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Download
} from 'lucide-react';
import webService from '../services/Website/WebService';
import UserSidebar from './UserSidebar';
import ConfirmModal from '../components/ConfirmModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
// Removed LoaderOverlay import – page renders without blocking loader
import { ToastContainer, Bounce } from 'react-toastify';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showConfirm, setShowConfirm] = useState(false);
  const { setCart, reorderItems } = useCart();
  const token = localStorage.getItem('token');
  const [showSuccess, setShowSuccess] = useState(false);
  const [addedItems, setAddedItems] = useState([]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await webService.getOrderDetails(orderId);
        setOrder(res.data.data);
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Unable to fetch order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    const handler = (e) => {
      const content = document.getElementById('details-content-wrapper');
      if (!content) return;
      const width = e?.detail?.width;
      if (window.innerWidth >= 1024) {
        content.style.marginLeft = width || '16rem';
      } else {
        content.style.marginLeft = '0px';
      }
    };
    window.addEventListener('sidebar:width', handler);
    handler({ detail: { width: '16rem' } });
    const onResize = () => handler();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('sidebar:width', handler);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const getStatusIcon = (status) => {
    // Normalize icon color to brand color
    const brand = { color: '#8e191c' };
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5" style={brand} />;
      case 'pending':
        return <Clock className="w-5 h-5" style={brand} />;
      default:
        return <AlertCircle className="w-5 h-5" style={brand} />;
    }
  };

  const getTrackingStatusColor = () => {
    // Use a single brand color treatment for consistency
    return 'text-[#8e191c] bg-[#8e191c]/10';
  };

  const handleReorder = async () => {
    setShowConfirm(false);
    try {
      // Use the reorderItems method from CartContext instead
      const result = await reorderItems(order.orderId);
      setAddedItems(result.items || []);
      setShowSuccess(true);
    } catch (e) {
      alert('Failed to reorder: ' + (e.response?.data?.message || e.message));
    }
  };

  // Do not block the page with a loader; render content once data arrives
  if (loading) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        <div className="hidden lg:block"><UserSidebar /></div>
        <main id="details-content-wrapper" className="lg:ml-64 relative z-10 p-6 sm:p-10 max-w-6xl mx-auto">
          {/* Skeleton similar to ProductList */}
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-56 bg-zinc-200 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-zinc-100 rounded-2xl border border-zinc-200" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-40 bg-zinc-100 rounded-2xl border border-zinc-200" />
              <div className="h-40 bg-zinc-100 rounded-2xl border border-zinc-200" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <Shell>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">❌</div>
          <p className="text-[#8e191c] text-lg font-semibold max-w-md">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#8e191c' }}
          >
            Go Back
          </motion.button>
        </motion.div>
      </Shell>
    );
  }

  if (!order) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FileText className="w-4 h-4" /> },
    { id: 'items', label: 'Items', icon: <Package className="w-4 h-4" /> },
    { id: 'tracking', label: 'Tracking', icon: <Truck className="w-4 h-4" /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin className="w-4 h-4" /> }
  ];

  return (
    <>
      <div className="min-h-screen bg-white relative overflow-hidden">
        <div className="hidden lg:block"><UserSidebar /></div>
        
        <main id="details-content-wrapper" className="lg:ml-64 relative z-10 p-6 sm:p-10 max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-semibold border border-zinc-200 shadow-sm transition-all duration-200"
            onClick={() => navigate('/user/orders')}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </motion.button>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md border border-zinc-200 p-8 mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 rounded-xl text-white shadow-lg"
                    style={{ backgroundColor: '#8e191c' }}
                  >
                    <Package className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h1 className="text-3xl font-bold text-black">
                      Order #{order.orderId.slice(-8).toUpperCase()}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(order.paymentStatus)}
                      <span className="text-sm font-medium capitalize text-zinc-600">
                        {order.paymentStatus} • {order.orderType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 bg-[#8e191c]/10 rounded-xl border"
                    style={{ borderColor: '#e7bcbc' }}
                  >
                    <Calendar className="w-5 h-5" style={{ color: '#8e191c' }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#8e191c' }}>Order Date</p>
                      <p className="text-sm font-semibold" style={{ color: '#8e191c' }}>
                        {new Date(order.orderDate).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 bg-[#8e191c]/10 rounded-xl border"
                    style={{ borderColor: '#e7bcbc' }}
                  >
                    <CreditCard className="w-5 h-5" style={{ color: '#8e191c' }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#8e191c' }}>Total Amount</p>
                      <p className="text-sm font-semibold" style={{ color: '#8e191c' }}>
                        AED {order.price?.toFixed(2)}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 bg-[#8e191c]/10 rounded-xl border"
                    style={{ borderColor: '#e7bcbc' }}
                  >
                    <User className="w-5 h-5" style={{ color: '#8e191c' }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#8e191c' }}>Customer</p>
                      <p className="text-sm font-semibold truncate" style={{ color: '#8e191c' }}>
                        {order.cardName}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => navigate(`/user/orders/${order.orderId}/receipt`)}
                >
                  <Download className="w-4 h-4" />
                  View Receipt
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                   className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                   style={{ backgroundColor: '#8e191c' }}
                  onClick={() => navigate(`/user/order-tracking?trackingNumber=${encodeURIComponent(order.trackingNumber || '')}`, { state: { fromOrderId: order.orderId } })}
                >
                  <Truck className="w-4 h-4" />
                  Track Order
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                   className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => setShowConfirm(true)}
                >
                  <Package className="w-4 h-4" />
                  Reorder
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Tabs Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-8 bg-white rounded-2xl p-2 border border-zinc-200 shadow-sm"
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-white shadow-lg'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800'
                }`}
                style={activeTab === tab.id ? { backgroundColor: '#8e191c' } : undefined}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && <OverviewTab order={order} />}
              {activeTab === 'items' && <ItemsTab order={order} />}
              {activeTab === 'tracking' && <TrackingTab order={order} getTrackingStatusColor={getTrackingStatusColor} />}
              {activeTab === 'addresses' && <AddressesTab order={order} />}
            </motion.div>
          </AnimatePresence>
        </main>
        <ConfirmModal
          open={showConfirm}
          onConfirm={handleReorder}
          onCancel={() => setShowConfirm(false)}
          title="Reorder Confirmation"
          message={order && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-700">Order ID:</span>
                <span className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded">{String(order.orderId).slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-700">Total:</span>
                <span className="font-bold text-[#8e191c]">AED {order.price?.toFixed(2)}</span>
              </div>
              <div>
                <div className="mt-2 space-y-2">
                  {order.orderItems?.slice(0,2).map((item, i) => (
                    <div key={item._id || i} className="flex items-center gap-2 bg-zinc-50 rounded-lg p-2">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />
                      )}
                      <span className="text-xs font-medium text-black truncate max-w-[7rem]">{item.name}</span>
                      <span className="text-xs text-zinc-600 ml-auto">x{item.quantity}</span>
                    </div>
                  ))}
                  {order.orderItems && order.orderItems.length > 2 && (
                    <div className="text-xs text-zinc-500 mt-1">+{order.orderItems.length - 2} more items</div>
                  )}
                </div>
              </div>
              <div className="pt-2 text-sm text-zinc-700">Are you sure you want to reorder all items from this order?</div>
            </div>
          )}
          confirmText="Yes, Reorder"
          cancelText="Cancel"
        />
        <ConfirmModal
          open={showSuccess}
          onConfirm={() => { setShowSuccess(false); navigate('/cart'); }}
          onCancel={() => setShowSuccess(false)}
          title="Reorder Successful"
          message={(
            <div className="space-y-3">
              <div className="text-green-600 font-bold text-lg">Items added to your cart!</div>
              <div className="space-y-2">
                {addedItems.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-zinc-50 rounded-lg p-2">
                    <span className="text-xs font-medium text-black truncate max-w-[7rem]">{item.name}</span>
                    <span className="text-xs text-zinc-600 ml-auto">x{item.quantity}</span>
                    <span className="text-xs text-[#8e191c] ml-2">AED {item.price}</span>
                  </div>
                ))}
                {addedItems.length > 3 && (
                  <div className="text-xs text-zinc-500 mt-1">+{addedItems.length - 3} more items</div>
                )}
              </div>
              <div className="pt-2 text-sm text-zinc-700">You can view or edit your cart before checkout.</div>
            </div>
          )}
          confirmText="Go to Cart"
          cancelText="Close"
        />
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  );
};

// Tab Components
const OverviewTab = ({ order }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6"
    >
      <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5" style={{ color: '#8e191c' }} />
        Payment Information
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-zinc-600">Payment Type:</span>
          <span className="font-medium capitalize" style={{ color: '#8e191c' }}>{order.paymentType}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-600">Payment Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            order.paymentStatus ? 'text-[#8e191c] bg-[#8e191c]/10' : 'text-zinc-600 bg-zinc-100'
          }`}>
            {order.paymentStatus}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-600">Total Amount:</span>
          <span className="font-bold text-lg" style={{ color: '#8e191c' }}>AED {order.price?.toFixed(2)}</span>
        </div>
      </div>
    </motion.div>

    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6"
    >
      <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5" style={{ color: '#8e191c' }} />
        Delivery Information
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-zinc-600">Order Type:</span>
          <span className="font-medium capitalize flex items-center gap-1">
            {order.orderType === 'pickup' ? '🏪' : '🚚'} {order.orderType}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-600">Tracking Number:</span>
          <span className="font-medium">{order.trackingNumber || 'Not assigned'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-zinc-600">Status:</span>
          <span className="font-medium capitalize">{order.trackingStatus || 'Processing'}</span>
        </div>
      </div>
    </motion.div>

    {order.notes && (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 lg:col-span-2"
      >
        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" style={{ color: '#8e191c' }} />
          Order Notes
        </h3>
        <p className="text-zinc-700 bg-zinc-50 p-4 rounded-xl">{order.notes}</p>
      </motion.div>
    )}
  </div>
);

const ItemsTab = ({ order }) => (
  <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
    <h3 className="text-lg font-semibold text-black mb-6 flex items-center gap-2">
      <Package className="w-5 h-5" style={{ color: '#8e191c' }} />
      Order Items ({order.orderItems?.length || 0})
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {order.orderItems?.map((item, index) => (
        <motion.div
          key={item._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.03, y: -5 }}
          className="flex flex-col gap-4 items-center border border-zinc-200 rounded-2xl bg-white/80 backdrop-blur-sm p-4 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <div className="flex gap-4 items-center w-full">
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-xl"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                }}
              />
              <div className="absolute -top-2 -right-2 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold" style={{ backgroundColor: '#8e191c' }}>
                {item.quantity}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-black text-sm mb-1 line-clamp-2">{item.name}</h4>
              <p className="text-xs text-zinc-600 mb-1">Quantity: {item.quantity}</p>
              <p className="text-sm font-bold" style={{ color: '#8e191c' }}>AED {item.price}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const TrackingTab = ({ order, getTrackingStatusColor }) => (
  <div className="space-y-6">
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6"
    >
      <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5" style={{ color: '#8e191c' }} />
        Tracking Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-zinc-600 mb-1">Tracking Number:</p>
          <p className="font-mono text-lg font-bold text-black bg-zinc-100 px-3 py-2 rounded-lg">
            {order.trackingNumber || 'Not yet assigned'}
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-600 mb-1">Current Status:</p>
          <span className={`inline-block px-4 py-2 rounded-lg font-medium capitalize ${getTrackingStatusColor(order.trackingStatus)}`}>
            {order.trackingStatus || 'Processing'}
          </span>
        </div>
      </div>
    </motion.div>

    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6"
    >
      <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" style={{ color: '#8e191c' }} />
        Tracking History
      </h3>
          {order.trackingHistory?.length ? (
        <div className="space-y-4">
          {order.trackingHistory.map((history, index) => (
            <motion.div
              key={history._id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 p-4 bg-gradient-to-r from-zinc-50 to-white rounded-xl border border-zinc-200"
            >
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTrackingStatusColor(history.status)}`}>
                    {history.status}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {new Date(history.timestamp).toLocaleString()}
                  </span>
                </div>
                {history.note && (
                  <p className="text-sm text-zinc-700 italic">{history.note}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="text-4xl mb-3">📦</div>
          <p className="text-zinc-600">No tracking history available yet.</p>
        </motion.div>
      )}
    </motion.div>
  </div>
);

const AddressesTab = ({ order }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Show pickup address for pickup orders, shipping address for delivery orders */}
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6"
    >
      <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" style={{ color: '#8e191c' }} />
        {order.orderType === 'pickup' ? 'Pickup Address' : 'Shipping Address'}
      </h3>
      {order.orderType === 'pickup' ? (
        // Show pickup location for pickup orders
        order.location ? (
          <div className="space-y-2">
            <p className="font-medium text-black">{order.location.address}</p>
            {order.location.city && (
              <p className="text-zinc-600">{order.location.city}</p>
            )}
            {order.location.phone && (
              <p className="text-zinc-600 flex items-center gap-2">
                📞 {order.location.phone}
              </p>
            )}
            {order.location.hours && (
              <p className="text-zinc-600 flex items-center gap-2">
                🕒 {order.location.hours}
              </p>
            )}
          </div>
        ) : (
          <p className="text-zinc-500 italic">No pickup location provided</p>
        )
      ) : (
        // Show shipping address for delivery orders
        order.shippingAddress ? (
          <div className="space-y-2">
            <p className="font-medium text-black">{order.shippingAddress.address}</p>
            <p className="text-zinc-600">
              {order.shippingAddress.city}, {order.shippingAddress.country}
            </p>
            {order.shippingAddress.postalCode && (
              <p className="text-zinc-600">{order.shippingAddress.postalCode}</p>
            )}
          </div>
        ) : (
          <p className="text-zinc-500 italic">No shipping address provided</p>
        )
      )}
    </motion.div>

    {order.orderType !== 'pickup' && (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6"
      >
        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" style={{ color: '#8e191c' }} />
          Billing Address
        </h3>
        {order.billingAddress ? (
          <div className="space-y-2">
            <p className="font-medium text-black">{order.billingAddress.address}</p>
            <p className="text-zinc-600">
              {order.billingAddress.city}, {order.billingAddress.country}
            </p>
            {order.billingAddress.postalCode && (
              <p className="text-zinc-600">{order.billingAddress.postalCode}</p>
            )}
          </div>
        ) : (
          <p className="text-zinc-500 italic">No billing address provided</p>
        )}
      </motion.div>
    )}
  </div>
);

const Shell = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-rose-50 via-zinc-50 to-gray-100 relative overflow-hidden">
    <UserSidebar />
    <div className="lg:ml-64 flex items-center justify-center p-12 relative z-10">
      <div className="text-center">{children}</div>
    </div>
  </div>
);

export default OrderDetailsPage;