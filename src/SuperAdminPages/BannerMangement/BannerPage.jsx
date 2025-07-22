import React, { useState, useEffect } from 'react';
import AdminSidebar from '../SuperAdminSidebar';
import BannerList from './components/BannerList';
import AddBanner from './components/AddBanner';
import EditBanner from './components/EditBanner';
import ViewBanner from './components/ViewBanner';
import DeleteBanner from './components/DeleteBanner';
import superAdminBannerService from '../../services/SuperAdmin/BannerService';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiGrid,
  FiImage,
  FiTrendingUp,
  FiActivity,
  FiEye,
  FiTrash2,
  FiEyeOff,
  FiBarChart2,
  FiPieChart,
  FiArrowUp,
  FiArrowDown,
  FiHome,
  FiTag
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
  const [bannerStats, setBannerStats] = useState(null);
  const [showStats, setShowStats] = useState(false); // <-- Add this line

  useEffect(() => {
    fetchBannersAndStats();
  }, []);

  const fetchBannersAndStats = async () => {
    setLoading(true);
    try {
      const [bannersRes, statsRes] = await Promise.all([
        superAdminBannerService.getAllBanners(),
        superAdminBannerService.getBannerStats()
      ]);
      const bannersData = bannersRes.data?.banners || [];
      setBanners(bannersData);
      setBannerStats(statsRes.data?.data || null);

      setStats({
        total: statsRes.data?.data?.totalBanners || bannersData.length,
        active: statsRes.data?.data?.visibleBanners || bannersData.length,
        recent: bannersData.filter(banner => {
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return new Date(banner.createdAt) > oneWeekAgo;
        }).length
      });
    } catch (error) {
      console.error('Error fetching banners or stats:', error);
      toast.error('Failed to fetch banners or stats');
      setBanners([]);
      setBannerStats(null);
      setStats({ total: 0, active: 0, recent: 0 });
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (bannerId) => {
    try {
      await superAdminBannerService.deleteBanner(bannerId);
      toast.success('Banner deleted successfully! 🗑️');

      setBanners(prevBanners => {
        const updatedBanners = prevBanners.filter(banner => banner._id !== bannerId);
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
      if (selectedBanner && selectedBanner._id === bannerId) {
        setView('list');
        setSelectedBanner(null);
      }
      fetchBannersAndStats();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
      fetchBannersAndStats();
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, trendDirection }) => (
    <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/10 cursor-pointer overflow-hidden">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${color}`}></div>
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trendValue && (
                <div className={`ml-3 flex items-center ${trendDirection === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {trendDirection === 'up' ? <FiArrowUp className="w-4 h-4" /> : <FiArrowDown className="w-4 h-4" />}
                  <span className="text-sm font-semibold ml-1">{trendValue}</span>
                </div>
              )}
            </div>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center pt-3 border-t border-gray-100">
            <FiTrendingUp className="text-gray-400 w-4 h-4 mr-2" />
            <span className="text-gray-600 text-sm">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );

  const NavigationButton = ({ onClick, icon: Icon, children, variant = 'primary' }) => {
    const baseClasses = "flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg";
    const variants = {
      primary: "bg-gradient-to-r from-[#a51d20] to-[#c62828] text-white hover:shadow-xl hover:shadow-red-500/25",
      secondary: "bg-white text-[#a51d20] border-2 border-[#f8d7da] hover:bg-[#fbeaea] hover:border-[#e57373] hover:text-[#c62828] hover:shadow-xl"
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

  const StatsTable = ({ title, headers, data, renderRow }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FiBarChart2 className="w-5 h-5 mr-2 text-gray-600" />
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50/50">
              {headers.map((header, index) => (
                <th key={index} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors duration-200">
                {renderRow(item)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TypeBadge = ({ type }) => {
    const colors = {
      featured: 'bg-blue-100 text-blue-800 border-blue-200',
      promotional: 'bg-purple-100 text-purple-800 border-purple-200',
      seasonal: 'bg-orange-100 text-orange-800 border-orange-200',
      default: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors[type] || colors.default}`}>
        <FiTag className="w-3 h-3 mr-1" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const handleBack = () => {
    setView('list');
    setSelectedBanner(null);
  };

  const handleBannerSuccess = () => {
    setView('list');
    setSelectedBanner(null);
    fetchBannersAndStats();
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
            onRefresh={fetchBannersAndStats}
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
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Enhanced animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/6 w-80 h-80 bg-gradient-to-r from-red-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-500/3 to-cyan-500/3 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      <div className="relative z-10 flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 ml-64">
          <div className="p-8">
            {/* Header and Stats - Only show on main list view */}
            {view === 'list' && (
              <>
                {/* Enhanced Header */}
                <div className="flex justify-between items-center mb-10">
                  <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-gray-900">
                      Banner Management
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your Banners and promotions</p>
                  </div>
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
                      Add Banner
                    </NavigationButton>
                  </div>
                </div>
                {/* Enhanced Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <StatCard
                    title="Total Banners"
                    value={bannerStats?.totalBanners ?? stats.total}
                    icon={FiImage}
                    color="bg-gradient-to-br from-[#a51d20] to-[#c62828]"
                    trend={`Active stores: ${bannerStats?.totalStoresWithBanners ?? '-'}`}
                    trendValue={bannerStats ? `+${bannerStats.totalBanners}` : ''}
                    trendDirection="up"
                  />
                  <StatCard
                    title="Visible Banners"
                    value={bannerStats?.visibleBanners ?? stats.active}
                    icon={FiEye}
                    color="bg-gradient-to-br from-emerald-500 to-green-600"
                    trend="Currently active"
                    trendValue={bannerStats && bannerStats.totalBanners ? `${Math.round((bannerStats.visibleBanners / bannerStats.totalBanners) * 100)}%` : ''}
                    trendDirection="up"
                  />
                  <StatCard
                    title="Hidden Banners"
                    value={bannerStats?.hiddenBanners ?? 0}
                    icon={FiEyeOff}
                    color="bg-gradient-to-br from-amber-500 to-orange-600"
                    trend="Inactive banners"
                  />
                </div>
                {showStats && bannerStats && (
                  <div className="space-y-8">
                    {/* Banner Type Statistics */}
                    <StatsTable
                      title="Banner Type Statistics"
                      headers={['Type', 'Total', 'Visible', 'Hidden', 'Stores']}
                      data={Object.entries(bannerStats.typeStatistics || {})}
                      renderRow={([type, stats]) => (
                        <>
                          <td className="px-6 py-4">
                            <TypeBadge type={type} />
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                              {stats.total}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                              {stats.visible}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-800 text-sm font-semibold">
                              {stats.hidden}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <FiHome className="w-4 h-4 text-gray-500 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{stats.storeCount}</span>
                            </div>
                          </td>
                        </>
                      )}
                    />
                    {/* Store Statistics */}
                    <StatsTable
                      title="Store Statistics"
                      headers={['Store Name', 'Total Banners', 'Visible', 'Hidden', 'Banner Types']}
                      data={bannerStats.storeStatistics || []}
                      renderRow={(store) => (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                                <FiHome className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{store.storeName}</div>
                                <div className="text-xs text-gray-500">Store ID: {store._id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-12 h-2 bg-gray-200 rounded-full mr-3">
                                <div
                                  className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                  style={{ width: `${(store.totalBanners / 5) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{store.totalBanners}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              {store.visibleBanners}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                              <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                              {store.hiddenBanners}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {(store.bannerTypes || []).map((type, index) => (
                                <TypeBadge key={index} type={type} />
                              ))}
                            </div>
                          </td>
                        </>
                      )}
                    />
                  </div>
                )}
              </>
            )}
            {/* Content */}
            <div className={view === 'list' ? "bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl overflow-hidden mt-8" : ""}>
              {renderContent()}
            </div>
            {/* Enhanced Delete Modal */}
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