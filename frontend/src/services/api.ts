import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authApi = {
  registerStudent: (data: any) => api.post('/v1/auth/register/student', data),
  registerTeacher: (data: any) => api.post('/v1/auth/register/teacher', data),
  login: (data: { email: string; password: string }) => api.post('/v1/auth/login', data),
  getProfile: () => api.get('/v1/auth/profile'),
};

// Users API
export const usersApi = {
  getTeachers: () => api.get('/v1/users/teachers'),
  getTeacherById: (id: string) => api.get(`/v1/users/teachers/${id}`),
  getPendingTeachers: () => api.get('/v1/users/pending-teachers'),
  getPendingCount: () => api.get('/v1/users/pending-teachers/count'),
  approveTeacher: (id: string) => api.post(`/v1/users/teachers/${id}/approve`),
  rejectTeacher: (id: string) => api.post(`/v1/users/teachers/${id}/reject`),
  getMe: () => api.get('/v1/users/me'),
};

// Events API
export const eventsApi = {
  getAll: () => api.get('/v1/events'),
  getUpcoming: () => api.get('/v1/events/upcoming'),
  register: (id: string) => api.post(`/v1/events/${id}/register`),
  getStats: () => api.get('/v1/events/stats'),
};


// Gallery API
export const galleryApi = {
  getAll: (params?: { page?: number; limit?: number }) => 
    api.get('/v1/gallery', { params }),
  
  getFeatured: () => api.get('/v1/gallery/featured'),
  
  getByCategory: (category: string) => api.get(`/v1/gallery/category/${category}`),
  
  getByTag: (tag: string) => api.get(`/v1/gallery/tag/${tag}`),
  
  search: (query: string) => api.get(`/v1/gallery/search?q=${query}`),
  
  getStats: () => api.get('/v1/gallery/stats'),
  
  getById: (id: string) => api.get(`/v1/gallery/${id}`),
};

// Lessons API
export const lessonsApi = {
  getAll: () => api.get('/v1/lessons'),
  getLive: () => api.get('/v1/lessons/live'),
  getUpcoming: () => api.get('/v1/lessons/upcoming'),
  getStats: () => api.get('/v1/lessons/stats'),
  getById: (id: string) => api.get(`/v1/lessons/${id}`),
  getByTeacher: (teacherId: string) => api.get(`/v1/lessons/teacher/${teacherId}`),
  getMyLessons: () => api.get('/v1/lessons/my-lessons'),
  create: (data: any) => api.post('/v1/lessons', data),
  update: (id: string, data: any) => api.patch(`/v1/lessons/${id}`, data),
  delete: (id: string) => api.delete(`/v1/lessons/${id}`),
  start: (id: string) => api.post(`/v1/lessons/${id}/start`),
  end: (id: string) => api.post(`/v1/lessons/${id}/end`),
  getToken: (id: string, role: 'host' | 'audience') => 
    api.get(`/v1/lessons/${id}/token?role=${role}`),
  join: (id: string) => api.post(`/v1/lessons/${id}/join`),
  leave: (id: string) => api.post(`/v1/lessons/${id}/leave`),
};

export default api;