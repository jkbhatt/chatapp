"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, MessageCircle, Zap } from "lucide-react";
import useAuthStore from "@/store/authStore";

export default function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await login(email.trim(), password.trim());
      toast.success("Welcome back! 👋");
      // Hard redirect — forces full page reload to /chat
      window.location.replace("/chat");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: "24px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Glow effects */}
      <div style={{
        position: "absolute", top: "-20%", left: "-10%",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", right: "-10%",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative" }}>

        {/* Logo */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
            <div style={{
              width: "44px", height: "44px",
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              borderRadius: "14px", display: "flex",
              alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 24px rgba(124,58,237,0.4)",
            }}>
              <MessageCircle size={22} color="white" />
            </div>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#fff" }}>ChatApp</span>
          </div>

          <h1 style={{
            fontSize: "34px", fontWeight: 800, color: "#fff",
            margin: "0 0 10px", letterSpacing: "-1px", lineHeight: 1.1,
          }}>
            Sign in to your<br />
            <span style={{
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>account</span>
          </h1>
          <p style={{ color: "#6b7280", fontSize: "15px", margin: 0 }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>
              Create one free
            </Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Email */}
          <div>
            <label style={{ display: "block", color: "#9ca3af", fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="#4b5563" style={{
                position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none",
              }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                style={{
                  width: "100%", padding: "13px 14px 13px 42px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px", color: "#fff",
                  fontSize: "15px", outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7c3aed";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", color: "#9ca3af", fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="#4b5563" style={{
                position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none",
              }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  width: "100%", padding: "13px 42px 13px 42px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px", color: "#fff",
                  fontSize: "15px", outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7c3aed";
                  e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#4b5563", padding: 0, display: "flex",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%", padding: "14px",
              background: isLoading ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none", borderRadius: "12px",
              color: "white", fontSize: "15px", fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: isLoading ? "none" : "0 6px 24px rgba(124,58,237,0.35)",
              marginTop: "6px", display: "flex",
              alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: "16px", height: "16px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                Signing in...
              </>
            ) : (
              <><Zap size={16} /> Sign In</>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: "36px", display: "flex",
          gap: "20px", justifyContent: "center", flexWrap: "wrap",
        }}>
          {["Real-time messaging", "End-to-end secure", "Always free"].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#7c3aed" }} />
              <span style={{ color: "#6b7280", fontSize: "12px" }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #4b5563 !important; }
      `}</style>
    </div>
  );
}
