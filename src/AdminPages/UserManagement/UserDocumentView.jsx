import React, { useState, useEffect } from 'react';
import { Eye, Download, Check, X, AlertCircle, FileText } from 'lucide-react';
import userService from '../../services/userService';

const UserDocumentView = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserById(userId);
      setUser(response.data.user);
      setVerificationStatus(response.data.user.documentVerificationStatus || 'pending');
      setNotes(response.data.user.documentVerificationNotes || '');
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationUpdate = async () => {
    try {
      setUpdating(true);
      await userService.updateDocumentVerification(userId, {
        status: verificationStatus,
        notes: notes
      });
      await fetchUserDetails(); // Refresh data
    } catch (error) {
      console.error('Error updating verification status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const openDocument = (url) => {
    window.open(url, '_blank');
  };

  // Helper function to validate if a document is actually uploaded
  const isValidDocument = (document) => {
    return document && 
           document.url && 
           document.filename && 
           document.uploadedAt && 
           new Date(document.uploadedAt).toString() !== 'Invalid Date';
  };

  // Helper function to format upload date safely
  const formatUploadDate = (uploadedAt) => {
    if (!uploadedAt) return 'Date not available';
    const date = new Date(uploadedAt);
    return date.toString() === 'Invalid Date' ? 'Date not available' : date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading user documents...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">User Documents</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-600">{user.phone}</p>
        </div>

        {/* Document Verification Status */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Verification Status</h3>
          <div className="flex items-center gap-4 mb-4">
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              onClick={handleVerificationUpdate}
              disabled={updating}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add verification notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            rows="3"
          />
        </div>

        {/* Documents */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Uploaded Documents</h3>
          
          {/* Trade License */}
          {user.documents?.tradeLicense && isValidDocument(user.documents.tradeLicense) ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Trade License</h4>
                    <p className="text-sm text-gray-600">{user.documents.tradeLicense.filename}</p>
                    <p className="text-xs text-gray-500">
                      Uploaded: {formatUploadDate(user.documents.tradeLicense.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.documents.tradeLicense.verified && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  <button
                    onClick={() => openDocument(user.documents.tradeLicense.url)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                    title="View Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={user.documents.tradeLicense.url}
                    download
                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                    title="Download Document"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-500">No Trade License uploaded</span>
              </div>
            </div>
          )}

          {/* ID Document */}
          {user.documents?.idDocument && isValidDocument(user.documents.idDocument) ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">ID Document</h4>
                    <p className="text-sm text-gray-600">{user.documents.idDocument.filename}</p>
                    <p className="text-xs text-gray-500">
                      Uploaded: {formatUploadDate(user.documents.idDocument.uploadedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.documents.idDocument.verified && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  <button
                    onClick={() => openDocument(user.documents.idDocument.url)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                    title="View Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={user.documents.idDocument.url}
                    download
                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg"
                    title="Download Document"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-500">No ID Document uploaded</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDocumentView; 