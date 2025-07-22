import api from '../api';

const getAllCategories = async () => {
  const response = await api.get('/superAdmin/category/getAll');
  return response;
};

const getCategoryStats = async () => {
  const response = await api.get('/superAdmin/category/stats');
  return response;
};

const getCategoryByStore = async (storeId) => {
  const response = await api.get(`/superAdmin/category/store/${storeId}`);
  return response;
};

const createCategory = async ({ name, ItemsGroupCode, image, isActive, storeId, ...additionalData }) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('ItemsGroupCode', ItemsGroupCode);
  formData.append('image', image);
  formData.append('isActive', String(isActive));
  
  // Add store ID if provided
  if (storeId) {
    formData.append('storeId', storeId);
  }
  
  // Add any additional data
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key]);
  });

  const response = await api.post('/superAdmin/category/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // If creation successful, refresh cache immediately
  if (response.status >= 200 && response.status < 300) {
    await refreshCache();
  }
  
  return response;
};

const updateCategory = async (categoryId, data) => {
  const response = await api.put(`/superAdmin/category/update/${categoryId}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  
  // If update successful, refresh cache immediately
  if (response.status >= 200 && response.status < 300) {
    await refreshCache();
  }
  
  return response;
};

const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/superAdmin/category/delete/${categoryId}`);
  
  // If deletion successful, refresh cache immediately
  if (response.status >= 200 && response.status < 300) {
    await refreshCache();
  }
  
  return response;
};

// Smart cache with immediate invalidation and update
const SUPER_ADMIN_CATEGORY_CACHE_KEY = 'super_admin_categories_cache';
const SUPER_ADMIN_CATEGORY_CACHE_TIMESTAMP_KEY = 'super_admin_categories_cache_timestamp';
const SUPER_ADMIN_CATEGORY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const getCachedCategories = () => {
  const cache = localStorage.getItem(SUPER_ADMIN_CATEGORY_CACHE_KEY);
  const timestamp = localStorage.getItem(SUPER_ADMIN_CATEGORY_CACHE_TIMESTAMP_KEY);
  if (cache && timestamp) {
    const age = Date.now() - Number(timestamp);
    if (age < SUPER_ADMIN_CATEGORY_CACHE_TTL_MS) {
      try {
        return JSON.parse(cache);
      } catch {
        return null;
      }
    }
  }
  return null;
};

const setCachedCategories = (categories) => {
  localStorage.setItem(SUPER_ADMIN_CATEGORY_CACHE_KEY, JSON.stringify(categories));
  localStorage.setItem(SUPER_ADMIN_CATEGORY_CACHE_TIMESTAMP_KEY, Date.now().toString());
};

const refreshCache = async () => {
  const response = await api.get('/superAdmin/category/getAll');
  const categories = response.data?.data || [];
  setCachedCategories(categories);
  return response;
};

const getAllCategoriesWithCache = async () => {
  const cached = getCachedCategories();
  if (cached) {
    return { data: { data: cached } };
  }
  
  return await refreshCache();
};

// Smart mutation methods that immediately update cache
const createCategoryAndRefresh = async (data) => {
  const response = await createCategory(data);
  
  // If creation successful, refresh cache immediately
  if (response.status >= 200 && response.status < 300) {
    await refreshCache();
  }
  
  return response;
};

const updateCategoryAndRefresh = async (categoryId, data) => {
  const response = await updateCategory(categoryId, data);
  
  // If update successful, refresh cache immediately
  if (response.status >= 200 && response.status < 300) {
    await refreshCache();
  }
  
  return response;
};

const deleteCategoryAndRefresh = async (categoryId) => {
  const response = await deleteCategory(categoryId);
  
  // If deletion successful, refresh cache immediately
  if (response.status >= 200 && response.status < 300) {
    await refreshCache();
  }
  
  return response;
};

const superAdminCategoryService = {
  getAllCategories,
  getAllCategoriesWithCache,
  getCategoryStats,
  getCategoryByStore,
  createCategory,
  updateCategory,
  deleteCategory,
  refreshCache,
};

export default superAdminCategoryService;