import api from './api';

export const createPaymentIntent = async (amount, customerInfo) => {
  const res = await api.post('/payment/create-payment-intent', {
    amount,
    currency: 'eur',
    customerInfo,
  });
  return res.data;
};

export const createOrderAfterPayment = async (paymentIntentId, orderData, customerInfo) => {
  const res = await api.post('/payment/create-order', {
    paymentIntentId,
    orderData, 
    customerInfo,
  });
  return res.data;
}; 