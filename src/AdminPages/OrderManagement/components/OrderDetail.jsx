import React from 'react';
import { 
  FiArrowLeft,
  FiUser,
  FiTruck,
  FiCreditCard,
  FiPackage,
  FiActivity,
  FiCheckCircle,
  FiEdit3,
  FiTrash2,
  FiSend,
  FiMail,
  FiPhone,
  FiHome,
  FiClock,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi';
import CustomerInfo from './OrderDetail/CustomerInfo';
import AddressInfo from './OrderDetail/AddressInfo';
import OrderItems from './OrderDetail/OrderItems';
import OrderStatus from './OrderDetail/OrderStatus';
import OrderDetailsCard from './OrderDetail/OrderDetails';
import StoreInfo from './OrderDetail/StoreInfo';
import PaymentInfo from './OrderDetail/PaymentInfo';
import ActionButtons from './OrderDetail/ActionButtons';
import TrackingHistory from './OrderDetail/TrackingHistory';
import LoaderOverlay from '../../../components/LoaderOverlay';

const OrderDetail = ({ 
  order, 
  loading, 
  error, 
  onBack, 
  onTrackingUpdate, 
  onSendNotification, 
  onGetOrderTimeline,
  setError 
}) => {
  if (!order) return null;

  // Format functions
  const formatPrice = (price) => `د.إ${price.toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString) => new Date(dateString).toLocaleString();

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return FiClock;
      case 'shipped': return FiTruck;
      case 'delivered': return FiCheckCircle;
      case 'cancelled': return FiXCircle;
      default: return FiPackage;
    }
  };

  return (
    <div className="min-h-screen p-4">
      {/* Loading and Error States */}
      {loading && (
        <LoaderOverlay text="Loading order details..." />
      )}
      {error && (
        <div className="flex justify-center items-center h-64">
          <span className="text-lg text-red-600">{error}</span>
        </div>
      )}
      {/* Only show controls and content if not loading and no error */}
      {!loading && !error && (
        <>
          {/* Animated background elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-600/3 rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-6">
                <button
                  onClick={onBack}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/10"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2 inline" />
                  Back to Orders
                </button>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-red-800 via-red-600 to-pink-600 bg-clip-text text-transparent">
                    Order Details
                  </h1>
                  <p className="text-gray-600 mt-1">Order #{order.orderId}</p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-600 hover:text-red-800 transition-colors"
                  >
                    <FiXCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-12 gap-8">
              {/* Left Column - Order Information */}
              <div className="col-span-12 lg:col-span-8">
                {/* Customer Information */}
                <CustomerInfo order={order} />

                {/* Shipping & Billing Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {order.orderType === 'delivery' ? (
                    <>
                      <AddressInfo 
                        title="Shipping Address"
                        address={order.shippingAddress}
                        icon={FiTruck}
                        iconColor="blue"
                      />
                      <AddressInfo 
                        title="Billing Address"
                        address={order.billingAddress}
                        icon={FiCreditCard}
                        iconColor="green"
                      />
                    </>
                  ) : (
                    <div className="col-span-2">
                      <AddressInfo 
                        title="Pickup Location"
                        address={order.store?.location?.address}
                        icon={FiHome}
                        iconColor="green"
                        isPickup={true}
                      />
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <OrderItems order={order} formatPrice={formatPrice} />
              </div>

              {/* Right Column - Order Status and Details */}
              <div className="col-span-12 lg:col-span-4">
                <div className="sticky top-6 space-y-6">
                  {/* Order Status */}
                  <OrderStatus 
                    order={order} 
                    getStatusColor={getStatusColor}
                    formatDateTime={formatDateTime}
                  />

                  {/* Order Details */}
                  <OrderDetailsCard 
                    order={order}
                    formatDateTime={formatDateTime}
                  />

                  {/* Store Information */}
                  {(order.store || order.orderType === 'pickup') && (
                    <StoreInfo order={order} />
                  )}

                  {/* Payment Information */}
                  {order.payment && (
                    <PaymentInfo 
                      order={order} 
                      formatPrice={formatPrice}
                      formatDateTime={formatDateTime}
                    />
                  )}

                  {/* Action Buttons */}
                  <ActionButtons 
                    order={order}
                    loading={loading}
                    onTrackingUpdate={onTrackingUpdate}
                    onSendNotification={onSendNotification}
                  />
                </div>
              </div>
            </div>

            {/* Tracking History */}
            {order.trackingHistory && order.trackingHistory.length > 0 && (
              <TrackingHistory 
                trackingHistory={order.trackingHistory}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                formatDateTime={formatDateTime}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderDetail;