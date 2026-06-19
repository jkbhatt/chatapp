"use client";

import { X, MessageCircle, Edit2 } from "lucide-react";

interface UserProfilePanelProps {
  user: {
    _id: string;
    username: string;
    email?: string;
    avatar?: string;
    bio?: string;
    createdAt?: string;
  };
  isOnline: boolean;
  onClose: () => void;
  onMessage: () => void;
  onEdit?: () => void;
  currentUserId?: string;
}

export default function UserProfilePanel({
  user,
  isOnline,
  onClose,
  onMessage,
  onEdit,
  currentUserId,
}: UserProfilePanelProps) {

  const isOwnProfile =
    currentUserId &&
    user?._id &&
    String(currentUserId) === String(user._id);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 9998,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "380px",
          maxWidth: "100%",
          height: "100vh",
          background: "#111118",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>
            Contact Info
          </h2>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Avatar */}
        <div style={{ padding: "30px 20px", textAlign: "center" }}>
          <img
            src={
              user.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
            }
            style={{
              width: "130px",
              height: "130px",
              borderRadius: "50%",
              border: "4px solid rgba(124,58,237,0.4)",
            }}
          />

          <h2 style={{ color: "#fff", marginTop: "18px" }}>
            {user.username}
          </h2>

          <div style={{ color: isOnline ? "#10b981" : "#6b7280" }}>
            {isOnline ? "🟢 Online" : "⚫ Offline"}
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", padding: "14px", borderRadius: "12px" }}>
            <div style={{ color: "#a78bfa", fontSize: "12px" }}>About</div>
            <div style={{ color: "#fff" }}>{user.bio || "Hey there! I am using ChatApp."}</div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", padding: "14px", borderRadius: "12px" }}>
            <div style={{ color: "#a78bfa", fontSize: "12px" }}>Email</div>
            <div style={{ color: "#fff" }}>{user.email || "Not available"}</div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", padding: "14px", borderRadius: "12px" }}>
            <div style={{ color: "#a78bfa", fontSize: "12px" }}>Joined</div>
            <div style={{ color: "#fff" }}>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Unknown"}
            </div>
          </div>
        </div>

        {/* Button */}
        <div style={{ marginTop: "auto", padding: "20px" }}>
          {isOwnProfile ? (
            <button
              onClick={onEdit}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                background: "#7c3aed",
                color: "#fff",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={onMessage}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                color: "#fff",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <MessageCircle size={18} />
              Message
            </button>
          )}
        </div>
      </div>
    </>
  );
}