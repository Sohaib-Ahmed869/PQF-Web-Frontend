import React, { useState, useEffect } from 'react';
import { 
  FiArrowLeft, 
  FiEdit3, 
  FiTrash2, 
  FiShoppingBag,
  FiCalendar,
  FiEye,
  FiMapPin,
  FiPhone,
  FiMail,
  FiGlobe,
  FiClock,
  FiSettings,
  FiUsers,
  FiToggleLeft,
  FiToggleRight,
  FiUserPlus,
  FiX,
  FiDollarSign,
  FiCheck,
  FiTruck,
  FiShoppingCart,
  FiPackage,
} from 'react-icons/fi';
import DeleteStore from './DeleteStore';

const ViewStore = ({ store, onBack, onDelete, onEdit, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [animatedCards, setAnimatedCards] = useState({});
  const toast = {
    success: (msg) => console.log('Success:', msg),
    error: (msg) => console.log('Error:', msg)
  };

  const storeService = {
    deleteStore: async (id) => new Promise(resolve => setTimeout(resolve, 1000)),
    updateStoreStatus: async (id, status) => new Promise(resolve => setTimeout(resolve, 1000))
  };

  useEffect(() => {
    // Animate cards on mount
    const cards = document.querySelectorAll('.animate-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        setAnimatedCards(prev => ({ ...prev, [index]: true }));
      }, index * 100);
    });
  }, []);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      try {
        setLoading(true);
        await storeService.deleteStore(store._id);
        toast.success('Store deleted successfully');
        onDelete && onDelete(store._id);
        onBack && onBack();
      } catch (error) {
        console.error('Error deleting store:', error);
        toast.error('Failed to delete store');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = store.status === 'active' ? 'inactive' : 'active';
    
    try {
      setLoading(true);
      await storeService.updateStoreStatus(store._id, newStatus);
      toast.success(`Store ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      onStatusUpdate && onStatusUpdate(store._id, newStatus);
    } catch (error) {
      console.error('Error updating store status:', error);
      toast.error('Failed to update store status');
    } finally {
      setLoading(false);
    }
  };

  const InfoCard = ({ title, value, icon: Icon, color = "red", subtitle, children, className = "", index = 0 }) => (
    <div className={`animate-card bg-white rounded-3xl border border-gray-200 p-6 hover:border-red-200 hover:shadow-2xl hover:shadow-red-100/20 transition-all duration-500 transform hover:-translate-y-1 ${animatedCards[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
         style={{ transitionDelay: `${index * 50}ms` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shadow-sm transform transition-transform duration-300 hover:scale-110`}
               style={{ background: `linear-gradient(135deg, #8e191c10, #8e191c20)` }}>
            <Icon className="w-5 h-5" style={{ color: '#8e191c' }} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#8e191c' }}></div>
      </div>
      <div className="space-y-2">
        {value && <p className="text-gray-700">{value}</p>}
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        {children}
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatBusinessHours = (hours) => {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return daysOfWeek.map(day => {
      const dayHours = hours[day];
      if (dayHours?.closed) {
        return `${day.charAt(0).toUpperCase() + day.slice(1)}: Closed`;
      }
      return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${dayHours?.open || '09:00'} - ${dayHours?.close || '18:00'}`;
    });
  };

  // Sample store data for demo
  const sampleStore = {
    _id: "670123456789abcdef123456",
    name: "Downtown Retail Store",
    description: "A modern retail store offering the best products in the heart of the city",
    status: "active",
    location: {
      address: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA"
      },
      coordinates: {
        latitude: "40.7128",
        longitude: "-74.0060"
      }
    },
    contact: {
      phone: "+1 (555) 123-4567",
      email: "info@downtownstore.com",
      website: "https://www.downtownstore.com"
    },
    businessHours: {
      monday: { open: "09:00", close: "18:00" },
      tuesday: { open: "09:00", close: "18:00" },
      wednesday: { open: "09:00", close: "18:00" },
      thursday: { open: "09:00", close: "20:00" },
      friday: { open: "09:00", close: "20:00" },
      saturday: { open: "10:00", close: "19:00" },
      sunday: { closed: true }
    },
    settings: {
      currency: "USD",
      language: "en"
    },
    features: {
      onlineOrdering: true,
      delivery: true,
      pickup: true
    },
    admins: [
      { _id: "1", name: "John Smith", email: "john@store.com" },
      { _id: "2", name: "Sarah Johnson", email: "sarah@store.com" }
    ],
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-07-16T12:30:00Z"
  };

  const currentStore = store || sampleStore;

  if (!currentStore) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <FiShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Store not found</h3>
          <p className="text-gray-500">The store you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2 relative overflow-hidden">
      {/* Animated background elements (like AddStore) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8e191c]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#a51d20]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-8 animate-card">
          <div className="flex items-center space-x-6">
            <button
              onClick={onBack}
              className="flex items-center px-6 py-3 text-sm font-medium text-gray-600 bg-white border-2 border-gray-200 rounded-2xl hover:shadow-lg hover:shadow-red-100/30 transition-all duration-300 transform hover:-translate-y-0.5"
              style={{ borderColor: '#8e191c20' }}
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {currentStore.name}
              </h1>
              <p className="text-gray-600 mt-2 text-lg flex items-center">
                <FiEye className="w-4 h-4 mr-2" style={{ color: '#8e191c' }} />
                Store Details & Management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="animate-pulse">
              <span className={`px-6 py-3 rounded-full text-sm font-medium border-2 shadow-lg ${getStatusColor(currentStore.status)}`}>
                {currentStore.status.charAt(0).toUpperCase() + currentStore.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Main Information */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Basic Information */}
            <InfoCard
              title="Store Information"
              icon={FiShoppingBag}
              index={0}
            >
              <div className="space-y-4">
                <div className="group">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Store Name</span>
                  <p className="text-xl font-bold text-gray-900 group-hover:text-red-700 transition-colors duration-300">
                    {currentStore.name}
                  </p>
                </div>
                {currentStore.description && (
                  <div className="group">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Description</span>
                    <p className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                      {currentStore.description}
                    </p>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Location Information */}
            <InfoCard
              title="Location Details"
              icon={FiMapPin}
              index={1}
            >
              <div className="space-y-4">
                <div className="group">
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</span>
                  <div className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                    <p className="font-medium">{currentStore.location?.address?.street}</p>
                    <p>{currentStore.location?.address?.city}, {currentStore.location?.address?.state} {currentStore.location?.address?.zipCode}</p>
                    <p>{currentStore.location?.address?.country}</p>
                  </div>
                </div>
                {currentStore.location?.coordinates && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="group">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Latitude</span>
                      <p className="text-gray-700 font-mono bg-gray-50 px-3 py-2 rounded-lg group-hover:bg-red-50 transition-colors duration-300">
                        {currentStore.location.coordinates.latitude}
                      </p>
                    </div>
                    <div className="group">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Longitude</span>
                      <p className="text-gray-700 font-mono bg-gray-50 px-3 py-2 rounded-lg group-hover:bg-red-50 transition-colors duration-300">
                        {currentStore.location.coordinates.longitude}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Contact Information */}
            <InfoCard
              title="Contact Information"
              icon={FiPhone}
              index={2}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-red-50 transition-colors duration-300 group">
                  <FiPhone className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors duration-300" />
                  <span className="text-gray-700 group-hover:text-gray-900 font-medium">{currentStore.contact?.phone}</span>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-red-50 transition-colors duration-300 group">
                  <FiMail className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors duration-300" />
                  <span className="text-gray-700 group-hover:text-gray-900 font-medium">{currentStore.contact?.email}</span>
                </div>
                {currentStore.contact?.website && (
                  <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-red-50 transition-colors duration-300 group">
                    <FiGlobe className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors duration-300" />
                    <a 
                      href={currentStore.contact.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-red-600 transition-colors duration-300 font-medium"
                    >
                      {currentStore.contact.website}
                    </a>
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Business Hours */}
            <InfoCard
              title="Business Hours"
              icon={FiClock}
              index={3}
            >
              <div className="space-y-3">
                {currentStore.businessHours && formatBusinessHours(currentStore.businessHours).map((day, index) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-red-50 transition-colors duration-300 group">
                    <span className="text-gray-700 group-hover:text-gray-900 font-medium">{day.split(':')[0]}:</span>
                    <span className="text-gray-600 group-hover:text-red-600 font-medium">{day.split(': ')[1]}</span>
                  </div>
                ))}
              </div>
            </InfoCard>

            {/* Store Settings */}
            <InfoCard
              title="Store Settings"
              icon={FiSettings}
              index={4}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-red-50 transition-colors duration-300 group">
                    <FiDollarSign className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors duration-300" />
                    <div>
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide block">Currency</span>
                      <span className="text-gray-700 group-hover:text-gray-900 font-bold text-lg">{currentStore.settings?.currency || 'USD'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-red-50 transition-colors duration-300 group">
                    <FiGlobe className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors duration-300" />
                    <div>
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide block">Language</span>
                      <span className="text-gray-700 group-hover:text-gray-900 font-bold text-lg">{currentStore.settings?.language || 'EN'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* Store Features */}
            <InfoCard
              title="Store Features"
              icon={FiCheck}
              index={5}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all duration-300 group">
                  <FiShoppingCart className="w-6 h-6 text-gray-500 group-hover:text-red-600 transition-colors duration-300" />
                  <div>
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide block">Online Ordering</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${currentStore.features?.onlineOrdering ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                      <span className="text-gray-700 font-medium">
                        {currentStore.features?.onlineOrdering ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all duration-300 group">
                  <FiTruck className="w-6 h-6 text-gray-500 group-hover:text-red-600 transition-colors duration-300" />
                  <div>
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide block">Delivery</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${currentStore.features?.delivery ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                      <span className="text-gray-700 font-medium">
                        {currentStore.features?.delivery ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all duration-300 group">
                  <FiPackage className="w-6 h-6 text-gray-500 group-hover:text-red-600 transition-colors duration-300" />
                  <div>
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide block">Pickup</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${currentStore.features?.pickup ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                      <span className="text-gray-700 font-medium">
                        {currentStore.features?.pickup ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </InfoCard>
          </div>

          {/* Right Column - Actions and Stats */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Quick Stats */}
              <div className="animate-card bg-white rounded-3xl border-2 border-gray-200 p-6 hover:border-red-200 hover:shadow-2xl hover:shadow-red-100/20 transition-all duration-500 transform hover:-translate-y-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="w-2 h-2 rounded-full mr-3 animate-pulse" style={{ backgroundColor: '#8e191c' }}></div>
                  Quick Stats
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg hover:bg-red-50 transition-colors duration-300 group">
                    <span className="text-gray-600 group-hover:text-gray-900">Status</span>
                    <span className={`px-4 py-2 rounded-full text-xs font-bold border-2 shadow-sm ${getStatusColor(currentStore.status)}`}>
                      {currentStore.status.charAt(0).toUpperCase() + currentStore.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg hover:bg-red-50 transition-colors duration-300 group">
                    <span className="text-gray-600 group-hover:text-gray-900">Admins</span>
                    <span className="text-gray-900 font-bold text-lg">{currentStore.admins?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg hover:bg-red-50 transition-colors duration-300 group">
                    <span className="text-gray-600 group-hover:text-gray-900">Created</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(currentStore.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg hover:bg-red-50 transition-colors duration-300 group">
                    <span className="text-gray-600 group-hover:text-gray-900">Updated</span>
                    <span className="text-gray-900 font-medium">
                      {new Date(currentStore.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Store Admins */}
              {currentStore.admins && currentStore.admins.length > 0 && (
                <div className="animate-card bg-white rounded-3xl border-2 border-gray-200 p-6 hover:border-red-200 hover:shadow-2xl hover:shadow-red-100/20 transition-all duration-500 transform hover:-translate-y-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3 animate-pulse" style={{ backgroundColor: '#8e191c' }}></div>
                    Store Admins
                  </h4>
                  <div className="space-y-4">
                    {currentStore.admins.map(admin => (
                      <div key={admin._id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-red-50 transition-all duration-300 group transform hover:scale-105">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                             style={{ background: `linear-gradient(135deg, #8e191c20, #8e191c40)` }}>
                          <FiUsers className="w-5 h-5" style={{ color: '#8e191c' }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 group-hover:text-red-700 transition-colors duration-300">{admin.name}</p>
                          <p className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors duration-300">{admin.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="animate-card bg-white rounded-3xl border-2 border-gray-200 p-6 hover:border-red-200 hover:shadow-2xl hover:shadow-red-100/20 transition-all duration-500 transform hover:-translate-y-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="w-2 h-2 rounded-full mr-3 animate-pulse" style={{ backgroundColor: '#8e191c' }}></div>
                  Quick Actions
                </h4>
                
                <div className="space-y-4">
                  <button
                    onClick={() => onEdit && onEdit(currentStore)}
                    className="w-full p-4 bg-blue-600/10 border-2 border-blue-500/20 rounded-2xl hover:bg-blue-600/20 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 text-center group flex items-center justify-center transform hover:-translate-y-1"
                  >
                    <FiEdit3 className="w-5 h-5 text-blue-600 mr-3 group-hover:scale-125 transition-transform duration-300" />
                    <span className="text-blue-600 font-bold text-lg">Edit Store</span>
                  </button>

                  
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full p-4 bg-red-600/10 border-2 border-red-500/20 rounded-2xl hover:bg-red-600/20 hover:border-red-500/40 hover:shadow-xl hover:shadow-red-100/50 transition-all duration-300 text-center group flex items-center justify-center transform hover:-translate-y-1"
                  >
                    <FiTrash2 className="w-5 h-5 text-red-600 mr-3 group-hover:scale-125 transition-transform duration-300" />
                    <span className="text-red-600 font-bold text-lg">Delete Store</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteStore
          store={currentStore}
          onClose={() => setShowDeleteModal(false)}
          onDelete={(deletedStoreId) => {
            onDelete && onDelete(deletedStoreId);
            setShowDeleteModal(false);
            onBack && onBack();
          }}
        />
      )}
    </div>
  );
};

export default ViewStore;