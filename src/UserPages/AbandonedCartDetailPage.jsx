import React, { useState, useEffect } from 'react';
import { 
  FiShoppingCart, 
  FiClock, 
  FiDollarSign,
  FiPackage,
  FiArrowLeft,
  FiRotateCcw,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiMail,
  FiTag
} from 'react-icons/fi';
import { FaStore } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import LoaderOverlay from '../components/LoaderOverlay';
import WebService from '../services/Website/WebService';
import UserSidebar from './UserSidebar';
import { useCart } from '../context/CartContext';
import ConfirmModal from '../components/ConfirmModal';

const AbandonedCartDetailPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { cartId } = useParams();
  const navigate = useNavigate();
  const { reorderAbandonedCart } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (cartId) {
      fetchCartDetails();
    }
  }, [cartId]);

  const fetchCartDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await WebService.getUserAbandonedCarts();
      if (response.success) {
        const foundCart = response.data.find(c => c._id === cartId);
        if (foundCart) {
          setCart(foundCart);
        } else {
          setError('Cart not found');
        }
      } else {
        setError('Failed to fetch cart details');
      }
    } catch (error) {
      console.error('Error fetching cart details:', error);
      setError(error.message || 'Failed to fetch cart details');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = () => {
    setConfirmModalOpen(true);
  };

  const confirmReorder = async () => {
    if (!cart || !cart._id) {
      setError('Cart not loaded');
      setConfirmModalOpen(false);
      return;
    }
    setConfirmModalOpen(false);
    console.log('Attempting reorder for cart:', cart._id);
    try {
      await reorderAbandonedCart(cart._id);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/cart');
      }, 1200);
    } catch (error) {
      console.error('Reorder error:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to reorder cart');
      alert('Failed to reorder: ' + (error?.response?.data?.message || error?.message));
    }
  };

  const cancelReorder = () => {
    setConfirmModalOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="flex-1 overflow-auto relative lg:ml-64 pt-8">
          <LoaderOverlay text="Loading cart details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="flex-1 overflow-auto relative lg:ml-64 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <FiShoppingCart className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Error Loading Cart Details</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="flex-1 overflow-auto relative lg:ml-64 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Cart Not Found</h3>
              <p className="text-gray-600 mb-8">The requested cart could not be found.</p>
              <button
                onClick={() => navigate('/user/abandoned-carts')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Back to Abandoned Carts
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserSidebar />
      
      <div className="flex-1 overflow-auto relative lg:ml-64 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Toast */}
          {showSuccess && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
              <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                <FiRotateCcw className="w-5 h-5" />
                <span>Cart items added! Redirecting…</span>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/user/abandoned-carts')}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-xl flex-shrink-0">
                    <FiShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                  </div>
                  <span className="truncate">Cart Details</span>
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">View detailed information about your abandoned cart</p>
              </div>
            </div>
            <button
              onClick={handleReorder}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <FiRotateCcw className="w-4 h-4" />
              Reorder Cart
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Info Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Cart Information</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cart.status)}`}>
                    {cart.status || 'abandoned'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FiPackage className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="font-semibold text-gray-900">{cart.itemCount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FiDollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="font-semibold text-gray-900">د.إ{cart.total}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FiCalendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-semibold text-gray-900">{formatDate(cart.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <FiClock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-semibold text-gray-900">{formatDate(cart.lastUpdated)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cart Items</h2>
                <div className="space-y-4">
                  {cart.items && cart.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-shrink-0">
                        <img 
                          src={item.product?.image || '/placeholder-product.jpg'} 
                          alt={item.product?.ItemName || 'Product'} 
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.product?.ItemName || 'Unknown Product'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Code: {item.product?.ItemCode || 'N/A'}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            د.إ{item.price} each
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-bold text-lg text-gray-900">
                          د.إ{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Store Information */}
              {cart.store && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaStore className="w-5 h-5 text-blue-600" />
                    Store Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Store Name</p>
                      <p className="font-semibold text-gray-900">{cart.store.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* User Information */}
              {cart.user && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-green-600" />
                    User Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold text-gray-900">{cart.user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{cart.user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Summary */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Cart Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">د.إ{cart.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items</span>
                    <span className="font-semibold">{cart.itemCount}</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>د.إ{cart.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

export default AbandonedCartDetailPage;