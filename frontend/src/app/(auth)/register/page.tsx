"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, User, MessageCircle, Zap } from "lucide-react";
import useAuthStore from "@/store/authStore";

export default function RegisterPage() {
  const { register, isLoading } = useAuthStore();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await register(username.trim(), email.trim(), password.trim());

toast.success("Account created! 🎉");

window.location.replace("/chat");
      window.location.replace("/login");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 14px 13px 42px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#9ca3af",
    fontSize: "13px",
    fontWeight: 500,
    marginBottom: "8px",
  };

  const iconStyle: React.CSSProperties = {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
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
        position: "absolute", top: "-20%", right: "-10%",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", left: "-10%",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative" }}>

        {/* Logo */}
        <div style={{ marginBottom: "36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
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
            Create your<br />
            <span style={{
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>free account</span>
          </h1>
          <p style={{ color: "#6b7280", fontSize: "15px", margin: 0 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Username */}
          <div>
            <label style={labelStyle}>Username</label>
            <div style={{ position: "relative" }}>
              <User size={16} color="#4b5563" style={iconStyle} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cooluser123"
                autoComplete="username"
                style={inputStyle}
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

          {/* Email */}
          <div>
            <label style={labelStyle}>Email address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="#4b5563" style={iconStyle} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                style={inputStyle}
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
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} color="#4b5563" style={iconStyle} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                style={{ ...inputStyle, paddingRight: "42px" }}
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
                  position: "absolute", right: "14px", top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", cursor: "pointer", color: "#4b5563",
                  padding: 0, display: "flex",
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength */}
            {password.length > 0 && (
              <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{
                    flex: 1, height: "3px", borderRadius: "2px",
                    background: password.length >= i * 2
                      ? i <= 1 ? "#ef4444"
                        : i <= 2 ? "#f59e0b"
                          : i <= 3 ? "#3b82f6"
                            : "#10b981"
                      : "rgba(255,255,255,0.1)",
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>
            )}
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
                Creating account...
              </>
            ) : (
              <><Zap size={16} /> Create Account</>
            )}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#4b5563", fontSize: "12px", marginTop: "20px" }}>
          By creating an account, you agree to our{" "}
          <span style={{ color: "#7c3aed", cursor: "pointer" }}>Terms</span>{" "}
          and{" "}
          <span style={{ color: "#7c3aed", cursor: "pointer" }}>Privacy Policy</span>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #4b5563 !important; }
      `}</style>
    </div>
  );
}
