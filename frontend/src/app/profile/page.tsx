"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft, Camera, Save, User,
  Mail, FileText, Check, X,
} from "lucide-react";
import useAuthStore from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const AVATAR_SEEDS = [
  "Felix", "Aneka", "Mia", "Zoe", "Leo",
  "Alex", "Sam", "Jordan", "Casey", "Morgan",
  "Riley", "Avery", "Quinn", "Blake", "Drew",
  "Charlie", "Finley", "Hayden", "Jamie", "Kai",
];

export default function ProfilePage() {
  const router = useRouter();
  // FIX: use updateUser from authStore so Zustand state + localStorage stay in sync
  const { user, loadUserFromStorage, updateUser } = useAuthStore();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // ── Auth check ────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.replace("/login"); return; }
    loadUserFromStorage();
    setIsAuthChecked(true);
  }, []);

  // ── Pre-fill form with current user data ─────────────────
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio || "");
      setSelectedAvatar(user.avatar || "");
    }
  }, [user]);

  // ── Save profile ──────────────────────────────────────────
  // FIX: replaced axiosInstance with plain fetch — no extra dependency needed
  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username.trim(),
          bio: bio.trim(),
          avatar: selectedAvatar,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // FIX: update Zustand store + localStorage together via updateUser()
      updateUser(data.user);
      toast.success("Profile updated! ✅");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Loading screen ────────────────────────────────────────
  if (!isAuthChecked || !user) {
    return (
      <div style={{
        height: "100vh", background: "#0a0a0f",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: "36px", height: "36px",
          border: "3px solid rgba(124,58,237,0.3)",
          borderTopColor: "#7c3aed", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* Header */}
      <div style={{
        background: "#111118",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "16px 24px",
        display: "flex", alignItems: "center", gap: "16px",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button
          onClick={() => router.push("/chat")}
          style={{
            background: "rgba(255,255,255,0.06)", border: "none",
            borderRadius: "10px", color: "#fff", padding: "8px",
            cursor: "pointer", display: "flex", alignItems: "center",
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>
            Edit Profile
          </h1>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
            Update your personal information
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          style={{
            marginLeft: "auto",
            background: isLoading ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
            border: "none", borderRadius: "10px",
            color: "white", padding: "10px 20px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "14px", fontWeight: 600,
            display: "flex", alignItems: "center", gap: "8px",
            boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
          }}
        >
          {isLoading ? (
            <div style={{
              width: "14px", height: "14px",
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "white", borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
          ) : <Save size={15} />}
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Avatar preview */}
        <div style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "20px", padding: "28px",
          marginBottom: "24px", textAlign: "center",
        }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: "16px" }}>
            <img
              src={selectedAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt="Avatar"
              style={{
                width: "96px", height: "96px", borderRadius: "50%",
                border: "3px solid rgba(124,58,237,0.4)",
              }}
            />
            <div style={{
              position: "absolute", bottom: "0", right: "0",
              width: "28px", height: "28px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center",
              border: "2px solid #111118",
            }}>
              <Camera size={13} color="white" />
            </div>
          </div>
          <p style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: "0 0 4px" }}>
            {username || user.username}
          </p>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>{user.email}</p>
        </div>

        {/* Avatar picker */}
        <div style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "20px", padding: "24px",
          marginBottom: "24px",
        }}>
          <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: 600, margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Camera size={16} color="#7c3aed" />
            Choose Avatar
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
            {AVATAR_SEEDS.map((seed) => {
              const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
              const isSelected = selectedAvatar === avatarUrl;
              return (
                <div
                  key={seed}
                  onClick={() => setSelectedAvatar(avatarUrl)}
                  style={{
                    position: "relative", cursor: "pointer",
                    borderRadius: "50%", padding: "2px",
                    border: isSelected ? "2px solid #7c3aed" : "2px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <img src={avatarUrl} alt={seed} style={{ width: "100%", borderRadius: "50%", display: "block" }} />
                  {isSelected && (
                    <div style={{
                      position: "absolute", bottom: "0", right: "0",
                      background: "#7c3aed", borderRadius: "50%",
                      width: "18px", height: "18px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2px solid #111118",
                    }}>
                      <Check size={10} color="white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form fields */}
        <div style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "20px", padding: "24px",
          display: "flex", flexDirection: "column", gap: "20px",
        }}>
          <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: 600, margin: 0 }}>
            Personal Information
          </h3>

          {/* Username */}
          <div>
            <label style={{ display: "block", color: "#9ca3af", fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>
              Username
            </label>
            <div style={{ position: "relative" }}>
              <User size={15} color="#4b5563" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                maxLength={20}
                style={{
                  width: "100%", padding: "12px 14px 12px 40px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px", color: "#fff",
                  fontSize: "14px", outline: "none", boxSizing: "border-box",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <p style={{ color: "#4b5563", fontSize: "11px", margin: "6px 0 0" }}>{username.length}/20 characters</p>
          </div>

          {/* Email (readonly) */}
          <div>
            <label style={{ display: "block", color: "#9ca3af", fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} color="#4b5563" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={user.email}
                disabled
                style={{
                  width: "100%", padding: "12px 14px 12px 40px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px", color: "#6b7280",
                  fontSize: "14px", outline: "none", boxSizing: "border-box",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <p style={{ color: "#4b5563", fontSize: "11px", margin: "6px 0 0" }}>Email cannot be changed</p>
          </div>

          {/* Bio */}
          <div>
            <label style={{ display: "block", color: "#9ca3af", fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>
              Bio
            </label>
            <div style={{ position: "relative" }}>
              <FileText size={15} color="#4b5563" style={{ position: "absolute", left: "14px", top: "14px" }} />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people about yourself..."
                maxLength={100}
                rows={3}
                style={{
                  width: "100%", padding: "12px 14px 12px 40px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px", color: "#fff",
                  fontSize: "14px", outline: "none",
                  boxSizing: "border-box", resize: "none",
                  fontFamily: "inherit", lineHeight: 1.5,
                }}
                onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <p style={{ color: "#4b5563", fontSize: "11px", margin: "6px 0 0" }}>{bio.length}/100 characters</p>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{
          background: "rgba(239,68,68,0.05)",
          border: "1px solid rgba(239,68,68,0.15)",
          borderRadius: "20px", padding: "24px",
          marginTop: "24px",
        }}>
          <h3 style={{ color: "#ef4444", fontSize: "15px", fontWeight: 600, margin: "0 0 8px" }}>
            Danger Zone
          </h3>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: "0 0 16px" }}>
            Once you delete your account, there is no going back.
          </p>
          <button style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px", color: "#ef4444",
            padding: "10px 20px", cursor: "pointer",
            fontSize: "14px", fontWeight: 600,
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <X size={15} />
            Delete Account
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: #4b5563; }
      `}</style>
    </div>
  );
}
