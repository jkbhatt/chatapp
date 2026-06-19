"use client";

import { create } from "zustand";
import { User } from "@/types";

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUserFromStorage: () => void;
  updateUser: (user: User) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  // ── Load user from localStorage on app start ──────────────
  loadUserFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // ── Login ─────────────────────────────────────────────────
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const { token, user } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.message || "Login failed. Please try again.");
    }
  },

  // ── Register ──────────────────────────────────────────────
  // FIX: now saves token + logs user in immediately after register
  register: async (username: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Save token & user — user is now logged in right away
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.message || "Registration failed. Please try again.");
    }
  },

  // ── Logout ────────────────────────────────────────────────
  logout: async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // ignore — we always clear local state
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  // ── Update user in store + localStorage (used by profile edit) ──
  updateUser: (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },
}));

export default useAuthStore;