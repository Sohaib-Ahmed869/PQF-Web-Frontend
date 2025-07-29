import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Package,
  Calendar,
  DollarSign,
  AlertCircle,
  Clock,
  MessageSquare,
  X,
  Send,
  FileText,
  ShoppingBag,
  Filter,
  CheckCircle,
} from "lucide-react";
import { useAuth } from '../context/AuthContext';
import disputeService from '../services/disputeService';
import UserSidebar from './UserSidebar';
import LoaderOverlay from '../components/LoaderOverlay';
import { toast, ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DisputesPage = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [previousSelectedId, setPreviousSelectedId] = useState(null);
  const [disputeChat, setDisputeChat] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const chatEndRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDisputes, setTotalDisputes] = useState(0);

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    if (user?._id) {
      console.log('User authenticated, fetching disputes for user:', user._id);
      fetchDisputes();
    } else {
      console.log('No user found, user object:', user);
      setError("Please log in to view your disputes");
      setLoading(false);
    }
  }, [user?._id, currentPage, itemsPerPage, filters]);

  // Animation effect when dispute selection changes
  useEffect(() => {
    if (selectedDispute && selectedDispute.disputeId !== previousSelectedId) {
      setPreviousSelectedId(selectedDispute.disputeId);
      console.log('Selected dispute:', selectedDispute);
      console.log('Selected dispute order:', selectedDispute.order);
      fetchDisputeChat(selectedDispute.disputeId);
    }
  }, [selectedDispute, previousSelectedId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [disputeChat]);

  const fetchDisputes = async () => {
    if (!user?._id) {
      console.log('No user ID available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build query parameters as an object
      const params = {
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      };

      // Add filters to params object
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      console.log('Fetching disputes with params:', params);
      const response = await disputeService.getUserDisputes(params);
      const result = response;

      console.log('Disputes response:', result);
      console.log('First dispute order data:', result.data?.disputes?.[0]?.order);

      if (result.success) {
        setDisputes(result.data.disputes);
        setTotalPages(
          result.data.totalPages ||
            Math.ceil(result.data.totalDisputes / itemsPerPage)
        );
        setTotalDisputes(
          result.data.totalDisputes || result.data.disputes.length
        );
        setCurrentPage(result.data.currentPage || currentPage);
        setItemsPerPage(result.data.itemsPerPage || itemsPerPage);
      } else {
        setError("Failed to fetch disputes: " + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching disputes:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. You don't have permission to view disputes.");
      } else if (err.response?.status === 404) {
        setError("Disputes endpoint not found.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Error connecting to server: " + (err.message || 'Network error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDisputeChat = async (disputeId) => {
    if (!disputeId) return;

    setLoadingChat(true);
    try {
      const response = await disputeService.getDisputeChat(disputeId);
      const result = response;

      if (result.success && result.data.dispute.responses) {
        setDisputeChat(result.data.dispute.responses);
      } else {
        setDisputeChat([]);
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
      setDisputeChat([]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedDispute || !user?._id || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const response = await disputeService.sendDisputeResponse(
        selectedDispute.disputeId,
        {
          message: newMessage.trim(),
          userId: user._id,
          userRole: "customer",
          userName: user.name || user.fullName,
        }
      );

      const result = response;

      if (result.success) {
        // Add the new response to the chat
        const newResponse = {
          id: result.data.responseId,
          senderType: "customer",
          senderId: user._id,
          senderName: user.name || user.fullName,
          message: newMessage.trim(),
          timestamp: new Date().toISOString(),
        };

        setDisputeChat((prev) => [...prev, newResponse]);
        setNewMessage("");

        // Update dispute status if needed
        if (result.data.disputeStatus !== selectedDispute.disputeStatus) {
          setSelectedDispute((prev) => ({
            ...prev,
            disputeStatus: result.data.disputeStatus,
          }));

          setDisputes((prevDisputes) =>
            prevDisputes.map((dispute) =>
              dispute.disputeId === selectedDispute.disputeId
                ? { ...dispute, disputeStatus: result.data.disputeStatus }
                : dispute
            )
          );
        }

        toast.success("Message sent successfully");
      } else {
        toast.error("Failed to send message: " + result.message);
      }
    } catch (error) {
      toast.error("Error sending message: " + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      category: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedDispute(null); // Clear selected dispute when changing pages
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 border-red-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "product_quality":
        return <Package className="w-4 h-4" />;
      case "shipping_delay":
        return <Clock className="w-4 h-4" />;
      case "billing_issue":
        return <DollarSign className="w-4 h-4" />;
      case "wrong_item":
        return <AlertCircle className="w-4 h-4" />;
      case "damaged_item":
        return <AlertCircle className="w-4 h-4" />;
      case "not_received":
        return <ShoppingBag className="w-4 h-4" />;
      case "refund_request":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Function to format relative dates
  const formatRelativeDate = (dateString) => {
    if (!dateString) return "Date not available";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      const now = new Date();
      
      // Reset time to start of day for accurate day comparison
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const diffTime = nowStart.getTime() - dateStart.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return "Today";
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays <= 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Date not available";
    }
  };

  // Function to group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp);
      const dateKey = date.toDateString(); // Gets the date string for grouping
      const relativeDate = formatRelativeDate(msg.timestamp);
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: relativeDate,
          messages: []
        };
      }
      groups[dateKey].messages.push(msg);
    });
    
    return Object.values(groups);
  };

  // Function to format time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return "";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.orderItem?.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      dispute.disputeCategory
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      dispute.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <>
        <LoaderOverlay text="Loading disputes..." />
        <div className="min-h-screen bg-gray-50">
          <UserSidebar />
          <div className="lg:ml-64 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
                  My Disputes
                </h2>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDisputes}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <UserSidebar />
        <div className="lg:ml-64 p-6">
          {/* Header */}
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
                My Disputes
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
              {/* Disputes List */}
              <div className="flex-1">
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Your Disputes ({totalDisputes})
                      </h3>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search disputes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                          />
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
                            showFilters || Object.values(filters).some((f) => f)
                              ? "bg-blue-50 border-blue-300 text-blue-700"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <Filter className="w-4 h-4" />
                          <span>Filters</span>
                          {Object.values(filters).some((f) => f) && (
                            <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {Object.values(filters).filter((f) => f).length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              value={filters.status}
                              onChange={(e) =>
                                handleFilterChange("status", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">All Statuses</option>
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category
                            </label>
                            <select
                              value={filters.category}
                              onChange={(e) =>
                                handleFilterChange("category", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">All Categories</option>
                              <option value="product_quality">
                                Product Quality
                              </option>
                              <option value="shipping_delay">
                                Shipping Delay
                              </option>
                              <option value="wrong_item">Wrong Item</option>
                              <option value="damaged_item">Damaged Item</option>
                              <option value="not_received">Not Received</option>
                              <option value="billing_issue">Billing Issue</option>
                              <option value="refund_request">
                                Refund Request
                              </option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={filters.startDate}
                              onChange={(e) =>
                                handleFilterChange("startDate", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={filters.endDate}
                              onChange={(e) =>
                                handleFilterChange("endDate", e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end mt-4">
                          <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Clear Filters
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="divide-y divide-gray-200">
                    {filteredDisputes.map((dispute) => (
                      <div
                        key={dispute.disputeId}
                        className={`p-4 sm:p-6 cursor-pointer transition-colors ${
                          selectedDispute?.disputeId === dispute.disputeId
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedDispute(dispute)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                              <div className="flex items-center space-x-2">
                                {getCategoryIcon(dispute.disputeCategory)}
                                <span className="text-sm font-medium text-gray-900 capitalize">
                                  {dispute.disputeCategory.replace("_", " ")}
                                </span>
                              </div>
                              
                              {/* Show status - only one indicator */}
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full border w-fit ${getStatusColor(
                                  dispute.disputeStatus
                                )}`}
                              >
                                {dispute.disputeStatus
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </span>

                              {/* Show response count badge - only for active disputes */}
                              {dispute.totalResponses > 0 &&
                                dispute.disputeStatus !== "resolved" &&
                                dispute.disputeStatus !== "closed" &&
                                dispute.disputeStatus !== "rejected" && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200 w-fit">
                                  {dispute.totalResponses}{" "}
                                  {dispute.totalResponses === 1
                                    ? "message"
                                    : "messages"}
                                </span>
                              )}

                              {/* Show waiting for user response indicator - only for active disputes */}
                              {dispute.waitingFor === "customer" &&
                                dispute.disputeStatus !== "resolved" &&
                                dispute.disputeStatus !== "closed" &&
                                dispute.disputeStatus !== "rejected" && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200 w-fit flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Awaiting your response
                                  </span>
                                )}

                              {/* Show admin responded indicator - only for active disputes */}
                              {dispute.hasUnreadAdminResponse &&
                                dispute.disputeStatus !== "resolved" &&
                                dispute.disputeStatus !== "closed" &&
                                dispute.disputeStatus !== "rejected" && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200 w-fit flex items-center">
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    New response
                                  </span>
                                )}
                            </div>

                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                              {dispute.order?.orderItems?.[0]?.name || dispute.order?.DocNum || dispute.orderItem?.title || "Order Item"}
                            </h3>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {dispute.description}
                            </p>

                            {/* Order Items Summary */}
                            {dispute.order?.orderItems && dispute.order.orderItems.length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Package className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {dispute.order.orderItems.length} item{dispute.order.orderItems.length !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {dispute.order.orderItems.slice(0, 3).map((item, index) => (
                                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                      {item.name} (Qty: {item.quantity})
                                    </span>
                                  ))}
                                  {dispute.order.orderItems.length > 3 && (
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                      +{dispute.order.orderItems.length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 flex-shrink-0" />
                                <span>
                                  Created {formatRelativeDate(dispute.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-3 h-3 flex-shrink-0" />
                                <span>${dispute.order?.DocTotal || dispute.order?.totalAmount || dispute.order?.DocTotal || 0}</span>
                              </div>
                              {dispute.lastResponseAt && (
                                <div className="flex items-center space-x-1">
                                  <MessageSquare className="w-3 h-3 flex-shrink-0" />
                                  <span>
                                    Last activity{" "}
                                    {formatRelativeDate(dispute.lastResponseAt)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Product Image */}
                          {(dispute.order?.orderItems?.[0]?.image || dispute.product?.image) && (
                            <img
                              src={dispute.order?.orderItems?.[0]?.image || dispute.product?.image || "/placeholder.svg"}
                              alt={dispute.order?.orderItems?.[0]?.name || dispute.orderItem?.title || "Product"}
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover ml-3 sm:ml-4 flex-shrink-0"
                            />
                          )}
                        </div>
                      </div>
                    ))}

                    {filteredDisputes.length === 0 && (
                      <div className="p-8 sm:p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          {searchTerm || Object.values(filters).some((f) => f)
                            ? "No disputes match your criteria"
                            : "No disputes found"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop Dispute Details Sidebar */}
              {selectedDispute && (
                <div className="hidden lg:block w-96">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-300 sticky top-8">
                    <div className="p-6 border-b flex relative border-gray-300">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dispute Details
                      </h3>
                      <span
                        onClick={() => setSelectedDispute(null)}
                        className="border-1 absolute right-4 border-gray-300 rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-100 cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-500 transition-colors" />
                      </span>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Product Info */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Order Information
                        </h4>
                        {selectedDispute.order?.orderItems && selectedDispute.order.orderItems.length > 0 ? (
                          <div className="space-y-3">
                            {selectedDispute.order.orderItems.map((item, index) => (
                              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {item.name}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-sm text-gray-600">
                                      Price: ${item.price}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    Total: ${(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-start space-x-3">
                            {selectedDispute.product?.image && (
                              <img
                                src={selectedDispute.product.image || "/placeholder.svg"}
                                alt={selectedDispute.orderItem?.title || "Product"}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {selectedDispute.orderItem?.title || "Product"}
                              </p>
                              <p className="text-sm text-gray-600">
                                Price: ${selectedDispute.orderItem?.price || 0}
                              </p>
                              <p className="text-sm text-gray-600">
                                Quantity: {selectedDispute.orderItem?.quantity || 1}
                              </p>
                              <p className="text-sm text-gray-600 capitalize">
                                Status: {selectedDispute.orderItem?.orderStatus || "Unknown"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat/Responses Section */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center justify-between">
                          <span>Conversation</span>
                          <span className="text-xs text-gray-500">
                            {disputeChat.length}{" "}
                            {disputeChat.length === 1 ? "message" : "messages"}
                          </span>
                        </h4>

                        <div className="border border-gray-200 rounded-lg p-3 h-64 overflow-y-auto">
                          {loadingChat ? (
                            <div className="flex justify-center items-center h-full">
                              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : disputeChat.length > 0 ? (
                            <div className="space-y-3">
                              {groupMessagesByDate(disputeChat).map((group) => (
                                <div key={group.date} className="space-y-3">
                                  <div className="text-xs text-gray-500 text-center font-medium">
                                    {group.date}
                                  </div>
                                  {group.messages.map((msg) => (
                                    <div
                                      key={msg.id}
                                      className={`flex ${
                                        msg.senderType === "customer"
                                          ? "justify-end"
                                          : "justify-start"
                                      }`}
                                    >
                                      <div
                                        className={`max-w-[80%] p-3 rounded-lg ${
                                          msg.senderType === "customer"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        <div className="text-xs text-gray-500 mb-1">
                                          {msg.senderType === "customer"
                                            ? "You"
                                            : "Admin"}{" "}
                                          • {formatTime(msg.timestamp)}
                                        </div>
                                        <p className="text-sm">{msg.message}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ))}
                              <div ref={chatEndRef} />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                              <MessageSquare className="w-8 h-8 mb-2" />
                              <p>No messages yet</p>
                            </div>
                          )}
                        </div>

                        {/* Inline Message Input */}
                        {selectedDispute.disputeStatus !== "resolved" &&
                          selectedDispute.disputeStatus !== "closed" &&
                          selectedDispute.disputeStatus !== "rejected" && (
                            <div className="mt-3 flex gap-2">
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                placeholder="Type your message..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                disabled={sendingMessage}
                              />
                              <button
                                onClick={handleSendMessage}
                                disabled={sendingMessage || !newMessage.trim()}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                              >
                                {sendingMessage ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Send className="w-4 h-4" />
                                )}
                                Send
                              </button>
                            </div>
                          )}
                      </div>

                      {/* Order Info */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Order Details
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Order ID: {selectedDispute.order?.DocNum || selectedDispute.order?.orderId || selectedDispute.order?._id?.slice(0, 8) || "N/A"}
                          </p>
                          {selectedDispute.order?.CardName && (
                            <p className="text-sm text-gray-600">
                              Customer: {selectedDispute.order.CardName}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            Total Amount: ${selectedDispute.order?.DocTotal || selectedDispute.order?.totalAmount || 0}
                          </p>
                          {selectedDispute.order?.paymentMethod && (
                            <p className="text-sm text-gray-600 capitalize">
                              Payment: {selectedDispute.order.paymentMethod.replace('_', ' ')}
                            </p>
                          )}
                          {selectedDispute.order?.trackingStatus && (
                            <p className="text-sm text-gray-600 capitalize">
                              Status: {selectedDispute.order.trackingStatus.replace('_', ' ')}
                            </p>
                          )}
                          {selectedDispute.order?.shippingAddress && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <p className="text-xs font-medium text-gray-700 mb-1">Shipping Address:</p>
                              <p className="text-xs text-gray-600">
                                {selectedDispute.order.shippingAddress.address}
                              </p>
                              <p className="text-xs text-gray-600">
                                {selectedDispute.order.shippingAddress.city}, {selectedDispute.order.shippingAddress.postalCode}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dispute Description */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Your Complaint
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {selectedDispute.description}
                        </p>
                      </div>

                      {/* Timeline */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Timeline
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Dispute Created
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatRelativeDate(selectedDispute.createdAt)}
                              </p>
                            </div>
                          </div>
                          {selectedDispute.resolvedAt && (
                            <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Dispute Resolved
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatRelativeDate(selectedDispute.resolvedAt)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Message for Closed Disputes */}
                      {(selectedDispute.disputeStatus === "resolved" ||
                        selectedDispute.disputeStatus === "closed" ||
                        selectedDispute.disputeStatus === "rejected") && (
                        <div className="pt-4 border-t border-gray-200">
                          <div
                            className={`p-3 rounded-lg ${
                              selectedDispute.disputeStatus === "resolved"
                                ? "bg-green-50 border border-green-200"
                                : selectedDispute.disputeStatus === "rejected"
                                ? "bg-red-50 border border-red-200"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <p
                              className={`text-sm font-medium ${
                                selectedDispute.disputeStatus === "resolved"
                                  ? "text-green-800"
                                  : selectedDispute.disputeStatus === "rejected"
                                  ? "text-red-800"
                                  : "text-gray-800"
                              }`}
                            >
                              This dispute has been{" "}
                              {selectedDispute.disputeStatus}.
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              No further messages can be sent for this dispute.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loader Overlay for API operations */}
      {(isProcessing || sendingMessage) && (
        <LoaderOverlay text={isProcessing ? "Processing..." : "Sending message..."} />
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  );
};

export default DisputesPage;