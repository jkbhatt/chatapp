"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  size?: "sm" | "md";
}

export default function ThemeToggle({ size = "md" }: ThemeToggleProps) {
  const { mode, toggleTheme, colors } = useTheme();
  const isSmall = size === "sm";

  return (
    <button
      onClick={toggleTheme}
      title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: isSmall ? "36px" : "44px",
        height: isSmall ? "36px" : "44px",
        borderRadius: "10px",
        background: colors.bgTertiary,
        border: `1px solid ${colors.border}`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: mode === "dark" ? "#fbbf24" : "#7c3aed",
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          transition: "transform 0.3s ease, opacity 0.2s ease",
          display: "flex",
        }}
        key={mode}
      >
        {mode === "dark" ? (
          <Moon size={isSmall ? 16 : 18} />
        ) : (
          <Sun size={isSmall ? 16 : 18} />
        )}
      </div>
    </button>
  );
}
