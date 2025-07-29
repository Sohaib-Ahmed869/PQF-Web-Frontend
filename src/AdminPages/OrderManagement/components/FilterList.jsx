import React from 'react';
import { 
  FiSearch, 
  FiRefreshCw,
  FiFilter,
  FiGrid,
  FiList,
  FiClock,
  FiTruck,
  FiActivity,
  FiCreditCard,
  FiDownload,
  FiShoppingCart
} from 'react-icons/fi';

const OrderFilters = ({ 
  filters, 
  statusOptions, 
  orderTypeOptions, 
  paymentStatusOptions, 
  loading,
  onSearchChange,
  onViewModeChange,
  onSortChange,
  onFiltersToggle,
  onRefresh,
  onExport,
  setFilters,
  ordersCount
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 p-6 mb-8 shadow-xl">
      {/* Search and View Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by customer, order ID, tracking number, or email..."
              value={filters.searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all duration-300 shadow-sm border border-gray-200"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                filters.viewMode === 'grid' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                filters.viewMode === 'list' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={filters.sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-300"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="customer">By Customer</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="status">By Status</option>
          </select>

          {/* Filter Toggle */}
          <button
            onClick={onFiltersToggle}
            className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
              filters.showFilters || filters.selectedStatus !== 'all' || filters.selectedOrderType !== 'all' || filters.paymentStatusFilter !== 'all'
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {(filters.selectedStatus !== 'all' || filters.selectedOrderType !== 'all' || filters.paymentStatusFilter !== 'all') && (
              <span className="w-2 h-2 bg-white rounded-full"></span>
            )}
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 bg-gray-50 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-300 shadow-sm flex items-center gap-2 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={() => onExport('csv')}
            disabled={loading}
            className="px-4 py-2 bg-green-50 rounded-xl text-green-600 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all duration-300 shadow-sm flex items-center gap-2 border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload className="w-4 h-4" />
            {loading ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Status and Type Filters */}
      {filters.showFilters && (
        <div className="border-t border-gray-200 pt-6 space-y-6">
          {/* Status Filters */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FiActivity className="w-4 h-4" />
              Filter by Order Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {statusOptions.map((status) => {
                const isSelected = filters.selectedStatus === status.value;
                const Icon = status.value === 'pending' ? FiClock :
                            status.value === 'shipped' ? FiTruck :
                            status.value === 'delivered' ? FiShoppingCart : FiShoppingCart;
                
                return (
                  <button
                    key={status.value}
                    onClick={() => setFilters(prev => ({ ...prev, selectedStatus: status.value }))}
                    className={`relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white border-transparent shadow-lg transform scale-105'
                        : 'bg-white hover:bg-red-50 border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isSelected 
                          ? 'bg-white/20' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-2xl font-bold ${
                        isSelected ? 'text-white' : 'text-gray-900'
                      }`}>
                        {status.count}
                      </span>
                    </div>
                    <div className={`font-medium text-sm ${
                      isSelected ? 'text-white' : 'text-gray-700'
                    }`}>
                      {status.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order Type and Payment Status Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FiTruck className="w-4 h-4" />
                Order Type
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {orderTypeOptions.map((type) => {
                  const isSelected = filters.selectedOrderType === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setFilters(prev => ({ ...prev, selectedOrderType: type.value }))}
                      className={`p-3 rounded-xl cursor-pointer transition-all duration-300 border-2 text-center ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-transparent shadow-lg transform scale-105'
                          : 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700'
                      }`}
                    >
                      <div className={`font-medium text-sm ${
                        isSelected ? 'text-white' : 'text-gray-700'
                      }`}>
                        {type.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FiCreditCard className="w-4 h-4" />
                Payment Status
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {paymentStatusOptions.map((payment) => {
                  const isSelected = filters.paymentStatusFilter === payment.value;
                  return (
                    <button
                      key={payment.value}
                      onClick={() => setFilters(prev => ({ ...prev, paymentStatusFilter: payment.value }))}
                      className={`p-3 rounded-xl cursor-pointer transition-all duration-300 border-2 text-center ${
                        isSelected
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-transparent shadow-lg transform scale-105'
                          : 'bg-white hover:bg-green-50 border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-700'
                      }`}
                    >
                      <div className={`font-medium text-sm ${
                        isSelected ? 'text-white' : 'text-gray-700'
                      }`}>
                        {payment.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-6">
        <div className="text-sm text-gray-600">
          {loading ? (
            <span>Loading orders...</span>
          ) : (
            <>
              Showing {ordersCount} orders
              {(filters.selectedStatus !== 'all' || filters.selectedOrderType !== 'all' || filters.paymentStatusFilter !== 'all') && (
                <div className="mt-2 flex gap-2">
                  {filters.selectedStatus !== 'all' && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
                      {statusOptions.find(s => s.value === filters.selectedStatus)?.label}
                    </span>
                  )}
                  {filters.selectedOrderType !== 'all' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                      {orderTypeOptions.find(t => t.value === filters.selectedOrderType)?.label}
                    </span>
                  )}
                  {filters.paymentStatusFilter !== 'all' && (
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                      {paymentStatusOptions.find(p => p.value === filters.paymentStatusFilter)?.label}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiClock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;