import React, { useState, useEffect } from 'react';
import AdminSidebar from '../SuperAdminSidebar';
import CategoryList from './components/CategoryList';
import AddCategory from './components/AddCategory';
import EditCategory from './components/EditCategory';
import ViewCategory from './components/ViewCategory';
import DeleteCategory from './components/DeleteCategory';
import superAdminCategoryService from '../../services/SuperAdmin/categoryService'; // Updated import
import storeService from '../../services/SuperAdmin/storeService';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiGrid,
  FiTag,
  FiTrendingUp,
  FiActivity,
  FiEye,
  FiTrash2,
  FiEyeOff,
  FiBarChart2
} from 'react-icons/fi';

const CategoryPage = () => {
  const [view, setView] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    recent: 0
  });
  const [categoryStats, setCategoryStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  // Remove store filter state
  // const [selectedStoreFilter, setSelectedStoreFilter] = useState('all');
  // const [stores, setStores] = useState([]);
  // const [storesLoading, setStoresLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchCategoryStats();
    // Remove fetchStores logic
    // const fetchStores = async () => {
    //   try {
    //     const data = await storeService.getAllStores();
    //     let storesArr = [];
    //     if (Array.isArray(data)) {
    //       storesArr = data;
    //     } else if (Array.isArray(data?.data)) {
    //       storesArr = data.data;
    //     } else if (Array.isArray(data?.stores)) {
    //       storesArr = data.stores;
    //     }
    //     setStores(storesArr);
    //     setStoresLoading(false);
    //   } catch (error) {
    //     setStores([]);
    //     setStoresLoading(false);
    //   }
    // };
    // fetchStores();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await superAdminCategoryService.getAllCategoriesWithCache();

      // Updated to handle the new response format
      const categoriesData = response.data?.data || response.data || [];

      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);

        // Calculate stats
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const stats = {
          total: categoriesData.length,
          active: categoriesData.filter(category => category.isActive).length,
          recent: categoriesData.filter(category =>
            new Date(category.createdAt) > oneWeekAgo
          ).length
        };
        setStats(stats);
      } else {
        setCategories([]);
        setStats({ total: 0, active: 0, recent: 0 });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
      setCategories([]);
      setStats({ total: 0, active: 0, recent: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryStats = async () => {
    try {
      const res = await superAdminCategoryService.getCategoryStats();
      setCategoryStats(res.data?.data || null);
    } catch (error) {
      setCategoryStats(null);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await superAdminCategoryService.deleteCategory(categoryId); // Cache auto-refreshes
      toast.success('Category deleted successfully! 🗑️');

      // Since cache auto-refreshes, we can update local state immediately
      setCategories(prevCategories => {
        const updatedCategories = prevCategories.filter(category => category._id !== categoryId);

        // Update stats
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        setStats({
          total: updatedCategories.length,
          active: updatedCategories.filter(category => category.isActive).length,
          recent: updatedCategories.filter(category =>
            new Date(category.createdAt) > oneWeekAgo
          ).length
        });

        return updatedCategories;
      });

      // If the deleted category is currently being viewed, return to list
      if (selectedCategory && selectedCategory._id === categoryId) {
        setView('list');
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      // Refresh categories to ensure sync with server
      fetchCategories();
    }
  };

  const handleCategoryDeleted = (categoryId) => {
    // Update categories list by removing the deleted category
    setCategories(prevCategories => {
      const updatedCategories = prevCategories.filter(category => category._id !== categoryId);

      // Update stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      setStats({
        total: updatedCategories.length,
        active: updatedCategories.filter(category => category.isActive).length,
        recent: updatedCategories.filter(category =>
          new Date(category.createdAt) > oneWeekAgo
        ).length
      });

      return updatedCategories;
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className={`bg-white rounded-2xl p-6 border border-gray-200 transition-all duration-300 group hover:scale-105 hover:shadow-2xl hover:border-transparent cursor-pointer`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-700 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <FiTrendingUp className="text-gray-400 w-4 h-4 mr-1" />
              <span className="text-gray-500 text-sm">{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-black/20`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const NavigationButton = ({ onClick, icon: Icon, children, variant = 'primary' }) => {
    const baseClasses = "flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105";
    const variants = {
      primary: "bg-gradient-to-r from-[#a51d20] to-[#c62828] text-white hover:shadow-lg shadow-md",
      secondary: "bg-white text-[#a51d20] border border-[#f8d7da] hover:bg-[#fbeaea] hover:border-[#e57373] hover:text-[#c62828]"
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variants[variant]}`}
      >
        <Icon className="w-5 h-5 mr-2" />
        {children}
      </button>
    );
  };

  const handleBack = () => {
    setView('list');
    setSelectedCategory(null);
  };

  const handleCategorySuccess = () => {
    setView('list');
    setSelectedCategory(null);
    fetchCategories(); // This will get fresh data since cache auto-refreshes on mutations
  };

  const renderContent = () => {
    switch (view) {
      case 'add':
        return <AddCategory onBack={handleBack} onSuccess={handleCategorySuccess} />;
      case 'edit':
        return <EditCategory category={selectedCategory} onBack={handleBack} onSuccess={handleCategorySuccess} />;
      case 'view':
        return <ViewCategory category={selectedCategory} onBack={handleBack} onEdit={() => setView('edit')} onDelete={deleteCategory} />;
      default:
        return (
          <CategoryList
            categories={categories}
            loading={loading}
            onDelete={deleteCategory}
            onRefresh={fetchCategories}
            onAdd={() => setView('add')}
            onView={(category) => {
              setSelectedCategory(category);
              setView('view');
            }}
            onEdit={(category) => {
              setSelectedCategory(category);
              setView('edit');
            }}
            onDeleteRequest={category => {
              setCategoryToDelete(category);
              setShowDeleteModal(true);
            }}
          />
        );
    }
  };

  // Remove filteredCategories logic
  // const filteredCategories = selectedStoreFilter === 'all'
  //   ? categories
  //   : categories.filter(cat => cat.storeId === selectedStoreFilter);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-50/20">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-600/3 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <div className="p-8">
            {/* Header and Stats - Only show on main list view */}
            {view === 'list' && (
              <>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold text-gray-900">
                      Category Management
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your product categories and organization</p>
                  </div>
                  {/* Remove Store Filter Dropdown */}
                  {/* <div className="flex flex-col md:flex-row items-center gap-4">
                    <select
                      value={selectedStoreFilter}
                      onChange={e => setSelectedStoreFilter(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm min-w-[200px]"
                      disabled={storesLoading}
                    >
                      <option value="all">All Stores</option>
                      {stores.map(store => (
                        <option key={store._id || store.id} value={store._id || store.id}>{store.name || store.storeName || 'Unnamed Store'}</option>
                      ))}
                    </select> */}
                  <div className="flex space-x-4">
                    <NavigationButton
                      onClick={() => setShowStats((prev) => !prev)}
                      icon={showStats ? FiEye : FiEyeOff}
                      variant="secondary"
                    >
                      {showStats ? 'Hide Statistics' : 'Show Statistics'}
                    </NavigationButton>
                    <NavigationButton
                      onClick={() => setView('add')}
                      icon={FiPlus}
                      variant="primary"
                    >
                      Add Category
                    </NavigationButton>
                  </div>
                </div>
                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Categories"
                    value={categoryStats?.totalCategories ?? stats.total}
                    icon={FiTag}
                    color="bg-gradient-to-r from-[#a51d20] to-[#c62828]"
                    trend={`Stores: ${categoryStats?.totalStoresWithCategories ?? '-'}`}
                  />
                  <StatCard
                    title="Active Categories"
                    value={categoryStats?.activeCategories ?? stats.active}
                    icon={FiActivity}
                    color="bg-gradient-to-r from-[#003f25] to-[#16a34a]"
                    trend="Currently visible"
                  />
                  <StatCard
                    title="Inactive Categories"
                    value={categoryStats?.inactiveCategories ?? 0}
                    icon={FiEyeOff}
                    color="bg-gradient-to-r from-[#ffc303] to-[#7c3aed]"
                    trend="Currently hidden"
                  />
                  <StatCard
                    title="Total Items"
                    value={categoryStats?.totalItems ?? 0}
                    icon={FiGrid}
                    color="bg-gradient-to-r from-[#0ea5e9] to-[#6366f1]"
                    trend="Across all categories"
                  />
                </div>
                {/* Store Statistics Table */}
                {showStats && categoryStats && (
                  <div className="mb-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FiBarChart2 className="w-5 h-5 mr-2 text-gray-600" />
                          Store Statistics
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50/50">
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Store Name</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Categories</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Active</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Inactive</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Items</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Avg Items/Category</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {(categoryStats?.storeStatistics || []).map((store) => (
                              <tr key={store._id} className="hover:bg-gray-50/50 transition-colors duration-200">
                                <td className="px-6 py-4">{store.storeName}</td>
                                <td className="px-6 py-4">{store.totalCategories}</td>
                                <td className="px-6 py-4">{store.activeCategories}</td>
                                <td className="px-6 py-4">{store.inactiveCategories}</td>
                                <td className="px-6 py-4">{store.totalItems}</td>
                                <td className="px-6 py-4">{store.avgItemsPerCategory !== undefined ? Number(store.avgItemsPerCategory).toFixed(2) : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {/* Content */}
            <div className={view === 'list' ? "bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg overflow-hidden" : ""}>
              {/* Pass categories directly instead of filteredCategories */}
              {view === 'list'
                ? <CategoryList
                    categories={categories}
                    loading={loading}
                    onDelete={deleteCategory}
                    onRefresh={fetchCategories}
                    onAdd={() => setView('add')}
                    onView={(category) => {
                      setSelectedCategory(category);
                      setView('view');
                    }}
                    onEdit={(category) => {
                      setSelectedCategory(category);
                      setView('edit');
                    }}
                    onDeleteRequest={category => {
                      setCategoryToDelete(category);
                      setShowDeleteModal(true);
                    }}
                  />
                : renderContent()
              }
            </div>
            {/* Delete Category Modal */}
            {showDeleteModal && categoryToDelete && (
              <DeleteCategory
                category={categoryToDelete}
                onClose={() => {
                  setShowDeleteModal(false);
                  setCategoryToDelete(null);
                }}
                onDelete={async (categoryId) => {
                  await deleteCategory(categoryId);
                  setShowDeleteModal(false);
                  setCategoryToDelete(null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;