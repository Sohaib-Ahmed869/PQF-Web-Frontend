import React, { useState, useEffect } from "react";
import { FaCreditCard, FaLock, FaShoppingCart, FaCheck } from "react-icons/fa";
import { MdContactless, MdSecurity } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { createPaymentIntent, createOrderAfterPayment } from '../services/checkoutService';
import userService from '../services/userService';
import { useStore } from '../context/StoreContext';

// Initialize Stripe - replace with your actual publishable key
const stripePromise = loadStripe("pk_test_51R4HwEP1U1i66wzc0CML1t20v7wPQrvuXPKrrXpnBJ0XVdIEDHuPazuL1ZPIVlQcbk4fSpCTrjla8nsMFog708Vl0031BNIGKo");

// Stripe Card Input Component
const StripeCardInput = ({ onChange }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isStripeReady, setIsStripeReady] = useState(false);
  
  useEffect(() => {
    if (stripe && elements) {
      setIsStripeReady(true);
    }
  }, [stripe, elements]);
  
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      {!isStripeReady ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-[#8e191c] border-t-transparent rounded-full animate-spin mr-2"></div>
          <span className="text-[#8e191c]">Loading Stripe...</span>
        </div>
      ) : (
        <CardElement 
          onChange={onChange}
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
              }
            },
            hidePostalCode: true
          }}
        />
      )}
    </div>
  );
};

// Helper to map country names to ISO 2-letter codes
const countryNameToCode = (name) => {
  const map = {
    'Pakistan': 'PK',
    'United States': 'US',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'India': 'IN',
    // Add more as needed
  };
  return map[name] || name; // fallback to input if already a code
};

const CheckoutPageContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart, cart } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const { orderType, selectedStore } = useStore();

  // Delivery method state
  const [deliveryMethod, setDeliveryMethod] = useState(orderType || 'delivery'); // 'delivery' or 'pickup'

  // Sync deliveryMethod with orderType from StoreContext
  useEffect(() => {
    if (orderType && orderType !== deliveryMethod) {
      setDeliveryMethod(orderType);
    }
  }, [orderType]);

  // State declarations
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cardErrors, setCardErrors] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [isStripeReady, setIsStripeReady] = useState(false);
  const [formState, setFormState] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    shipping: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    },
    billing: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    },
    notes: ""
  });
  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Get order summary from navigation state
  const orderSummary = location.state?.orderSummary || { items: cart.items, subtotal: cart.total };

  let cartError = null;

  useEffect(() => {
    if (!orderSummary || !orderSummary.items || orderSummary.items.length === 0) {
      toast.error('No items in cart');
      navigate('/cart');
      return;
    }
    setLoading(false);
  }, [orderSummary, navigate]);

  // Handle Stripe initialization
  useEffect(() => {
    if (stripe && elements) {
      setIsStripeReady(true);
    }
  }, [stripe, elements]);

  // Auto-populate user data if available
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && deliveryMethod === 'delivery') {
      // Guest user: prefill address from localStorage
      const line1 = localStorage.getItem('delivery_address_line1') || '';
      const line2 = localStorage.getItem('delivery_address_line2') || '';
      const line3 = localStorage.getItem('delivery_address_line3') || '';
      const country = localStorage.getItem('delivery_address_country') || '';
      setFormState(prev => ({
        ...prev,
        shipping: {
          ...prev.shipping,
          street: line1,
          city: line2,
          state: line3,
          country: country
        },
        billing: {
          ...prev.billing,
          street: line1,
          city: line2,
          zipCode: line3,
          country: country
        }
      }));
      return;
    }
    if (!token) return;
    const fetchProfile = async () => {
      try {
        const res = await userService.getProfile();
        const user = res.data?.data;
        setFormState(prev => ({
          ...prev,
          email: user.email || '',
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
          phone: user.phone || '',
          shipping: (() => {
            const shipping = user.addresses?.find(addr => addr._id === user.shippingAddress);
            return shipping ? {
              street: shipping.street,
              city: shipping.city,
              state: shipping.state,
              zipCode: shipping.zipCode,
              country: shipping.country
            } : prev.shipping;
          })(),
          billing: (() => {
            const billing = user.addresses?.find(addr => addr._id === user.billingAddress);
            return billing ? {
              street: billing.street,
              city: billing.city,
              state: billing.state,
              zipCode: billing.zipCode,
              country: billing.country
            } : prev.billing;
          })()
        }));
        setSameAsShipping(user.shippingAddress === user.billingAddress);
      } catch (err) {
        console.log('Profile fetch failed:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleAddressChange = (type, field, value) => {
    setFormState(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
    if (type === 'shipping' && sameAsShipping) {
      setFormState(prev => ({
        ...prev,
        billing: {
          ...prev.billing,
          [field]: value
        }
      }));
    }
  };

  const handleSameAsShippingChange = (checked) => {
    setSameAsShipping(checked);
    if (checked) {
      setFormState(prev => ({
        ...prev,
        billing: { ...prev.shipping }
      }));
    }
  };

  // Validate required fields for step 1
  const isStep1Complete = () => {
    if (cartError) return false;
    const requiredFields = ['email', 'firstName', 'lastName', 'phone'];
    if (deliveryMethod === 'delivery') {
      // Require address fields for delivery
      const shippingFields = [
        formState.shipping.street,
        formState.shipping.city,
        formState.shipping.zipCode,
        formState.shipping.country
      ];
      if (shippingFields.some(f => !f.trim())) return false;
      if (!sameAsShipping) {
        const billingFields = [
          formState.billing.street,
          formState.billing.city,
          formState.billing.zipCode,
          formState.billing.country
        ];
        if (billingFields.some(f => !f.trim())) return false;
      }
    }
    return requiredFields.every(field => formState[field].trim() !== '');
  };

  const handleInputChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const handleCardChange = (event) => {
    setCardErrors(event.error ? event.error.message : null);
    setCardComplete(event.complete);
    if (error && event.complete) setError(null);
  };

  const calculateTotals = () => {
    if (!orderSummary) return {
      itemsPrice: 0,
      totalPrice: 0
    };

    const itemsPrice = orderSummary.subtotal || 0;
    const totalPrice = itemsPrice;

    return {
      itemsPrice,
      totalPrice
    };
  };

  const validateForm = () => {
    const requiredFields = ['email', 'firstName', 'lastName', 'phone'];
    const missingFields = requiredFields.filter(field => !formState[field].trim());
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!isStripeReady || !stripe || !elements) {
      setError('Stripe is not properly loaded. Please refresh the page and try again.');
      return false;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      setError('Card information is required.');
      return false;
    }

    if (cardErrors) {
      setError(cardErrors);
      return false;
    }

    if (!cardComplete) {
      setError('Please complete your card information.');
      return false;
    }

    if (deliveryMethod === 'delivery') {
      // Validate shipping/billing for delivery
      const shippingFields = [
        { label: 'Shipping Street', value: formState.shipping.street },
        { label: 'Shipping City', value: formState.shipping.city },
        { label: 'Shipping ZIP', value: formState.shipping.zipCode },
        { label: 'Shipping Country', value: formState.shipping.country }
      ];
      const missingShipping = shippingFields.filter(f => !f.value.trim());
      if (missingShipping.length > 0) {
        setError(`Please fill in all required fields: ${missingShipping.map(f => f.label).join(', ')}`);
        return false;
      }
      if (!sameAsShipping) {
        const billingFields = [
          { label: 'Billing Street', value: formState.billing.street },
          { label: 'Billing City', value: formState.billing.city },
          { label: 'Billing ZIP', value: formState.billing.zipCode },
          { label: 'Billing Country', value: formState.billing.country }
        ];
        const missingBilling = billingFields.filter(f => !f.value.trim());
        if (missingBilling.length > 0) {
          setError(`Please fill in all required fields: ${missingBilling.map(f => f.label).join(', ')}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const totals = calculateTotals();
      // 1. Create PaymentIntent
      const customerInfo = {
        name: `${formState.firstName} ${formState.lastName}`,
        email: formState.email,
        phone: formState.phone,
        address: deliveryMethod === 'delivery' ? {
          line1: formState.shipping.street,
          city: formState.shipping.city,
          postal_code: formState.shipping.zipCode,
          country: countryNameToCode(formState.shipping.country),
        } : undefined,
      };
      const { clientSecret } = await createPaymentIntent(Math.round(totals.totalPrice * 100), customerInfo);

      // 2. Confirm card payment
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: deliveryMethod === 'delivery' ? {
              line1: formState.billing.street,
              city: formState.billing.city,
              postal_code: formState.billing.zipCode,
              country: countryNameToCode(formState.billing.country),
            } : undefined,
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // 3. Create order in backend
      const orderData = {
        orderItems: orderSummary.items.map(item => ({
          name: item.title,
          price: item.price,
          quantity: item.quantity,
          product: item._id || item.id,
          image: item.imageUrl || item.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300"
        })),
        shippingAddress: deliveryMethod === 'delivery' ? {
          address: formState.shipping.street,
          city: formState.shipping.city,
          postalCode: formState.shipping.zipCode,
          country: formState.shipping.country
        } : undefined,
        billingAddress: deliveryMethod === 'delivery' ? {
          address: formState.billing.street,
          city: formState.billing.city,
          postalCode: formState.billing.zipCode,
          country: formState.billing.country
        } : undefined,
        deliveryMethod,
        pickupStore: deliveryMethod === 'pickup' ? selectedStore : undefined,
        paymentMethod: 'stripe',
        itemsPrice: totals.itemsPrice,
        totalPrice: totals.totalPrice,
        notes: formState.notes,
        store: selectedStore?._id || selectedStore?.id || undefined,
      };

      const orderRes = await createOrderAfterPayment(paymentIntent.id, orderData, customerInfo);

      if (orderRes.success) {
        clearCart();
        setSuccess(true);
        setCurrentStep(4);
        toast.success('Order placed successfully!', {
          position: "bottom-right",
          autoClose: 3000,
        });
        const token = localStorage.getItem('token');
        const stateObj = {
          orderId: orderRes.orderId,
          items: orderSummary.items,
          total: totals.totalPrice
        };
        if (!token) {
          stateObj.email = formState.email;
        }
        navigate('/order-confirmation', { state: stateObj });
      } else {
        throw new Error(orderRes.message || 'Order failed to save.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#8e191c]/5 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#8e191c]/30 border-t-[#8e191c] rounded-full animate-spin"></div>
          <p className="text-[#8e191c] font-medium">Loading secure checkout...</p>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  const steps = [
    { id: 1, name: "Shipping", icon: FaShoppingCart },
    { id: 2, name: "Review", icon: FaCheck },
    { id: 3, name: "Payment", icon: FaCreditCard },
    { id: 4, name: "Complete", icon: FaCheck }
  ];

  return (
    <div className="w-full min-h-screen bg-[#8e191c]/5 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#8e191c] mb-4">Checkout</h1>
        </div>
        {/* Delivery Method Selector */}
        <div className="mb-8 flex justify-center">
          <div className="flex gap-4">
            <button
              type="button"
              className={`px-6 py-2 rounded-lg font-semibold border transition-all duration-200 ${deliveryMethod === 'delivery' ? 'bg-[#8e191c] text-white border-[#8e191c]' : 'bg-white text-[#8e191c] border-gray-300'}`}
              onClick={() => setDeliveryMethod('delivery')}
            >
              Delivery
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded-lg font-semibold border transition-all duration-200 ${deliveryMethod === 'pickup' ? 'bg-[#8e191c] text-white border-[#8e191c]' : 'bg-white text-[#8e191c] border-gray-300'}`}
              onClick={() => setDeliveryMethod('pickup')}
            >
              Pickup
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            <div className="flex items-center justify-center space-x-2">
              <FaLock className="text-[#8e191c]" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {cartError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            <div className="flex items-center justify-center space-x-2">
              <FaLock className="text-[#8e191c]" />
              <span>{cartError}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
                  <FaShoppingCart className="mr-3 text-[#8e191c]" />
                  {deliveryMethod === 'pickup' ? 'Contact Information' : 'Shipping Information'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact fields */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Email *</label>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={e => setFormState(f => ({ ...f, email: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c] placeholder-[#8e191c]/50 focus:border-[#8e191c] focus:ring-2 focus:ring-[#8e191c]/20 transition-all duration-200"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formState.phone}
                      onChange={e => setFormState(f => ({ ...f, phone: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c] placeholder-[#8e191c]/50 focus:border-[#8e191c] focus:ring-2 focus:ring-[#8e191c]/20 transition-all duration-200"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">First Name *</label>
                    <input
                      type="text"
                      value={formState.firstName}
                      onChange={e => setFormState(f => ({ ...f, firstName: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c] placeholder-[#8e191c]/50 focus:border-[#8e191c] focus:ring-2 focus:ring-[#8e191c]/20 transition-all duration-200"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={formState.lastName}
                      onChange={e => setFormState(f => ({ ...f, lastName: e.target.value }))}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c] placeholder-[#8e191c]/50 focus:border-[#8e191c] focus:ring-2 focus:ring-[#8e191c]/20 transition-all duration-200"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                {/* Shipping Address Fields */}
                {deliveryMethod === 'delivery' && (
                  <>
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-black mb-2 border-b border-gray-200 pb-1">Shipping Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">Street Address *</label>
                          <input type="text" value={formState.shipping.street} onChange={e => handleAddressChange('shipping', 'street', e.target.value)} required placeholder="123 Main St" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">City *</label>
                          <input type="text" value={formState.shipping.city} onChange={e => handleAddressChange('shipping', 'city', e.target.value)} required placeholder="New York" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">State/Province</label>
                          <input type="text" value={formState.shipping.state} onChange={e => handleAddressChange('shipping', 'state', e.target.value)} placeholder="California" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">ZIP/Postal Code *</label>
                          <input type="text" value={formState.shipping.zipCode} onChange={e => handleAddressChange('shipping', 'zipCode', e.target.value)} required placeholder="90210" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c]" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">Country *</label>
                          <input type="text" value={formState.shipping.country} onChange={e => handleAddressChange('shipping', 'country', e.target.value)} required placeholder="USA" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c]" />
                        </div>
                      </div>
                    </div>
                    {/* Same as shipping checkbox */}
                    <div className="mt-4 flex items-center">
                      <input type="checkbox" checked={sameAsShipping} onChange={e => handleSameAsShippingChange(e.target.checked)} id="sameAsShipping" className="mr-2" />
                      <label htmlFor="sameAsShipping" className="text-sm text-black">Billing address is the same as shipping address</label>
                    </div>
                    {/* Billing Address Fields */}
                    {!sameAsShipping && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-black mb-2 border-b border-gray-200 pb-1">Billing Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">Street Address *</label>
                            <input type="text" value={formState.billing.street} onChange={e => handleAddressChange('billing', 'street', e.target.value)} required placeholder="123 Main St" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">City *</label>
                            <input type="text" value={formState.billing.city} onChange={e => handleAddressChange('billing', 'city', e.target.value)} required placeholder="New York" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">State/Province</label>
                            <input type="text" value={formState.billing.state} onChange={e => handleAddressChange('billing', 'state', e.target.value)} placeholder="California" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">ZIP/Postal Code *</label>
                            <input type="text" value={formState.billing.zipCode} onChange={e => handleAddressChange('billing', 'zipCode', e.target.value)} required placeholder="90210" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c]" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">Country *</label>
                            <input type="text" value={formState.billing.country} onChange={e => handleAddressChange('billing', 'country', e.target.value)} required placeholder="USA" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-black mb-2">Special Instructions (Optional)</label>
                  <textarea
                    value={formState.notes}
                    onChange={e => setFormState(f => ({ ...f, notes: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[#8e191c] placeholder-[#8e191c]/50 focus:border-[#8e191c] focus:ring-2 focus:ring-[#8e191c]/20 transition-all duration-200"
                    placeholder="Leave at front door, etc..."
                    rows="3"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!isStep1Complete()}
                  className="mt-6 w-full py-3 px-6 bg-[#8e191c] text-white font-semibold rounded-lg hover:bg-[#8e191c]/90 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-white">Continue to Review</span>
                </button>
              </div>
            )}

            {/* Step 2: Review Order */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
                  <FaCheck className="mr-3 text-[#8e191c]" />
                  Review Your Order
                </h2>
                <div className="space-y-4 mb-6">
                  {/* Pickup location or addresses */}
                  {deliveryMethod === 'pickup' ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">Pickup Location</h3>
                      <p className="text-black">
                        {selectedStore?.name || selectedStore?.storeName || 'Selected Store'}<br />
                        {selectedStore?.location?.address ? (
                          <>
                            {selectedStore.location.address.street && (<>{selectedStore.location.address.street}, </>)}
                            {selectedStore.location.address.city && (<>{selectedStore.location.address.city}, </>)}
                            {selectedStore.location.address.state && (<>{selectedStore.location.address.state}, </>)}
                            {selectedStore.location.address.country && (<>{selectedStore.location.address.country}</>)}
                          </>
                        ) : (
                          'Address not available'
                        )}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-black mb-2">Shipping Address</h3>
                        <p className="text-black">
                          {formState.firstName} {formState.lastName}<br />
                          {formState.email}<br />
                          {formState.phone}<br />
                          {`${formState.shipping.street}, ${formState.shipping.city}, ${formState.shipping.state} ${formState.shipping.zipCode}, ${formState.shipping.country}`}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-black mb-2">Billing Address</h3>
                        {sameAsShipping ? (
                          <p className="text-black italic">Same as shipping address</p>
                        ) : (
                          <p className="text-black">
                            {formState.firstName} {formState.lastName}<br />
                            {formState.email}<br />
                            {formState.phone}<br />
                            {`${formState.billing.street}, ${formState.billing.city}, ${formState.billing.state} ${formState.billing.zipCode}, ${formState.billing.country}`}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  {formState.notes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">Special Instructions</h3>
                      <p className="text-black">{formState.notes}</p>
                    </div>
                  )}
                  <div className="bg-[#8e191c]/10 border border-[#8e191c]/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#8e191c] mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {orderSummary?.items.map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center">
                            <span className="text-[#8e191c] font-medium">{item.title}</span>
                            <span className="font-semibold text-[#8e191c]">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          <div className="ml-4 mt-1 text-sm text-black">
                            Quantity: {item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-[#8e191c]/30 mt-3 pt-3">
                      <div className="flex justify-between items-center text-[#8e191c] font-bold">
                        <span>Total: ${totals.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 px-6 bg-gray-200 text-black font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
                  >
                    Back to Shipping
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 py-3 px-6 bg-[#8e191c] text-white font-semibold rounded-lg hover:bg-[#8e191c]/90 transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="text-white">Proceed to Payment</span>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                {!isStripeReady ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-[#8e191c]/30 border-t-[#8e191c] rounded-full animate-spin"></div>
                      <p className="text-[#8e191c] font-medium">Initializing secure payment...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
                      <FaLock className="mr-3 text-[#8e191c]" />
                      Secure Payment
                    </h2>
                    <div className="mb-6">
                      <div className="flex items-center p-4 border-2 border-[#8e191c] bg-[#8e191c]/10 rounded-lg">
                        <MdContactless className="w-6 h-6 text-[#8e191c] mr-3" />
                        <span className="text-[#8e191c] font-medium">Credit/Debit Card - Secured by Stripe</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Card Information *
                        </label>
                        <StripeCardInput onChange={handleCardChange} />
                        {cardErrors && (
                          <p className="mt-2 text-sm text-red-600">{cardErrors}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm text-[#8e191c]">
                        <FaLock className="text-[#8e191c]" />
                        <span>Your payment information is encrypted and secure. We never store your card details.</span>
                      </div>
                    </div>
                    <div className="flex space-x-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="flex-1 py-3 px-6 bg-gray-200 text-black font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
                      >
                        Back to Review
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !cardComplete || cardErrors || !isStripeReady}
                        className="flex-1 py-3 px-6 bg-[#8e191c] text-white font-semibold rounded-lg hover:bg-[#8e191c]/90 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            <span className="text-white">Processing Payment...</span>
                          </>
                        ) : (
                          <>
                            <FaLock className="mr-2 text-white" />
                            <span className="text-white">Pay {totals.totalPrice.toFixed(2)}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-4">
              <h3 className="text-xl font-bold text-black mb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {orderSummary?.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <img 
                      src={item.imageUrl || item.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300"} 
                      alt={item.title}
                      className="w-12 h-12 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300";
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-black font-medium text-sm">{item.title}</p>
                      <p className="text-black text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-black font-semibold text-right">
                      {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-[#8e191c]/30 pt-4 space-y-2">
                <div className="flex justify-between text-black">
                  <span>Subtotal</span>
                  <span>${totals.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#8e191c]/30 pt-2">
                  <div className="flex justify-between text-black font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[#8e191c]">${totals.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security badges */}
              <div className="mt-6 pt-4 border-t border-[#8e191c]/30">
                <div className="flex items-center justify-center space-x-4 text-xs text-[#8e191c]">
                  <div className="flex items-center space-x-1">
                    <FaLock className="text-[#8e191c]" />
                    <span>SSL Secured</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MdSecurity className="text-[#8e191c]" />
                    <span>Stripe Protected</span>
                  </div>
                </div>
                
                {/* Payment method icons */}
                <div className="mt-4 flex items-center justify-center space-x-3">
                  {/* Visa */}
                  <div className="w-10 h-6 bg-white rounded border border-gray-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#8e191c]">VISA</span>
                  </div>
                  {/* Mastercard */}
                  <div className="w-10 h-6 bg-white rounded border border-gray-200 flex items-center justify-center">
                    <div className="flex">
                      <div className="w-2 h-2 bg-[#ef4444] rounded-full"></div>
                      <div className="w-2 h-2 bg-[#f97316] rounded-full -ml-1"></div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutPageContent />
    </Elements>
  );
};

export default CheckoutPage; 