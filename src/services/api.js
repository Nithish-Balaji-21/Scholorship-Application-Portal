import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

// API Service class with comprehensive methods
class APIService {
  // Authentication APIs
  async login(credentials) {
    return api.post('/auth/login', credentials);
  }

  async register(userData) {
    return api.post('/auth/register', userData);
  }

  async logout() {
    return api.post('/auth/logout');
  }

  async getCurrentUser() {
    return api.get('/auth/me');
  }

  async forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token, password) {
    return api.put(`/auth/reset-password/${token}`, { password });
  }

  // Scholarship APIs
  async getScholarships(params = {}) {
    return api.get('/scholarships', { params });
  }

  async getScholarshipById(id) {
    return api.get(`/scholarships/${id}`);
  }

  async createScholarship(scholarshipData) {
    return api.post('/scholarships', scholarshipData);
  }

  async updateScholarship(id, scholarshipData) {
    return api.put(`/scholarships/${id}`, scholarshipData);
  }

  async deleteScholarship(id) {
    return api.delete(`/scholarships/${id}`);
  }

  // Application APIs
  async getApplications(params = {}) {
    return api.get('/applications', { params });
  }

  async getApplicationById(id) {
    return api.get(`/applications/${id}`);
  }

  async createApplication(applicationData) {
    return api.post('/applications', applicationData);
  }

  async updateApplication(id, applicationData) {
    return api.put(`/applications/${id}`, applicationData);
  }

  async submitApplication(id) {
    return api.post(`/applications/${id}/submit`);
  }

  async deleteApplication(id) {
    return api.delete(`/applications/${id}`);
  }

  // File Upload APIs
  async uploadFile(formData, config = {}) {
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
  }

  async uploadMultipleFiles(formData) {
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteFile(fileId) {
    return api.delete(`/upload/${fileId}`);
  }

  // User Profile APIs
  async getUserProfile() {
    return api.get('/user/profile');
  }

  async updateUserProfile(profileData) {
    return api.put('/user/profile', profileData);
  }

  async changePassword(passwordData) {
    return api.put('/user/change-password', passwordData);
  }

  async deleteAccount() {
    return api.delete('/user/profile');
  }

  // Saved Scholarships APIs
  async getSavedScholarships() {
    return api.get('/user/saved-scholarships');
  }

  async saveScholarship(scholarshipId) {
    return api.post(`/scholarships/${scholarshipId}/save`);
  }

  async unsaveScholarship(scholarshipId) {
    return api.delete(`/scholarships/${scholarshipId}/save`);
  }

  // User Applications APIs
  async getMyApplications() {
    return api.get('/applications/my-applications');
  }

  // Admin APIs
  async getAllUsers(params = {}) {
    return api.get('/admin/users', { params });
  }

  async getUserStats() {
    return api.get('/admin/users/stats');
  }

  async updateUserRole(userId, role) {
    return api.put(`/admin/users/${userId}/role`, { role });
  }

  async deleteUser(userId) {
    return api.delete(`/admin/users/${userId}`);
  }

  async getAllApplicationsAdmin(params = {}) {
    return api.get('/applications/admin/all', { params });
  }

  async getApplicationByIdAdmin(id) {
    return api.get(`/admin/applications/${id}`);
  }

  async reviewApplication(id, reviewData) {
    return api.put(`/admin/applications/${id}/review`, reviewData);
  }

  async updateApplicationStatus(id, status, adminNotes = '') {
    return api.put(`/applications/${id}/status`, { status, adminNotes });
  }

  async getApplicationStats(params = {}) {
    return api.get('/admin/applications/stats', { params });
  }

  // Admin Scholarship APIs
  async getAllScholarshipsAdmin(params = {}) {
    return api.get('/admin/scholarships', { params });
  }

  async getScholarshipStats() {
    return api.get('/admin/scholarships/stats');
  }

  // Admin Organization APIs
  async getAllOrganizationsAdmin(params = {}) {
    return api.get('/admin/organizations', { params });
  }

  async getOrganizationStats() {
    return api.get('/admin/organizations/stats');
  }

  // Admin Dashboard APIs
  async getAdminDashboardStats() {
    return api.get('/admin/dashboard/stats');
  }

  async getAllApplicationsAdmin() {
    return api.get('/admin/applications');
  }

  async getAllScholarshipsAdmin() {
    return api.get('/admin/scholarships');
  }

  async getAllOrganizationsAdmin() {
    return api.get('/admin/organizations');
  }

  // Organization APIs
  async getOrganizations(params = {}) {
    return api.get('/organizations', { params });
  }

  async getOrganizationById(id) {
    return api.get(`/organizations/${id}`);
  }

  async createOrganization(organizationData) {
    return api.post('/organizations', organizationData);
  }

  async updateOrganization(id, organizationData) {
    return api.put(`/organizations/${id}`, organizationData);
  }

  // Dashboard/Stats APIs (Student Dashboard)
  async getDashboardStats() {
    return api.get('/user/dashboard/stats');
  }

  async getStudentDashboardData() {
    return api.get('/user/dashboard');
  }

  async getRecentActivity() {
    return api.get('/user/dashboard/activity');
  }

  // Search and Filter APIs
  async searchScholarships(searchTerm, filters = {}) {
    const params = {
      search: searchTerm,
      ...filters
    };
    return api.get('/scholarships/search', { params });
  }

  async getScholarshipFilters() {
    return api.get('/scholarships/filters');
  }

  // Notification APIs
  async getNotifications() {
    return api.get('/user/notifications');
  }

  async markNotificationRead(notificationId) {
    return api.put(`/user/notifications/${notificationId}/read`);
  }

  async markAllNotificationsRead() {
    return api.put('/user/notifications/read-all');
  }
}

// Create and export a singleton instance
const apiService = new APIService();

// Also export the axios instance for direct access if needed
export const axiosInstance = api;
export const apiBaseURL = API_BASE_URL;

export default apiService;