import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const items = location.state?.items || [];
  const total = location.state?.total;
  const email = location.state?.email || '';

  const handleViewOrders = () => {
    navigate('/user/orders');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#8e191c]/5 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-100">
        <FaCheckCircle className="mx-auto text-green-500 w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold text-[#8e191c] mb-2">Order Confirmed!</h1>
        <p className="text-lg text-gray-700 mb-4">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        {orderId && (
          <p className="text-gray-500 mb-4">Order ID: <span className="font-semibold">{orderId}</span></p>
        )}
        {/* Ordered Items */}
        {items.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
            <h3 className="text-lg font-semibold text-[#8e191c] mb-2">Ordered Items</h3>
            <ul className="divide-y divide-gray-200">
              {items.map((item, idx) => (
                <li key={idx} className="py-2 flex justify-between items-center">
                  <span className="text-sm text-gray-800">{item.title} <span className="text-xs text-gray-500">x{item.quantity}</span></span>
                  <span className="text-sm font-semibold text-[#8e191c]">{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-[#8e191c]">{total ? `د.إ${total.toFixed(2)}` : ''}</span>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3 mt-6">
          <button
            className="w-full py-3 bg-[#8e191c] text-white font-semibold rounded-lg hover:bg-[#8e191c]/90 transition-all duration-200"
            onClick={handleViewOrders}
          >
            View My Orders
          </button>
          <button
            className="w-full py-3 bg-gray-200 text-[#8e191c] font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 