import api from '../api';

// Utility to get selected store ID from localStorage
const getSelectedStoreId = () => {
  const id = localStorage.getItem('selected_store_id');
  console.log('Selected Store ID:', id);
  return id;
};

// Get active banners by store
const getActiveBannersByStore = async () => {
  const storeId = getSelectedStoreId();
  const response = await api.get('/web/banners/active', {
    params: storeId ? { storeId } : {}
  });
  const banners = response.data?.data || response.data || [];
  return { data: { data: banners } };
};

// Get active categories by store
const getActiveCategoriesByStore = async () => {
  const storeId = getSelectedStoreId();
  const response = await api.get('/web/categories/active', {
    params: storeId ? { storeId } : {}
  });

  const categories = response.data?.data || response.data || [];
  return { data: { data: categories } };
};

// Get active stores
const getActiveStores = async () => {
  const response = await api.get('/web/stores/active');
  const stores = response.data?.data || response.data || [];
  return { data: { data: stores } };
};

// Get top 3 active products by store
const getTop3ActiveProductsByStore = async () => {
  const storeId = getSelectedStoreId();
  const response = await api.get('/web/products/active/top3', {
    params: storeId ? { storeId } : {}
  });
  const products = response.data?.data?.products || response.data?.data || response.data || [];
  return { data: { data: products } };
};

// Get active products by store
const getActiveProductsByStore = async (params = {}) => {
  const storeId = getSelectedStoreId();
  const response = await api.get('/web/products/active', {
    params: {
      ...params,
      ...(storeId ? { storeId } : {})
    }
  });
  const products = response.data?.data?.products || response.data?.data || response.data || [];
  return { data: { data: products } };
};

// Get active products by category
const getActiveProductsByCategory = async (categoryId, params = {}) => {
  const storeId = getSelectedStoreId();
  const response = await api.get('/web/products/active', {
    params: {
      category: categoryId,
      ...params,
      ...(storeId ? { storeId } : {})
    }
  });
  const products = response.data?.data?.products || response.data?.data || response.data || [];
  return { data: { data: products } };
};

// Search active products
const searchActiveProducts = async (searchQuery, params = {}) => {
  if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim().length === 0) {
    return { data: { data: [] } };
  }
  const storeId = getSelectedStoreId();
  const response = await api.get('/web/products/active', {
    params: {
      search: searchQuery.trim(),
      ...params,
      ...(storeId ? { storeId } : {})
    }
  });
  const products = response.data?.data?.products || response.data?.data || response.data || [];
  return { data: { data: products } };
};

// Get featured/recommended products (using top 3 endpoint)
const getFeaturedProducts = async () => {
  return await getTop3ActiveProductsByStore();
};

// Get store details by ID (if you have individual store endpoint)
const getStoreById = async (storeId) => {
  try {
    const response = await api.get(`/web/stores/${storeId}`);
    return response;
  } catch (error) {
    // Fallback to getting all stores and filtering
    const allStores = await getActiveStores();
    const store = allStores.data?.data?.find(s => s._id === storeId || s.id === storeId);
    return { data: { data: store } };
  }
};

// Get category details by ID (if you have individual category endpoint)
const getCategoryById = async (categoryId) => {
  try {
    const storeId = getSelectedStoreId();
    const response = await api.get(`/web/categories/${categoryId}`, {
      params: storeId ? { storeId } : {}
    });
    return response;
  } catch (error) {
    // Fallback to getting all categories and filtering
    const allCategories = await getActiveCategoriesByStore();
    const category = allCategories.data?.data?.find(c => c._id === categoryId || c.id === categoryId);
    return { data: { data: category } };
  }
};

// Get product details by ID (if you have individual product endpoint for web)
const getProductById = async (productId) => {
  try {
    const storeId = getSelectedStoreId();
    const response = await api.get(`/web/products/${productId}`, {
      params: storeId ? { storeId } : {}
    });
    return response;
  } catch (error) {
    // Fallback - this might not be ideal for performance but provides compatibility
    console.warn('Individual product endpoint not available, consider adding it to your API');
    throw new Error('Product details not available');
  }
};

// Get products with pagination support
const getActiveProductsPaginated = async (page = 1, limit = 10, filters = {}) => {
  const storeId = getSelectedStoreId();
  const response = await api.get('/web/products/active', {
    params: {
      page,
      limit,
      ...filters,
      ...(storeId ? { storeId } : {})
    }
  });
  return {
    data: {
      data: response.data?.data?.products || response.data?.data || [],
      pagination: {
        page: response.data?.pagination?.page || page,
        limit: response.data?.pagination?.limit || limit,
        total: response.data?.pagination?.total || 0,
        totalPages: response.data?.pagination?.totalPages || 0
      }
    }
  };
};

// Get categories with items count
const getCategoriesWithItemCount = async () => {
  const storeId = getSelectedStoreId();
  const response = await api.get('/web/categories/active', {
    params: storeId ? { storeId } : {}
  });
  const categories = response.data?.data || response.data || [];
  return { data: { data: categories } };
};

// Suggest product names for autocomplete
const suggestProductNames = async (query) => {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return { data: { data: [] } };
  }
  const response = await api.get('/web/products/suggest-names', {
    params: { q: query.trim() }
  });
  const suggestions = response.data?.data || response.data || [];
  return { data: { data: suggestions } };
};

// Search active products (new API)
const searchProducts = async (searchQuery, params = {}) => {
  if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim().length === 0) {
    return { data: { data: [] } };
  }
  const storeId = getSelectedStoreId();
  const response = await api.get('/web/products/search', {
    params: {
      search: searchQuery.trim(),
      ...params,
      ...(storeId ? { storeId } : {})
    }
  });
  const products = response.data?.data || [];
  return { data: { data: products } };
};

// Get active products by store and category
const getActiveProductsByStoreAndCategory = async (categoryId, params = {}) => {
  const storeId = getSelectedStoreId();
  const response = await api.get('/web/products/active/by-store-category', {
    params: {
      category: categoryId,
      ...params,
      ...(storeId ? { storeId } : {})
    }
  });
  const products = response.data?.data || [];
  return { data: { data: products } };
};

const webService = {
  // Banner services
  getActiveBannersByStore,
  
  // Category services
  getActiveCategoriesByStore,
  getCategoryById,
  getCategoriesWithItemCount,
  
  // Store services
  getActiveStores,
  getStoreById,
  
  // Product services
  getTop3ActiveProductsByStore,
  getActiveProductsByStore,
  getActiveProductsByCategory,
  searchActiveProducts,
  getFeaturedProducts,
  getProductById,
  getActiveProductsPaginated,
  getActiveProductsByStoreAndCategory,
  
  // Utility methods
  suggestProductNames, // newly added
  searchProducts, // newly added
  getProductsByCategory: getActiveProductsByCategory, // Alias for consistency
};

export default webService;