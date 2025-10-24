import { axiosInstance as api } from './api';

export const applicationService = {
  // Get user's applications
  getMyApplications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/applications?${queryString}`);
  },

  // Get single application
  getApplication: (id) => api.get(`/applications/${id}`),

  // Create new application
  createApplication: (applicationData) => api.post('/applications', applicationData),

  // Update application
  updateApplication: (id, applicationData) => api.put(`/applications/${id}`, applicationData),

  // Submit application
  submitApplication: (id) => api.post(`/applications/${id}/submit`),

  // Admin only - Get all applications
  getAllApplications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/applications/admin/all?${queryString}`);
  },

  // Admin only - Update application status
  updateApplicationStatus: (id, statusData) => api.put(`/applications/${id}/status`, statusData),
};