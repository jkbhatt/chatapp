"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ============================================================
// THEME DEFINITIONS
// Every color used across the app lives here. To change the
// look of the whole app, edit these two objects — nothing else.
// ============================================================

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string;       // main page background
  bgSecondary: string;     // sidebar / header / cards
  bgTertiary: string;      // input fields, subtle surfaces
  bgHover: string;         // hover state for list items

  // Borders
  border: string;
  borderLight: string;

  // Text
  textPrimary: string;     // headings, important text
  textSecondary: string;   // body text, descriptions
  textMuted: string;       // timestamps, placeholders

  // Brand / accent (stays purple-blue in both modes — this is
  // your app's identity color, not part of light/dark switching)
  accent: string;
  accentHover: string;
  accentGradient: string;

  // Message bubbles
  bubbleMine: string;
  bubbleMineText: string;
  bubbleOther: string;
  bubbleOtherText: string;
  bubbleOtherBorder: string;

  // Status colors (consistent across themes)
  online: string;
  offline: string;
  danger: string;
  dangerBg: string;
}

const darkTheme: ThemeColors = {
  bgPrimary: "#0a0a0f",
  bgSecondary: "#111118",
  bgTertiary: "rgba(255,255,255,0.05)",
  bgHover: "rgba(255,255,255,0.06)",

  border: "rgba(255,255,255,0.06)",
  borderLight: "rgba(255,255,255,0.1)",

  textPrimary: "#ffffff",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",

  accent: "#7c3aed",
  accentHover: "#6d28d9",
  accentGradient: "linear-gradient(135deg, #7c3aed, #3b82f6)",

  bubbleMine: "linear-gradient(135deg, #7c3aed, #6d28d9)",
  bubbleMineText: "#ffffff",
  bubbleOther: "rgba(255,255,255,0.07)",
  bubbleOtherText: "#ffffff",
  bubbleOtherBorder: "rgba(255,255,255,0.06)",

  online: "#10b981",
  offline: "#374151",
  danger: "#ef4444",
  dangerBg: "rgba(239,68,68,0.1)",
};

const lightTheme: ThemeColors = {
  bgPrimary: "#f4f4f7",
  bgSecondary: "#ffffff",
  bgTertiary: "rgba(0,0,0,0.04)",
  bgHover: "rgba(0,0,0,0.05)",

  border: "rgba(0,0,0,0.08)",
  borderLight: "rgba(0,0,0,0.12)",

  textPrimary: "#16161d",
  textSecondary: "#52525b",
  textMuted: "#8b8b94",

  accent: "#7c3aed",
  accentHover: "#6d28d9",
  accentGradient: "linear-gradient(135deg, #7c3aed, #3b82f6)",

  bubbleMine: "linear-gradient(135deg, #7c3aed, #6d28d9)",
  bubbleMineText: "#ffffff",
  bubbleOther: "#ffffff",
  bubbleOtherText: "#16161d",
  bubbleOtherBorder: "rgba(0,0,0,0.08)",

  online: "#10b981",
  offline: "#a1a1aa",
  danger: "#ef4444",
  dangerBg: "rgba(239,68,68,0.08)",
};

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "chatapp-theme-mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default to dark (matches your current app) until we read storage
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [hydrated, setHydrated] = useState(false);

  // Read saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved === "light" || saved === "dark") {
      setMode(saved);
    }
    setHydrated(true);
  }, []);

  // Persist + reflect on <html> for any global CSS that needs it
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, mode);
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode, hydrated]);

  const toggleTheme = () => setMode((prev) => (prev === "dark" ? "light" : "dark"));
  const setTheme = (newMode: ThemeMode) => setMode(newMode);

  const colors = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
