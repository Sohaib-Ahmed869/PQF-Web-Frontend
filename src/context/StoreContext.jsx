import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [selectedStore, setSelectedStoreState] = useState(null);
  const [orderType, setOrderType] = useState('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState({
    line1: '',
    line2: '',
    line3: ''
  });

  // Custom setter to avoid refetch if same store is selected
  const setSelectedStore = (store) => {
    if (!selectedStore || (store && selectedStore?._id !== store?._id)) {
      setSelectedStoreState(store);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    // Try pickup store first
    const pickupStore = localStorage.getItem('pickup_store');
    if (pickupStore) {
      setSelectedStore(JSON.parse(pickupStore));
      setOrderType('pickup');
      return;
    }
    // Try delivery address
    const line1 = localStorage.getItem('delivery_address_line1') || '';
    const line2 = localStorage.getItem('delivery_address_line2') || '';
    const line3 = localStorage.getItem('delivery_address_line3') || '';
    if (line1 || line2 || line3) {
      setDeliveryAddress({ line1, line2, line3 });
      setOrderType('delivery');
      setSelectedStore({
        name: `${line1}${line1 && line2 ? ', ' : ''}${line2}${(line1 || line2) && line3 ? ', ' : ''}${line3}`,
        isDeliveryAddress: true
      });
    }
  }, []);

  return (
    <StoreContext.Provider value={{ selectedStore, setSelectedStore, orderType, setOrderType, deliveryAddress, setDeliveryAddress }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext); 