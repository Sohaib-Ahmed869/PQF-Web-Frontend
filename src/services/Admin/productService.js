import api from '../api';

const getAllProducts = async () => {
  const response = await api.get('/products/getAll');
  const products = response.data?.data?.products || response.data?.data || response.data || [];
  return { data: { data: products } };
};

const getIndividualProduct = async (productId) => {
  const response = await api.get(`/products/getIndividual/${productId}`);
  return response;
};

/**
 * Update product. FormData should include 'image' and/or 'description' fields as needed.
 */
const updateProduct = async (productId, data) => {
  if (!productId || productId === 'undefined') {
    throw new Error('updateProduct: productId is required and must be valid');
  }

  // Ensure data is FormData for image upload
  if (!(data instanceof FormData)) {
    throw new Error('updateProduct: FormData is required for image upload');
  }

  const response = await api.put(`/products/update/${productId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
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
  const response = await api.delete(`/products/delete/${productId}`);
  return response;
};

const getProductsByCategory = async (category) => {
  const response = await api.get('/products/by-category', {
    params: { category }
  });
  return response;
};

const getProductNameSuggestions = async (query) => {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return [];
  }
  const response = await api.get('/products/suggest-names', {
    params: { q: query }
  });
  return response.data?.data || [];
};

const searchProducts = async (search) => {
  const response = await api.get('/products/getAll', {
    params: { search }
  });
  const products = response.data?.data?.products || response.data?.data || response.data || [];
  return { data: { data: { products } } };
};

const productService = {
  getAllProducts,
  getIndividualProduct,
  updateProduct,
  updateProductImageAndDescription,
  deleteProduct,
  getProductsByCategory,
  getProductNameSuggestions,
  searchProducts,
};

export default productService;