import React, { useState, useEffect } from 'react';
import {
  FiArrowLeft,
  FiSave,
  FiShoppingBag,
  FiMapPin,
  FiPhone,
  FiMail,
  FiGlobe,
  FiClock,
  FiSettings,
  FiCheck,
  FiX,
  FiZap,
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import storeService from '../../../services/SuperAdmin/storeService';
import LoaderOverlay from '../../../components/LoaderOverlay';

const EditStore = ({ store, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      coordinates: {
        latitude: '',
        longitude: ''
      }
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '10:00', close: '17:00', closed: false }
    },
    settings: {
      currency: 'USD',
      timezone: 'UTC',
      language: 'en',
      taxRate: 0
    },
    features: {
      onlineOrdering: true,
      delivery: true,
      pickup: true,
      reservations: false
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || '',
        description: store.description || '',
        location: {
          address: {
            street: store.location?.address?.street || '',
            city: store.location?.address?.city || '',
            state: store.location?.address?.state || '',
            zipCode: store.location?.address?.zipCode || '',
            country: store.location?.address?.country || ''
          },
          coordinates: {
            latitude: store.location?.coordinates?.latitude || '',
            longitude: store.location?.coordinates?.longitude || ''
          }
        },
        contact: {
          phone: store.contact?.phone || '',
          email: store.contact?.email || '',
          website: store.contact?.website || ''
        },
        businessHours: store.businessHours || {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: false },
          sunday: { open: '10:00', close: '17:00', closed: false }
        },
        settings: store.settings || {
          currency: 'USD',
          timezone: 'UTC',
          language: 'en',
          taxRate: 0
        },
        features: store.features || {
          onlineOrdering: true,
          delivery: true,
          pickup: true,
          reservations: false
        },
        socialMedia: store.socialMedia || {
          facebook: '',
          instagram: '',
          twitter: ''
        }
      });
    }
  }, [store]);

  // Step validation logic
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      // Basic Information Validation
      if (!formData.name.trim()) {
        newErrors.name = 'Store name is required';
      } else if (formData.name.length > 100) {
        newErrors.name = 'Store name cannot exceed 100 characters';
      }
      if (formData.description && formData.description.length > 500) {
        newErrors.description = 'Description cannot exceed 500 characters';
      }
    } else if (step === 2) {
      // Location Validation
      if (!formData.location.address.street.trim()) {
        newErrors.street = 'Street address is required';
      }
      if (!formData.location.address.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.location.address.country.trim()) {
        newErrors.country = 'Country is required';
      }
    } else if (step === 3) {
      // Contact Information Validation
      if (!formData.contact.email.trim()) {
        newErrors.email = 'Email is required';
      } else {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(formData.contact.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
      }
      if (!formData.contact.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      toast.error('Please fix the errors in this step');
      return;
    }

    setLoading(true);

    try {
      // Clean up the data before sending
      const cleanData = {
        name: formData.name,
        description: formData.description,
        location: {
          address: {
            street: formData.location.address.street,
            city: formData.location.address.city,
            state: formData.location.address.state,
            zipCode: formData.location.address.zipCode,
            country: formData.location.address.country,
          },
        },
        contact: {
          phone: formData.contact.phone,
          email: formData.contact.email,
          website: formData.contact.website,
        },
        businessHours: formData.businessHours,
        settings: {
          currency: formData.settings.currency,
          language: formData.settings.language,
        },
        features: {
          onlineOrdering: formData.features.onlineOrdering,
          delivery: formData.features.delivery,
          pickup: formData.features.pickup,
        },
        socialMedia: {
          facebook: formData.socialMedia.facebook,
          instagram: formData.socialMedia.instagram,
          twitter: formData.socialMedia.twitter,
        },
      };

      await storeService.updateStore(store._id, cleanData);

      toast.success('Store updated successfully! 🎉', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating store:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update store. Please try again.';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const CheckboxField = ({ label, name, checked, onChange, description }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="w-5 h-5 text-[#8e191c] border-gray-300 rounded focus:ring-[#8e191c]"
        />
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>
      {description && (
        <p className="text-xs text-gray-500 ml-8">{description}</p>
      )}
    </div>
  );

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div
          key={step}
          className={`flex items-center space-x-2 ${step <= currentStep ? 'text-[#8e191c]' : 'text-gray-400'
            }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step <= currentStep
                ? 'bg-[#8e191c] border-[#8e191c] text-white'
                : 'border-gray-300 text-gray-400'
              }`}
          >
            {step < currentStep ? <FiCheck className="w-4 h-4" /> : step}
          </div>
          {step < 5 && (
            <div
              className={`w-12 h-0.5 ${step < currentStep ? 'bg-[#8e191c]' : 'bg-gray-300'
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Please fix the errors in this step');
    }
  };

  const handleBackStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  if (!store) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <FiShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Store not found</h3>
          <p className="text-gray-500">The store you're trying to edit doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {loading && <LoaderOverlay text="Updating Store..." />}
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#8e191c]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#a51d20]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-[#8e191c]/5 hover:border-[#8e191c]/20 hover:text-[#8e191c] transition-all duration-300"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Edit Store</h1>
              <p className="text-gray-600 mt-2 text-lg">Update store information</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-4 py-2 rounded-full bg-[#8e191c]/10 border border-[#8e191c]/20 text-[#8e191c] text-sm font-medium">
              <FiZap className="w-4 h-4 inline mr-2" />
              Edit Mode
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl bg-[#8e191c]/10 border border-[#8e191c]/20">
                  <FiShoppingBag className="w-5 h-5 text-[#8e191c]" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Store Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    placeholder="Enter store name"
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${errors.name
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20'
                      } focus:outline-none focus:ring-2`}
                  />
                  {errors.name && (
                    <div className="flex items-center space-x-1 text-red-500 text-sm">
                      <FiAlertCircle className="w-4 h-4" />
                      <span>{errors.name}</span>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Enter store description (optional)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20 focus:outline-none focus:ring-2 transition-all duration-200"
                    />
                    {errors.description && (
                      <div className="flex items-center space-x-1 text-red-500 text-sm">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>{errors.description}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Maximum 500 characters ({formData.description.length}/500)
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-8">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="px-8 py-4 border border-gray-200 text-gray-700 rounded-2xl font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-4 bg-gradient-to-r from-[#8e191c] to-[#a51d20] text-white rounded-2xl font-medium flex items-center gap-3 shadow-xl hover:shadow-[#8e191c]/25"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Location Information */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl bg-[#7a1518]/10 border border-[#7a1518]/20">
                  <FiMapPin className="w-5 h-5 text-[#7a1518]" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Location Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.address.street}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        location: {
                          ...prev.location,
                          address: {
                            ...prev.location.address,
                            street: e.target.value
                          }
                        }
                      }))}
                      placeholder="Enter street address"
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${errors.street
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20'
                        } focus:outline-none focus:ring-2`}
                    />
                    {errors.street && (
                      <div className="flex items-center space-x-1 text-red-500 text-sm">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>{errors.street}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location.address.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        address: {
                          ...prev.location.address,
                          city: e.target.value
                        }
                      }
                    }))}
                    placeholder="Enter city"
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${errors.city
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20'
                      } focus:outline-none focus:ring-2`}
                  />
                  {errors.city && (
                    <div className="flex items-center space-x-1 text-red-500 text-sm">
                      <FiAlertCircle className="w-4 h-4" />
                      <span>{errors.city}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={formData.location.address.state}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        address: {
                          ...prev.location.address,
                          state: e.target.value
                        }
                      }
                    }))}
                    placeholder="Enter state or province"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20 focus:outline-none focus:ring-2 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.location.address.zipCode}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        address: {
                          ...prev.location.address,
                          zipCode: e.target.value
                        }
                      }
                    }))}
                    placeholder="Enter ZIP or postal code"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20 focus:outline-none focus:ring-2 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location.address.country}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location: {
                        ...prev.location,
                        address: {
                          ...prev.location.address,
                          country: e.target.value
                        }
                      }
                    }))}
                    placeholder="Enter country"
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${errors.country
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20'
                      } focus:outline-none focus:ring-2`}
                  />
                  {errors.country && (
                    <div className="flex items-center space-x-1 text-red-500 text-sm">
                      <FiAlertCircle className="w-4 h-4" />
                      <span>{errors.country}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between pt-8">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="px-8 py-4 border border-gray-200 text-gray-700 rounded-2xl font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-4 bg-gradient-to-r from-[#8e191c] to-[#a51d20] text-white rounded-2xl font-medium flex items-center gap-3 shadow-xl hover:shadow-[#8e191c]/25"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl bg-[#a51d20]/10 border border-[#a51d20]/20">
                  <FiPhone className="w-5 h-5 text-[#a51d20]" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        phone: e.target.value
                      }
                    }))}
                    placeholder="Enter phone number"
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${errors.phone
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20'
                      } focus:outline-none focus:ring-2`}
                  />
                  {errors.phone && (
                    <div className="flex items-center space-x-1 text-red-500 text-sm">
                      <FiAlertCircle className="w-4 h-4" />
                      <span>{errors.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      contact: {
                        ...prev.contact,
                        email: e.target.value
                      }
                    }))}
                    placeholder="Enter email address"
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20'
                      } focus:outline-none focus:ring-2`}
                  />
                  {errors.email && (
                    <div className="flex items-center space-x-1 text-red-500 text-sm">
                      <FiAlertCircle className="w-4 h-4" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.contact.website}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        contact: {
                          ...prev.contact,
                          website: e.target.value
                        }
                      }))}
                      placeholder="Enter website URL (optional)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20 focus:outline-none focus:ring-2 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-8">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="px-8 py-4 border border-gray-200 text-gray-700 rounded-2xl font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-4 bg-gradient-to-r from-[#8e191c] to-[#a51d20] text-white rounded-2xl font-medium flex items-center gap-3 shadow-xl hover:shadow-[#8e191c]/25"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Business Hours */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl bg-[#c12126]/10 border border-[#c12126]/20">
                  <FiClock className="w-5 h-5 text-[#c12126]" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900">Business Hours</h3>
              </div>

              <div className="space-y-4">
                {Object.entries(formData.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-28">
                      <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={hours.closed}
                        onChange={(e) => handleBusinessHoursChange(day, 'closed', e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-600">Closed</span>
                    </div>
                    {!hours.closed && (
                      <div className="flex items-center space-x-3">
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#8e191c] focus:ring-[#8e191c]/20 focus:outline-none focus:ring-2"
                        />
                        <span className="text-sm text-gray-600">to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#8e191c] focus:ring-[#8e191c]/20 focus:outline-none focus:ring-2"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-8">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="px-8 py-4 border border-gray-200 text-gray-700 rounded-2xl font-medium"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-4 bg-gradient-to-r from-[#8e191c] to-[#a51d20] text-white rounded-2xl font-medium flex items-center gap-3 shadow-xl hover:shadow-[#8e191c]/25"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Store Settings, Features & Social Media */}
          {currentStep === 5 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Store Settings */}
                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 rounded-xl bg-[#8e191c]/10 border border-[#8e191c]/20">
                      <FiSettings className="w-5 h-5 text-[#8e191c]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Store Settings</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Currency</label>
                      <select
                        value={formData.settings.currency}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            currency: e.target.value
                          }
                        }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20 focus:outline-none focus:ring-2"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="AED">AED - UAE Dirham</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Language</label>
                      <select
                        value={formData.settings.language}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            language: e.target.value
                          }
                        }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20 focus:outline-none focus:ring-2"
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="ar">Arabic</option>
                        <option value="es">Spanish</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 rounded-xl bg-[#a51d20]/10 border border-[#a51d20]/20">
                      <FiSettings className="w-5 h-5 text-[#a51d20]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Store Features</h3>
                  </div>

                  <div className="space-y-4">
                    <CheckboxField
                      label="Online Ordering"
                      name="features.onlineOrdering"
                      checked={formData.features.onlineOrdering}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        features: {
                          ...prev.features,
                          onlineOrdering: e.target.checked
                        }
                      }))}
                      description="Allow customers to place orders online"
                    />
                    <CheckboxField
                      label="Delivery Service"
                      name="features.delivery"
                      checked={formData.features.delivery}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        features: {
                          ...prev.features,
                          delivery: e.target.checked
                        }
                      }))}
                      description="Offer delivery to customers"
                    />
                    <CheckboxField
                      label="Pickup Service"
                      name="features.pickup"
                      checked={formData.features.pickup}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        features: {
                          ...prev.features,
                          pickup: e.target.checked
                        }
                      }))}
                      description="Allow customers to pick up orders"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-xl bg-[#c12126]/10 border border-[#c12126]/20">
                    <FiGlobe className="w-5 h-5 text-[#c12126]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Social Media</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          facebook: e.target.value
                        }
                      }))}
                      placeholder="https://facebook.com/yourstore"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20 focus:outline-none focus:ring-2 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          instagram: e.target.value
                        }
                      }))}
                      placeholder="https://instagram.com/yourstore"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20 focus:outline-none focus:ring-2 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          twitter: e.target.value
                        }
                      }))}
                      placeholder="https://twitter.com/yourstore"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8e191c] focus:ring-[#8e191c]/20 focus:outline-none focus:ring-2 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-8">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="px-8 py-4 border border-gray-200 text-gray-700 rounded-2xl font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative px-10 py-4 bg-gradient-to-r from-[#8e191c] to-[#a51d20] text-white rounded-2xl font-medium flex items-center gap-3 shadow-xl hover:shadow-[#8e191c]/25 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative z-10 flex items-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Updating Store...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-5 h-5" />
                        Update Store
                      </>
                    )}
                  </div>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditStore;