import api from '../api';

const createCategory = async ({ name, ItemsGroupCode, image, isActive }) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('ItemsGroupCode', ItemsGroupCode);
  formData.append('image', image);
  formData.append('isActive', String(isActive));
  
  const response = await api.post('/categories/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

const getAllCategories = async () => {
  const response = await api.get('/categories/getCategoriesBystore');
  return response;
};

const getActiveCategories = async () => {
  const response = await api.get('/categories/getActiveCategory');
  return response;
};

const getIndividualCategory = async (categoryId) => {
  const response = await api.get(`/categories/getIndividual/${categoryId}`);
  return response;
};

const updateCategory = async (categoryId, data) => {
  const response = await api.put(`/categories/update/${categoryId}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return response;
};

const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/categories/delete/${categoryId}`);
  return response;
};

const categoryService = {
  createCategory,
  getAllCategories,
  getActiveCategories,
  getIndividualCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;