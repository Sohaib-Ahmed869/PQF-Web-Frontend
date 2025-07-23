import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, TrendingUp, Package, Clock, DollarSign, Filter, Calendar, Star } from "lucide-react";
import UserSidebar from "./UserSidebar";
import api from "../services/api";
import { reorder as reorderApi } from '../services/Website/WebService';
import ConfirmModal from '../components/ConfirmModal';
import { useCart } from '../context/CartContext';
import cartService from '../services/cartService';

/**
 * Enhanced ViewOrdersPage – 07‑2025
 * A beautiful, interactive dashboard with stats and enhanced visuals
 */

const shimmer = {
  animate: {
    backgroundPosition: "200% center",
    transition: { repeat: Infinity, ease: "linear", duration: 6 }
  }
};

const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
  }
};

const statusColorMap = {
  pending: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border-yellow-300",
  shipped: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300",
  "in transit": "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-300",
  delivered: "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-300",
  cancelled: "bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300"
};
const statusLabelMap = {
  pending: "Pending",
  shipped: "Shipped",
  "in transit": "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

const paymentStatusColorMap = {
  paid: "bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-300",
  pending: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border-yellow-300",
  failed: "bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300",
  refunded: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300"
};
const paymentStatusLabelMap = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded"
};

const ViewOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { setCart, reorderItems } = useCart();
  const token = localStorage.getItem('token');
  const [showSuccess, setShowSuccess] = useState(false);
  const [addedItems, setAddedItems] = useState([]);

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

  // Calculate stats
  const stats = React.useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.paymentStatus === "paid").length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.price || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const recentOrders = orders.filter(o => {
      const orderDate = new Date(o.orderDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return orderDate >= thirtyDaysAgo;
    }).length;

    return {
      totalOrders,
      paidOrders,
      totalSpent,
      avgOrderValue,
      recentOrders
    };
  }, [orders]);

  // Filter and sort orders
  const processedOrders = React.useMemo(() => {
    let filtered = orders.filter((o) => {
      const id = (o.orderId || "").toLowerCase();
      const nm = (o.cardName || "").toLowerCase();
      const term = search.toLowerCase();
      const matchesSearch = id.includes(term) || nm.includes(term);
      
      if (filterStatus === "all") return matchesSearch;
      return matchesSearch && o.paymentStatus === filterStatus;
    });

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.orderDate) - new Date(a.orderDate);
        case "oldest":
          return new Date(a.orderDate) - new Date(b.orderDate);
        case "highest":
          return (b.price || 0) - (a.price || 0);
        case "lowest":
          return (a.price || 0) - (b.price || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, search, filterStatus, sortBy]);

  // Move handleReorder here so it's defined before JSX
  const handleReorder = async () => {
    setShowConfirm(false);
    if (!selectedOrder) return;
    try {
      // Use the reorderItems method from CartContext instead
      const result = await reorderItems(selectedOrder.orderId);
      setAddedItems(result.items || []);
      setShowSuccess(true);
    } catch (e) {
      alert('Failed to reorder: ' + (e.response?.data?.message || e.message));
    }
  };

  if (loading)
    return (
      <Shell>
        <motion.div
          initial={{ rotate: 0, scale: 0.8 }}
          animate={{ rotate: 360, scale: 1 }}
          transition={{ repeat: Infinity, duration: 1.25, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-red-600" />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-lg font-medium text-black/80"
        >
          Fetching your orders…
        </motion.p>
      </Shell>
    );

  if (error)
    return (
      <Shell>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg font-semibold max-w-md">
            {error}
          </p>
        </motion.div>
      </Shell>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-zinc-50 to-gray-100 relative overflow-hidden">
      {/* Enhanced moving gradient backdrop */}
      <motion.div
        variants={shimmer}
        animate="animate"
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,0,128,0.08),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(0,128,255,0.08),transparent_40%),radial-gradient(circle_at_50%_50%,rgba(255,165,0,0.05),transparent_50%)] bg-[length:400%_400%] pointer-events-none"
      />

      {/* Floating decorative elements */}
      <motion.div variants={floatingAnimation} animate="animate" className="absolute top-20 right-20 text-4xl opacity-20">
        📦
      </motion.div>
      <motion.div 
        variants={floatingAnimation} 
        animate="animate" 
        transition={{ delay: 1 }}
        className="absolute bottom-32 left-20 text-3xl opacity-20"
      >
        🚚
      </motion.div>

      <UserSidebar />

      <main className="lg:ml-64 relative z-10 p-6 sm:p-10 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-black drop-shadow-sm">
                My Orders
              </h1>
              <p className="text-black/70 mt-1">Track your recent & past orders</p>
            </div>

            {/* Enhanced Search */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative w-full sm:w-72"
            >
              <Search className="absolute w-5 h-5 top-1/2 left-4 -translate-y-1/2 text-red-500/80" />
              <input
                aria-label="Search orders"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders…"
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black placeholder:text-zinc-500 shadow-lg transition-all duration-200"
              />
            </motion.div>
          </div>

          {/* Stats Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          >
            <StatCard
              icon={<Package className="w-6 h-6" />}
              title="Total Orders"
              value={stats.totalOrders}
              color="blue"
            />
            <StatCard
              icon={<DollarSign className="w-6 h-6" />}
              title="Total Spent"
              value={`د.إ${stats.totalSpent.toFixed(2)}`}
              color="green"
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Avg Order"
              value={`د.إ${stats.avgOrderValue.toFixed(2)}`}
              color="purple"
            />
            <StatCard
              icon={<Star className="w-6 h-6" />}
              title="Paid Orders"
              value={stats.paidOrders}
              color="yellow"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              title="Recent (30d)"
              value={stats.recentOrders}
              color="red"
            />
          </motion.div>

          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-600" />
              <span className="text-sm font-medium text-zinc-700">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 rounded-lg bg-white/60 backdrop-blur-md border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-600" />
              <span className="text-sm font-medium text-zinc-700">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 rounded-lg bg-white/60 backdrop-blur-md border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </div>
          </motion.div>
        </motion.div>

        {/* Orders Grid */}
        <AnimatePresence mode="wait">
          {processedOrders.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <EnhancedEmptyState search={!!search} />
            </motion.div>
          ) : (
            <motion.section 
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {processedOrders.map((order, index) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EnhancedOrderCard order={order} onReorder={() => { setSelectedOrder(order); setShowConfirm(true); }} />
                </motion.div>
              ))}
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      <ConfirmModal
        open={showConfirm}
        onConfirm={handleReorder}
        onCancel={() => setShowConfirm(false)}
        title="Reorder Confirmation"
        message={selectedOrder && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-700">Order ID:</span>
              <span className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded">{String(selectedOrder.orderId).slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-700">Total:</span>
              <span className="font-bold text-red-600">د.إ{selectedOrder.price?.toFixed(2)}</span>
            </div>
            <div>
              <div className="mt-2 space-y-2">
                {selectedOrder.orderItems?.slice(0,2).map((item, i) => (
                  <div key={item._id || i} className="flex items-center gap-2 bg-zinc-50 rounded-lg p-2">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />
                    )}
                    <span className="text-xs font-medium text-black truncate max-w-[7rem]">{item.name}</span>
                    <span className="text-xs text-zinc-600 ml-auto">x{item.quantity}</span>
                  </div>
                ))}
                {selectedOrder.orderItems && selectedOrder.orderItems.length > 2 && (
                  <div className="text-xs text-zinc-500 mt-1">+{selectedOrder.orderItems.length - 2} more items</div>
                )}
              </div>
            </div>
            <div className="pt-2 text-sm text-zinc-700">Are you sure you want to reorder all items from this order?</div>
          </div>
        )}
        confirmText="Yes, Reorder"
        cancelText="Cancel"
      />
      <ConfirmModal
        open={showSuccess}
        onConfirm={() => { setShowSuccess(false); navigate('/cart'); }}
        onCancel={() => setShowSuccess(false)}
        title="Reorder Successful"
        message={(
          <div className="space-y-3">
            <div className="text-green-600 font-bold text-lg">Items added to your cart!</div>
            <div className="space-y-2">
              {addedItems.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-zinc-50 rounded-lg p-2">
                  <span className="text-xs font-medium text-black truncate max-w-[7rem]">{item.name}</span>
                  <span className="text-xs text-zinc-600 ml-auto">x{item.quantity}</span>
                  <span className="text-xs text-zinc-600 ml-2">د.إ{item.price}</span>
                </div>
              ))}
              {addedItems.length > 3 && (
                <div className="text-xs text-zinc-500 mt-1">+{addedItems.length - 3} more items</div>
              )}
            </div>
            <div className="pt-2 text-sm text-zinc-700">You can view or edit your cart before checkout.</div>
          </div>
        )}
        confirmText="Go to Cart"
        cancelText="Close"
      />
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

const StatCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 text-blue-700 border-blue-200",
    green: "from-green-500/20 to-green-600/20 text-green-700 border-green-200",
    purple: "from-purple-500/20 to-purple-600/20 text-purple-700 border-purple-200",
    yellow: "from-yellow-500/20 to-yellow-600/20 text-yellow-700 border-yellow-200",
    red: "from-red-500/20 to-red-600/20 text-red-700 border-red-200"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md border rounded-2xl p-4 shadow-lg`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/50 rounded-xl">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium opacity-80">{title}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

const EnhancedEmptyState = ({ search }) => (
  <div className="flex flex-col items-center justify-center py-24">
    <motion.div
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ 
        repeat: Infinity, 
        duration: 4, 
        ease: "easeInOut" 
      }}
      className="text-8xl mb-6"
    >
      📦
    </motion.div>
    <motion.h3 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-2xl font-semibold text-black mb-2"
    >
      No orders found
    </motion.h3>
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-black/70"
    >
      {search ? "Try a different search term." : "You haven't placed any orders yet."}
    </motion.p>
    {!search && (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
        onClick={() => window.location.href = '/shop'}
      >
        Start Shopping
      </motion.button>
    )}
  </div>
);

const EnhancedOrderCard = ({ order, onReorder }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const trackingStatus = order.trackingStatus?.toLowerCase() || "pending";
  const statusColor = statusColorMap[trackingStatus] || "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300";
  const statusLabel = statusLabelMap[trackingStatus] || order.trackingStatus || "Pending";

  const paymentStatus = order.paymentStatus?.toLowerCase() || "pending";
  const paymentColor = paymentStatusColorMap[paymentStatus] || "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300";
  const paymentLabel = paymentStatusLabelMap[paymentStatus] || order.paymentStatus || "Pending";

  return (
    <motion.div
      whileHover={{ 
        scale: 1.03,
        rotateY: 5,
        z: 50
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative rounded-2xl overflow-hidden border border-transparent bg-white/60 shadow-lg hover:border-red-500 group h-full flex flex-col min-h-[420px] cursor-pointer"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Enhanced Glow Effect */}
      <motion.div
        // Removed inside hover effect (glow)
      />

      <div className="relative z-10 p-6 space-y-3 text-sm text-black/90 flex flex-col h-full">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between text-xs font-semibold"
          whileHover={{ scale: 1.02 }}
        >
          <span className="px-2 py-1 bg-black/10 rounded-lg">
            Order #{order.orderId.slice(-8).toUpperCase()}
          </span>
          <span className="flex gap-2">
            <span className={`px-3 py-1 rounded-full border ${statusColor}`}>{statusLabel}</span>
            <span className={`px-3 py-1 rounded-full border ${paymentColor}`}>{paymentLabel}</span>
          </span>
        </motion.div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-zinc-600 mb-1">
          <span className="capitalize flex items-center gap-1">
            {order.orderType === "pickup" ? "🏪 Pickup" : "🚚 Delivery"}
          </span>
          {order.orderDate && (
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              📅 {new Date(order.orderDate).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric'
              })}
            </span>
          )}
        </div>

        <motion.h3 
          className="font-medium truncate text-lg"
          whileHover={{ scale: 1.02 }}
        >
          {order.cardName}
        </motion.h3>

        <div className="grid gap-1 text-xs text-zinc-600 leading-snug">
          {order.location && (
            <span className="flex items-center gap-1">
              📍 {order.location.address}
            </span>
          )}
          {order.notes && (
            <span className="flex items-center gap-1">
              📝 {order.notes}
            </span>
          )}
        </div>

        <motion.p 
          className="font-bold text-xl pt-2 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
        >
          Total: د.إ{order.price?.toFixed(2)}
        </motion.p>

        {/* Enhanced Items Display */}
        <div className="flex flex-wrap gap-3 pt-3">
          {order.orderItems?.slice(0, 2).map((item, i) => (
            <motion.div
              key={item._id || i}
              whileHover={{ scale: 1.02, y: -2 }}
              className="flex items-center gap-2 border border-zinc-200 bg-white/80 rounded-xl p-2 backdrop-blur-sm shadow-sm w-56"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/40";
                  }}
                  className="w-10 h-10 object-cover rounded-lg"
                />
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {item.quantity}
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium max-w-[7rem] truncate text-black">
                  {item.name}
                </p>
                <p className="text-xs font-semibold text-black">د.إ{item.price}</p>
              </div>
            </motion.div>
          ))}
          {order.orderItems && order.orderItems.length > 2 && (
            <motion.div 
              className="flex items-center text-xs font-semibold text-zinc-600 px-3 py-2 bg-zinc-100/80 rounded-xl"
              whileHover={{ scale: 1.05 }}
            >
              +{order.orderItems.length - 2} more items
            </motion.div>
          )}
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex gap-3 pt-4 mt-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={() => navigate(`/user/orders/${order.orderId}`)}
          >
            View Details
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-zinc-200 to-zinc-300 hover:from-zinc-300 hover:to-zinc-400 text-zinc-800 font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={onReorder}
          >
            Reorder
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewOrdersPage;