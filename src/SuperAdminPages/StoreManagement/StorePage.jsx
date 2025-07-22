import React, { useState, useEffect } from 'react';
import AdminSidebar from '../SuperAdminSidebar';
import StoreList from './components/StoreList';
import AddStore from './components/AddStore';
import EditStore from './components/EditStore';
import ViewStore from './components/ViewStore';
import AssignAdmin from './components/AssignAdmin';
import storeService from '../../services/SuperAdmin/storeService';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiShoppingBag,
  FiTrendingUp,
  FiActivity,
  FiUsers,
  FiMapPin
} from 'react-icons/fi';

const StorePage = () => {
  const [view, setView] = useState('list');
  const [selectedStore, setSelectedStore] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    maintenance: 0
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await storeService.getAllStores();
      
      const storesData = response.stores || [];
      setStores(storesData);
      
      // Calculate stats
      const stats = {
        total: storesData.length,
        active: storesData.filter(store => store.status === 'active').length,
        inactive: storesData.filter(store => store.status === 'inactive').length,
        maintenance: storesData.filter(store => store.status === 'maintenance').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to fetch stores');
      setStores([]);
      setStats({ total: 0, active: 0, inactive: 0, maintenance: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleStoreDeleted = (storeId) => {
    setStores(prevStores => {
      const updatedStores = prevStores.filter(store => store._id !== storeId);
      
      // Update stats
      const newStats = {
        total: updatedStores.length,
        active: updatedStores.filter(store => store.status === 'active').length,
        inactive: updatedStores.filter(store => store.status === 'inactive').length,
        maintenance: updatedStores.filter(store => store.status === 'maintenance').length
      };
      setStats(newStats);
      
      return updatedStores;
    });
  };

  const handleStoreStatusUpdate = (storeId, newStatus) => {
    setStores(prevStores => {
      const updatedStores = prevStores.map(store => 
        store._id === storeId ? { ...store, status: newStatus } : store
      );
      
      // Update stats
      const newStats = {
        total: updatedStores.length,
        active: updatedStores.filter(store => store.status === 'active').length,
        inactive: updatedStores.filter(store => store.status === 'inactive').length,
        maintenance: updatedStores.filter(store => store.status === 'maintenance').length
      };
      setStats(newStats);
      
      return updatedStores;
    });
  };

  const handleAdminChange = (storeId, updatedAdmins) => {
    setStores(prevStores =>
      prevStores.map(store =>
        store._id === storeId ? { ...store, admins: updatedAdmins } : store
      )
    );
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
    setSelectedStore(null);
  };

  const handleStoreSuccess = () => {
    setView('list');
    setSelectedStore(null);
    fetchStores();
  };

  const renderContent = () => {
    switch (view) {
      case 'add':
        return <AddStore onBack={handleBack} onSuccess={handleStoreSuccess} />;
      case 'edit':
        return <EditStore store={selectedStore} onBack={handleBack} onSuccess={handleStoreSuccess} />;
      case 'view':
        return (
          <ViewStore 
            store={selectedStore} 
            onBack={handleBack} 
            onEdit={() => setView('edit')}
            onDelete={handleStoreDeleted}
            onStatusUpdate={handleStoreStatusUpdate}
          />
        );
      case 'assign':
        return (
          <AssignAdmin 
            store={selectedStore} 
            onBack={handleBack} 
            onSuccess={handleStoreSuccess}
            onAdminChange={handleAdminChange}
          />
        );
      default:
        return (
          <StoreList
            stores={stores}
            loading={loading}
            onRefresh={fetchStores}
            onAdd={() => setView('add')}
            onView={(store) => {
              setSelectedStore(store);
              setView('view');
            }}
            onEdit={(store) => {
              setSelectedStore(store);
              setView('edit');
            }}
            onAssignAdmin={(store) => {
              setSelectedStore(store);
              setView('assign');
            }}
            onDelete={handleStoreDeleted}
            onStatusUpdate={handleStoreStatusUpdate}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header and Stats - Only show on main list view */}
          {view === 'list' && (
            <>
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    Store Management
                  </h1>
                  <p className="text-gray-600 mt-2">Manage stores across your network</p>
                </div>
                
                <div className="flex space-x-4">
                  <NavigationButton 
                    onClick={() => setView('add')}
                    icon={FiPlus}
                    variant="primary"
                  >
                    Add Store
                  </NavigationButton>
                </div>
              </div>

              {/* Stats Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Total Stores"
                  value={stats.total}
                  icon={FiShoppingBag}
                  color="bg-gradient-to-r from-[#a51d20] to-[#c62828]"
                  trend="+12% this month"
                />
                <StatCard
                  title="Active Stores"
                  value={stats.active}
                  icon={FiActivity}
                  color="bg-gradient-to-r from-[#003f25] to-[#16a34a]"
                  trend="Currently open"
                />
                <StatCard
                  title="Inactive Stores"
                  value={stats.inactive}
                  icon={FiUsers}
                  color="bg-gradient-to-r from-[#f59e42] to-[#ea580c]"
                  trend="Temporarily closed"
                />
                <StatCard
                  title="Under Maintenance"
                  value={stats.maintenance}
                  icon={FiMapPin}
                  color="bg-gradient-to-r from-[#ffc303] to-[#7c3aed]"
                  trend="Being updated"
                />
              </div>
            </>
          )}

          {/* Content */}
          <div className={view === 'list' ? "bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden" : ""}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePage;