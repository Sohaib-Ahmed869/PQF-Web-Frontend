import React, { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import abandonedCartService from '../../services/Admin/abandonedCartService';
import AdminSidebar from '../Sidebar';
import AbandonedCartList from './components/AbandonedCartList';

const AbandonedCartManagement = () => {
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch abandoned carts on component mount
  useEffect(() => {
    fetchAbandonedCarts();
  }, []);

  const fetchAbandonedCarts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await abandonedCartService.getAbandonedCarts();
      if (response.success) {
        setAbandonedCarts(response.data || []);
      } else {
        setError('Failed to fetch abandoned carts');
        setAbandonedCarts([]);
      }
    } catch (error) {
      console.error('Error fetching abandoned carts:', error);
      setError(error.message || 'Failed to fetch abandoned carts');
      setAbandonedCarts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAbandonedCarts();
  };

  const handleViewDetails = (cart) => {
    console.log('View cart details:', cart);
    // You can implement navigation to a detailed view here
  };

  const handleSendReminder = async (cart) => {
    try {
      console.log('Sending reminder for cart:', cart);
      
      const reminderData = {
        email: cart.user?.email,
        message: `Hi ${cart.user?.name || 'there'}, we noticed you left some items in your cart. Don't miss out on these great products!`
      };
      
      const response = await abandonedCartService.sendReminder(cart._id, reminderData);
      
      if (response.success) {
        console.log('Reminder sent successfully');
        // You could add a toast notification here
        // toast.success('Reminder sent successfully');
      } else {
        console.error('Failed to send reminder:', response.message);
        setError('Failed to send reminder');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      setError('Failed to send reminder');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto relative lg:ml-64">
        <AbandonedCartList
          abandonedCarts={abandonedCarts}
          abandonedLoading={loading}
          abandonedError={error}
          onRefresh={handleRefresh}
          onViewDetails={handleViewDetails}
          onSendReminder={handleSendReminder}
        />
      </div>
    </div>
  );
};

export default AbandonedCartManagement;