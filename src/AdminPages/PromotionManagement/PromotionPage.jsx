import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import promotionService from '../../services/promotionService';
import AddPromotion from './components/AddPromotion';
import PromotionList from './components/PromotionList';
import EditPromotion from './components/EditPromotion';
import ViewPromotion from './components/ViewPromotion';
import DeletePromotion from './components/DeletePromotion';
import AdminSidebar from '../Sidebar';
import LoaderOverlay from '../../components/LoaderOverlay';

const PromotionPage = () => {
  const { user, token } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    currentPage: 1,
    itemsPerPage: 9,
    selectedStatus: 'all',
    selectedType: 'all',
    sortBy: 'newest',
    showFilters: false,
    viewMode: 'grid'
  });

  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    expired: 0,
    totalUsage: 0,
    avgUsage: 0
  });

  useEffect(() => {
    fetchPromotions();
  }, [filters.currentPage, filters.itemsPerPage, filters.sortBy]);

  // Calculate stats when promotions change
  useEffect(() => {
    calculateStats(promotions);
  }, [promotions]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build filter params, only including defined values
      const filterParams = {};
      
      // Add store parameter if user has assigned store
      if (user?.assignedStore) {
        // Handle both cases: assignedStore as object with _id or as string
        const storeId = user.assignedStore._id || user.assignedStore;
        if (storeId) {
          filterParams.store = storeId;
        }
      }
      
      // Map status to isActive for backend
      if (filters.selectedStatus !== 'all') {
        if (filters.selectedStatus === 'active') {
          filterParams.isActive = 'true';
        } else if (filters.selectedStatus === 'inactive') {
          filterParams.isActive = 'false';
        }
        // For 'expired' status, we'll handle it on the frontend
      }
      
      if (filters.selectedType !== 'all') {
        filterParams.type = filters.selectedType;
      }
      
      // Note: Backend doesn't support search parameter yet, so we'll handle it on frontend
      // if (filters.searchTerm && filters.searchTerm.trim()) {
      //   filterParams.search = filters.searchTerm.trim();
      // }
      
      const pagination = {
        page: filters.currentPage,
        limit: filters.itemsPerPage,
      };
      
      // Note: Backend doesn't support custom sorting yet, so we'll handle it on frontend
      // const sorting = {
      //   field: filters.sortBy === 'newest' ? 'createdAt' : 
      //          filters.sortBy === 'oldest' ? 'createdAt' :
      //          filters.sortBy === 'name' ? 'name' :
      //          filters.sortBy === 'usage-high' ? 'currentUsage' :
      //          filters.sortBy === 'usage-low' ? 'currentUsage' : 'createdAt',
      //   order: filters.sortBy === 'oldest' || filters.sortBy === 'usage-low' ? 'asc' : 'desc',
      // };
      
      const response = await promotionService.getPromotions(token, { ...filterParams, ...pagination });
      
      if (response.data.success) {
        let promotionsData = response.data.data || [];
        
        // Handle search filtering on frontend
        if (filters.searchTerm && filters.searchTerm.trim()) {
          const searchTerm = filters.searchTerm.toLowerCase().trim();
          promotionsData = promotionsData.filter(promotion => 
            promotion.name?.toLowerCase().includes(searchTerm) ||
            promotion.description?.toLowerCase().includes(searchTerm) ||
            promotion.code?.toLowerCase().includes(searchTerm)
          );
        }
        
        // Handle expired status filtering on frontend
        if (filters.selectedStatus === 'expired') {
          const now = new Date();
          promotionsData = promotionsData.filter(promotion => {
            const endDate = new Date(promotion.endDate);
            return now > endDate;
          });
        }
        
        // Handle sorting on frontend
        if (filters.sortBy) {
          promotionsData.sort((a, b) => {
            switch (filters.sortBy) {
              case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
              case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
              case 'name':
                return (a.name || '').localeCompare(b.name || '');
              case 'usage-high':
                return (b.currentUsage || 0) - (a.currentUsage || 0);
              case 'usage-low':
                return (a.currentUsage || 0) - (b.currentUsage || 0);
              default:
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
          });
        }
        
        setPromotions(promotionsData);
      } else {
        setError(response.data.error || 'Failed to fetch promotions');
        setPromotions([]);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setError(error.response?.data?.error || 'Failed to fetch promotions');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (promotionsData) => {
    const now = new Date();
    const newStats = {
      total: promotionsData.length,
      active: promotionsData.filter(promo => {
        const startDate = new Date(promo.startDate);
        const endDate = new Date(promo.endDate);
        return promo.isActive && now >= startDate && now <= endDate;
      }).length,
      inactive: promotionsData.filter(promo => !promo.isActive).length,
      expired: promotionsData.filter(promo => {
        const endDate = new Date(promo.endDate);
        return now > endDate;
      }).length,
      totalUsage: promotionsData.reduce((sum, promo) => sum + (promo.currentUsage || 0), 0),
      avgUsage: promotionsData.length > 0 ? promotionsData.reduce((sum, promo) => sum + (promo.currentUsage || 0), 0) / promotionsData.length : 0
    };
    setStats(newStats);
  };

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, currentPage: 1 }));
      fetchPromotions();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm, filters.selectedStatus, filters.selectedType]);

  const handleAddPromotion = () => {
    setSelectedPromotion(null);
    setCurrentView('add');
  };

  const handleEditPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    setCurrentView('edit');
  };

  const handleViewPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    setCurrentView('view');
  };

  const handleDeletePromotion = (promotion) => {
    setSelectedPromotion(promotion);
    setCurrentView('delete');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPromotion(null);
    fetchPromotions();
  };

  const handleRefresh = () => {
    fetchPromotions();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setFilters(prev => ({ ...prev, itemsPerPage, currentPage: 1 }));
  };

  const handleSearchChange = (searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  };

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const handleViewModeChange = (viewMode) => {
    setFilters(prev => ({ ...prev, viewMode }));
  };

  const handleFiltersToggle = () => {
    setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto relative lg:ml-64 pt-8">
        {currentView === 'list' ? (
          <PromotionList
            promotions={promotions}
            loading={loading}
            error={error}
            stats={stats}
            filters={filters}
            setFilters={setFilters}
            onRefresh={handleRefresh}
            onEdit={handleEditPromotion}
            onView={handleViewPromotion}
            onDelete={handleDeletePromotion}
            onAdd={handleAddPromotion}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            onViewModeChange={handleViewModeChange}
            onFiltersToggle={handleFiltersToggle}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            setError={setError}
          />
        ) : currentView === 'add' ? (
          <AddPromotion
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        ) : currentView === 'edit' && selectedPromotion ? (
          <EditPromotion
            promotion={selectedPromotion}
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        ) : currentView === 'view' && selectedPromotion ? (
          <ViewPromotion
            promotion={selectedPromotion}
            onBack={handleBackToList}
          />
        ) : currentView === 'delete' && selectedPromotion ? (
          <DeletePromotion
            promotion={selectedPromotion}
            onBack={handleBackToList}
            onSuccess={handleBackToList}
          />
        ) : null}
      </div>
    </div>
  );
};

export default PromotionPage; 