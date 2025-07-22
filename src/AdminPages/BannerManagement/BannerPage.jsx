import React, { useState, useEffect } from 'react';
import AdminSidebar from '../Sidebar';
import BannerList from './components/BannerList';
import AddBanner from './components/AddBanner';
import EditBanner from './components/EditBanner';
import ViewBanner from './components/ViewBanner';
import DeleteBanner from './components/DeleteBanner';
import bannerService from '../../services/Admin/bannerService';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiGrid, 
  FiImage,
  FiTrendingUp,
  FiActivity,
  FiEye,
  FiTrash2
} from 'react-icons/fi';

const BannerPage = () => {
  const [view, setView] = useState('list');
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    recent: 0
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerService.getAllBanners();
      
      // Handle different response formats
      const bannersData = response.data?.data?.data || response.data?.data || response.data || [];
      
      if (Array.isArray(bannersData)) {
        setBanners(bannersData);
        
        // Calculate stats
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const stats = {
          total: bannersData.length,
          active: bannersData.length, // All banners are considered active
          recent: bannersData.filter(banner => 
            new Date(banner.createdAt) > oneWeekAgo
          ).length
        };
        setStats(stats);
      } else {
        setBanners([]);
        setStats({ total: 0, active: 0, recent: 0 });
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to fetch banners');
      setBanners([]);
      setStats({ total: 0, active: 0, recent: 0 });
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (bannerId) => {
    try {
      await bannerService.deleteBanner(bannerId);
      toast.success('Banner deleted successfully! 🗑️');

      setBanners(prevBanners => {
        const updatedBanners = prevBanners.filter(banner => banner._id !== bannerId);

        // Update stats
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        setStats({
          total: updatedBanners.length,
          active: updatedBanners.length,
          recent: updatedBanners.filter(banner => 
            new Date(banner.createdAt) > oneWeekAgo
          ).length
        });

        return updatedBanners;
      });

      // If the deleted banner is currently being viewed, return to list
      if (selectedBanner && selectedBanner._id === bannerId) {
        setView('list');
        setSelectedBanner(null);
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
      // Refresh banners to ensure sync with server
      fetchBanners();
    }
  };

  const handleBannerDeleted = (bannerId) => {
    // Update banners list by removing the deleted banner
    setBanners(prevBanners => {
      const updatedBanners = prevBanners.filter(banner => banner._id !== bannerId);
      
      // Update stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      setStats({
        total: updatedBanners.length,
        active: updatedBanners.length,
        recent: updatedBanners.filter(banner => 
          new Date(banner.createdAt) > oneWeekAgo
        ).length
      });
      
      return updatedBanners;
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
    setSelectedBanner(null);
  };

  const handleBannerSuccess = () => {
    setView('list');
    setSelectedBanner(null);
    fetchBanners();
  };

  const renderContent = () => {
    switch (view) {
      case 'add':
        return <AddBanner onBack={handleBack} onSuccess={handleBannerSuccess} />;
      case 'edit':
        return <EditBanner banner={selectedBanner} onBack={handleBack} onSuccess={handleBannerSuccess} />;
      case 'view':
        return <ViewBanner banner={selectedBanner} onBack={handleBack} onEdit={() => setView('edit')} onDeleteRequest={(banner) => { setBannerToDelete(banner); setShowDeleteModal(true); }} />;
      default:
        return (
          <BannerList
            banners={banners}
            loading={loading}
            onDelete={deleteBanner}
            onDeleteRequest={(banner) => { setBannerToDelete(banner); setShowDeleteModal(true); }}
            onRefresh={fetchBanners}
            onAdd={() => setView('add')}
            onView={(banner) => {
              setSelectedBanner(banner);
              setView('view');
            }}
            onEdit={(banner) => {
              setSelectedBanner(banner);
              setView('edit');
            }}
          />
        );
    }
  };

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
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">
                      Banner Management
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your website banners and promotional content</p>
                  </div>
                  <div className="flex space-x-4">
                    <NavigationButton 
                      onClick={() => setView('add')}
                      icon={FiPlus}
                      variant="primary"
                    >
                      Add Banner
                    </NavigationButton>
                  </div>
                </div>
                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatCard
                    title="Total Banners"
                    value={stats.total}
                    icon={FiImage}
                    color="bg-gradient-to-r from-[#a51d20] to-[#c62828]"
                    trend="+12% this month"
                  />
                  <StatCard
                    title="Active Banners"
                    value={stats.active}
                    icon={FiActivity}
                    color="bg-gradient-to-r from-[#003f25] to-[#16a34a]"
                    trend="All displaying"
                  />
                  <StatCard
                    title="Recent Uploads"
                    value={stats.recent}
                    icon={FiEye}
                    color="bg-gradient-to-r from-[#ffc303] to-[#7c3aed]"
                    trend="This week"
                  />
                </div>
              </>
            )}
            {/* Content */}
            <div className={view === 'list' ? "bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg overflow-hidden" : ""}>
              {renderContent()}
            </div>
            {/* Delete Banner Modal */}
            {showDeleteModal && bannerToDelete && (
              <DeleteBanner
                banner={bannerToDelete}
                onClose={() => { setShowDeleteModal(false); setBannerToDelete(null); }}
                onDelete={() => {
                  deleteBanner(bannerToDelete._id);
                  setShowDeleteModal(false);
                  setBannerToDelete(null);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerPage;