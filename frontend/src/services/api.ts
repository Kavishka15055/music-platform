import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

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