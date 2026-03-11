import axios from 'axios';

// Base API URL - update this to your backend URL
const BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - handle errors globally
// Note: Token injection is handled by authMiddleware in Redux store
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.warn('Unauthorized - user token expired or invalid');
          break;
        case 403:
          console.warn('Forbidden access');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
