"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loadUserFromStorage } = useAuthStore();

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f10",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "3px solid #7c3aed",
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto",
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: "#9898a8", marginTop: "16px", fontSize: "14px" }}>
          Loading ChatApp...
        </p>
      </div>
    </div>
  );
}
