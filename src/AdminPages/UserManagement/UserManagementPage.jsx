import React, { useState, useEffect } from 'react';
import { Eye, FileText, Check, X, AlertCircle, Search, Filter, Grid, List } from 'lucide-react';
import userService from '../../services/userService';
import UserDocumentView from './UserDocumentView';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../Sidebar';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDocumentView, setShowDocumentView] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
  const { user, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();

  useEffect(() => {
    console.log('UserManagementPage - Current user:', user);
    console.log('UserManagementPage - Is authenticated:', isAuthenticated());
    console.log('UserManagementPage - Is admin:', isAdmin());
    console.log('UserManagementPage - Is super admin:', isSuperAdmin());
    
    if (isAuthenticated() && (isAdmin() || isSuperAdmin())) {
      fetchUsers();
    } else {
      console.error('UserManagementPage - User not authorized to access this page');
      setError('You do not have permission to access this page. Please contact your administrator.');
      setLoading(false);
    }
  }, [user, isAuthenticated, isAdmin, isSuperAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('UserManagementPage - Fetching users...');
      console.log('UserManagementPage - Token:', localStorage.getItem('token'));
      console.log('UserManagementPage - User:', localStorage.getItem('user'));
      
      const response = await userService.getAllUsers();
      console.log('UserManagementPage - Response:', response);
      
      // Handle different response structures
      let usersData = [];
      if (response.data && response.data.users) {
        usersData = response.data.users;
      } else if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    // Ensure user has required fields
    if (!user || !user.name || !user.email) {
      return false;
    }
    
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'pending' && user.documentVerificationStatus === 'pending') ||
                         (filterStatus === 'verified' && user.documentVerificationStatus === 'verified') ||
                         (filterStatus === 'rejected' && user.documentVerificationStatus === 'rejected');

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      verified: { color: 'bg-green-100 text-green-800', text: 'Verified' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleViewDocuments = (user) => {
    setSelectedUser(user);
    setShowDocumentView(true);
  };

  const handleCloseDocumentView = () => {
    setShowDocumentView(false);
    setSelectedUser(null);
    fetchUsers(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 overflow-auto relative lg:ml-64">
        <div className="w-full max-w-full mb-10 px-4 sm:px-6 lg:px-8 pt-8">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-10 right-4 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 bg-red-500/5 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-20 left-4 sm:left-10 w-32 h-32 sm:w-40 sm:h-40 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <span className="truncate">User Management</span>
              </h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage users and verify their documents</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-red-500 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-red-500 text-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Access Error</h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:flex-row sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
              >
                <option value="all">All Users</option>
                <option value="pending">Pending Verification</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Users Content */}
          {!loading && !error && (
            <>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-12 shadow-xl">
                    <div className="bg-gray-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <AlertCircle className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No Users Found</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      No users match your current search criteria. Try adjusting your search or filter settings.
                    </p>
                  </div>
                </div>
              ) : viewMode === 'cards' ? (
                // Card View
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {filteredUsers.map((user) => (
                    <div key={user._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 sm:p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="bg-red-100 p-1.5 sm:p-2 rounded-xl flex-shrink-0">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                {user.name || 'N/A'}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'superAdmin' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            } flex-shrink-0`}>
                              {user.role || 'customer'}
                            </span>
                            {getStatusBadge(user.documentVerificationStatus || 'pending')}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 sm:p-4">
                        {/* Contact Info */}
                        {user.phone && (
                          <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 bg-blue-50 rounded-lg p-1.5 sm:p-2">
                            <span className="text-xs sm:text-sm text-blue-900 truncate">{user.phone}</span>
                          </div>
                        )}

                        {/* Documents */}
                        <div className="mb-3 sm:mb-4">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Documents:</h4>
                          <div className="flex items-center gap-2">
                            {user.documents?.tradeLicense || user.documents?.idDocument ? (
                              <>
                                {user.documents?.tradeLicense && (
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    {user.documents.tradeLicense.verified && (
                                      <Check className="w-4 h-4 text-green-500" />
                                    )}
                                  </div>
                                )}
                                {user.documents?.idDocument && (
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    {user.documents.idDocument.verified && (
                                      <Check className="w-4 h-4 text-green-500" />
                                    )}
                                  </div>
                                )}
                              </>
                            ) : null}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleViewDocuments(user)}
                            disabled={!user.documents?.tradeLicense && !user.documents?.idDocument}
                            className={`w-full text-xs sm:text-sm font-medium py-2 px-2 sm:px-3 rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2 ${
                              user.documents?.tradeLicense || user.documents?.idDocument
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>View Documents</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // List View
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Documents
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Verification Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                                {user.phone && (
                                  <div className="text-sm text-gray-500">{user.phone}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'superAdmin' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role || 'customer'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {user.documents?.tradeLicense || user.documents?.idDocument ? (
                                  <>
                                    {user.documents?.tradeLicense && (
                                      <div className="flex items-center gap-1">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        {user.documents.tradeLicense.verified && (
                                          <Check className="w-4 h-4 text-green-500" />
                                        )}
                                      </div>
                                    )}
                                    {user.documents?.idDocument && (
                                      <div className="flex items-center gap-1">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        {user.documents.idDocument.verified && (
                                          <Check className="w-4 h-4 text-green-500" />
                                        )}
                                      </div>
                                    )}
                                  </>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(user.documentVerificationStatus || 'pending')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleViewDocuments(user)}
                                disabled={!user.documents?.tradeLicense && !user.documents?.idDocument}
                                className={`flex items-center gap-1 ${
                                  user.documents?.tradeLicense || user.documents?.idDocument
                                    ? 'text-red-600 hover:text-red-900'
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                <Eye className="w-4 h-4" />
                                View Documents
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Document View Modal */}
          {showDocumentView && selectedUser && (
            <UserDocumentView
              userId={selectedUser._id}
              onClose={handleCloseDocumentView}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage; 