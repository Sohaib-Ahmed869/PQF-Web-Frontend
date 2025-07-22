import api from '../api';

// Get all products (no caching)
const getAllProducts = async () => {
  return await api.get('/superAdmin/products/getAll');
};

// Alias for consistency
const getAllProductsWithCache = async () => {
  return await getAllProducts();
};

// Get product statistics (no caching)
const getProductStats = async () => {
  return await api.get('/superAdmin/products/stats');
};

// Get products by store (no caching)
const getProductsByStore = async (storeId) => {
  if (!storeId) {
    throw new Error('Store ID is required');
  }
  return await api.get(`/superAdmin/products/store/${storeId}`);
};

// Get individual product (no caching)
const getIndividualProduct = async (productId) => {
  if (!productId) {
    throw new Error('Product ID is required');
  }
  return await api.get(`/superAdmin/products/IndividualProduct/${productId}`);
};

/**
 * Update product. FormData should include 'image' and/or 'description' fields as needed.
 */
const updateProduct = async (productId, data) => {
  if (!productId || productId === 'undefined') {
    throw new Error('updateProduct: productId is required and must be valid');
  }
  if (!(data instanceof FormData)) {
    throw new Error('updateProduct: data must be a FormData instance containing the image and/or description');
  }
  return await api.put(`/superAdmin/products/update/${productId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Update product image and/or description.
 * @param {string} productId - The product ID.
 * @param {File} imageFile - The image file to upload (optional).
 * @param {string} description - The new description (optional).
 * @returns {Promise}
 */
const updateProductImageAndDescription = async (productId, imageFile, description) => {
  const formData = new FormData();
  if (imageFile) {
    formData.append('image', imageFile);
  }
  if (description !== undefined) {
    formData.append('description', description);
  }
  return updateProduct(productId, formData);
};

const deleteProduct = async (productId) => {
  if (!productId) {
    throw new Error('Product ID is required for deletion');
  }
  return await api.delete(`/superAdmin/products/delete/${productId}`);
};

// Search products (no caching)
const searchProducts = async (searchQuery, storeId = null) => {
  if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim().length === 0) {
    return storeId ? getProductsByStore(storeId) : getAllProducts();
  }
  const endpoint = storeId 
    ? `/superAdmin/products/store/${storeId}` 
    : '/superAdmin/products/getAll';
  return await api.get(endpoint, {
    params: { search: searchQuery }
  });
};

const superAdminProductService = {
  getAllProducts,
  getAllProductsWithCache,
  getProductStats,
  getProductsByStore,
  getIndividualProduct,
  updateProduct,
  updateProductImageAndDescription,
  deleteProduct,
  searchProducts
};

export default superAdminProductService;