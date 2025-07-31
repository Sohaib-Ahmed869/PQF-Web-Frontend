import api from './api';

export const createPaymentIntent = async (amount, customerInfo, isRecurring = false, recurringFrequency = null) => {
  try {
    const res = await api.post('/payment/create-payment-intent', {
      amount,
      currency: 'aed',
      customerInfo,
      isRecurring,
      recurringFrequency,
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to create payment intent');
    }
    
    // Return the response with all the new fields for subscription handling
    return {
      ...res.data,
      // For backward compatibility, ensure these fields exist
      clientSecret: res.data.clientSecret,
      paymentIntentId: res.data.paymentIntentId,
      setupIntentId: res.data.setupIntentId,
      requiresSetup: res.data.requiresSetup || false,
      stripeCustomerId: res.data.stripeCustomerId,
      subscriptionId: res.data.subscriptionId,
      paymentIntentStatus: res.data.paymentIntentStatus,
      subscriptionStatus: res.data.subscriptionStatus
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Handle authentication errors specifically
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to create payment intent'
    );
  }
};

// New function to activate subscription after setup intent confirmation
export const activateSubscription = async (subscriptionId, paymentMethodId, setupIntentId = null, customerInfo = null, amount = null, currency = null, recurringFrequency = null) => {
  try {
    const payload = {
      subscriptionId,
      paymentMethodId,
    };

    // Add additional data if provided (for setup intent flow)
    if (setupIntentId && customerInfo && amount && currency && recurringFrequency) {
      payload.setupIntentId = setupIntentId;
      payload.customerInfo = customerInfo;
      payload.amount = amount;
      payload.currency = currency;
      payload.recurringFrequency = recurringFrequency;
    }

    const res = await api.post('/payment/subscriptions/activate', payload);
    
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to activate subscription');
    }
    
    return res.data;
  } catch (error) {
    console.error('Error activating subscription:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to activate subscription'
    );
  }
};

export const createOrderAfterPayment = async (paymentIntentId, orderData, customerInfo) => {
  try {
    // Prepare the request payload
    const payload = {
      orderData, 
      customerInfo,
    };

    // Only include paymentIntentId if it exists (for card payments)
    if (paymentIntentId) {
      payload.paymentIntentId = paymentIntentId;
    }

    const res = await api.post('/payment/create-order', payload);
    
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to create order');
    }
    
    return res.data;
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Handle authentication errors specifically
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }

    // Handle payment-specific errors
    if (error.response?.data?.error === 'Payment not successful') {
      throw new Error('Payment verification failed. Please try again.');
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to create order'
    );
  }
};

// New function to create recurring orders
export const createRecurringOrder = async (orderData, customerInfo) => {
  try {
    const payload = {
      orderData: {
        ...orderData,
        orderType: 'recurring'
      },
      customerInfo,
    };

    const res = await api.post('/payment/create-order', payload);
    
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to create recurring order');
    }
    
    return res.data;
  } catch (error) {
    console.error('Error creating recurring order:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to create recurring order'
    );
  }
};

// Function to create subscription after order
export const createSubscription = async (subscriptionData) => {
  try {
    const res = await api.post('/payment/subscriptions/create', subscriptionData);
    
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to create subscription');
    }
    
    return res.data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to create subscription'
    );
  }
};

// Function to manage subscriptions
export const cancelSubscription = async (orderId) => {
  try {
    const res = await api.post('/payment/subscriptions/cancel', { orderId });
    
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to cancel subscription');
    }
    
    return res.data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to cancel subscription'
    );
  }
};

export const pauseSubscription = async (orderId) => {
  try {
    const res = await api.post('/payment/subscriptions/pause', { orderId });
    
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to pause subscription');
    }
    
    return res.data;
  } catch (error) {
    console.error('Error pausing subscription:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to pause subscription'
    );
  }
};

export const resumeSubscription = async (orderId) => {
  try {
    const res = await api.post('/payment/subscriptions/resume', { orderId });
    
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to resume subscription');
    }
    
    return res.data;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to resume subscription'
    );
  }
};

export const getUserSubscriptions = async () => {
  try {
    const res = await api.get('/payment/subscriptions');
    
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to get subscriptions');
    }
    
    return res.data;
  } catch (error) {
    console.error('Error getting user subscriptions:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to get subscriptions'
    );
  }
};