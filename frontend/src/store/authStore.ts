import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Passenger } from '../types/auth.types';

interface AuthStore {
  passenger: Passenger | null;
  token: string | null;
  isAuthenticated: boolean;
  pendingPhone: string | null;
  setAuth: (passenger: Passenger, token: string) => void;
  logout: () => void;
  updatePassenger: (passenger: Passenger) => void;
  setPendingPhone: (phone: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      passenger: null,
      token: null,
      isAuthenticated: false,
      pendingPhone: null,
      setAuth: (passenger, token) =>
        set({ passenger, token, isAuthenticated: true, pendingPhone: null }),
      logout: () =>
        set({ passenger: null, token: null, isAuthenticated: false }),
      updatePassenger: (passenger) => set({ passenger }),
      setPendingPhone: (phone) => set({ pendingPhone: phone }),
    }),
    {
      name: 'comequick-auth',
    }
  )
);
