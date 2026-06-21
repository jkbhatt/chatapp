"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "@/contexts/ThemeContext";

// ============================================================
// Wraps react-hot-toast so its colors follow the active theme.
// Kept as its own component because Toaster needs "use client"
// and needs to re-read colors whenever mode changes.
// ============================================================
export default function ThemedToaster() {
  const { colors } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: colors.bgSecondary,
          color: colors.textPrimary,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px",
          fontSize: "14px",
        },
        success: {
          iconTheme: {
            primary: colors.online,
            secondary: colors.bgSecondary,
          },
        },
        error: {
          iconTheme: {
            primary: colors.danger,
            secondary: colors.bgSecondary,
          },
        },
      }}
    />
  );
}
