import { create } from 'zustand';
import { api } from '@/lib/api';

interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  photoUrl?: string;
  pointsBalance: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (initData: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (initData: string) => {
    try {
      const response = await api.login(initData);
      
      localStorage.setItem('auth_token', response.token);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Login failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  refreshUser: async () => {
    try {
      const response = await api.getUser();
      set({ user: response });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },
}));
