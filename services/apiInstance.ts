import axios from 'axios';
import storageService from './storageService';
import { Platform } from 'react-native';

export const BASE_URL = 'https://cinefriends-native-chat-backend.onrender.com/api'; //Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';

const apiInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiInstance.interceptors.request.use(
  async (config) => {
    const token = await storageService.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/cinefriends-login')
    ) {
      originalRequest._retry = true;
      const refreshToken = await storageService.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = res.data;
          await storageService.setItem('userToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiInstance(originalRequest);
        } catch (err) {
          await storageService.removeItem('userToken');
          await storageService.removeItem('refreshToken');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiInstance;
