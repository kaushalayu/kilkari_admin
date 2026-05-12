import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const getFullUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = API_URL.replace(/\/api\/?$/, '');
  return `${baseUrl}${path}`;
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === 'ECONNABORTED') {
      console.error('Request timed out. Please check your connection.');
    } else if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (err.response?.status >= 500) {
      console.error('Server error. Please try again later.');
    }
    return Promise.reject(err);
  }
);

export default api;
