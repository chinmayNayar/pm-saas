import { create } from "zustand";
import type { User } from "../lib/auth";
import { axiosClient } from "../lib/axiosClient";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  refresh: () => Promise<boolean>;
  fetchMe: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  refresh: async () => {
    try {
      const res = await axiosClient.post("/auth/refresh");
      const token = res.data?.accessToken ?? null;
      if (token) set({ accessToken: token });
      if (res.data?.user) set({ user: res.data.user });
      return !!token;
    } catch {
      set({ accessToken: null });
      return false;
    }
  },
  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosClient.get("/auth/me");
      set({ user: res.data.user });
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  }
}));

