import React, { useState, useEffect } from 'react';
import { Eye, Download, Check, X, AlertCircle, FileText, Calendar, User, Mail, Phone } from 'lucide-react';
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

  const openDocument = (url, filename) => {
    if (!url) {
      console.error('No URL provided for document');
      return;
    }

    // Get file extension
    const fileExtension = getFileExtension(filename).toLowerCase();
    
    // For PDFs, we can open them directly in a new tab
    if (fileExtension === 'pdf') {
      // Try to open PDF in a new tab with proper headers
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${filename || 'Document Viewer'}</title>
              <style>
                body { margin: 0; padding: 0; height: 100vh; background: #f5f5f5; }
                .pdf-container { width: 100%; height: 100vh; }
                .pdf-viewer { width: 100%; height: 100%; border: none; }
                .fallback { padding: 20px; text-align: center; }
                .fallback a { color: #3b82f6; text-decoration: none; }
                .fallback a:hover { text-decoration: underline; }
              </style>
            </head>
            <body>
              <div class="pdf-container">
                <iframe 
                  src="${url}#toolbar=1&navpanes=1&scrollbar=1" 
                  class="pdf-viewer"
                  type="application/pdf"
                >
                  <div class="fallback">
                    <p>Your browser does not support PDF viewing.</p>
                    <a href="${url}" target="_blank" download="${filename}">Click here to download the PDF</a>
                  </div>
                </iframe>
              </div>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        // Fallback: open directly in new tab
        window.open(url, '_blank');
      }
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      // For images, open in a new tab
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${filename || 'Image Viewer'}</title>
              <style>
                body { margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                img { max-width: 100%; max-height: 100vh; object-fit: contain; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
              </style>
            </head>
            <body>
              <img src="${url}" alt="${filename}" />
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        window.open(url, '_blank');
      }
    } else if (['doc', 'docx'].includes(fileExtension)) {
      // For Word documents, try to open in Google Docs viewer
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${filename || 'Document Viewer'}</title>
              <style>
                body { margin: 0; padding: 0; height: 100vh; }
                iframe { width: 100%; height: 100%; border: none; }
                .fallback { padding: 20px; text-align: center; }
                .fallback a { color: #3b82f6; text-decoration: none; }
                .fallback a:hover { text-decoration: underline; }
              </style>
            </head>
            <body>
              <iframe src="${googleDocsUrl}" width="100%" height="100%">
                <div class="fallback">
                  <p>Unable to display document in browser.</p>
                  <a href="${url}" target="_blank" download="${filename}">Click here to download the document</a>
                </div>
              </iframe>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        // Fallback: open directly
        window.open(url, '_blank');
      }
    } else {
      // For other file types, try to open in a new tab
      // If the browser can't display it, it will download it
      window.open(url, '_blank');
    }
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
    return date.toString() === 'Invalid Date' ? 'Date not available' : date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get file extension
  const getFileExtension = (filename) => {
    if (!filename) return '';
    return filename.split('.').pop().toUpperCase();
  };

  // Helper function to get document icon based on file type
  const getDocumentIcon = (filename) => {
    const ext = getFileExtension(filename).toLowerCase();
    if (['pdf'].includes(ext)) {
      return '📄';
    } else if (['doc', 'docx'].includes(ext)) {
      return '📝';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return '🖼️';
    }
    return '📎';
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
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">User Documents & Verification</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <User className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{user.name || 'N/A'}</h3>
                <p className="text-sm text-gray-600">Full Name</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{user.email || 'N/A'}</p>
                <p className="text-sm text-gray-600">Email Address</p>
              </div>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user.phone}</p>
                  <p className="text-sm text-gray-600">Phone Number</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Registration Date</p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Verification Status */}
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg mb-3 text-gray-800">Verification Status</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <select
              value={verificationStatus}
              onChange={(e) => setVerificationStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="pending">⏳ Pending</option>
              <option value="verified">✅ Verified</option>
              <option value="rejected">❌ Rejected</option>
            </select>
            <button
              onClick={handleVerificationUpdate}
              disabled={updating}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add verification notes or comments..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            rows="3"
          />
        </div>

        {/* Documents */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-gray-800">Uploaded Documents</h3>
          
          {/* Trade License */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl">{getDocumentIcon(user.documents?.tradeLicense?.filename)}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Trade License <span className="text-red-500">*</span></h4>
                  {user.documents?.tradeLicense && isValidDocument(user.documents.tradeLicense) ? (
                    <>
                      <p className="text-sm text-gray-600">{user.documents.tradeLicense.filename}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Uploaded: {formatUploadDate(user.documents.tradeLicense.uploadedAt)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No Trade License uploaded</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.documents?.tradeLicense && isValidDocument(user.documents.tradeLicense) ? (
                  <>
                    {user.documents.tradeLicense.verified && (
                      <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">Verified</span>
                      </div>
                    )}
                    <button
                      onClick={() => openDocument(user.documents.tradeLicense.url, user.documents.tradeLicense.filename)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={user.documents.tradeLicense.url}
                      download
                      className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download Document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">Required</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ID Document */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl">{getDocumentIcon(user.documents?.idDocument?.filename)}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">ID Document <span className="text-red-500">*</span></h4>
                  {user.documents?.idDocument && isValidDocument(user.documents.idDocument) ? (
                    <>
                      <p className="text-sm text-gray-600">{user.documents.idDocument.filename}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Uploaded: {formatUploadDate(user.documents.idDocument.uploadedAt)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No ID Document uploaded</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.documents?.idDocument && isValidDocument(user.documents.idDocument) ? (
                  <>
                    {user.documents.idDocument.verified && (
                      <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">Verified</span>
                      </div>
                    )}
                    <button
                      onClick={() => openDocument(user.documents.idDocument.url, user.documents.idDocument.filename)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={user.documents.idDocument.url}
                      download
                      className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download Document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">Required</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank Statement */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl">{getDocumentIcon(user.documents?.bankStatement?.filename)}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">Bank Statement (Last 6 Months) <span className="text-gray-400">(Optional)</span></h4>
                  {user.documents?.bankStatement && isValidDocument(user.documents.bankStatement) ? (
                    <>
                      <p className="text-sm text-gray-600">{user.documents.bankStatement.filename}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Uploaded: {formatUploadDate(user.documents.bankStatement.uploadedAt)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No Bank Statement uploaded</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.documents?.bankStatement && isValidDocument(user.documents.bankStatement) ? (
                  <>
                    {user.documents.bankStatement.verified && (
                      <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">Verified</span>
                      </div>
                    )}
                    <button
                      onClick={() => openDocument(user.documents.bankStatement.url, user.documents.bankStatement.filename)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={user.documents.bankStatement.url}
                      download
                      className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download Document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </>
                ) : (
                  <div className="flex items-center gap-1 text-gray-400">
                    <span className="text-xs">Optional</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-2">Document Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${user.documents?.tradeLicense && isValidDocument(user.documents.tradeLicense) ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-600">Trade License: {user.documents?.tradeLicense && isValidDocument(user.documents.tradeLicense) ? 'Uploaded' : 'Missing'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${user.documents?.idDocument && isValidDocument(user.documents.idDocument) ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-600">ID Document: {user.documents?.idDocument && isValidDocument(user.documents.idDocument) ? 'Uploaded' : 'Missing'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${user.documents?.bankStatement && isValidDocument(user.documents.bankStatement) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-gray-600">Bank Statement: {user.documents?.bankStatement && isValidDocument(user.documents.bankStatement) ? 'Uploaded' : 'Not Provided'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDocumentView; 