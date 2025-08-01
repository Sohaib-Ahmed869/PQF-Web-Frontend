import React, { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import orderService from '../../services/Admin/OrderService';
import AdminSidebar from '../Sidebar';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';

const OrderManagement = () => {
  const [view, setView] = useState('list');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    currentPage: 1,
    itemsPerPage: 9,
    selectedStatus: 'all',
    selectedOrderType: 'all',
    paymentStatusFilter: 'all',
    sortBy: 'newest',
    showFilters: false
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
    totalRevenue: 0,
    avgOrderValue: 0
  });

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [filters.currentPage, filters.itemsPerPage, filters.sortBy]);

  // Calculate stats when orders change
  useEffect(() => {
    calculateStats(orders);
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams = {
        status: filters.selectedStatus !== 'all' ? filters.selectedStatus : undefined,
        orderType: filters.selectedOrderType !== 'all' ? filters.selectedOrderType : undefined,
        paymentStatus: filters.paymentStatusFilter !== 'all' ? filters.paymentStatusFilter : undefined,
        search: filters.searchTerm || undefined,
      };
      
      const pagination = {
        page: filters.currentPage,
        limit: filters.itemsPerPage,
      };
      
      const sorting = {
        field: filters.sortBy === 'newest' ? 'createdAt' : 
               filters.sortBy === 'oldest' ? 'createdAt' :
               filters.sortBy === 'customer' ? 'cardName' :
               filters.sortBy === 'price-high' ? 'price' :
               filters.sortBy === 'price-low' ? 'price' :
               filters.sortBy === 'status' ? 'trackingStatus' : 'createdAt',
        order: filters.sortBy === 'oldest' || filters.sortBy === 'price-low' ? 'asc' : 'desc',
      };
      
      const response = await orderService.getOrdersWithFilters(filterParams, pagination, sorting);
      
      if (response.success) {
        setOrders(response.data || []);
      } else {
        setError('Failed to fetch orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ordersData) => {
    const newStats = {
      total: ordersData.length,
      pending: ordersData.filter(order => order.trackingStatus === 'pending').length,
      shipped: ordersData.filter(order => order.trackingStatus === 'shipped').length,
      delivered: ordersData.filter(order => order.trackingStatus === 'delivered').length,
      totalRevenue: ordersData.reduce((sum, order) => sum + order.price, 0),
      avgOrderValue: ordersData.length > 0 ? ordersData.reduce((sum, order) => sum + order.price, 0) / ordersData.length : 0
    };
    setStats(newStats);
  };

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, currentPage: 1 }));
      fetchOrders();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm, filters.selectedStatus, filters.selectedOrderType, filters.paymentStatusFilter]);

  // Handler functions
  const handleRefresh = () => {
    fetchOrders();
  };

  const handleOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      const response = await orderService.getOrderDetails(orderId);
      if (response.success) {
        setSelectedOrder(response.data);
        setView('view');
      } else {
        setError('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackingUpdate = async (orderId, trackingData) => {
    try {
      setLoading(true);
      const response = await orderService.updateOrderTracking(orderId, trackingData);
      if (response.success) {
        // Update orders list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.orderId === orderId ? response.data : order
          )
        );
        
        // Update selected order if it's the same one
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder(response.data);
        }
        
        // Show success message with details
        const statusChanged = response.statusChanged;
        const previousStatus = response.previousStatus;
        
        if (statusChanged) {
          console.log(`Order status updated from ${previousStatus} to ${trackingData.trackingStatus}`);
          // You could add a toast notification here
          // toast.success(`Order status updated from ${previousStatus} to ${trackingData.trackingStatus}`);
        } else {
          console.log('Order tracking information updated (no status change)');
          // toast.info('Order tracking information updated');
        }
        
        // Close the modal if it's open
        if (view === 'updateStatus') {
          setView('list');
        }
      } else {
        setError('Failed to update tracking');
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      setError(error.message || 'Failed to update tracking');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (orderIds, status, note = '') => {
    try {
      setLoading(true);
      const response = await orderService.bulkUpdateOrderStatus(orderIds, status, note);
      if (response.success) {
        // Refresh orders list
        fetchOrders();
        console.log('Bulk status update successful');
        // toast.success('Orders updated successfully');
      } else {
        setError('Failed to update orders');
      }
    } catch (error) {
      console.error('Error updating orders:', error);
      setError(error.message || 'Failed to update orders');
    } finally {
      setLoading(false);
    }
  };

  const handleExportOrders = async (format = 'csv') => {
    try {
      setLoading(true);
      const filterParams = {
        status: filters.selectedStatus !== 'all' ? filters.selectedStatus : undefined,
        orderType: filters.selectedOrderType !== 'all' ? filters.selectedOrderType : undefined,
        paymentStatus: filters.paymentStatusFilter !== 'all' ? filters.paymentStatusFilter : undefined,
        search: filters.searchTerm || undefined,
      };
      
      const response = await orderService.exportOrders(filterParams, format);
      if (response.success) {
        // Handle file download
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
        console.log('Orders exported successfully');
        // toast.success('Orders exported successfully');
      } else {
        setError('Failed to export orders');
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
      setError(error.message || 'Failed to export orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (orderId, notificationType, message = '') => {
    try {
      setLoading(true);
      const response = await orderService.sendOrderNotification(orderId, notificationType, message);
      if (response.success) {
        console.log('Notification sent successfully');
        // toast.success('Notification sent successfully');
      } else {
        setError('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setError(error.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleGetOrderTimeline = async (orderId) => {
    try {
      setLoading(true);
      const response = await orderService.getOrderTimeline(orderId);
      if (response.success) {
        console.log('Order timeline:', response.data);
        // You can handle the timeline data here
      } else {
        setError('Failed to fetch order timeline');
      }
    } catch (error) {
      console.error('Error fetching order timeline:', error);
      setError(error.message || 'Failed to fetch order timeline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto relative lg:ml-64 pt-8">

        {view === 'list' ? (
          <OrderList 
            orders={orders}
            loading={loading}
            error={error}
            stats={stats}
            filters={filters}
            setFilters={setFilters}
            onRefresh={handleRefresh}
            onOrderDetails={handleOrderDetails}
            onExportOrders={handleExportOrders}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            setError={setError}
          />
        ) : (
          <OrderDetail 
            order={selectedOrder}
            loading={loading}
            error={error}
            onBack={() => setView('list')}
            onTrackingUpdate={handleTrackingUpdate}
            onSendNotification={handleSendNotification}
            onGetOrderTimeline={handleGetOrderTimeline}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
};

export default OrderManagement;