import api from '../api';

// Create banner for any store (super admin)
const createBanner = async ({ storeId, image, isVisible, bannerType }) => {
  // Ensure storeId is provided
  if (!storeId) {
    throw new Error('storeId is required to create a banner');
  }
  const formData = new FormData();
  formData.append('storeId', storeId);
  formData.append('image', image);
  formData.append('isVisible', String(isVisible));
  formData.append('bannerType', bannerType);
  
  const response = await api.post('/superAdmin/banners/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

// Get all banners from all stores
const getAllBanners = async (params = {}) => {
  const { isVisible, bannerType, storeId, sortBy, sortOrder } = params;
  const queryParams = new URLSearchParams();
  
  if (isVisible !== undefined) queryParams.append('isVisible', String(isVisible));
  if (bannerType) queryParams.append('bannerType', bannerType);
  if (storeId) queryParams.append('storeId', storeId);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  
  const queryString = queryParams.toString();
  const url = `/superAdmin/banners/getAll${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(url);
  return response;
};

// Get global banner statistics
const getBannerStats = async () => {
  const response = await api.get('/superAdmin/banners/stats');
  return response;
};

// Get banners by specific store ID
const getBannersByStore = async (storeId, params = {}) => {
  const { isVisible, bannerType } = params;
  const queryParams = new URLSearchParams();
  
  if (isVisible !== undefined) queryParams.append('isVisible', String(isVisible));
  if (bannerType) queryParams.append('bannerType', bannerType);
  
  const queryString = queryParams.toString();
  const url = `/superAdmin/banners/store/${storeId}${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(url);
  return response;
};

// Get individual banner details
const getBannerById = async (bannerId) => {
  const response = await api.get(`/superAdmin/banners/IndividualBanner/${bannerId}`);
  return response;
};

// Update any banner from any store
const updateBanner = async (bannerId, data) => {
  // If data contains a file, create FormData
  if (data.image && data.image instanceof File) {
    const formData = new FormData();
    formData.append('image', data.image);
    if (data.isVisible !== undefined) formData.append('isVisible', String(data.isVisible));
    if (data.bannerType) formData.append('bannerType', data.bannerType);
    
    const response = await api.put(`/superAdmin/banners/update/${bannerId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }
  
  // If no file, send as JSON
  const response = await api.put(`/superAdmin/banners/update/${bannerId}`, data);
  return response;
};

// Delete any banner from any store
const deleteBanner = async (bannerId) => {
  const response = await api.delete(`/superAdmin/banners/delete/${bannerId}`);
  return response;
};

// Helper function to get banners with advanced filtering
const getFilteredBanners = async (filters = {}) => {
  const {
    isVisible,
    bannerType,
    storeId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    storeName,
    dateFrom,
    dateTo
  } = filters;
  
  const params = {
    isVisible,
    bannerType,
    storeId,
    sortBy,
    sortOrder
  };
  
  return getAllBanners(params);
};

const superAdminBannerService = {
  createBanner,
  getAllBanners,
  getBannerStats,
  getBannersByStore,
  getBannerById,
  updateBanner,
  deleteBanner,
  getFilteredBanners,
};

export default superAdminBannerService;