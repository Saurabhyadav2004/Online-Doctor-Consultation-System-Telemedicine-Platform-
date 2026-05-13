import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto-refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
};

// Users
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getDoctors: () => api.get('/users/doctors'),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Appointments
export const appointmentsAPI = {
  create: (data) => api.post('/appointments', data),
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
};

// Vitals
export const vitalsAPI = {
  create: (data) => api.post('/vitals', data),
  getAll: (params) => api.get('/vitals', { params }),
  getLatest: (params) => api.get('/vitals/latest', { params }),
  delete: (id) => api.delete(`/vitals/${id}`),
};

// Medications
export const medicationsAPI = {
  create: (data) => api.post('/medications', data),
  getAll: (params) => api.get('/medications', { params }),
  update: (id, data) => api.put(`/medications/${id}`, data),
  delete: (id) => api.delete(`/medications/${id}`),
};

// Health Records
export const recordsAPI = {
  create: (data) => api.post('/records', data),
  getAll: (params) => api.get('/records', { params }),
  getById: (id) => api.get(`/records/${id}`),
  update: (id, data) => api.put(`/records/${id}`, data),
  delete: (id) => api.delete(`/records/${id}`),
};

// Workshops
export const workshopsAPI = {
  create: (data) => api.post('/workshops', data),
  getAll: (params) => api.get('/workshops', { params }),
  getById: (id) => api.get(`/workshops/${id}`),
  register: (id) => api.post(`/workshops/${id}/register`),
  unregister: (id) => api.post(`/workshops/${id}/unregister`),
  update: (id, data) => api.put(`/workshops/${id}`, data),
  delete: (id) => api.delete(`/workshops/${id}`),
};

// Screenings
export const screeningsAPI = {
  create: (data) => api.post('/screenings', data),
  getAll: (params) => api.get('/screenings', { params }),
  getById: (id) => api.get(`/screenings/${id}`),
  register: (id) => api.post(`/screenings/${id}/register`),
  unregister: (id) => api.post(`/screenings/${id}/unregister`),
  update: (id, data) => api.put(`/screenings/${id}`, data),
  delete: (id) => api.delete(`/screenings/${id}`),
};

// Education
export const educationAPI = {
  create: (data) => api.post('/education', data),
  getAll: (params) => api.get('/education', { params }),
  getById: (id) => api.get(`/education/${id}`),
  like: (id) => api.post(`/education/${id}/like`),
  addComment: (id, text) => api.post(`/education/${id}/comments`, { text }),
  deleteComment: (id, commentId) => api.delete(`/education/${id}/comments/${commentId}`),
  update: (id, data) => api.put(`/education/${id}`, data),
  delete: (id) => api.delete(`/education/${id}`),
};

export default api;
