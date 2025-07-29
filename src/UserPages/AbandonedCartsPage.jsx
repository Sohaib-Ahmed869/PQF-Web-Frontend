import React, { useState, useEffect } from 'react';
import { 
  FiShoppingCart, 
  FiUser, 
  FiMail, 
  FiClock, 
  FiDollarSign,
  FiPackage,
  FiEye,
  FiSend,
  FiCalendar,
  FiTrendingUp,
  FiUsers,
  FiPercent,
  FiRefreshCw,
  FiTrash2,
  FiArrowLeft,
  FiRotateCcw
} from 'react-icons/fi';
import LoaderOverlay from '../components/LoaderOverlay';
import WebService from '../services/Website/WebService';
import { useNavigate } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import { useCart } from '../context/CartContext';
import ConfirmModal from '../components/ConfirmModal';

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
  <div className={`${color} rounded-2xl p-4 sm:p-6 text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-xs sm:text-sm font-medium truncate">{title}</p>
        <p className="text-xl sm:text-3xl font-bold mt-1 sm:mt-2 truncate text-white">{value}</p>
        {subtitle && <p className="text-white/70 text-xs sm:text-sm mt-1 truncate">{subtitle}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">{trend}</span>
          </div>
        )}
      </div>
      <div className="bg-white/20 p-2 sm:p-3 rounded-xl flex-shrink-0 ml-2">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
      </div>
    </div>
  </div>
);

const AbandonedCartCard = ({ cart, onReorder, onViewCart }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'abandoned': return 'bg-red-100 text-red-800';
      case 'checked_out': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="bg-red-100 p-1.5 sm:p-2 rounded-xl flex-shrink-0">
              <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                Abandoned Cart
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Cart ID: {cart._id?.slice(-8) || 'N/A'}</p>
            </div>
          </div>
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cart.status)} flex-shrink-0`}>
            {cart.status || 'abandoned'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="bg-blue-50 rounded-xl p-2 sm:p-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <FiPackage className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-blue-900 truncate">{cart.itemCount} Items</span>
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-2 sm:p-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <FiDollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-green-900 truncate">د.إ{cart.total}</span>
            </div>
          </div>
        </div>

        {/* Time Info */}
        <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 text-gray-600">
          <FiClock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="text-xs sm:text-sm truncate">Last updated {formatDate(cart.lastUpdated)}</span>
        </div>

        {/* Items Preview */}
        <div className="mb-3 sm:mb-4">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Items in Cart:</h4>
          <div className="space-y-1 sm:space-y-2">
            {cart.items && cart.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-1.5 sm:p-2">
                <span className="text-xs sm:text-sm text-gray-700 truncate flex-1">
                  {item.product?.ItemName || 'Unknown Product'}
                </span>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">×{item.quantity}</span>
              </div>
            ))}
            {cart.items && cart.items.length > 3 && (
              <div className="text-xs text-gray-500 text-center py-1">
                +{cart.items.length - 3} more items
              </div>
            )}
          </div>
        </div>

        {/* Store Info */}
        {cart.store && (
          <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 bg-purple-50 rounded-lg p-1.5 sm:p-2">
            <FiUsers className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-purple-900 truncate">{cart.store.name}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => onViewCart(cart)}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm font-medium py-2 px-2 sm:px-3 rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2"
          >
            <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>View Cart</span>
          </button>
          <button
            onClick={() => onReorder(cart)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium py-2 px-2 sm:px-3 rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2"
          >
            <FiRotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Reorder</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const AbandonedCartsPage = () => {
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { reorderAbandonedCart } = useCart();
  const [reorderLoading, setReorderLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState(null);

  // Fetch abandoned carts on component mount
  useEffect(() => {
    fetchAbandonedCarts();
  }, []);

  const fetchAbandonedCarts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await WebService.getUserAbandonedCarts();
      if (response.success) {
        setAbandonedCarts(response.data || []);
      } else {
        setError('Failed to fetch abandoned carts');
        setAbandonedCarts([]);
      }
    } catch (error) {
      console.error('Error fetching abandoned carts:', error);
      setError(error.message || 'Failed to fetch abandoned carts');
      setAbandonedCarts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAbandonedCarts();
  };

  const handleReorder = (cart) => {
    setSelectedCart(cart);
    setConfirmModalOpen(true);
  };

  const confirmReorder = async () => {
    if (!selectedCart || !selectedCart._id) {
      setError('Cart not loaded');
      setConfirmModalOpen(false);
      return;
    }
    setReorderLoading(true);
    setConfirmModalOpen(false);
    console.log('Attempting reorder for cart:', selectedCart._id);
    try {
      await reorderAbandonedCart(selectedCart._id);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/cart');
      }, 1200);
    } catch (error) {
      console.error('Reorder error:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to reorder cart');
      alert('Failed to reorder: ' + (error?.response?.data?.message || error?.message));
    } finally {
      setReorderLoading(false);
      setSelectedCart(null);
    }
  };

  const cancelReorder = () => {
    setConfirmModalOpen(false);
    setSelectedCart(null);
  };

  const handleViewCart = (cart) => {
    navigate(`/user/abandoned-carts/${cart._id}`);
  };

  // Calculate stats
  const stats = {
    totalCarts: abandonedCarts.length,
    totalValue: abandonedCarts.reduce((sum, cart) => sum + (cart.total || 0), 0),
    avgCartValue: abandonedCarts.length > 0 ? 
      (abandonedCarts.reduce((sum, cart) => sum + (cart.total || 0), 0) / abandonedCarts.length) : 0,
    totalItems: abandonedCarts.reduce((sum, cart) => sum + (cart.itemCount || 0), 0),
    recentCarts: abandonedCarts.filter(cart => {
      const cartDate = new Date(cart.lastUpdated);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return cartDate > dayAgo;
    }).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar />
      
      <div className="flex-1 overflow-auto relative lg:ml-64 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="truncate">My Abandoned Carts</span>
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">Recover your abandoned shopping carts</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="relative">
              <LoaderOverlay text="Loading abandoned carts..." />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <FiShoppingCart className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Error Loading Abandoned Carts</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Dashboard */}
          {!loading && !error && abandonedCarts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                title="Total Abandoned Carts"
                value={stats.totalCarts}
                icon={FiShoppingCart}
                color="bg-gradient-to-r from-red-500 to-red-600"
                subtitle={`${stats.recentCarts} in last 24h`}
              />
              <StatCard
                title="Total Value"
                value={`د.إ${stats.totalValue.toFixed(2)}`}
                icon={FiDollarSign}
                color="bg-gradient-to-r from-green-500 to-green-600"
                subtitle={`Avg: د.إ${stats.avgCartValue.toFixed(2)}`}
              />
              <StatCard
                title="Total Items"
                value={stats.totalItems}
                icon={FiPackage}
                color="bg-gradient-to-r from-blue-500 to-blue-600"
                subtitle={`${(stats.totalItems / stats.totalCarts || 0).toFixed(1)} per cart`}
              />
              <StatCard
                title="Recovery Rate"
                value="0%"
                icon={FiTrendingUp}
                color="bg-gradient-to-r from-purple-500 to-purple-600"
                subtitle="Reorder your carts"
              />
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {abandonedCarts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-12 shadow-xl">
                    <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <FiShoppingCart className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Abandoned Carts</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Great news! You don't have any abandoned carts. Keep up the great shopping!
                    </p>
                    <button
                      onClick={() => navigate('/products')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {abandonedCarts.map(cart => (
                    <AbandonedCartCard
                      key={cart._id}
                      cart={cart}
                      onReorder={handleReorder}
                      onViewCart={handleViewCart}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <FiRotateCcw className="w-5 h-5" />
            <span>Cart items added! Redirecting…</span>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirmModalOpen}
        onConfirm={confirmReorder}
        onCancel={cancelReorder}
        title="Reorder Cart?"
        message="Are you sure you want to add all items from this abandoned cart to your active cart?"
        confirmText="Yes, Reorder"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AbandonedCartsPage;