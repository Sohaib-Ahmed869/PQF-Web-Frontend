import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Phone, Mail, X, Navigation, Store, ChevronRight, Truck, ShoppingBag } from 'lucide-react';
import webService from '../../services/Website/WebService';
import { useStore } from '../../context/StoreContext';

const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getStoreAddress = (store) => {
  if (store.location?.address) {
    const addr = store.location.address;
    const parts = [addr.street, addr.city, addr.state, addr.country].filter(Boolean);
    return parts.join(', ');
  }
  return 'Address not available';
};

const formatBusinessHours = (businessHours) => {
  if (!businessHours) return 'Hours not available';
  // Get current day as lowercase string
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[new Date().getDay()];
  const todayHours = businessHours[currentDay];
  if (!todayHours) return 'Hours not available';
  if (todayHours.closed) return 'Closed today';
  return `Open today: ${todayHours.open} - ${todayHours.close}`;
};

const isStoreOpen = (businessHours) => {
  if (!businessHours) return false;
  
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = businessHours[currentDay];
  if (!todayHours || todayHours.closed) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

const StoreCard = ({ store, onSelect, isSelected, distance, orderType }) => {
  const storeOpen = isStoreOpen(store.businessHours);
  
  return (
    <div 
      className={`
        border-2 rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-lg bg-white
        ${isSelected ? 'border-red-500 shadow-lg ring-2 ring-red-100' : 'border-gray-200 hover:border-red-300'}
      `}
      onClick={() => onSelect(store)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">
            {store.name}
          </h3>
          <div className="flex items-start text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" />
            <span className="line-clamp-2">{getStoreAddress(store)}</span>
          </div>
        </div>
        {Number.isFinite(distance) && (
          <div className="text-sm font-bold text-white bg-black px-3 py-1 rounded-full">
            {distance.toFixed(1)} km
          </div>
        )}
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          <span className={`font-medium ${storeOpen ? 'text-green-600' : 'text-red-500'}`}>
            {storeOpen ? 'OPEN' : 'CLOSED'} • {formatBusinessHours(store.businessHours)}
          </span>
        </div>
        
        {store.contact?.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 text-gray-400" />
            <span>{store.contact.phone}</span>
          </div>
        )}
        
        {store.contact?.email && (
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2 text-gray-400" />
            <span>{store.contact.email}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs">
          {store.features?.delivery && (
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded flex items-center">
              <Truck className="w-3 h-3 mr-1" />
              Delivery
            </span>
          )}
          {store.features?.pickup && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center">
              <ShoppingBag className="w-3 h-3 mr-1" />
              Pickup
            </span>
          )}
          {store.features?.onlineOrdering && (
            <span className="bg-black text-white px-2 py-1 rounded">Online Order</span>
          )}
        </div>
        
        <button 
          className={`
            px-6 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105
            ${isSelected 
              ? 'bg-red-600 text-white shadow-lg' 
              : 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white'
            }
          `}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(store);
          }}
        >
          {isSelected ? '✓ SELECTED' : 'SELECT'}
        </button>
      </div>
    </div>
  );
};

