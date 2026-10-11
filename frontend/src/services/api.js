import axios from 'axios';

// Get backend URL from environment variable, defaulting to deployed Render backend URL
const rawBaseURL = import.meta.env.VITE_API_URL || 'https://student-management-system-2-01m2.onrender.com';

// Ensure the baseURL points to the /api prefix so endpoints resolve correctly
const baseURL = rawBaseURL.endsWith('/api')
  ? rawBaseURL
  : `${rawBaseURL.replace(/\/+$/, '')}/api`;

// Create a reusable Axios instance pointing to the backend API
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Axios Request Interceptor: Automatically attach JWT token if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
