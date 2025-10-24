import { create } from 'zustand';
import { scholarshipService } from '../services/scholarshipService';

export const useScholarshipStore = create((set, get) => ({
  scholarships: [],
  scholarship: null,
  filters: {
    categories: [],
    tags: [],
    organizations: [],
  },
  isLoading: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 12,
  },
  searchFilters: {
    search: '',
    categories: [],
    tags: [],
    organization: '',
    minAmount: '',
    maxAmount: '',
    educationLevel: [],
    sort: 'featured',
  },

  // Get scholarships with filters
  fetchScholarships: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await scholarshipService.getScholarships(params);
      set({
        scholarships: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Get single scholarship
  fetchScholarship: async (id) => {
    set({ isLoading: true });
    try {
      const response = await scholarshipService.getScholarship(id);
      set({
        scholarship: response.data,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Get filter options
  fetchFilters: async () => {
    try {
      const response = await scholarshipService.getFilters();
      set({ filters: response.data });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update search filters
  updateSearchFilters: (newFilters) => {
    const { searchFilters } = get();
    set({
      searchFilters: { ...searchFilters, ...newFilters },
    });
  },

  // Reset search filters
  resetSearchFilters: () => {
    set({
      searchFilters: {
        search: '',
        categories: [],
        tags: [],
        organization: '',
        minAmount: '',
        maxAmount: '',
        educationLevel: [],
        sort: 'featured',
      },
    });
  },

  // Save scholarship
  saveScholarship: async (id) => {
    try {
      await scholarshipService.saveScholarship(id);
      // Update the scholarship in the list if it exists
      const { scholarships } = get();
      const updatedScholarships = scholarships.map((s) =>
        s._id === id ? { ...s, isSaved: true } : s
      );
      set({ scholarships: updatedScholarships });
    } catch (error) {
      throw error;
    }
  },

  // Unsave scholarship
  unsaveScholarship: async (id) => {
    try {
      await scholarshipService.unsaveScholarship(id);
      // Update the scholarship in the list if it exists
      const { scholarships } = get();
      const updatedScholarships = scholarships.map((s) =>
        s._id === id ? { ...s, isSaved: false } : s
      );
      set({ scholarships: updatedScholarships });
    } catch (error) {
      throw error;
    }
  },

  // Clear scholarship detail
  clearScholarship: () => {
    set({ scholarship: null });
  },
}));