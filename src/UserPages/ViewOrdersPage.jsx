import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import UserSidebar from "./UserSidebar";
import api from "../services/api";

/**
 * ViewOrdersPage – 07‑2025
 * A sleek, glass‑morphic dashboard that lists the user’s orders.
 * TailwindCSS + Framer Motion + Lucide icons.
 */

const shimmer = {
  animate: {
    backgroundPosition: "200% center",
    transition: { repeat: Infinity, ease: "linear", duration: 6 }
  }
};

const ViewOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        const { data } = await api.get("/web/orders/my");
        setOrders(data.data ?? []);
      } catch (e) {
        setError(
          e.response?.data?.message || e.message || "Unable to fetch orders."
        );
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, [navigate]);

  /** Filtered list */
  const filtered = orders.filter((o) => {
    const id = (o.orderId || "").toLowerCase();
    const nm = (o.cardName || "").toLowerCase();
    const term = search.toLowerCase();
    return id.includes(term) || nm.includes(term);
  });

  /* ---------------------------------------------------------------- */
  if (loading)
    return (
      <Shell>
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.25, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-red-600" />
        </motion.div>
        <p className="mt-4 text-lg font-medium text-black/80">
          Fetching your orders…
        </p>
      </Shell>
    );

  if (error)
    return (
      <Shell>
        <p className="text-red-600 text-lg font-semibold text-center max-w-md">
          {error}
        </p>
      </Shell>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-zinc-50 to-gray-100 relative overflow-hidden">
      {/* subtle moving gradient backdrop */}
      <motion.div
        variants={shimmer}
        animate="animate"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,128,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,128,255,0.08),transparent_40%)] bg-[length:400%_400%] pointer-events-none"
      />

      {/* Sidebar */}
      <UserSidebar />

      {/* Content */}
      <main className="lg:ml-64 relative z-10 p-6 sm:p-10 max-w-7xl mx-auto">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-black drop-shadow-sm">
              My Orders
            </h1>
            <p className="text-black/70 mt-1">Track your recent & past orders</p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute w-5 h-5 top-1/2 left-4 -translate-y-1/2 text-red-500/80" />
            <input
              aria-label="Search orders"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-black placeholder:text-zinc-500 shadow-lg"
            />
          </div>
        </div>

        {/* Orders Grid */}
        {filtered.length === 0 ? (
          <EmptyState search={!!search} />
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filtered.map((order) => (
              <OrderCard key={order.orderId} order={order} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

/* ------------------------------------------------------------------ */
const Shell = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-rose-50 via-zinc-50 to-gray-100 relative overflow-hidden">
    <UserSidebar />
    <div className="lg:ml-64 flex items-center justify-center p-12 relative z-10">
      <div className="text-center">{children}</div>
    </div>
  </div>
);

const EmptyState = ({ search }) => (
  <div className="flex flex-col items-center justify-center py-24">
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      className="text-7xl"
    >
      📦
    </motion.div>
    <h3 className="mt-6 text-2xl font-semibold text-black">No orders found</h3>
    <p className="text-black/70 mt-2">
      {search ? "Try a different search term." : "You haven't placed any orders yet."}
    </p>
  </div>
);

const OrderCard = ({ order }) => {
  const statusColor =
    order.paymentStatus === "paid"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative rounded-2xl overflow-hidden border border-transparent bg-white/60 backdrop-blur-xl shadow-lg hover:border-red-500 group"
    >
      {/* Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-black/10 pointer-events-none"
      />

      <div className="relative z-10 p-6 space-y-3 text-sm text-black/90">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>Order #{order.orderId.slice(-8).toUpperCase()}</span>
          <span className={`px-3 py-1 rounded-full ${statusColor}`}>
            {order.paymentStatus}
          </span>
        </div>

        <p className="text-xs text-zinc-600 capitalize">
          {order.orderType === "pickup" ? "Pickup" : "Delivery"}
        </p>

        <h3 className="font-medium truncate">{order.cardName}</h3>

        <div className="grid gap-1 text-xs text-zinc-600 leading-snug">
          <span>Card Code: {order.cardCode}</span>
          {order.location && <span>Location: {order.location.address}</span>}
          {order.shippingAddress && (
            <span>
              Shipping: {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.country}
            </span>
          )}
          {order.billingAddress && (
            <span>
              Billing: {order.billingAddress.address}, {order.billingAddress.city},{" "}
              {order.billingAddress.country}
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
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/40";
                }}
                className="w-10 h-10 object-cover rounded-lg"
              />
              <div className="space-y-0.5">
                <p className="text-xs font-medium max-w-[7rem] truncate text-black">
                  {item.name}
                </p>
                <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                <p className="text-xs font-semibold text-black">${item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ViewOrdersPage;
