import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, TrendingUp, Package, Clock, DollarSign, Filter, Calendar, Star, AlertTriangle, CheckCircle, X } from "lucide-react";
import UserSidebar from "./UserSidebar";
import api from "../services/api";
import webService from '../services/Website/WebService';
import ConfirmModal from '../components/ConfirmModal';
import { useCart } from '../context/CartContext';
// Removed LoaderOverlay per request – no blocking loader during data fetch
import { useAuth } from "../context/AuthContext";

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
  const { user } = useAuth();
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

  // Dispute states
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    email: user?.email || '',
    category: '',
    description: ''
  });
  const [disputeFormErrors, setDisputeFormErrors] = useState({});
  const [processingAction, setProcessingAction] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDisputeSuccess, setShowDisputeSuccess] = useState(false);

  // Update dispute form email when user changes
  useEffect(() => {
    if (user?.email) {
      setDisputeForm(prev => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");
        const { data } = await api.get("/web/orders/my");
        console.log('Fetched orders:', data.data);
        console.log('First order dispute data:', data.data?.[0]?.dispute);
        console.log('All orders dispute data:', data.data?.map(order => ({ orderId: order.orderId, dispute: order.dispute })));
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

  // Adjust left margin when sidebar collapses/expands (same approach as Addresses page)
  useEffect(() => {
    const handler = (e) => {
      const content = document.getElementById('content-wrapper');
      if (!content) return;
      const width = e?.detail?.width;
      if (window.innerWidth >= 1024) {
        content.style.marginLeft = width || '16rem';
      } else {
        content.style.marginLeft = '0px';
      }
    };
    window.addEventListener('sidebar:width', handler);
    handler({ detail: { width: '16rem' } });
    const onResize = () => handler();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('sidebar:width', handler);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Validate dispute form
  const validateDisputeForm = () => {
    const errors = {};
    
    if (!disputeForm.email.trim()) {
      errors.email = 'Email is required';
    }
    
    if (!disputeForm.category) {
      errors.category = 'Please select a category';
    }
    
    if (!disputeForm.description.trim()) {
      errors.description = 'Description is required';
    } else if (disputeForm.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }
    
    setDisputeFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle dispute creation
  const handleCreateDispute = async (orderId) => {
    // Validate form before submission
    if (!validateDisputeForm()) {
      return;
    }

    try {
      setProcessingAction(true);
      const response = await webService.createCustomerDispute(orderId, disputeForm);
      
      if (response.success) {
        setSuccessMessage('Dispute created successfully!');
        setShowDisputeSuccess(true);
        setShowDisputeModal(false);
        setDisputeForm({ email: '', category: '', description: '' });
        setDisputeFormErrors({});
        
        // Refresh orders to show updated dispute status
        const { data } = await api.get("/web/orders/my");
        setOrders(data.data ?? []);
        
        setTimeout(() => setShowDisputeSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Dispute creation error:', error);
      
      // Handle specific error messages
      let errorMessage = 'Failed to create dispute';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setShowDisputeModal(false);
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle dispute button click
  const handleDisputeClick = (orderId) => {
    console.log('Dispute clicked for orderId:', orderId);
    const order = orders.find(o => o.orderId === orderId);
    console.log('Found order:', order);
    
    // Check if order already has an active dispute (not closed/resolved)
    if (order.dispute && order.dispute.status && 
        order.dispute.status !== 'none' && 
        !['resolved', 'closed', 'rejected'].includes(order.dispute.status.toLowerCase())) {
      setError('This order already has an active dispute');
      return;
    }
    
    setSelectedOrder(order);
    setShowDisputeModal(true);
  };

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
      <div className="min-h-screen bg-white relative overflow-hidden">
        <div className="hidden lg:block"><UserSidebar /></div>
        <main id="content-wrapper" className="lg:ml-64 relative z-10 p-6 sm:p-10 max-w-7xl mx-auto min-h-[60vh]">
          {/* Skeleton shimmer similar to ProductList */}
          <div className="animate-pulse space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="space-y-3 w-full sm:w-auto">
                <div className="h-8 w-48 bg-zinc-200 rounded"></div>
                <div className="h-4 w-64 bg-zinc-200 rounded"></div>
              </div>
              <div className="relative w-full sm:w-72">
                <div className="h-11 w-full bg-zinc-200 rounded-2xl"></div>
              </div>
            </div>

            {/* KPI skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-zinc-100 rounded-2xl p-4 border border-zinc-200 shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 w-24 bg-zinc-200 rounded"></div>
                      <div className="h-4 w-16 bg-zinc-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-10 bg-zinc-200 rounded-xl" />
              <div className="h-10 bg-zinc-200 rounded-xl" />
            </div>

            {/* Orders grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-zinc-200 bg-white shadow p-4 h-48" />
              ))}
            </div>
          </div>
        </main>
      </div>
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="hidden lg:block"><UserSidebar /></div>

      <main id="content-wrapper" className="lg:ml-64 relative z-10 p-6 sm:p-10 max-w-7xl mx-auto min-h-[60vh]">
        {!loading && (
          <>
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
                  <Search className="absolute w-5 h-5 top-1/2 left-4 -translate-y-1/2 text-[#8e191c]/80" />
                  <input
                    aria-label="Search orders"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search orders…"
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#8e191c] focus:border-transparent text-black placeholder:text-zinc-500 shadow-sm transition-all duration-200"
                  />
                </motion.div>
              </div>

              {/* Stats Dashboard */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
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
                  value={`AED ${stats.totalSpent.toFixed(2)}`}
                  color="green"
                />
                <StatCard
                  icon={<TrendingUp className="w-6 h-6" />}
                  title="Avg Order"
                  value={`AED ${stats.avgOrderValue.toFixed(2)}`}
                  color="purple"
                />
                <StatCard
                  icon={<Star className="w-6 h-6" />}
                  title="Paid Orders"
                  value={stats.paidOrders}
                  color="yellow"
                />
                <div className="hidden sm:block">
                  <StatCard
                    icon={<Clock className="w-6 h-6" />}
                    title="Recent (30d)"
                    value={stats.recentOrders}
                    color="red"
                  />
                </div>
              </motion.div>

              {/* Filters */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 w-full"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-zinc-600" />
                  <span className="text-sm font-medium text-zinc-700">Filter:</span>
                  <div className="w-full sm:min-w-[140px]">
                    <OrdersCustomSelect
                      value={filterStatus}
                      onChange={setFilterStatus}
                      options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'paid', label: 'Paid' },
                        { value: 'pending', label: 'Pending' }
                      ]}
                      placeholder="All Status"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                  <Calendar className="w-4 h-4 text-zinc-600" />
                  <span className="text-sm font-medium text-zinc-700">Sort:</span>
                  <div className="w-full sm:min-w-[160px]">
                    <OrdersCustomSelect
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        { value: 'newest', label: 'Newest First' },
                        { value: 'oldest', label: 'Oldest First' },
                        { value: 'highest', label: 'Highest Amount' },
                        { value: 'lowest', label: 'Lowest Amount' }
                      ]}
                      placeholder="Newest First"
                    />
                  </div>
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
                   className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {processedOrders.map((order, index) => (
                    <motion.div
                      key={order.orderId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <EnhancedOrderCard order={order} onReorder={() => { setSelectedOrder(order); setShowConfirm(true); }} onDispute={handleDisputeClick} />
                    </motion.div>
                  ))}
                </motion.section>
              )}
            </AnimatePresence>
          </>
        )}
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
              <span className="font-bold text-[#8e191c]">AED {selectedOrder.price?.toFixed(2)}</span>
            </div>
            <div>
              <div className="mt-2 space-y-2">
                {selectedOrder.orderItems?.slice(0,2).map((item, i) => (
                  <div key={item._id || i} className="flex items-center gap-2 bg-zinc-50 rounded-lg p-2">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" loading="lazy" decoding="async" />
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
                  <span className="text-xs text-zinc-600 ml-2">AED {item.price}</span>
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
        {/* Dispute Modal */}
        {showDisputeModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="bg-[#8e191c]/10 p-2 rounded-xl">
                      <AlertTriangle className="w-6 h-6" style={{ color: '#8e191c' }} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Create Dispute</h2>
                </div>
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={disputeForm.email}
                      onChange={(e) => setDisputeForm(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8e191c] focus:border-[#8e191c] ${disputeFormErrors.email ? 'border-red-500' : ''}`}
                      placeholder="Your email address"
                    />
                    {disputeFormErrors.email && (
                      <p className="text-xs text-red-500 mt-1">{disputeFormErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={disputeForm.category}
                      onChange={(e) => setDisputeForm(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8e191c] focus:border-[#8e191c] ${disputeFormErrors.category ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select a category</option>
                      <option value="Wrong item received">Wrong item received</option>
                      <option value="Damaged item">Damaged item</option>
                      <option value="Quality issues">Quality issues</option>
                      <option value="Delivery problems">Delivery problems</option>
                      <option value="Billing issues">Billing issues</option>
                      <option value="Other">Other</option>
                    </select>
                    {disputeFormErrors.category && (
                      <p className="text-xs text-red-500 mt-1">{disputeFormErrors.category}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={disputeForm.description}
                      onChange={(e) => setDisputeForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#8e191c] focus:border-[#8e191c] ${disputeFormErrors.description ? 'border-red-500' : ''}`}
                      placeholder="Please describe the issue in detail..."
                    />
                    {disputeFormErrors.description && (
                      <p className="text-xs text-red-500 mt-1">{disputeFormErrors.description}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCreateDispute(selectedOrder?.orderId)}
                  disabled={processingAction || !disputeForm.email || !disputeForm.category || !disputeForm.description || disputeForm.description.trim().length < 10}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#8e191c] rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {processingAction ? 'Creating...' : 'Create Dispute'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showDisputeSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}
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

const StatCard = ({ icon, title, value }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-gradient-to-br from-[#8e191c]/10 to-[#8e191c]/15 backdrop-blur-md border rounded-2xl p-4 shadow-lg"
      style={{ borderColor: '#e7bcbc' }}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/50 rounded-xl">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium opacity-80">{title}</p>
          <p className="text-lg font-bold text-zinc-800">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Lightweight custom select used in Orders page, modeled after ProductList's dropdown feel
const OrdersCustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selected = options.find(o => o.value === value);
  React.useEffect(() => {
    const handle = (e) => {
      if (!e.target.closest?.('.orders-select')) setIsOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);
  return (
    <div className="relative orders-select">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#8e191c] text-sm text-left flex items-center justify-between"
      >
        <span>{selected ? selected.label : placeholder}</span>
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="#8e191c" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full px-3 py-2 text-left transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl ${
                value === opt.value ? 'bg-[#8e191c] text-white' : 'hover:bg-[#8e191c]/10 text-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
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

const EnhancedOrderCard = ({ order, onReorder, onDispute }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const trackingStatus = order.trackingStatus?.toLowerCase() || "pending";
  const statusColor = statusColorMap[trackingStatus] || "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300";
  const statusLabel = statusLabelMap[trackingStatus] || order.trackingStatus || "Pending";

  const paymentStatus = order.paymentStatus?.toLowerCase() || "pending";
  const paymentColor = paymentStatusColorMap[paymentStatus] || "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300";
  const paymentLabel = paymentStatusLabelMap[paymentStatus] || order.paymentStatus || "Pending";

  // Check if order has existing dispute
  const hasDispute = order.dispute && order.dispute.status && order.dispute.status !== 'none';
  
  // Check if dispute is closed (resolved, closed, or rejected)
  const isDisputeClosed = order.dispute && order.dispute.status && 
    ['resolved', 'closed', 'rejected'].includes(order.dispute.status.toLowerCase());
  
  // Check if there's an active dispute (not closed/resolved)
  const hasActiveDispute = hasDispute && !isDisputeClosed;
  
  // Show dispute button only if no dispute exists OR if dispute is closed
  const canCreateDispute = !hasActiveDispute;

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
      className="relative rounded-2xl overflow-hidden border bg-white/60 shadow-lg group h-full flex flex-col min-h-[260px] sm:min-h-[420px] cursor-pointer"
      style={{ transformStyle: "preserve-3d", borderColor: '#e7bcbc' }}
      onClick={() => navigate(`/user/orders/${order.orderId}`)}
    >
      {/* Enhanced Glow Effect */}
      <motion.div
        // Removed inside hover effect (glow)
      />

      <div className="relative z-10 p-4 sm:p-6 space-y-3 text-sm text-black/90 flex flex-col h-full">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between text-xs font-semibold"
          whileHover={{ scale: 1.02 }}
        >
          <span className="px-2 py-1 bg-black/10 rounded-lg">
            Order #{order.orderId.slice(-8).toUpperCase()}
          </span>
          <span className="hidden sm:flex gap-2">
            <span className={`px-3 py-1 rounded-full border ${statusColor}`}>{statusLabel}</span>
            <span className={`px-3 py-1 rounded-full border ${paymentColor}`}>{paymentLabel}</span>
          </span>
        </motion.div>

        {/* Dispute Status Indicators (hidden on mobile for compactness) */}
        {hasDispute && (
          <div className="hidden sm:flex gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${
              isDisputeClosed 
                ? 'bg-green-100 text-green-800 border-green-300' 
                : 'bg-red-100 text-red-800 border-red-300'
            }`}>
              <AlertTriangle className="w-3 h-3" />
              Dispute: {order.dispute.status}
              {order.dispute.category && ` (${order.dispute.category})`}
            </span>
          </div>
        )}

        {/* Meta Info (hidden on mobile) */}
        <div className="hidden sm:flex items-center justify-between text-xs text-zinc-600 mb-1">
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
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #8e191c, #8e191c)' }}>
            Total: AED {order.price?.toFixed(2)}
          </span>
        </motion.p>

        {/* Enhanced Items Display (hidden on mobile) */}
        <div className="hidden sm:flex flex-wrap gap-3 pt-3">
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
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/40";
                  }}
                  className="w-10 h-10 object-cover rounded-lg"
                />
                <div className="absolute -top-1 -right-1 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center" style={{ backgroundColor: '#8e191c' }}>
                  {item.quantity}
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium max-w-[7rem] truncate text-black">
                  {item.name}
                </p>
                <p className="text-xs font-semibold text-black">AED {item.price}</p>
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
        <div className="flex gap-2 pt-4 mt-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 text-white font-semibold py-2 px-3 sm:px-4 text-sm sm:text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#8e191c' }}
            onClick={(e) => { e.stopPropagation(); navigate(`/user/orders/${order.orderId}`); }}
          >
            View Details
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-zinc-200 to-zinc-300 hover:from-zinc-300 hover:to-zinc-400 text-zinc-800 font-semibold py-2 px-3 sm:px-4 text-sm sm:text-base rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={(e) => { e.stopPropagation(); onReorder(); }}
          >
            Reorder
          </motion.button>
        </div>

        {/* Dispute Button Only */}
        {canCreateDispute && (
          <div className="flex gap-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            className="flex-1 text-white font-semibold py-2 px-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-xs"
            style={{ backgroundColor: '#8e191c' }}
              onClick={(e) => { e.stopPropagation(); onDispute(order.orderId); }}
            >
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              {hasDispute && isDisputeClosed ? 'Create New Dispute' : 'Dispute'}
            </motion.button>
          </div>
        )}

        {/* Show message if order has active dispute */}
        {hasActiveDispute && (
          <div className="hidden sm:block pt-2">
            <div className="text-xs text-gray-500 text-center bg-gray-50 rounded-lg p-2">
              <span>This order has an active dispute</span>
            </div>
          </div>
        )}

        {/* Show message if order has closed dispute */}
        {hasDispute && isDisputeClosed && (
          <div className="hidden sm:block pt-2">
            <div className="text-xs text-green-600 text-center bg-green-50 rounded-lg p-2">
              <span>Previous dispute was {order.dispute.status}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ViewOrdersPage;