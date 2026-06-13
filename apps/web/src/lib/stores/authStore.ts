import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  token: string | null;
  userId: string | null;
  walletAddress: string | null;
  setAuth: (token: string, userId: string, walletAddress: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      walletAddress: null,
      setAuth: (token, userId, walletAddress) => {
        localStorage.setItem('na_token', token);
        set({ token, userId, walletAddress });
      },
      logout: () => {
        localStorage.removeItem('na_token');
        set({ token: null, userId: null, walletAddress: null });
      },
    }),
    { name: 'normies-auth' }
  )
);
