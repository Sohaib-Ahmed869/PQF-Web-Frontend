import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Loader2, 
  ArrowLeft,
  ShoppingBag,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

const Cart = () => {
  const { 
    cart, 
    loading, 
    error,
    updateCartItem, 
    removeFromCart, 
    clearCart,
    checkout,
    getCartItemCount 
  } = useCart();
  const { selectedStore } = useStore();
  
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState(null);
  const [updateLoading, setUpdateLoading] = useState({});
  const { isAuthenticated } = useAuth();
  // Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Helper functions
  const getProductName = (product) => {
    if (typeof product === 'string') return 'Product';
    return product?.ItemName || product?.name || 'Unknown Product';
  };

  const getProductImage = (product) => {
    if (typeof product === 'string') return null;
    if (product?.images && product.images.length > 0) return product.images[0];
    if (product?.image) return product.image;
    return 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
  };

  const getProductPrice = (item) => {
    return item?.price || 0;
  };

  const formatPrice = (price) => {
    return `د.إ${parseFloat(price || 0).toFixed(2)}`;
  };

  // Event handlers
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdateLoading(prev => ({ ...prev, [productId]: true }));
    try {
      await updateCartItem(productId, newQuantity, selectedStore?._id);
    } catch (err) {
      console.error('Error updating quantity:', err);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemove = async (productId) => {
    setUpdateLoading(prev => ({ ...prev, [productId]: true }));
    try {
      await removeFromCart(productId, selectedStore?._id);
    } catch (err) {
      console.error('Error removing item:', err);
    } finally {
      setUpdateLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (err) {
        console.error('Error clearing cart:', err);
      }
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutMessage(null);
    
    try {
      const result = await checkout();
      setCheckoutMessage({
        type: 'success',
        text: result.message || 'Checkout completed successfully!'
      });
      
      // Redirect to orders page or show success
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err) {
      setCheckoutMessage({
        type: 'error',
        text: err.response?.data?.error || err.message || 'Checkout failed'
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  // Modified checkout handler
  const handleProceedToCheckout = () => {
    if (isAuthenticated()) {
      navigate('/checkout', {
        state: {
          orderSummary: {
            items: cart.items.map(item => {
              const product = item.product || {};
              return {
                title: product.ItemName || product.name || item.ItemName || item.name || 'Product',
                price: item.price,
                quantity: item.quantity,
                image: product.image || (Array.isArray(product.images) && product.images[0]) || item.image || (Array.isArray(item.images) && item.images[0]) || undefined,
                _id: product._id || product.id || item._id || item.id || undefined,
                id: product.id || product._id || item.id || item._id || undefined,
              };
            }),
            subtotal: cart.total,
            shipping: 0 // You can update this if you have shipping logic
          }
        }
      });
    } else {
      setShowAuthModal(true);
    }
  };

  // Modal action handlers
  const handleLogin = () => {
    setShowAuthModal(false);
    navigate('/login');
  };
  const handleCancelModal = () => {
    setShowAuthModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-red-600" />
              Shopping Cart
              {getCartItemCount() > 0 && (
                <span className="bg-red-600 text-white text-sm px-3 py-1 rounded-full">
                  {getCartItemCount()} items
                </span>
              )}
            </h1>
          </div>
          
          {cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Checkout Message */}
        {checkoutMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            checkoutMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
              checkoutMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`} />
            <p className={checkoutMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {checkoutMessage.text}
            </p>
          </div>
        )}

        {cart.items.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Start adding some products to your cart!</p>
            <button
              onClick={handleContinueShopping}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, index) => {
                const productId = item.product?._id || item.product?.id || item.product || `item-${index}`;
                const isUpdating = updateLoading[productId];
                
                return (
                  <div key={`cart-item-${productId}-${index}`} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {getProductImage(item.product) ? (
                          <img
                            src={getProductImage(item.product)}
                            alt={getProductName(item.product)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-2">
                          {getProductName(item.product)}
                        </h3>
                        
                        {item.product?.ItemCode && (
                          <p className="text-sm text-gray-500 mb-2">
                            Code: {item.product.ItemCode}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Qty:</span>
                            <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleQuantityChange(productId, item.quantity - 1)}
                                disabled={isUpdating || item.quantity <= 1}
                                className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 font-semibold min-w-[50px] text-center">
                                {isUpdating ? (
                                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(productId, item.quantity + 1)}
                                disabled={isUpdating}
                                className="p-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Price and Remove */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-800">
                                {formatPrice(getProductPrice(item) * item.quantity)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatPrice(getProductPrice(item))} each
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemove(productId)}
                              disabled={isUpdating}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({getCartItemCount()} items)</span>
                    <span className="font-semibold">{formatPrice(cart.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-red-600">{formatPrice(cart.total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  disabled={cart.items.length === 0}
                  className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceed to Checkout
                  </>
                </button>

                <button
                  onClick={handleContinueShopping}
                  className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold mb-4">Proceed to Checkout</h2>
            <p className="mb-6 text-gray-700">You need to be logged in to checkout.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogin}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Login
              </button>
              <button
                onClick={handleCancelModal}
                className="w-full mt-2 text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;