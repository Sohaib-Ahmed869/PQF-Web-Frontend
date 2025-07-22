import React, { useState } from 'react';
import { 
  FiSearch, 
  FiEye, 
  FiEdit3, 
  FiTrash2, 
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUsers,
  FiMoreVertical,
  FiUserPlus,
  FiShoppingBag,
  
} from 'react-icons/fi';
import storeService from '../../../services/SuperAdmin/storeService';
import { toast } from 'react-toastify';
import DeleteStore from './DeleteStore';
import LoaderOverlay from '../../../components/LoaderOverlay';
const StoreList = ({ 
  stores: initialStores, 
  loading, 
  onRefresh, 
  onAdd, 
  onView, 
  onEdit, 
  onDelete,
  onAssignAdmin,
  onStatusUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [localStores, setLocalStores] = useState(initialStores);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);

  // Update local stores when initialStores changes
  React.useEffect(() => {
    setLocalStores(initialStores);
  }, [initialStores]);

  // Filter stores based on search term and status
  const filteredStores = localStores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.location.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.location.address.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || store.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStores = filteredStores.slice(startIndex, endIndex);

  const handleDelete = async (storeId) => {
    if (window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      try {
        await storeService.deleteStore(storeId);
        toast.success('Store deleted successfully! 🗑️');
        onDelete(storeId);
      } catch (error) {
        console.error('Error deleting store:', error);
        toast.error('Failed to delete store');
      }
    }
  };

  const handleStatusToggle = async (store) => {
    const newStatus = store.status === 'active' ? 'inactive' : 'active';
    
    try {
      await storeService.updateStoreStatus(store._id, newStatus);
      toast.success(`Store ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      onStatusUpdate(store._id, newStatus);
    } catch (error) {
      console.error('Error updating store status:', error);
      toast.error('Failed to update store status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-[#fbeaea] text-[#8e191c] border-[#e7bcbc]';
      case 'inactive': return 'bg-[#fbeaea] text-[#a51d20] border-[#e7bcbc]';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 relative min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-50/20">
      {/* Animated background elements for loader */}
      {loading && (
        <>
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          <div className="relative z-20 flex justify-center items-center h-96">
            <div className="text-center">
              {/* Futuristic loading spinner */}
              <div className="w-20 h-20 relative mx-auto mb-6">
                <div className="w-20 h-20 rounded-full border-4 border-red-200 border-t-red-500 animate-spin"></div>
                <div className="absolute inset-2 w-16 h-16 rounded-full border-2 border-red-100 border-b-red-400 animate-spin animate-reverse"></div>
                <div className="absolute inset-4 w-12 h-12 rounded-full border-2 border-pink-100 border-l-pink-500 animate-spin"></div>
              </div>
              <div className="text-red-600 text-xl font-semibold">Loading stores...</div>
              <div className="text-gray-500 text-sm mt-2">Please wait while we fetch your stores</div>
            </div>
          </div>
        </>
      )}
      {/* Store List Content */}
      {!loading && (
        <>
          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stores by name, city, or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8e191c]/20 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8e191c]/20 transition-all duration-300 shadow-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
                <option value="closed">Closed</option>
              </select>
              
              <button
                onClick={onRefresh}
                className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 hover:bg-[#8e191c]/10 hover:text-[#8e191c] focus:outline-none focus:ring-2 focus:ring-[#8e191c]/20 transition-all duration-300 shadow-sm flex items-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Stores Grid */}
          {localStores.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-3xl border border-gray-200 p-12">
                <FiShoppingBag className="w-16 h-16 text-[#c62828] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stores Found</h3>
                <p className="text-gray-600 mb-6">You haven't created any stores yet. Get started by adding your first store!</p>
                <button
                  onClick={onAdd}
                  className="px-6 py-3 bg-gradient-to-r from-[#c62828] to-[#a51d20] text-white rounded-xl hover:from-[#a51d20] hover:to-[#c62828] transition-all duration-300 font-medium"
                >
                  Add Your First Store
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentStores.map(store => (
                  <div 
                    key={store._id} 
                    className="bg-white rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#8e191c]/20 hover:-translate-y-2 group shadow-lg overflow-hidden border border-gray-200"
                  >
                    {/* Store Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#8e191c] transition-colors duration-300">
                            {store.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <FiMapPin className="w-4 h-4 mr-1" />
                            {store.location.address.city}, {store.location.address.country}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(store.status)}`}>
                            {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Store Details */}
                    <div className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiMail className="w-4 h-4 mr-2 text-[#8e191c]" />
                          {store.contact.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiPhone className="w-4 h-4 mr-2 text-[#8e191c]" />
                          {store.contact.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiUsers className="w-4 h-4 mr-2 text-[#8e191c]" />
                          {store.admins?.length || 0} Admin{store.admins?.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiCalendar className="w-4 h-4 mr-2 text-[#8e191c]" />
                          Created {new Date(store.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onView(store)}
                          className="flex items-center justify-center px-3 py-2 text-sm font-medium text-[#2563eb] bg-[#e0e7ff] rounded-lg hover:bg-[#dbeafe] transition-colors duration-200"
                        >
                          <FiEye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => onEdit(store)}
                          className="flex items-center justify-center px-3 py-2 text-sm font-medium text-[#b45309] bg-[#fff7ed] rounded-lg hover:bg-[#fde68a] transition-colors duration-200"
                        >
                          <FiEdit3 className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => onAssignAdmin(store)}
                          className="flex items-center justify-center px-3 py-2 text-sm font-medium text-[#9333ea] bg-[#ede9fe] rounded-lg hover:bg-[#ddd6fe] transition-colors duration-200"
                        >
                          <FiUserPlus className="w-4 h-4 mr-1" />
                          Assign
                        </button>
                        <button
                          onClick={() => {
                            setStoreToDelete(store);
                            setShowDeleteModal(true);
                          }}
                          className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-[#dc2626] rounded-lg hover:bg-[#b91c1c] transition-colors duration-200"
                        >
                          <FiTrash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>

                      {/* Status Toggle */}
                      <div className="mt-4 pt-4 border-t border-[#f8d7da]">
                        <button
                          onClick={() => handleStatusToggle(store)}
                          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            store.status === 'active' 
                              ? 'bg-gradient-to-r from-[#c62828] to-[#a51d20] text-white hover:from-[#a51d20] hover:to-[#c62828]' 
                              : 'bg-[#22c55e] text-white hover:bg-[#16a34a]'
                          }`}
                        >
                          {store.status === 'active' ? 'Deactivate Store' : 'Activate Store'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl text-[#8e191c] hover:bg-[#fbeaea] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-sm"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <span className="text-[#8e191c] px-4 py-2 bg-[#fbeaea] rounded-xl shadow-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl text-[#8e191c] hover:bg-[#fbeaea] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-sm"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
      {showDeleteModal && storeToDelete && (
        <DeleteStore
          store={storeToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setStoreToDelete(null);
          }}
          onDelete={(deletedStoreId) => {
            onDelete(deletedStoreId);
            setShowDeleteModal(false);
            setStoreToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default StoreList;