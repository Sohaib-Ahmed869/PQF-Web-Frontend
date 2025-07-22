import api from '../api';

const createBanner = async ({ image, isVisible, bannerType }) => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('isVisible', String(isVisible));
  formData.append('bannerType', bannerType);
  const response = await api.post('/banners/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};
const getAllBanners = async () => {
    const response = await api.get('/banners/store');
    return response;
  };
const updateBanner = async (bannerId, data) => {
  const response = await api.put(`/banners/update/${bannerId}`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return response;
};

const deleteBanner = async (bannerId) => {
  const response = await api.delete(`/banners/delete/${bannerId}`);
  return response;
};



const bannerService = {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner,
};

export default bannerService; 