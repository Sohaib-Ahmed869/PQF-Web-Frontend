import React, { useState, useEffect } from "react";
import { FaCreditCard, FaLock, FaShoppingCart, FaCheck, FaCalendarAlt, FaSync } from "react-icons/fa";
import { MdContactless, MdSecurity } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { createPaymentIntent, createOrderAfterPayment, activateSubscription } from '../services/checkoutService';
import userService from '../services/userService';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

// Initialize Stripe - replace with your actual publishable key
const stripePromise = loadStripe("pk_test_51R4HwEP1U1i66wzc0CML1t20v7wPQrvuXPKrrXpnBJ0XVdIEDHuPazuL1ZPIVlQcbk4fSpCTrjla8nsMFog708Vl0031BNIGKo");

// Custom Dropdown Component (same as ProductList.jsx)
const CustomSelect = ({ value, onChange, options, placeholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  
  useEffect(() => {
    const selected = options.find(opt => opt.value === value);
    setSelectedLabel(selected ? selected.label : placeholder);
  }, [value, options, placeholder]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.relative')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 bg-white text-gray-800 font-medium focus:outline-none focus:ring-4 focus:ring-[#8e191c]/20 focus:border-[#8e191c] transition-all duration-300 shadow-sm text-left flex items-center justify-between"
      >
        <span>{selectedLabel}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="#8e191c" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-[#8e191c] hover:text-white transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                value === option.value ? 'bg-[#8e191c] text-white' : 'text-gray-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
  const { isAuthenticated, loading: authLoading } = useAuth();

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
  
  // Helper function to get current time slot
  const getCurrentTimeSlot = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 9 && hour < 12) return '9-12';
    if (hour >= 12 && hour < 15) return '12-3';
    if (hour >= 15 && hour < 18) return '3-6';
    if (hour >= 18 && hour < 21) return '6-9';
    return '9-12'; // Default to morning if outside business hours
  };
  
  // Helper function to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
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
  
  // Add delivery/pickup date and time state
  const [deliveryDate, setDeliveryDate] = useState(getCurrentDate());
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(getCurrentTimeSlot());
  const [pickupDate, setPickupDate] = useState(getCurrentDate());
  const [pickupTimeSlot, setPickupTimeSlot] = useState(getCurrentTimeSlot());
  
  const [sameAsShipping, setSameAsShipping] = useState(true);
  // Add state for payment method
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'cash', 'cheque', 'bank_transfer'

  // Add state for payment processing
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);

  // Add state for recurring orders
  const [orderFrequency, setOrderFrequency] = useState('one-time'); // 'one-time' or 'recurring'
  const [recurringOptions, setRecurringOptions] = useState({
    frequency: 'weekly', 
  });

  // No need to calculate end date since we're charging monthly on the same date

  // Helper function to normalize cart items for display
  const normalizeCartItems = (items) => {
    if (!items || !Array.isArray(items)) return [];
    
    return items.map(item => {
      // Handle nested product structure
      const product = item.product || {};
      
      // Check if this item has free quantity or is a free item
      const isFreeItem = item.isFreeItem || false;
      const freeQuantity = item.freeQuantity || 0;
      const regularQuantity = item.quantity - freeQuantity;
      
      const normalizedItem = {
        _id: item._id || product._id || product.id || `item-${Math.random()}`,
        title: item.title || item.name || product.ItemName || product.name || "Product",
        name: item.name || product.ItemName || product.name || "Product",
        price: item.price || product.price || product.PriceList?.[0]?.Price || 0,
        quantity: item.quantity || 1,
        image: item.image || item.imageUrl || product.image || product.ImageUrl || product.Picture || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300",
        imageUrl: item.imageUrl || item.image || product.image || product.ImageUrl || product.Picture || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300",
        product: product,
        // Handle free items
        isFreeItem: isFreeItem,
        freeQuantity: freeQuantity,
        regularQuantity: regularQuantity
      };
      
      // Ensure we have a valid image URL
      if (!normalizedItem.image || normalizedItem.image === 'null' || normalizedItem.image === 'undefined') {
        normalizedItem.image = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300";
      }
      
      return normalizedItem;
    });
  };

  // Get order summary from navigation state
  const orderSummary = location.state?.orderSummary || { items: cart.items, subtotal: cart.total };

  // Normalize orderSummary items with proper free item handling
  const normalizedItems = normalizeCartItems(orderSummary?.items || cart?.items || []);

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
    
    // Check basic required fields
    if (!requiredFields.every(field => formState[field].trim() !== '')) {
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formState.email)) {
      return false;
    }
    
    // Check delivery method specific requirements
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
    
    return true;
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

  const getRecurringDuration = () => {
    switch (recurringOptions.frequency) {
      case 'weekly':
        return 4; // 4 weeks
      case 'bi-weekly':
        return 4; // 4 bi-weekly periods
      case 'monthly':
        return 4; // 4 months
      case 'quarterly':
        return 4; // 4 quarters
      default:
        return 4;
    }
  };

  const calculateTotals = () => {
    if (!orderSummary) return {
      itemsPrice: 0,
      totalPrice: 0,
      totalDiscount: 0,
      originalTotal: 0
    };

    // Calculate base total from items (before any discounts)
    const itemsPrice = normalizedItems.reduce((total, item) => {
      const isFreeItem = item.isFreeItem || false;
      const freeQuantity = item.freeQuantity || 0;
      const regularQuantity = item.regularQuantity || (item.quantity - freeQuantity);
      
      // If item is entirely free
      if (isFreeItem && freeQuantity >= item.quantity) {
        return total; // Don't add anything to total
      } 
      // If item has some free quantities
      else if (freeQuantity > 0) {
        // Only charge for the non-free portion
        return total + (item.price * Math.max(0, regularQuantity));
      } 
      // If marked as free item but no specific free quantity
      else if (isFreeItem) {
        return total; // Don't charge for free items
      } 
      // Regular item, charge full price
      else {
        return total + (item.price * item.quantity);
      }
    }, 0);

    // Get discount information from cart or orderSummary
    const totalDiscount = cart.totalDiscount || orderSummary.totalDiscount || 0;
    const originalTotal = cart.originalTotal || orderSummary.originalTotal || itemsPrice;
    const finalTotal = cart.finalTotal || orderSummary.finalTotal || Math.max(0, originalTotal - totalDiscount);

    const result = {
      itemsPrice: originalTotal, // Use original total for display
      totalPrice: finalTotal, // Use final total after discounts
      totalDiscount: totalDiscount,
      originalTotal: originalTotal
    };

    // Debug: Log calculated totals
    console.log('💰 Calculated totals in checkout:', {
      result: result,
      cartData: {
        totalDiscount: cart.totalDiscount,
        originalTotal: cart.originalTotal,
        finalTotal: cart.finalTotal
      },
      orderSummaryData: {
        totalDiscount: orderSummary.totalDiscount,
        originalTotal: orderSummary.originalTotal,
        finalTotal: orderSummary.finalTotal
      }
    });

    return result;
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

    // Validate payment method specific requirements
    if (paymentMethod === 'card') {
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
      
      // Prepare customer information
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

      let paymentIntentId = null;
      let paymentConfirmed = false;
      let stripeCustomerId = null;
      let subscriptionId = null;
      let setupIntentId = null;
      let requiresSetup = false;

      // Handle card payment method
      if (paymentMethod === 'card') {
        setPaymentProcessing(true);
        try {
          // Create PaymentIntent or Subscription
          const totalAmount = totals.totalPrice;
          const response = await createPaymentIntent(
            Math.round(totalAmount * 100), 
            customerInfo,
            orderFrequency === 'recurring',
            orderFrequency === 'recurring' ? (recurringOptions.frequency === 'bi-weekly' ? 'biweekly' : recurringOptions.frequency) : null
          );
          
          let { 
            clientSecret, 
            paymentIntentId: intentId, 
            stripeCustomerId: customerId, 
            subscriptionId: subId, 
            paymentIntentStatus: initialPaymentIntentStatus,
            setupIntentId,
            requiresSetup: requiresSetupFlag,
            subscriptionStatus,
            success,
            message
          } = response;
          
          console.log('Payment intent response:', response);
          console.log('Extracted values:', { intentId, customerId, subId, setupIntentId, requiresSetupFlag });
          
          paymentIntentId = intentId;
          stripeCustomerId = customerId;
          subscriptionId = subId;
          requiresSetup = requiresSetupFlag;

          let paymentIntent;
          
          // Handle different subscription scenarios
          if (orderFrequency === 'recurring' && subscriptionStatus === 'active' && !clientSecret) {
            // Subscription is already active with existing payment method
            console.log('Subscription already active, no additional payment needed');
            paymentConfirmed = true;
            // Create a mock payment intent for consistent flow
            paymentIntent = { status: 'succeeded' };
            // For active subscriptions without payment intent, we'll pass null
            paymentIntentId = null;
          } else if (requiresSetup && clientSecret) {
            // Handle setup intent flow for subscriptions
            console.log('Handling setup intent for subscription', { requiresSetup, setupIntentId, subscriptionId });
            const cardElement = elements.getElement(CardElement);
            const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
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

            if (setupIntent.status === 'succeeded') {
              // Activate the subscription with the payment method
              // Pass additional data for setup intent flow
              const activationResponse = await activateSubscription(
                subscriptionId, 
                setupIntent.payment_method,
                setupIntentId,
                customerInfo,
                Math.round(totals.totalPrice * 100),
                'aed',
                orderFrequency === 'recurring' ? (recurringOptions.frequency === 'bi-weekly' ? 'biweekly' : recurringOptions.frequency) : null
              );
              console.log('Activation response:', activationResponse);
              if (activationResponse.success) {
                paymentConfirmed = true;
                // Update subscription ID if a new one was created
                if (activationResponse.subscriptionId) {
                  subscriptionId = activationResponse.subscriptionId;
                  console.log('Updated subscription ID after activation:', subscriptionId);
                }
                console.log('Subscription activated successfully');
                
                // Wait for webhook to process
                await new Promise(resolve => setTimeout(resolve, 2000));
              } else {
                throw new Error('Failed to activate subscription: ' + activationResponse.message);
              }
            } else {
              throw new Error('Setup intent was not successful. Please try again.');
            }
          } else if (clientSecret) {
            // Regular payment intent flow
            console.log('Handling regular payment intent flow', { paymentIntentId, subscriptionId });
            const cardElement = elements.getElement(CardElement);
            const { error: stripeError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(clientSecret, {
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
            paymentIntent = confirmedPaymentIntent;
            
            if (paymentIntent.status === 'succeeded') {
              paymentConfirmed = true;
            } else if (paymentIntent.status === 'processing') {
              paymentConfirmed = true;
            } else {
              throw new Error('Payment was not successful. Please try again.');
            }
          }



        } catch (paymentError) {
          console.error('Payment processing error:', paymentError);
          
          // Provide more specific error messages
          let errorMessage = paymentError.message;
          if (paymentError.message.includes('setup intent')) {
            errorMessage = 'Payment method setup failed. Please check your card details and try again.';
          } else if (paymentError.message.includes('subscription')) {
            errorMessage = 'Subscription activation failed. Please try again or contact support.';
          }
          
          throw new Error(`Payment failed: ${errorMessage}`);
        } finally {
          setPaymentProcessing(false);
        }
      }

      // 3. Create order in backend
      setOrderProcessing(true);
      
      // Debug: Log the values being used for order data
      console.log('Order data preparation - Debug values:', {
        orderFrequency,
        paymentMethod,
        stripeCustomerId,
        subscriptionId,
        setupIntentId,
        requiresSetup,
        paymentConfirmed
      });
      
      const orderData = {
        orderItems: normalizedItems.map(item => {
          const isFreeItem = item.isFreeItem || false;
          const freeQuantity = item.freeQuantity || 0;
          const regularQuantity = item.quantity - freeQuantity;
          const totalPrice = isFreeItem && freeQuantity > 0 
            ? (regularQuantity > 0 ? item.price * regularQuantity : 0)
            : item.price * item.quantity;
          
          const orderItem = {
            name: item.title || item.name,
            price: item.price,
            quantity: item.quantity,
            product: item._id || item.product?._id || item.product?.id,
            image: item.image || item.imageUrl || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300",
            isFreeItem: isFreeItem,
            freeQuantity: freeQuantity,
            regularQuantity: regularQuantity,
            totalPrice: totalPrice
          };
          
          // Debug: Log free items being sent
          if (isFreeItem || freeQuantity > 0) {
            console.log('🆓 Frontend sending free item:', {
              name: orderItem.name,
              isFreeItem: orderItem.isFreeItem,
              freeQuantity: orderItem.freeQuantity,
              regularQuantity: orderItem.regularQuantity,
              totalPrice: orderItem.totalPrice
            });
          }
          
          return orderItem;
        }),
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
        paymentMethod: paymentMethod,
        itemsPrice: totals.itemsPrice,
        originalTotal: totals.originalTotal,
        totalDiscount: totals.totalDiscount,
        finalTotal: totals.totalPrice,
        totalPrice: totals.totalPrice,
        appliedPromotions: cart.appliedPromotions || orderSummary.appliedPromotions || [],
        appliedDiscounts: cart.appliedDiscounts || orderSummary.appliedDiscounts || [], 
        notes: formState.notes,
        store: selectedStore?._id || selectedStore?.id || undefined,
        orderType: orderFrequency, // Use the selected order frequency
        recurringFrequency: orderFrequency === 'recurring' ? (recurringOptions.frequency === 'bi-weekly' ? 'biweekly' : recurringOptions.frequency) : undefined,
        recurringOptions: orderFrequency === 'recurring' ? {
          frequency: recurringOptions.frequency === 'bi-weekly' ? 'biweekly' : recurringOptions.frequency,
          startDate: new Date().toISOString().split('T')[0],
          singleOrderPrice: totals.totalPrice
        } : undefined,
        stripeCustomerId: orderFrequency === 'recurring' && paymentMethod === 'card' ? stripeCustomerId : undefined,
        stripeSubscriptionId: orderFrequency === 'recurring' && paymentMethod === 'card' ? (subscriptionId || null) : undefined,
        setupIntentId: orderFrequency === 'recurring' && paymentMethod === 'card' ? (setupIntentId || null) : undefined,
        stripePaymentMethodId: orderFrequency === 'recurring' && paymentMethod === 'card' ? (paymentConfirmed && setupIntentId ? 'payment_method_confirmed' : null) : undefined,
        requiresSetup: orderFrequency === 'recurring' && paymentMethod === 'card' ? requiresSetup : undefined,
        // Add delivery/pickup date and time
        deliveryTimeSlot: deliveryMethod === 'delivery' ? deliveryTimeSlot : undefined,
        deliveryDate: deliveryMethod === 'delivery' ? deliveryDate : undefined,
        pickupTimeSlot: deliveryMethod === 'pickup' ? pickupTimeSlot : undefined,
        pickupDate: deliveryMethod === 'pickup' ? pickupDate : undefined,
      };

      // Debug: Log the final order data being sent
      console.log('Final order data being sent:', {
        orderType: orderData.orderType,
        paymentMethod: orderData.paymentMethod,
        stripeCustomerId: orderData.stripeCustomerId,
        stripeSubscriptionId: orderData.stripeSubscriptionId,
        setupIntentId: orderData.setupIntentId,
        requiresSetup: orderData.requiresSetup
      });

      // Validate that we have the required data for recurring card payments
      if (orderFrequency === 'recurring' && paymentMethod === 'card') {
        if (!orderData.stripeSubscriptionId && !orderData.setupIntentId) {
          console.error('Missing required data for recurring order:', {
            subscriptionId,
            setupIntentId,
            stripeCustomerId
          });
          throw new Error('Payment setup incomplete. Please try again.');
        }
      }

      // Try to create order with retry mechanism
      let orderRes;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          // Pass paymentIntentId only if it exists
          // For active subscriptions, paymentIntentId might be null
          orderRes = await createOrderAfterPayment(paymentIntentId, orderData, customerInfo);
          
          if (orderRes.success) {
            break; // Success, exit retry loop
          } else if (orderRes.error === 'Payment not successful' && retryCount < maxRetries - 1) {
            // Payment might still be processing, wait and retry
            console.log(`Payment still processing, retrying in ${(retryCount + 1) * 2} seconds...`);
            await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
            retryCount++;
            continue;
          } else {
            throw new Error(orderRes.message || 'Order failed to save.');
          }
        } catch (error) {
          if (error.response?.data?.error === 'Payment not successful' && retryCount < maxRetries - 1) {
            // Payment might still be processing, wait and retry
            console.log(`Payment still processing, retrying in ${(retryCount + 1) * 2} seconds...`);
            await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
            retryCount++;
            continue;
          } else {
            throw error;
          }
        }
      }

      if (orderRes.success) {
        // Clear cart on successful order
        clearCart();
        setSuccess(true);
        setCurrentStep(4);
        
        // Show success message based on payment method and order type
        let successMessage = 'Order placed successfully!';
        const orderTypeText = orderFrequency === 'recurring' ? 'Recurring order' : 'Order';
        
        if (paymentMethod === 'card') {
          successMessage = `${orderTypeText} placed successfully! Payment confirmed.`;
        } else if (paymentMethod === 'cash') {
          successMessage = `${orderTypeText} placed successfully! Please prepare cash payment upon delivery/pickup.`;
        } else if (paymentMethod === 'cheque') {
          successMessage = `${orderTypeText} placed successfully! Please have your cheque ready upon delivery/pickup.`;
        } else if (paymentMethod === 'bank_transfer') {
          successMessage = `${orderTypeText} placed successfully! Please complete the bank transfer and email your receipt.`;
        }
        
        if (orderFrequency === 'recurring') {
          successMessage += ` Your recurring orders have been set up. You will be charged every ${recurringOptions.frequency.replace('-', ' ')} on the same date.`;
        }
        
        toast.success(successMessage, {
          position: "bottom-right",
          autoClose: 5000,
        });

        // Navigate to order confirmation
        const token = localStorage.getItem('token');
        const stateObj = {
          orderId: orderRes.orderId,
          orderNumber: orderRes.orderNumber,
          trackingNumber: orderRes.trackingNumber,
          items: orderSummary.items,
          total: totals.totalPrice, // Charge per order for recurring orders
          paymentMethod: paymentMethod,
          paymentStatus: orderRes.paymentStatus,
          deliveryMethod: deliveryMethod,
          estimatedDelivery: orderRes.estimatedDelivery,
          orderFrequency: orderFrequency,
          recurringOptions: orderFrequency === 'recurring' ? recurringOptions : undefined,
          // Add delivery/pickup date and time
          deliveryTimeSlot: deliveryMethod === 'delivery' ? deliveryTimeSlot : undefined,
          deliveryDate: deliveryMethod === 'delivery' ? deliveryDate : undefined,
          pickupTimeSlot: deliveryMethod === 'pickup' ? pickupTimeSlot : undefined,
          pickupDate: deliveryMethod === 'pickup' ? pickupDate : undefined,
          // Enhanced order data with promotion information
          orderData: {
            originalTotal: totals.originalTotal,
            finalTotal: totals.totalPrice,
            totalDiscount: totals.totalDiscount,
            appliedPromotions: cart.appliedPromotions || orderSummary.appliedPromotions || [],
            appliedDiscounts: cart.appliedDiscounts || orderSummary.appliedDiscounts || []
          }
        };
        
        if (!token) {
          stateObj.email = formState.email;
        }
        
        navigate('/order-confirmation', { state: stateObj });
      } else {
        throw new Error(orderRes.message || 'Order failed to save.');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message.includes('Payment failed')) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
      setOrderProcessing(false);
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('💳 Checkout page loaded with data:', {
      locationState: location.state,
      orderSummary: orderSummary,
      cart: cart,
      normalizedItems: normalizedItems
    });
    console.log('CheckoutPage - orderSummary:', orderSummary);
    console.log('CheckoutPage - normalizedItems:', normalizedItems);
    console.log('CheckoutPage - cart:', cart);
    
    // Debug free items specifically
    if (normalizedItems.length > 0) {
      normalizedItems.forEach((item, index) => {
        const isFreeItem = item.isFreeItem || false;
        const freeQuantity = item.freeQuantity || 0;
        const regularQuantity = item.regularQuantity || (item.quantity - freeQuantity);
        
        // Calculate the total price for this item considering free quantities
        let itemTotalPrice;
        if (isFreeItem && freeQuantity >= item.quantity) {
          // Entire item is free
          itemTotalPrice = 0;
        } else if (freeQuantity > 0) {
          // Some quantities are free, charge only for non-free quantities
          itemTotalPrice = item.price * Math.max(0, regularQuantity);
        } else if (isFreeItem) {
          // Item is marked as free but no specific free quantity
          itemTotalPrice = 0;
        } else {
          // Regular item, charge full price
          itemTotalPrice = item.price * item.quantity;
        }
        
        console.log(`Item ${index}:`, {
          name: item.title || item.name,
          isFreeItem: item.isFreeItem,
          freeQuantity: item.freeQuantity,
          quantity: item.quantity,
          price: item.price,
          totalPrice: itemTotalPrice
        });
      });
    }
  }, [orderSummary, normalizedItems, cart]);

  if (authLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">image.png
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#8e191c]/30 border-t-[#8e191c] rounded-full animate-spin"></div>
          <p className="text-[#8e191c] font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-xl shadow text-center">
        <div className="mb-4 text-red-600 font-bold text-lg">
          You must be logged in to place an order.
        </div>
        <button
          onClick={() => navigate('/login')}
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

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

  // Helper function to get button text based on payment method and state
  const getButtonText = () => {
    if (isSubmitting || paymentProcessing || orderProcessing) {
      if (paymentProcessing) return 'Processing Payment...';
      if (orderProcessing) return 'Creating Order...';
      return 'Processing...';
    }
    
    const totalAmount = totals.totalPrice; // Charge per order for recurring orders
    const amount = `AED ${totalAmount.toFixed(2)}`;
    
    switch (paymentMethod) {
      case 'card':
        return `Pay ${amount}`;
      case 'cash':
        return `Place Order (Cash) ${amount}`;
      case 'cheque':
        return `Place Order (Cheque) ${amount}`;
      case 'bank_transfer':
        return `Place Order (Bank Transfer) ${amount}`;
      default:
        return `Place Order ${amount}`;
    }
  };

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
                  Checkout Information
                </h2>

                {/* Order Type Section - First */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                    <FaSync className="mr-3 text-[#8e191c]" />
                    Order Type
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex gap-4 mb-6">
                      <button
                        type="button"
                        className={`flex-1 py-4 px-6 rounded-xl border-2 font-bold transition-all duration-300 transform hover:scale-105 ${
                          orderFrequency === 'one-time' 
                            ? 'bg-[#8e191c] text-white border-[#8e191c] shadow-lg' 
                            : 'bg-white text-[#8e191c] border-gray-300 hover:border-[#8e191c] hover:shadow-md'
                        }`}
                        onClick={() => setOrderFrequency('one-time')}
                      >
                        One-Time Order
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-4 px-6 rounded-xl border-2 font-bold transition-all duration-300 transform hover:scale-105 ${
                          orderFrequency === 'recurring' 
                            ? 'bg-[#8e191c] text-white border-[#8e191c] shadow-lg' 
                            : 'bg-white text-[#8e191c] border-gray-300 hover:border-[#8e191c] hover:shadow-md'
                        }`}
                        onClick={() => setOrderFrequency('recurring')}
                      >
                        Recurring Order
                      </button>
                    </div>

                    {orderFrequency === 'recurring' && (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-black mb-3">Select Frequency</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              className={`py-2 px-3 rounded-lg border-2 font-semibold transition-all duration-300 text-xs transform hover:scale-105 ${
                                recurringOptions.frequency === 'weekly'
                                  ? 'bg-red-100 text-[#8e191c] border-red-300 shadow-lg'
                                  : 'bg-white text-[#8e191c] border-gray-300 hover:border-red-300 hover:shadow-md'
                              }`}
                              onClick={() => setRecurringOptions(prev => ({ ...prev, frequency: 'weekly' }))}
                            >
                              Weekly
                            </button>
                            <button
                              type="button"
                              className={`py-2 px-3 rounded-lg border-2 font-semibold transition-all duration-300 text-xs transform hover:scale-105 ${
                                recurringOptions.frequency === 'bi-weekly'
                                  ? 'bg-red-100 text-[#8e191c] border-red-300 shadow-lg'
                                  : 'bg-white text-[#8e191c] border-gray-300 hover:border-red-300 hover:shadow-md'
                              }`}
                              onClick={() => setRecurringOptions(prev => ({ ...prev, frequency: 'bi-weekly' }))}
                            >
                              Bi-Weekly
                            </button>
                            <button
                              type="button"
                              className={`py-2 px-3 rounded-lg border-2 font-semibold transition-all duration-300 text-xs transform hover:scale-105 ${
                                recurringOptions.frequency === 'monthly'
                                  ? 'bg-red-100 text-[#8e191c] border-red-300 shadow-lg'
                                  : 'bg-white text-[#8e191c] border-gray-300 hover:border-red-300 hover:shadow-md'
                              }`}
                              onClick={() => setRecurringOptions(prev => ({ ...prev, frequency: 'monthly' }))}
                            >
                              Monthly
                            </button>
                            <button
                              type="button"
                              className={`py-2 px-3 rounded-lg border-2 font-semibold transition-all duration-300 text-xs transform hover:scale-105 ${
                                recurringOptions.frequency === 'quarterly'
                                  ? 'bg-red-100 text-[#8e191c] border-red-300 shadow-lg'
                                  : 'bg-white text-[#8e191c] border-gray-300 hover:border-red-300 hover:shadow-md'
                              }`}
                              onClick={() => setRecurringOptions(prev => ({ ...prev, frequency: 'quarterly' }))}
                            >
                              Quarterly
                            </button>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-[#8e191c]/10 to-[#8e191c]/5 border-2 border-[#8e191c]/20 rounded-xl p-4">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-[#8e191c] rounded-full mr-3"></div>
                            <div className="text-sm text-[#8e191c] font-medium">
                              Your orders will be automatically charged every {recurringOptions.frequency.replace('-', ' ')} on the same date.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information Section - Second */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                    <FaShoppingCart className="mr-3 text-[#8e191c]" />
                    Contact Information
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-black mb-3">Email *</label>
                        <input
                          type="email"
                          value={formState.email}
                          onChange={e => setFormState(f => ({ ...f, email: e.target.value }))}
                          required
                          className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-[#8e191c] placeholder-[#8e191c]/50 focus:border-[#8e191c] focus:ring-4 focus:ring-[#8e191c]/20 transition-all duration-300 shadow-sm"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-black mb-3">Phone *</label>
                        <input
                          type="tel"
                          value={formState.phone}
                          onChange={e => setFormState(f => ({ ...f, phone: e.target.value }))}
                          required
                          className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-[#8e191c] placeholder-[#8e191c]/50 focus:border-[#8e191c] focus:ring-4 focus:ring-[#8e191c]/20 transition-all duration-300 shadow-sm"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-black mb-3">First Name *</label>
                        <input
                          type="text"
                          value={formState.firstName}
                          onChange={e => setFormState(f => ({ ...f, firstName: e.target.value }))}
                          required
                          className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-[#8e191c] placeholder-[#8e191c]/50 focus:border-[#8e191c] focus:ring-4 focus:ring-[#8e191c]/20 transition-all duration-300 shadow-sm"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-black mb-3">Last Name *</label>
                        <input
                          type="text"
                          value={formState.lastName}
                          onChange={e => setFormState(f => ({ ...f, lastName: e.target.value }))}
                          required
                          className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-[#8e191c] placeholder-[#8e191c]/50 focus:border-[#8e191c] focus:ring-4 focus:ring-[#8e191c]/20 transition-all duration-300 shadow-sm"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address Fields */}
                {deliveryMethod === 'delivery' && (
                  <>
                    <div className="mb-6">
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
                    <div className="mb-4 flex items-center">
                      <input type="checkbox" checked={sameAsShipping} onChange={e => handleSameAsShippingChange(e.target.checked)} id="sameAsShipping" className="mr-2" />
                      <label htmlFor="sameAsShipping" className="text-sm text-black">Billing address is the same as shipping address</label>
                    </div>
                    {/* Billing Address Fields */}
                    {!sameAsShipping && (
                      <div className="mb-6">
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

                {/* Special Instructions */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                    <FaShoppingCart className="mr-3 text-[#8e191c]" />
                    Special Instructions
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm border border-gray-200">
                    <textarea
                      value={formState.notes}
                      onChange={e => setFormState(f => ({ ...f, notes: e.target.value }))}
                      className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-[#8e191c] placeholder-[#8e191c]/50 focus:border-[#8e191c] focus:ring-4 focus:ring-[#8e191c]/20 transition-all duration-300 shadow-sm resize-none"
                      placeholder="Leave at front door, delivery instructions, or any special requests..."
                      rows="4"
                    />
                  </div>
                </div>

                {/* Delivery/Pickup Date and Time Selection */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                    <FaCalendarAlt className="mr-3 text-[#8e191c]" />
                    {deliveryMethod === 'delivery' ? 'Delivery Date & Time' : 'Pickup Date & Time'}
                  </h3>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Date Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-black mb-3">
                          {deliveryMethod === 'delivery' ? 'Delivery Date' : 'Pickup Date'} *
                        </label>
                        <input
                          type="date"
                          value={deliveryMethod === 'delivery' ? deliveryDate : pickupDate}
                          onChange={e => {
                            if (deliveryMethod === 'delivery') {
                              setDeliveryDate(e.target.value);
                            } else {
                              setPickupDate(e.target.value);
                            }
                          }}
                          min={getCurrentDate()}
                          required
                          className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-[#8e191c] placeholder-[#8e191c]/50 focus:border-[#8e191c] focus:ring-4 focus:ring-[#8e191c]/20 transition-all duration-300 shadow-sm"
                        />
                      </div>
                      
                      {/* Time Slot Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-black mb-3">
                          {deliveryMethod === 'delivery' ? 'Delivery Time' : 'Pickup Time'} *
                        </label>
                        <CustomSelect
                          value={deliveryMethod === 'delivery' ? deliveryTimeSlot : pickupTimeSlot}
                          onChange={(value) => {
                            if (deliveryMethod === 'delivery') {
                              setDeliveryTimeSlot(value);
                            } else {
                              setPickupTimeSlot(value);
                            }
                          }}
                          options={[
                            { value: '9-12', label: '9:00 AM - 12:00 PM' },
                            { value: '12-3', label: '12:00 PM - 3:00 PM' },
                            { value: '3-6', label: '3:00 PM - 6:00 PM' },
                            { value: '6-9', label: '6:00 PM - 9:00 PM' }
                          ]}
                          placeholder="Select Time"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
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
                  
                  {/* Delivery/Pickup Date and Time */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-black mb-2">
                      {deliveryMethod === 'delivery' ? 'Delivery Date & Time' : 'Pickup Date & Time'}
                    </h3>
                    <p className="text-black">
                      {deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} on{' '}
                      {new Date(deliveryMethod === 'delivery' ? deliveryDate : pickupDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })} during{' '}
                      {(() => {
                        const timeSlots = {
                          '9-12': '9:00 AM - 12:00 PM',
                          '12-3': '12:00 PM - 3:00 PM',
                          '3-6': '3:00 PM - 6:00 PM',
                          '6-9': '6:00 PM - 9:00 PM'
                        };
                        return timeSlots[deliveryMethod === 'delivery' ? deliveryTimeSlot : pickupTimeSlot];
                      })()}
                    </p>
                  </div>
                  {formState.notes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">Special Instructions</h3>
                      <p className="text-black">{formState.notes}</p>
                    </div>
                  )}
                  
                  {/* Order Frequency Information */}
                  <div className="bg-[#8e191c]/10 border border-[#8e191c]/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#8e191c] mb-2 flex items-center">
                      <FaSync className="mr-2" />
                      Order Type
                    </h3>
                    <div className="space-y-2">
                                              <div className="flex justify-between items-center">
                          <span className="text-[#8e191c] font-medium">Order Type:</span>
                          <span className="font-semibold text-[#8e191c] capitalize">
                            {orderFrequency === 'one-time' ? 'One-Time Order' : 'Recurring Order'}
                          </span>
                        </div>
                        {orderFrequency === 'recurring' && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-[#8e191c] font-medium">Frequency:</span>
                            <span className="font-semibold text-[#8e191c] capitalize">
                              {recurringOptions.frequency.replace('-', ' ')}
                            </span>
                          </div>
                          <div className="mt-2 p-2 bg-[#8e191c]/5 rounded border border-[#8e191c]/20">
                            <p className="text-xs text-[#8e191c]/80">
                              Your orders will be automatically charged every {recurringOptions.frequency.replace('-', ' ')} on the same date.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-[#8e191c]/10 border border-[#8e191c]/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#8e191c] mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {normalizedItems.map((item, index) => {
                        const isFreeItem = item.isFreeItem || false;
                        const freeQuantity = item.freeQuantity || 0;
                        const regularQuantity = item.regularQuantity || (item.quantity - freeQuantity);
                        
                        // Calculate the total price for this item considering free quantities
                        let itemTotalPrice;
                        if (isFreeItem && freeQuantity >= item.quantity) {
                          // Entire item is free
                          itemTotalPrice = 0;
                        } else if (freeQuantity > 0) {
                          // Some quantities are free, charge only for non-free quantities
                          itemTotalPrice = item.price * Math.max(0, regularQuantity);
                        } else if (isFreeItem) {
                          // Item is marked as free but no specific free quantity
                          itemTotalPrice = 0;
                        } else {
                          // Regular item, charge full price
                          itemTotalPrice = item.price * item.quantity;
                        }
                        
                        return (
                          <div key={index}>
                            <div className="flex justify-between items-center">
                              <span className="text-[#8e191c] font-medium">
                                {item.title || item.name || "Product"}
                                {(isFreeItem || freeQuantity > 0) && (
                                  <span className="text-green-600 text-sm ml-2">
                                    ({freeQuantity > 0 ? `${freeQuantity} FREE` : ''})
                                  </span>
                                )}
                              </span>
                              <span className="font-semibold text-[#8e191c]">
                                {itemTotalPrice === 0 ? 'FREE' : `AED ${itemTotalPrice.toFixed(2)}`}
                              </span>
                            </div>
                            <div className="ml-4 mt-1 text-sm text-black">
                              Quantity: {item.quantity}
                              {freeQuantity > 0 && regularQuantity > 0 && (
                                <span className="text-green-600 ml-2">
                                  ({regularQuantity} paid + {freeQuantity} free)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-[#8e191c]/30 mt-3 pt-3">
                      <div className="flex justify-between items-center text-[#8e191c] font-bold">
                        <span>Total: AED {totals.totalPrice.toFixed(2)}</span>
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
                {/* Payment Method Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">Select Payment Method</label>
                  <div className="flex gap-4 flex-wrap">
                    <button
                      type="button"
                      className={`flex-1 py-2 rounded-lg border font-semibold transition-all duration-200 ${paymentMethod === 'card' ? 'bg-[#8e191c] text-white border-[#8e191c]' : 'bg-white text-[#8e191c] border-gray-300'}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      Pay by Card
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 rounded-lg border font-semibold transition-all duration-200 ${paymentMethod === 'cash' ? 'bg-[#8e191c] text-white border-[#8e191c]' : 'bg-white text-[#8e191c] border-gray-300'}`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      Pay by Cash
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 rounded-lg border font-semibold transition-all duration-200 ${paymentMethod === 'cheque' ? 'bg-[#8e191c] text-white border-[#8e191c]' : 'bg-white text-[#8e191c] border-gray-300'}`}
                      onClick={() => setPaymentMethod('cheque')}
                    >
                      Pay by Cheque
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 rounded-lg border font-semibold transition-all duration-200 ${paymentMethod === 'bank_transfer' ? 'bg-[#8e191c] text-white border-[#8e191c]' : 'bg-white text-[#8e191c] border-gray-300'}`}
                      onClick={() => setPaymentMethod('bank_transfer')}
                    >
                      Pay by Bank Transfer
                    </button>
                  </div>
                </div>
                {/* Payment Forms */}
                {paymentMethod === 'card' ? (
                  !isStripeReady ? (
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
                    </>
                  )
                ) : paymentMethod === 'cash' ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-green-800 text-center">
                    <h2 className="text-xl font-bold mb-2">Pay by Cash</h2>
                    <p className="mb-4">You will pay in cash upon delivery or pickup. Please prepare the exact amount if possible.</p>
                  </div>
                ) : paymentMethod === 'cheque' ? (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-center">
                    <h2 className="text-xl font-bold mb-2">Pay by Cheque</h2>
                    <p className="mb-4">You will pay by cheque upon delivery or pickup. Please have your cheque ready.</p>
                  </div>
                ) : paymentMethod === 'bank_transfer' ? (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-center">
                    <h2 className="text-xl font-bold mb-2">Pay by Bank Transfer</h2>
                    <p className="mb-4">Please transfer the total amount to the following bank account and upload your payment receipt after placing the order:</p>
                    <div className="bg-white border border-yellow-300 rounded-lg p-4 mb-4 text-left max-w-md mx-auto">
                      <div><strong>Bank Name:</strong> Emirates NBD</div>
                      <div><strong>Account Name:</strong> Premier Quality Foods</div>
                      <div><strong>Account Number:</strong> 1234567890</div>
                      <div><strong>IBAN:</strong> AE12 3456 7890 1234 5678 90</div>
                      <div><strong>SWIFT/BIC:</strong> EBILAEAD</div>
                    </div>
                    <div className="text-sm text-yellow-700">After payment, please email your receipt to <a href="mailto:orders@premiumqualityfoods.ae" className="underline">orders@premiumqualityfoods.ae</a> with your order number.</div>
                  </div>
                ) : null}
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
                    disabled={isSubmitting || (paymentMethod === 'card' && (!cardComplete || cardErrors || !isStripeReady)) || paymentProcessing || orderProcessing}
                    className="flex-1 py-3 px-6 bg-[#8e191c] text-white font-semibold rounded-lg hover:bg-[#8e191c]/90 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting || paymentProcessing || orderProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-white">{getButtonText()}</span>
                      </>
                    ) : (
                      <>
                        <FaLock className="mr-2 text-white" />
                        <span className="text-white">{getButtonText()}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-4">
              <h3 className="text-xl font-bold text-black mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                {normalizedItems.map((item, index) => {
                  const isFreeItem = item.isFreeItem || false;
                  const freeQuantity = item.freeQuantity || 0;
                  const regularQuantity = item.regularQuantity || (item.quantity - freeQuantity);
                  
                  // Calculate the total price for this item considering free quantities
                  let itemTotalPrice;
                  if (isFreeItem && freeQuantity >= item.quantity) {
                    // Entire item is free
                    itemTotalPrice = 0;
                  } else if (freeQuantity > 0) {
                    // Some quantities are free, charge only for non-free quantities
                    itemTotalPrice = item.price * Math.max(0, regularQuantity);
                  } else if (isFreeItem) {
                    // Item is marked as free but no specific free quantity
                    itemTotalPrice = 0;
                  } else {
                    // Regular item, charge full price
                    itemTotalPrice = item.price * item.quantity;
                  }
                  
                  return (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <img 
                        src={item.image || item.imageUrl || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300"} 
                        alt={item.title || item.name || "Product"}
                        className="w-14 h-14 object-cover rounded-lg shadow-sm"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300";
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-black font-semibold text-sm leading-tight">
                          {item.title || item.name || "Product"}
                          
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600 text-sm">
                              Qty: {item.quantity}
                            </span>
                            {freeQuantity > 0 && (
                              <span className="text-green-600 text-sm font-medium">
                                ({freeQuantity} FREE)
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            {(isFreeItem && freeQuantity >= item.quantity) ? (
                              // Entire item is free
                              <span className="text-lg font-bold text-green-600">
                                FREE
                              </span>
                            ) : freeQuantity > 0 && regularQuantity > 0 ? (
                              // Mixed: some free, some paid
                              <div className="flex flex-col items-end">
                                <span className="text-lg font-bold text-gray-800">
                                  AED {itemTotalPrice.toFixed(2)}
                                </span>
                                <span className="text-sm text-green-600 font-medium">
                                  + {freeQuantity} FREE
                                </span>
                              </div>
                            ) : freeQuantity > 0 && regularQuantity === 0 ? (
                              // All quantities are free
                              <span className="text-lg font-bold text-green-600">
                                FREE
                              </span>
                            ) : (
                              // Regular item with no free quantities
                              <span className="text-lg font-bold text-gray-800">
                                AED {itemTotalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">Subtotal</span>
                  <span className="text-black font-bold text-lg">AED {totals.originalTotal.toFixed(2)}</span>
                </div>
                
                {/* Show discount if any */}
                {totals.totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-semibold">Discount</span>
                    <span className="font-bold text-lg">-AED {totals.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Recurring Order Summary */}
                {orderFrequency === 'recurring' && (
                  <div className="bg-gradient-to-br from-[#8e191c]/15 to-[#8e191c]/5 border-2 border-[#8e191c]/20 rounded-xl p-4 mt-4 shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-3 h-3 bg-[#8e191c] rounded-full mr-3"></div>
                      <span className="text-[#8e191c] font-bold text-base">Recurring Order</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8e191c]/80 text-sm">Billing Cycle:</span>
                        <span className="text-[#8e191c] font-bold text-base capitalize">
                          {recurringOptions.frequency.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8e191c]/80 text-sm">Per Order:</span>
                        <span className="text-[#8e191c] font-bold text-lg">
                          AED {totals.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="border-t-2 border-[#8e191c]/20 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-black font-bold text-xl">Total</span>
                    <span className="text-[#8e191c] font-bold text-2xl">
                      AED {totals.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  {orderFrequency === 'recurring' && (
                    <div className="mt-2 p-3 bg-[#8e191c]/5 border border-[#8e191c]/20 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-[#8e191c]/60 rounded-full mr-2"></div>
                        <span className="text-xs text-[#8e191c]/80 font-medium">
                          You will be charged AED {totals.totalPrice.toFixed(2)} every {recurringOptions.frequency.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  )}
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