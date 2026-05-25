import { create } from "zustand";
import type { Profile } from "@/types/database";

interface AuthState {
  user: Profile | null;
  isGuest: boolean;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setGuest: (guest: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isGuest: false,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setGuest: (isGuest) => set({ isGuest }),
  setLoading: (isLoading) => set({ isLoading }),
}));
