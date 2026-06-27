import axios from 'axios';

// Backend'imizin ana adresi
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Axios Interceptor istekler sunucuya gitmeden buraya uğrar
api.interceptors.request.use(
  (config) => {
    // Tokenı al
    const token = localStorage.getItem('token');
    
    // Token varsa yetki ver
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;