const StoreSelector = ({ 
  isOpen, 
  onClose, 
  selectedStore, 
  onStoreSelect, 
  canClose = true 
}) => {
  // Only destructure useStore once here:
  const { deliveryAddress, setOrderType, setDeliveryAddress } = useStore();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // Use a local state for UI switching, but do not redeclare setOrderType
  const [orderTypeLocal, setOrderTypeLocal] = useState('delivery'); // 'delivery' or 'pickup'
  const [addressError, setAddressError] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressLine3, setAddressLine3] = useState('');
  const modalRef = useRef(null);

  // Pre-populate address fields when modal opens
  useEffect(() => {
    if (isOpen && orderTypeLocal === 'delivery' && deliveryAddress) {
      setAddressLine1(deliveryAddress.line1 || '');
      setAddressLine2(deliveryAddress.line2 || '');
      setAddressLine3(deliveryAddress.line3 || '');
    }
  }, [isOpen, orderTypeLocal, deliveryAddress]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (canClose) onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, canClose, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchStores();
    }
  }, [isOpen]);

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await webService.getActiveStores();
      const storesData = response.data?.data || [];
      setStores(storesData);
    } catch (err) {
      setError('Failed to load stores. Please try again.');
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = () => {
    setLocationLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setSortByDistance(true);
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        setError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const getFilteredAndSortedStores = () => {
    let filtered = stores;

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = stores.filter(store => 
        store.name.toLowerCase().includes(search) ||
        getStoreAddress(store).toLowerCase().includes(search)
      );
    }

    // Calculate distances and sort if location is available
    if (userLocation && sortByDistance) {
      filtered = filtered.map(store => ({
        ...store,
        distance: store.latitude && store.longitude 
          ? getDistance(userLocation.latitude, userLocation.longitude, store.latitude, store.longitude)
          : Infinity
      })).sort((a, b) => a.distance - b.distance);
    }

    return filtered;
  };

  const handleStoreSelect = (store) => {
    // Validate delivery address if delivery is selected
    if (orderTypeLocal === 'delivery') {
      if (!addressLine1.trim() || !addressLine2.trim() || !addressLine3.trim()) {
        setAddressError('Please fill all delivery address fields');
        return;
      }
      setAddressError('');
      // Store delivery address in localStorage
      localStorage.setItem('delivery_address_line1', addressLine1);
      localStorage.setItem('delivery_address_line2', addressLine2);
      localStorage.setItem('delivery_address_line3', addressLine3);
      // Update context for Navbar
      setOrderType('delivery');
      setDeliveryAddress({ line1: addressLine1, line2: addressLine2, line3: addressLine3 });
    } else if (orderTypeLocal === 'pickup') {
      // Store selected store in localStorage
      localStorage.setItem('pickup_store', JSON.stringify(store));
      // Update context for Navbar
      setOrderType('pickup');
      setDeliveryAddress({ line1: '', line2: '', line3: '' });
    }
    
    const fullAddress = `${addressLine1}, ${addressLine2}, ${addressLine3}`;
    onStoreSelect({ ...store, deliveryAddress: fullAddress });
    if (canClose) {
      onClose();
    }
  };

  const validateDeliveryAddress = () => {
    if (orderTypeLocal === 'delivery' && (!addressLine1.trim() || !addressLine2.trim() || !addressLine3.trim())) {
      setAddressError('All delivery address fields are required');
      return false;
    }
    setAddressError('');
    return true;
  };

  if (!isOpen) return null;

  const filteredStores = getFilteredAndSortedStores();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm pointer-events-none" />
      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-2 my-2 flex flex-col h-full max-h-[95vh] min-h-0 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-black text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-full p-2">
                <Store className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">SELECT YOUR STORE</h2>
                <p className="text-red-100 text-sm">Choose your preferred store location</p>
              </div>
            </div>
            {canClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Order Type Selector */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center space-x-4 mb-4">
            <span className="font-bold text-gray-700">ORDER TYPE:</span>
            <div className="flex bg-white rounded-full p-1 shadow-inner">
              <button
                onClick={() => {
                  setOrderTypeLocal('delivery');
                  setOrderType('delivery'); // Update context immediately
                  setAddressError('');
                }}
                className={`flex items-center px-6 py-2 rounded-full font-bold text-sm transition-all
                  ${orderTypeLocal === 'delivery' 
                    ? 'bg-red-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:text-red-600'
                  }`}
              >
                <Truck className="w-4 h-4 mr-2" />
                DELIVERY
              </button>
              <button
                onClick={() => {
                  setOrderTypeLocal('pickup');
                  setOrderType('pickup'); // Update context immediately
                  setAddressError('');
                  setDeliveryAddress({ line1: '', line2: '', line3: '' });
                }}
                className={`flex items-center px-6 py-2 rounded-full font-bold text-sm transition-all
                  ${orderTypeLocal === 'pickup' 
                    ? 'bg-black text-white shadow-lg' 
                    : 'text-gray-600 hover:text-black'
                  }`}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                PICKUP
              </button>
            </div>
          </div>

          {/* Delivery Address Input */}
          {orderTypeLocal === 'delivery' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <span className="font-bold text-gray-700">DELIVERY ADDRESS:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Home / Apartment / Office / Plot number"
                  value={addressLine1}
                  onChange={e => {
                    setAddressLine1(e.target.value);
                    setDeliveryAddress({ line1: e.target.value, line2: addressLine2, line3: addressLine3 });
                    if (addressError) setAddressError('');
                  }}
                  onBlur={validateDeliveryAddress}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 font-medium transition-colors ${addressError && !addressLine1.trim() ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'}`}
                />
                <input
                  type="text"
                  placeholder="Street / Building / Landmark"
                  value={addressLine2}
                  onChange={e => {
                    setAddressLine2(e.target.value);
                    setDeliveryAddress({ line1: addressLine1, line2: e.target.value, line3: addressLine3 });
                    if (addressError) setAddressError('');
                  }}
                  onBlur={validateDeliveryAddress}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 font-medium transition-colors ${addressError && !addressLine2.trim() ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'}`}
                />
                <input
                  type="text"
                  placeholder="Sector / Block / Phase"
                  value={addressLine3}
                  onChange={e => {
                    setAddressLine3(e.target.value);
                    setDeliveryAddress({ line1: addressLine1, line2: addressLine2, line3: e.target.value });
                    if (addressError) setAddressError('');
                  }}
                  onBlur={validateDeliveryAddress}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 font-medium transition-colors ${addressError && !addressLine3.trim() ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:ring-red-500 focus:border-red-500'}`}
                />
              </div>
              {addressError && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <X className="w-4 h-4" />
                  <span className="font-medium">{addressError}</span>
                </div>
              )}
              <div className="text-xs text-gray-500 bg-white p-3 rounded-lg border border-gray-200">
                <strong>💡 Tip:</strong> Include building name, floor, apartment number, and nearby landmarks for faster delivery
              </div>
            </div>
          )}
        </div>

        {/* Search and Location */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by store name or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 font-medium"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={requestLocation}
              disabled={locationLoading}
              className="flex items-center justify-center px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 disabled:bg-gray-400 transition-colors font-bold whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Navigation className="w-5 h-5 mr-2" />
              {locationLoading ? 'LOCATING...' : 'USE MY LOCATION'}
            </button>
          </div>
          
          {userLocation && (
            <div className="flex items-center text-sm text-green-600 mt-3 bg-green-50 px-3 py-2 rounded-full">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="font-medium">📍 Location found - stores sorted by distance</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 bg-gray-50 overflow-y-auto max-h-[60vh] sm:max-h-full">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mb-4"></div>
                <p className="text-gray-600 font-medium">Finding nearby stores...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg">
                <div className="text-red-500 mb-4">
                  <X className="w-16 h-16 mx-auto" />
                </div>
                <p className="text-gray-600 mb-4 font-medium">{error}</p>
                <button
                  onClick={fetchStores}
                  className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-bold shadow-lg"
                >
                  TRY AGAIN
                </button>
              </div>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  {searchTerm ? 'No stores found matching your search.' : 'No stores available.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredStores.map((store) => (
                  <StoreCard
                    key={store._id}
                    store={store}
                    onSelect={handleStoreSelect}
                    isSelected={selectedStore?._id === store._id}
                    distance={store.distance}
                    orderType={orderTypeLocal}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedStore && (
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">
                  Selected Store: <span className="font-bold text-gray-900">{selectedStore.name}</span>
                </span>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  orderTypeLocal === 'delivery' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {orderTypeLocal.toUpperCase()}
                </div>
                {/* Show address based on order type */}
                {orderTypeLocal === 'delivery' && (addressLine1 || addressLine2 || addressLine3) && (
                  <div className="hidden lg:flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                    <MapPin className="w-3 h-3 mr-1" />
                    {`${addressLine1}, ${addressLine2}, ${addressLine3}`.length > 30 ? `${`${addressLine1}, ${addressLine2}, ${addressLine3}`.substring(0, 30)}...` : `${addressLine1}, ${addressLine2}, ${addressLine3}`}
                  </div>
                )}
                {orderTypeLocal === 'pickup' && (
                  <div className="hidden lg:flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    <MapPin className="w-3 h-3 mr-1" />
                    {getStoreAddress(selectedStore)}
                  </div>
                )}
              </div>
              {canClose && (
                <button
                  onClick={() => {
                    if (orderTypeLocal === 'delivery' && !validateDeliveryAddress()) {
                      return;
                    }
                    onClose();
                  }}
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-red-600 to-black text-white rounded-full hover:from-red-700 hover:to-gray-800 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  CONTINUE TO ORDER
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreSelector;