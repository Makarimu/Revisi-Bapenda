import axios from 'axios';

// Gunakan URL yang diberikan backend saat menjalankan php artisan serve
// atau atur di .env (VITE_API_BASE_URL)
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor: Sisipkan Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    const isAuthOrAdminRoute = config.url?.includes('/admin') || config.url?.includes('/auth');
    if (token && isAuthOrAdminRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Tangani Token Expired/Unauthorized
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hanya redirect ke login jika bukan request auth/login itu sendiri
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_nama');
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
