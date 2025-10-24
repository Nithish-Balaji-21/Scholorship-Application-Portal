import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Initialize auth state from localStorage
      initializeAuth: () => {
        const user = authService.getCurrentUser();
        const token = authService.getToken();
        
        if (user && token) {
          set({
            user,
            token,
            isAuthenticated: true,
          });
        }
      },

      // Login action
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(credentials);
          set({
            user: response.data,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(userData);
          set({
            user: response.data,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Logout action
      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      // Update user profile
      updateProfile: async (profileData) => {
        try {
          const response = await authService.updateProfile(profileData);
          set({ user: response.data });
          localStorage.setItem('user', JSON.stringify(response.data));
          return response;
        } catch (error) {
          throw error;
        }
      },

      // Check if user is admin
      isAdmin: () => {
        const { user } = get();
        return user && user.role === 'admin';
      },

      // Check if user is student
      isStudent: () => {
        const { user } = get();
        return user && user.role === 'student';
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);