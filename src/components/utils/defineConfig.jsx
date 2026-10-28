export const getApiBaseUrl = () => {
  const customUrl = localStorage.getItem('custom_api_url');
  if (customUrl) return customUrl;
  
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const apiUrl = '/api/v1';
  
  
  // console.log('🌐 Fixed API URL for External Access:', apiUrl);
  return apiUrl;
};