import api from './api';

// Test the translation API connection
export const testApi = async () => {
  const response = await api.get('/translation/test');
  return response.data;
};

// Translate a single text
export const translateSingle = async ({ text, target_lang, source_lang }) => {
  const response = await api.post('/translation', {
    text,
    target_lang,
    source_lang,
  });
  return response.data;
};

// Translate a batch of texts
export const translateBatch = async ({ texts, target_lang, source_lang }) => {
  const response = await api.post('/translation/translate-batch', {
    texts,
    target_lang,
    source_lang,
  });
  return response.data;
};

// Get translation API usage
export const getUsage = async () => {
  const response = await api.get('/translation/usage');
  return response.data;
};

// Health check for translation API
export const healthCheck = async () => {
  const response = await api.get('/translation/health');
  return response.data;
};

const translationService = {
  testApi,
  translateSingle,
  translateBatch,
  getUsage,
  healthCheck,
};

export default translationService; 