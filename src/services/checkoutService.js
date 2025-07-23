import api from './api';

export const createPaymentIntent = async (amount, customerInfo) => {
  try {
    const res = await api.post('/payment/create-payment-intent', {
      amount,
      currency: 'aed', // Changed from 'eur' to 'aed' for UAE Dirham
      customerInfo,
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to create payment intent');
    }
    
    return res.data;
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

export const createOrderAfterPayment = async (paymentIntentId, orderData, customerInfo) => {
  try {
    const res = await api.post('/payment/create-order', {
      paymentIntentId,
      orderData, 
      customerInfo,
    });
    
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
    
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to create order'
    );
  }
};