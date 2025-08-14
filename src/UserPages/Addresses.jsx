import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaGlobe, FaStar, FaSearch, FaFilter, FaTimes } from 'react-icons/fa'
import UserSidebar from './UserSidebar'
import userService from '../services/userService'
import LoaderOverlay from '../components/LoaderOverlay'

export default function Addresses() {
  const [addresses, setAddresses] = useState([])
  const [shippingAddress, setShippingAddress] = useState(null)
  const [billingAddress, setBillingAddress] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDefault, setFilterDefault] = useState(false)
  const [filterDefaultType, setFilterDefaultType] = useState('all') // 'all', 'shipping', 'billing', 'both'
  const [animatingCards, setAnimatingCards] = useState(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    setDefaultShipping: false,
    setDefaultBilling: false,
    setBoth: false
  })

  // Fetch addresses from backend
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true)
        const res = await userService.getAddresses()
        setAddresses(res.data.addresses.map(addr => ({ ...addr, id: addr._id })))
        setShippingAddress(res.data.shippingAddress)
        setBillingAddress(res.data.billingAddress)
      } catch (err) {
        console.error('Failed to fetch addresses', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAddresses()
  }, [])

  // Listen for sidebar width changes to adjust left margin dynamically
  useEffect(() => {
    const handler = (e) => {
      const content = document.getElementById('content-wrapper')
      if (!content) return
      const width = e?.detail?.width
      // On large screens, align content margin with sidebar width
      if (window.innerWidth >= 1024) {
        content.style.marginLeft = width || '16rem'
      } else {
        content.style.marginLeft = '0px'
      }
    }
    window.addEventListener('sidebar:width', handler)
    // Initialize with current width (expanded default)
    handler({ detail: { width: '16rem' } })
    const onResize = () => handler()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('sidebar:width', handler)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'setBoth') {
      setFormData(prev => ({
        ...prev,
        setBoth: checked,
        setDefaultShipping: checked ? true : prev.setDefaultShipping,
        setDefaultBilling: checked ? true : prev.setDefaultBilling
      }))
    } else {
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingAddress) {
        // Update address
        const payload = { ...formData }
        // Remove UI-only fields
        // Map frontend flags to backend flags
        payload.setAsShipping = !!formData.setDefaultShipping
        payload.setAsBilling = !!formData.setDefaultBilling
        payload.setBoth = !!formData.setBoth
        delete payload.setDefaultShipping
        delete payload.setDefaultBilling
        // setBoth is already correct
        const res = await userService.updateAddress(editingAddress._id || editingAddress.id, payload)
        setAddresses(res.data.addresses.map(addr => ({ ...addr, id: addr._id })))
        setShippingAddress(res.data.shippingAddress)
        setBillingAddress(res.data.billingAddress)
      } else {
        // Add address
        const payload = { ...formData }
        payload.setAsShipping = !!formData.setDefaultShipping
        payload.setAsBilling = !!formData.setDefaultBilling
        payload.setBoth = !!formData.setBoth
        delete payload.setDefaultShipping
        delete payload.setDefaultBilling
        // setBoth is already correct
        const res = await userService.addAddress(payload)
        setAddresses(res.data.addresses.map(addr => ({ ...addr, id: addr._id })))
        setShippingAddress(res.data.shippingAddress)
        setBillingAddress(res.data.billingAddress)
      }
    } catch (err) {
      console.error('Failed to save address', err)
    }
    setShowForm(false)
    setEditingAddress(null)
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      setDefaultShipping: false,
      setDefaultBilling: false,
      setBoth: false
    })
  }

  const handleEdit = (address) => {
    setEditingAddress(address)
    setFormData({
      name: address.name || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || '',
      setDefaultShipping: false,
      setDefaultBilling: false,
      setBoth: false
    })
    setShowForm(true)
  }

  const handleDelete = async (addressId) => {
    setAnimatingCards(prev => new Set([...prev, addressId]))
    try {
      await userService.deleteAddress(addressId)
      setAddresses(prev => prev.filter(addr => addr.id !== addressId))
      if (shippingAddress === addressId) setShippingAddress(null)
      if (billingAddress === addressId) setBillingAddress(null)
    } catch (err) {
      console.error('Failed to delete address', err)
    }
    setTimeout(() => {
      setAnimatingCards(prev => {
        const newSet = new Set(prev)
        newSet.delete(addressId)
        return newSet
      })
    }, 300)
  }

  const handleSetShipping = async (addressId) => {
    try {
      const res = await userService.setDefaultAddress('shipping', addressId)
      setShippingAddress(res.data.shippingAddress)
      setAddresses(res.data.addresses.map(addr => ({ ...addr, id: addr._id })))
    } catch (err) {
      console.error('Failed to set shipping address', err)
    }
  }

  const handleSetBilling = async (addressId) => {
    try {
      const res = await userService.setDefaultAddress('billing', addressId)
      setBillingAddress(res.data.billingAddress)
      setAddresses(res.data.addresses.map(addr => ({ ...addr, id: addr._id })))
    } catch (err) {
      console.error('Failed to set billing address', err)
    }
  }

  const handleSetBoth = async (addressId) => {
    try {
      const res = await userService.setShippingAndBillingSame(addressId)
      setShippingAddress(res.data.shippingAddress)
      setBillingAddress(res.data.billingAddress)
      setAddresses(res.data.addresses.map(addr => ({ ...addr, id: addr._id })))
    } catch (err) {
      console.error('Failed to set both addresses', err)
    }
  }

  const filteredAddresses = addresses.filter(address => {
    const matchesSearch = address.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         address.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         address.country?.toLowerCase().includes(searchTerm.toLowerCase())
    // Filter: show only default addresses if filterDefault is on
    let matchesFilter = true
    if (filterDefault) {
      const isShipping = shippingAddress && address._id === shippingAddress.toString()
      const isBilling = billingAddress && address._id === billingAddress.toString()
      if (filterDefaultType === 'shipping') matchesFilter = isShipping
      else if (filterDefaultType === 'billing') matchesFilter = isBilling
      else if (filterDefaultType === 'both') matchesFilter = isShipping && isBilling
      else matchesFilter = isShipping || isBilling
    }
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-white relative">
      <div className="hidden lg:block"><UserSidebar /></div>
      <div
        id="content-wrapper"
        className={`flex-1 flex justify-center items-start p-4 md:p-8 relative ${showForm ? 'z-[60]' : 'z-10'} ml-0 lg:ml-64 transition-all duration-300`}
      >
        <div className="w-full max-w-6xl relative">
          <div className="relative z-10">
            {/* Header */}
            <div className="flex flex-col items-start mb-8 space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-black mb-2">
                  Address
                </h1>
                <p className="text-black">Manage your address for delivery</p>
              </div>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 w-full">
                <div className="relative w-full sm:w-64 md:w-80 min-w-0">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8e191c] opacity-70" />
                  <input
                    type="text"
                    placeholder="Search addresses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#8e191c] rounded-xl text-black placeholder-black placeholder-opacity-40 focus:ring-2 focus:ring-[#8e191c] focus:border-transparent transition-all duration-300 shadow-sm"
                  />
                </div>
                <div className="relative w-full sm:w-auto">
                  <button
                    onClick={() => setFilterDefault(!filterDefault)}
                    className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 border border-[#8e191c] shadow-sm font-semibold ${
                      filterDefault 
                        ? 'bg-[#8e191c] text-white' 
                        : 'bg-white text-black hover:bg-[#8e191c]/10'
                    }`}
                  >
                    <FaFilter />
                    <span className="hidden sm:inline">Default Only</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowForm(true)}
                  className="group w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-[#8e191c] text-white rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                >
                  <FaPlus className="group-hover:rotate-90 transition-transform duration-300 text-white" />
                  <span className="hidden sm:inline text-white">Add Address</span>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <LoaderOverlay text="Loading your addresses..." />
            )}

            {/* Form Modal */}
            {showForm && (
              <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => {
                  setShowForm(false)
                  setEditingAddress(null)
                  setFormData({
                    name: '',
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: '',
                    setDefaultShipping: false,
                    setDefaultBilling: false,
                    setBoth: false
                  })
                }}
              >
                <div
                  className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative border border-[#8e191c] max-h-[90vh] overflow-y-auto custom-scrollbar"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Close (cross) icon */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingAddress(null)
                      setFormData({
                        name: '',
                        street: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: '',
                        setDefaultShipping: false,
                        setDefaultBilling: false,
                        setBoth: false
                      })
                    }}
                    className="absolute top-4 right-4 text-black hover:text-[#8e191c] text-2xl focus:outline-none"
                    aria-label="Close"
                  >
                    <FaTimes />
                  </button>
                  <h2 className="text-2xl font-bold mb-6 text-black">
                    {editingAddress ? 'Update Address' : 'Add New Address'}
                  </h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-black mb-2">
                          Address Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g., Home Base, Work Station"
                          className="w-full px-4 py-3 bg-[#f6faef] border border-[#8e191c] rounded-xl text-black placeholder-black placeholder-opacity-40 focus:ring-2 focus:ring-[#8e191c] focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-black mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          placeholder="123 Quantum Street"
                          className="w-full px-4 py-3 bg-[#f6faef] border border-[#8e191c] rounded-xl text-black placeholder-black placeholder-opacity-40 focus:ring-2 focus:ring-[#8e191c] focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Neo Tokyo"
                          className="w-full px-4 py-3 bg-[#f6faef] border border-[#8e191c] rounded-xl text-black placeholder-black placeholder-opacity-40 focus:ring-2 focus:ring-[#8e191c] focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          State/Province
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="Cyber District"
                          className="w-full px-4 py-3 bg-[#f6faef] border border-[#8e191c] rounded-xl text-black placeholder-black placeholder-opacity-40 focus:ring-2 focus:ring-[#8e191c] focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          ZIP/Postal Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          placeholder="00001"
                          className="w-full px-4 py-3 bg-[#f6faef] border border-[#8e191c] rounded-xl text-black placeholder-black placeholder-opacity-40 focus:ring-2 focus:ring-[#8e191c] focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="Digital Earth"
                          className="w-full px-4 py-3 bg-[#f6faef] border border-[#8e191c] rounded-xl text-black placeholder-black placeholder-opacity-40 focus:ring-2 focus:ring-[#8e191c] focus:border-transparent transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:space-x-6 space-y-3 md:space-y-0">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="setDefaultShipping"
                          checked={formData.setDefaultShipping || formData.setBoth}
                          onChange={handleChange}
                          className="w-5 h-5 text-[#8e191c] bg-[#f6faef] border-[#8e191c] rounded focus:ring-[#8e191c] focus:ring-2"
                          disabled={formData.setBoth}
                        />
                        <label className="text-black flex items-center space-x-2">
                          <FaStar className="text-[#8e191c]" />
                          <span>Set as default shipping address</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="setDefaultBilling"
                          checked={formData.setDefaultBilling || formData.setBoth}
                          onChange={handleChange}
                          className="w-5 h-5 text-[#8e191c] bg-[#f6faef] border-[#8e191c] rounded focus:ring-[#8e191c] focus:ring-2"
                          disabled={formData.setBoth}
                        />
                        <label className="text-black flex items-center space-x-2">
                          <FaStar className="text-[#8e191c]" />
                          <span>Set as default billing address</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="setBoth"
                          checked={formData.setBoth}
                          onChange={handleChange}
                          className="w-5 h-5 text-[#8e191c] bg-[#f6faef] border-[#8e191c] rounded focus:ring-[#8e191c] focus:ring-2"
                        />
                        <label className="text-black flex items-center space-x-2">
                          <FaStar className="text-[#8e191c]" />
                          <span>Set as default for both shipping & billing</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="submit"
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-[#8e191c] text-white rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                      >
                        <span className="text-white">{editingAddress ? 'Update Address' : 'Save Address'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Address Cards */}
            {!isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredAddresses.map((address) => {
                  const isShipping = shippingAddress && address._id === shippingAddress.toString();
                  const isBilling = billingAddress && address._id === billingAddress.toString();
                  return (
                    <div
                      key={address.id}
                      className={`group relative bg-white rounded-2xl p-6 border border-[#8e191c] hover:border-black transition-all duration-500 hover:shadow-xl hover:scale-105 ${
                        animatingCards.has(address.id) ? 'animate-pulse scale-110' : ''
                      }`}
                    >
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-[#8e191c]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-black mb-2 flex items-center space-x-2">
                              <FaMapMarkerAlt className="text-[#8e191c]" />
                              <span>{address.name}</span>
                            </h3>
                            {(isShipping || isBilling) && (
                              <span className="inline-flex items-center space-x-1 px-3 py-1 text-xs bg-[#8e191c] text-white rounded-full font-medium">
                                <FaStar />
                                <span>
                                  {isShipping && isBilling
                                    ? 'Default (Shipping & Billing)'
                                    : isShipping
                                      ? 'Default (Shipping)'
                                      : 'Default (Billing)'}
                                </span>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEdit(address)}
                              className="p-2 text-black hover:text-[#8e191c] hover:bg-[#f6faef] rounded-lg transition-all duration-300"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(address.id)}
                              className="p-2 text-black hover:text-[#8e191c] hover:bg-[#f6faef] rounded-lg transition-all duration-300"
                            >
                              <FaTrash />
                            </button>
                            {/* Set as shipping */}
                            {shippingAddress !== address._id && (
                              <button
                                onClick={() => handleSetShipping(address._id)}
                                className="px-3 py-2 text-[#8e191c] hover:text-white hover:bg-[#8e191c] border border-[#8e191c] rounded-lg transition-all duration-300"
                                title="Set as shipping address"
                              >
                                <span className="text-sm">Ship</span>
                              </button>
                            )}
                            {/* Set as billing */}
                            {billingAddress !== address._id && (
                              <button
                                onClick={() => handleSetBilling(address._id)}
                                className="px-3 py-2 text-[#8e191c] hover:text-white hover:bg-[#8e191c] border border-[#8e191c] rounded-lg transition-all duration-300"
                                title="Set as billing address"
                              >
                                <span className="text-sm">Bill</span>
                              </button>
                            )}
                            {/* Set as both */}
                            {(shippingAddress !== address._id || billingAddress !== address._id) && (
                              <button
                                onClick={() => handleSetBoth(address._id)}
                                className="px-3 py-2 text-[#8e191c] hover:text-white hover:bg-[#8e191c] border border-[#8e191c] rounded-lg transition-all duration-300"
                                title="Set as shipping & billing address"
                              >
                                <FaStar />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 text-black">
                          <p className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#8e191c] rounded-full"></span>
                            <span>{address.street}</span>
                          </p>
                          <p className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-black rounded-full"></span>
                            <span>{address.city}, {address.state} {address.zipCode}</span>
                          </p>
                          <p className="flex items-center space-x-2">
                            <FaGlobe className="text-[#8e191c]" />
                            <span>{address.country}</span>
                          </p>
                           <div className="flex flex-wrap gap-2 mt-2">
                            {shippingAddress === address._id && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-[#8e191c] text-white rounded-full font-medium">Ship</span>
                            )}
                            {billingAddress === address._id && (
                              <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-black text-white rounded-full font-medium">Bill</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoading && filteredAddresses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl text-[#8e191c] mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-black mb-2">No addresses found</h3>
                <p className="text-black mb-6">
                  {searchTerm || filterDefault ? 'Try adjusting your search or filters' : 'Add your first address to get started'}
                </p>
                {!searchTerm && !filterDefault && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-[#8e191c] rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg font-semibold text-white"
                  >
                    <span className="text-white">Add Your First Address</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}