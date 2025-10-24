import { axiosInstance as api } from './api';

export const scholarshipService = {
  // Get all scholarships with filters and pagination
  getScholarships: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/scholarships?${queryString}`);
  },

  // Get single scholarship
  getScholarship: (id) => api.get(`/scholarships/${id}`),

  // Get scholarship filters (categories, tags, organizations)
  getFilters: () => api.get('/scholarships/filters'),

  // Save scholarship
  saveScholarship: (id) => api.post(`/scholarships/${id}/save`),

  // Unsave scholarship
  unsaveScholarship: (id) => api.delete(`/scholarships/${id}/save`),

  // Admin only - Create scholarship
  createScholarship: (scholarshipData) => api.post('/scholarships', scholarshipData),

  // Admin only - Update scholarship
  updateScholarship: (id, scholarshipData) => api.put(`/scholarships/${id}`, scholarshipData),

  // Admin only - Delete scholarship
  deleteScholarship: (id) => api.delete(`/scholarships/${id}`),
};