import React, { useState, useEffect } from 'react';
import UserSidebar from './UserSidebar';
import api from '../services/api';
import { useLocation } from 'react-router-dom';

const GuestOrdersPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialEmail = params.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrders([]);
    try {
      const res = await api.post('/web/orders/guest-orders', { email });
      setOrders(res.data.data || []);
      if ((res.data.data || []).length === 0) setError('No orders found for this email address.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-zinc-50 to-gray-100 relative overflow-hidden">
      <UserSidebar />
      <main className="lg:ml-64 relative z-10 p-6 sm:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-black drop-shadow-sm">
              Guest Order Lookup
            </h1>
            <p className="text-black/70 mt-1">Find your order by email address</p>
          </div>
        </div>
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-10">
          <div className="relative w-full">
            <input
              type="email"
              aria-label="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full pl-4 pr-4 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-black placeholder:text-zinc-500 shadow-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full py-3 px-8 rounded-2xl font-bold text-white text-lg tracking-wider transition-all duration-300 ${loading ? 'bg-zinc-400 cursor-not-allowed' : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 hover:shadow-lg hover:shadow-red-400/25'}`}
          >
            {loading ? 'Searching…' : 'Search Orders'}
          </button>
        </form>
        {/* Error */}
        {error && (
          <div className="mb-8 max-w-xl mx-auto">
            <div className="bg-red-100 border border-red-300 rounded-xl p-6 text-red-700 text-center font-medium">
              {error}
            </div>
          </div>
        )}
        {/* Orders Grid */}
        {orders.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-7xl">📦</div>
            <h3 className="mt-6 text-2xl font-semibold text-black">No orders found</h3>
            <p className="text-black/70 mt-2">Enter your email to view your orders.</p>
          </div>
        )}
        {orders.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="relative rounded-2xl overflow-hidden border border-transparent bg-white/60 backdrop-blur-xl shadow-lg hover:border-red-500 group transition-all"
              >
                <div className="relative z-10 p-6 space-y-3 text-sm text-black/90">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Order #{order.orderId.slice(-8).toUpperCase()}</span>
                    <span className={`px-3 py-1 rounded-full ${getStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 capitalize">
                    {order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}
                  </p>
                  <h3 className="font-medium truncate">{order.cardName}</h3>
                  <div className="grid gap-1 text-xs text-zinc-600 leading-snug">
                    <span>Card Code: {order.cardCode}</span>
                    {order.location && <span>Location: {order.location.address}</span>}
                    {order.shippingAddress && (
                      <span>
                        Shipping: {order.shippingAddress.address}, {order.shippingAddress.city}{order.shippingAddress.country ? `, ${order.shippingAddress.country}` : ''}
                      </span>
                    )}
                    {order.billingAddress && (
                      <span>
                        Billing: {order.billingAddress.address}, {order.billingAddress.city}{order.billingAddress.country ? `, ${order.billingAddress.country}` : ''}
                      </span>
                    )}
                    {order.notes && <span>Notes: {order.notes}</span>}
                  </div>
                  <p className="font-bold text-base pt-2">Total: ${order.price?.toFixed(2)}</p>
                  {/* Items */}
                  <div className="flex flex-wrap gap-3 pt-3">
                    {order.orderItems?.map((item, i) => (
                      <div
                        key={item._id || i}
                        className="flex items-center gap-2 border border-zinc-200 bg-white/80 rounded-xl p-2 backdrop-blur-sm shadow-sm"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={e => { e.target.src = 'https://via.placeholder.com/40'; }}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-medium max-w-[7rem] truncate text-black">{item.name}</p>
                          <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                          <p className="text-xs font-semibold text-black">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default GuestOrdersPage;