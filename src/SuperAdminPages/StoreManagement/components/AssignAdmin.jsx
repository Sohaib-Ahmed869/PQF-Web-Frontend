import React, { useState, useEffect } from 'react';
import { 
  FiArrowLeft, 
  FiSave, 
  FiUsers,
  FiUserPlus,
  FiUserMinus,
  FiSearch,
  FiCheck,
  FiX,
  FiMail,
  FiPhone,
  FiTrash2
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import storeService from '../../../services/SuperAdmin/storeService';
import userService from '../../../services/userService';
import LoaderOverlay from '../../../components/LoaderOverlay';

const AssignAdmin = ({ store, onBack, onSuccess, onAdminChange }) => {
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableAdmins, setAvailableAdmins] = useState([]);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try {
        // Fetch all admins from backend
        const res = await userService.getAdmins();
        const allAdmins = res.data.admins || [];
        // Current admins assigned to this store
        const currentAdmins = store?.admins || [];
        setSelectedAdmins(currentAdmins.map(admin => admin._id));
        setAdmins(currentAdmins);
        // Filter available admins (not assigned to this store)
        const available = allAdmins.filter(admin =>
          !currentAdmins.find(currentAdmin => currentAdmin._id === admin._id) && !admin.assignedStore
        );
        setAvailableAdmins(available);
      } catch (error) {
        toast.error('Failed to fetch admins');
      } finally {
        setLoading(false);
      }
    };
    if (store) fetchAdmins();
  }, [store]);

  const filteredAvailableAdmins = availableAdmins.filter(admin =>
    (admin.name && admin.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (admin.email && admin.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAssignAdmin = async (adminId) => {
    try {
      setLoading(true);
      await storeService.assignAdminToStore(store._id, adminId);
      
      const assignedAdmin = availableAdmins.find(admin => admin._id === adminId);
      if (assignedAdmin) {
        setAdmins(prev => {
          const updated = [...prev, assignedAdmin];
          if (onAdminChange) onAdminChange(store._id, updated);
          return updated;
        });
        setSelectedAdmins(prev => [...prev, adminId]);
        setAvailableAdmins(prev => prev.filter(admin => admin._id !== adminId));
      }
      
      toast.success('Admin assigned successfully!');
    } catch (error) {
      console.error('Error assigning admin:', error);
      toast.error('Failed to assign admin');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    try {
      setLoading(true);
      await storeService.removeAdminFromStore(store._id, adminId);
      
      const removedAdmin = admins.find(admin => admin._id === adminId);
      if (removedAdmin) {
        setAvailableAdmins(prev => [...prev, removedAdmin]);
        setAdmins(prev => {
          const updated = prev.filter(admin => admin._id !== adminId);
          if (onAdminChange) onAdminChange(store._id, updated);
          return updated;
        });
        setSelectedAdmins(prev => prev.filter(id => id !== adminId));
      }
      
      toast.success('Admin removed successfully!');
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Failed to remove admin');
    } finally {
      setLoading(false);
    }
  };

  const AdminCard = ({ admin, isAssigned, onAssign, onRemove }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#8e191c] transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8e191c] to-[#c62828] rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {admin.name ? admin.name.split(' ').map(n => n[0]).join('') : '?'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{admin.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FiMail className="w-4 h-4" />
              <span>{admin.email}</span>
            </div>
            {admin.phone && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <FiPhone className="w-4 h-4" />
                <span>{admin.phone}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isAssigned ? (
            <>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#fbeaea] text-[#8e191c] border border-[#e7bcbc]">
                Assigned
              </span>
              <button
                onClick={() => onRemove(admin._id)}
                disabled={loading}
                className="p-2 text-red-600 hover:bg-[#fbeaea] rounded-lg transition-colors duration-200 disabled:opacity-50"
                title="Remove admin"
              >
                <FiUserMinus className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onAssign(admin._id)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#c62828] to-[#8e191c] text-white rounded-lg hover:from-[#a51d20] hover:to-[#c62828] transition-colors duration-200 disabled:opacity-50"
            >
              <FiUserPlus className="w-4 h-4" />
              <span>Assign</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!store) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Store not found</h3>
          <p className="text-gray-500">The store you're trying to manage doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 relative">
      {/* Loader Overlay (matches Login splash loader) */}
      {loading && <LoaderOverlay text="Loading..." />}
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8e191c]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c62828]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-[#fbeaea] hover:border-[#8e191c] hover:text-[#8e191c] transition-all duration-300"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Assign Admins</h1>
              <p className="text-gray-600 mt-2 text-lg">Manage administrators for {store.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Admins */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-[#8e191c]/10 border border-[#8e191c]/20">
                <FiUsers className="w-5 h-5 text-[#8e191c]" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">Current Admins</h3>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#fbeaea] text-[#8e191c] border border-[#e7bcbc]">
                {admins.length}
              </span>
            </div>

            <div className="space-y-4">
              {admins.length === 0 ? (
                <div className="text-center py-12">
                  <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">No Admins Assigned</h4>
                  <p className="text-gray-500">This store doesn't have any administrators assigned yet.</p>
                </div>
              ) : (
                admins.map(admin => (
                  <AdminCard
                    key={admin._id}
                    admin={admin}
                    isAssigned={true}
                    onRemove={handleRemoveAdmin}
                  />
                ))
              )}
            </div>
          </div>

          {/* Available Admins */}
          <div className="bg-white rounded-3xl border border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-[#9333ea]/10 border border-[#9333ea]/20">
                <FiUserPlus className="w-5 h-5 text-[#9333ea]" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900">Available Admins</h3>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#ede9fe] text-[#9333ea] border border-[#ddd6fe]">
                {availableAdmins.length}
              </span>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search admins by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8e191c]/20 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredAvailableAdmins.length === 0 ? (
                <div className="text-center py-12">
                  <FiUserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">
                    {searchTerm ? 'No Matching Admins' : 'No Available Admins'}
                  </h4>
                  <p className="text-gray-500">
                    {searchTerm 
                      ? 'Try adjusting your search terms.' 
                      : 'All admins are already assigned to stores.'}
                  </p>
                </div>
              ) : (
                filteredAvailableAdmins.map(admin => (
                  <AdminCard
                    key={admin._id}
                    admin={admin}
                    isAssigned={false}
                    onAssign={handleAssignAdmin}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-3xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-[#8e191c]/10 border border-[#8e191c]/20">
                <FiCheck className="w-6 h-6 text-[#8e191c]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {admins.length} Admin{admins.length !== 1 ? 's' : ''} Assigned
                </h3>
                <p className="text-gray-600">
                  {availableAdmins.length} admin{availableAdmins.length !== 1 ? 's' : ''} available for assignment
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onBack}
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-[#fbeaea] hover:text-[#8e191c] hover:border-[#8e191c] transition-all duration-300 font-medium"
              >
                Back to Store
              </button>
              <button
                onClick={onSuccess}
                className="px-6 py-3 bg-gradient-to-r from-[#c62828] to-[#8e191c] text-white rounded-xl hover:from-[#a51d20] hover:to-[#c62828] transition-all duration-300 font-medium flex items-center space-x-2"
              >
                <FiCheck className="w-4 h-4" />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignAdmin;