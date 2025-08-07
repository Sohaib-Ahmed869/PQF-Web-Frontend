import React from 'react';
import { 
  FiSearch, 
  FiEye, 
  FiRefreshCw,
  FiFilter,
  FiGrid,
  FiList,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
  FiTruck,
  FiHome,
  FiMail,
  FiPhone,
  FiTag,
  FiActivity,
  FiAlertCircle,
  FiDownload,
  FiXCircle,
  FiCheckCircle,
  FiCreditCard,
  FiBox
} from 'react-icons/fi';
import StatCard from './StatsCard';
import OrderFilters from './FilterList';
import OrderGrid from './OrderGrid';
import OrderListView from './OrderListView';
import Pagination from './Pagination';
import LoaderOverlay from '../../../components/LoaderOverlay';

const OrderList = ({ 
  orders, 
  loading, 
  error, 
  stats, 
  filters, 
  setFilters,
  onRefresh,
  onOrderDetails,
  onExportOrders,
  onBulkStatusUpdate,
  setError
}) => {
  // Format functions
  const formatPrice = (price) => `AED ${price.toFixed(2)}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  // Status options with counts
  const statusOptions = [
    { value: 'all', label: 'All Orders', count: stats.total },
    { value: 'pending', label: 'Pending', count: stats.pending },
    { value: 'shipped', label: 'Shipped', count: stats.shipped },
    { value: 'delivered', label: 'Delivered', count: stats.delivered }
  ];

  const orderTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'pickup', label: 'Pickup' }
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    if (filters.selectedStatus !== 'all' && order.trackingStatus !== filters.selectedStatus) return false;
    if (filters.selectedOrderType !== 'all' && order.orderType !== filters.selectedOrderType) return false;
    if (filters.paymentStatusFilter !== 'all' && order.paymentStatus !== filters.paymentStatusFilter) return false;
    
    if (filters.searchTerm) {
      const searchText = filters.searchTerm.toLowerCase();
      const customerName = (order.cardName || order.user?.name || '').toLowerCase();
      const orderId = order.orderId.toLowerCase();
      const trackingNumber = (order.trackingNumber || '').toLowerCase();
      const userEmail = (order.user?.email || '').toLowerCase();
      
      return customerName.includes(searchText) || 
             orderId.includes(searchText) || 
             trackingNumber.includes(searchText) ||
             userEmail.includes(searchText);
    }

    return true;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'customer':
        return (a.cardName || a.user?.name || '').localeCompare(b.cardName || b.user?.name || '');
      case 'price-high':
        return b.price - a.price;
      case 'price-low':
        return a.price - b.price;
      case 'status':
        return (a.trackingStatus || '').localeCompare(b.trackingStatus || '');
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / filters.itemsPerPage);
  const startIndex = (filters.currentPage - 1) * filters.itemsPerPage;
  const endIndex = startIndex + filters.itemsPerPage;
  const currentOrders = sortedOrders.slice(startIndex, endIndex);

  // Handler functions
  const handleViewModeChange = (mode) => {
    setFilters(prev => ({ ...prev, viewMode: mode }));
  };

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({ ...prev, sortBy, currentPage: 1 }));
  };

  const handleFiltersToggle = () => {
    setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }));
  };

  const handleSearchChange = (searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setFilters(prev => ({ ...prev, itemsPerPage, currentPage: 1 }));
  };

  return (
    <div className="w-full max-w-full mb-10 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 right-4 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 bg-red-500/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-4 sm:left-10 w-32 h-32 sm:w-40 sm:h-40 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="relative">
          <LoaderOverlay text="Loading orders..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <FiAlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Orders</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800 transition-colors"
            >
              <FiXCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="truncate">Order Management</span>
          </h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage and track all customer orders</p>
        </div>
      </div>
      
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={stats.total}
          icon={FiShoppingCart}
          color="bg-gradient-to-r from-[#a51d20] to-[#c62828]"
          subtitle="All orders"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pending}
          icon={FiClock}
          color="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]"
          subtitle="Awaiting processing"
        />
        <StatCard
          title="Shipped Orders"
          value={stats.shipped}
          icon={FiTruck}
          color="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]"
          subtitle="In transit"
        />
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          icon={FiDollarSign}
          color="bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6]"
          subtitle={`Avg: ${formatPrice(stats.avgOrderValue)}`}
        />
        <StatCard
          title="Customer Savings"
          value={formatPrice(stats.totalSavings || 0)}
          icon={FiTag}
          color="bg-gradient-to-r from-[#10b981] to-[#34d399]"
          subtitle={`${stats.discountedOrders || 0} orders with discounts`}
        />
      </div>

      {/* Filters and Controls */}
      <OrderFilters
        filters={filters}
        statusOptions={statusOptions}
        orderTypeOptions={orderTypeOptions}
        paymentStatusOptions={paymentStatusOptions}
        loading={loading}
        onSearchChange={handleSearchChange}
        onViewModeChange={handleViewModeChange}
        onSortChange={handleSortChange}
        onFiltersToggle={handleFiltersToggle}
        onRefresh={onRefresh}
        onExport={onExportOrders}
        setFilters={setFilters}
        ordersCount={orders.length}
      />

      {/* Orders Display */}
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-12 shadow-xl">
            <FiShoppingCart className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">There are no orders to display at the moment.</p>
          </div>
        </div>
      ) : (
        <>
          {filters.viewMode === 'grid' ? (
            <OrderGrid 
              orders={currentOrders}
              onOrderDetails={onOrderDetails}
              formatPrice={formatPrice}
              formatDate={formatDate}
              showDiscounts={true}
            />
          ) : (
            <OrderListView 
              orders={currentOrders}
              onOrderDetails={onOrderDetails}
              formatPrice={formatPrice}
              formatDate={formatDate}
              showDiscounts={true}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={filters.currentPage}
              totalPages={totalPages}
              itemsPerPage={filters.itemsPerPage}
              totalItems={sortedOrders.length}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default OrderList;