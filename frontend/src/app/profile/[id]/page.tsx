"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Edit2 } from "lucide-react";
import useAuthStore from "@/store/authStore";
import useChatStore from "@/store/chatStore";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser, loadUserFromStorage } = useAuthStore();
  const { setSelectedUser, users } = useChatStore();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile =
    currentUser && String(currentUser._id) === String(id);

  // ── Auth check + fetch profile ──────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // Make sure currentUser is loaded for isOwnProfile check
    loadUserFromStorage();

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.status === "success") {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // ── Message button — select user and go to chat ─────────
  const handleMessage = () => {
    // Try to find user in already-loaded sidebar users first
    const existing = users.find((u) => u._id === String(id));
    if (existing) {
      setSelectedUser(existing);
    } else if (user) {
      setSelectedUser(user);
    }
    router.push("/chat");
  };

  // ── Loading state ────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0a0f",
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

  // ── Not found state ──────────────────────────────────────
  if (!user) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0a0f",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "16px",
      }}>
        <span style={{ fontSize: "48px" }}>😕</span>
        <p style={{ color: "#6b7280", fontSize: "16px" }}>User not found</p>
        <button
          onClick={() => router.back()}
          style={{
            background: "rgba(124,58,237,0.2)",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: "10px", color: "#a78bfa",
            padding: "10px 20px", cursor: "pointer", fontSize: "14px",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // ── Main profile page ────────────────────────────────────
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
          onClick={() => router.back()}
          style={{
            background: "rgba(255,255,255,0.06)", border: "none",
            borderRadius: "10px", color: "#fff", padding: "8px",
            cursor: "pointer", display: "flex", alignItems: "center",
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>
          {isOwnProfile ? "My Profile" : "Profile"}
        </h1>
      </div>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Avatar + Name + Status */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
              }
              alt={user.username}
              style={{
                width: "120px", height: "120px", borderRadius: "50%",
                border: "4px solid rgba(124,58,237,0.4)",
                objectFit: "cover",
              }}
            />
            {/* Online dot */}
            <div style={{
              position: "absolute", bottom: "6px", right: "6px",
              width: "18px", height: "18px", borderRadius: "50%",
              background: user.isOnline ? "#10b981" : "#374151",
              border: "3px solid #0a0a0f",
            }} />
          </div>

          <h2 style={{
            color: "#fff", fontSize: "24px", fontWeight: 700,
            margin: "16px 0 4px",
          }}>
            {user.username}
          </h2>

          <div style={{
            color: user.isOnline ? "#10b981" : "#6b7280",
            fontSize: "14px", marginBottom: "4px",
          }}>
            {user.isOnline ? "🟢 Online" : "⚫ Offline"}
          </div>
        </div>

        {/* Info Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>

          {/* Bio */}
          <div style={{
            background: "#111118",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px", padding: "16px",
          }}>
            <div style={{
              color: "#7c3aed", fontSize: "12px",
              fontWeight: 600, marginBottom: "8px",
              textTransform: "uppercase", letterSpacing: "0.5px",
            }}>
              About
            </div>
            <div style={{ color: "#e5e7eb", fontSize: "14px", lineHeight: 1.6 }}>
              {user.bio || "Hey there! I am using ChatApp."}
            </div>
          </div>

          {/* Email */}
          <div style={{
            background: "#111118",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px", padding: "16px",
          }}>
            <div style={{
              color: "#7c3aed", fontSize: "12px",
              fontWeight: 600, marginBottom: "8px",
              textTransform: "uppercase", letterSpacing: "0.5px",
            }}>
              Email
            </div>
            <div style={{ color: "#e5e7eb", fontSize: "14px" }}>
              {user.email}
            </div>
          </div>

          {/* Last Seen */}
          <div style={{
            background: "#111118",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px", padding: "16px",
          }}>
            <div style={{
              color: "#7c3aed", fontSize: "12px",
              fontWeight: 600, marginBottom: "8px",
              textTransform: "uppercase", letterSpacing: "0.5px",
            }}>
              Last Seen
            </div>
            <div style={{ color: "#e5e7eb", fontSize: "14px" }}>
              {user.isOnline
                ? "Currently online"
                : user.lastSeen
                  ? new Date(user.lastSeen).toLocaleString([], {
                      year: "numeric", month: "short", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })
                  : "Unknown"}
            </div>
          </div>

          {/* Joined */}
          <div style={{
            background: "#111118",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px", padding: "16px",
          }}>
            <div style={{
              color: "#7c3aed", fontSize: "12px",
              fontWeight: 600, marginBottom: "8px",
              textTransform: "uppercase", letterSpacing: "0.5px",
            }}>
              Joined
            </div>
            <div style={{ color: "#e5e7eb", fontSize: "14px" }}>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString([], {
                    year: "numeric", month: "long", day: "numeric",
                  })
                : "Unknown"}
            </div>
          </div>
        </div>

        {/* Action Button */}
        {isOwnProfile ? (
          <button
            onClick={() => router.push("/profile")}
            style={{
              width: "100%", padding: "15px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none", borderRadius: "14px",
              color: "#fff", fontSize: "15px", fontWeight: 600,
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={handleMessage}
            style={{
              width: "100%", padding: "15px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              border: "none", borderRadius: "14px",
              color: "#fff", fontSize: "15px", fontWeight: 600,
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <MessageCircle size={18} />
            Message
          </button>
        )}
      </div>
    </div>
  );
}
