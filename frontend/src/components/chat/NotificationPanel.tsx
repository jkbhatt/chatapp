"use client";

import { useEffect, useRef } from "react";
import { Bell, MessageCircle, UserPlus, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  type: "message" | "online" | "system";
  title: string;
  body: string;
  avatar?: string;
  time: string;
  read: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

export default function NotificationPanel({
  notifications,
  onClose,
  onMarkAllRead,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case "message": return MessageCircle;
      case "online": return UserPlus;
      default: return Bell;
    }
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute",
        top: "100%",
        left: "0",
        marginTop: "8px",
        width: "320px",
        maxHeight: "420px",
        background: "#1a1a2e",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        zIndex: 50,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        animation: "menuFadeIn 0.15s ease-out",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>
          Notifications
        </span>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={onMarkAllRead}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#7c3aed", fontSize: "12px", fontWeight: 500,
              display: "flex", alignItems: "center", gap: "4px",
            }}
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ overflowY: "auto", maxHeight: "360px" }}>
        {notifications.length === 0 ? (
          <div style={{
            padding: "40px 20px", textAlign: "center",
          }}>
            <Bell size={28} color="#374151" style={{ marginBottom: "12px" }} />
            <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>
              No notifications yet
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const Icon = getIcon(notif.type);
            return (
              <div
                key={notif.id}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  display: "flex", gap: "12px",
                  background: notif.read ? "transparent" : "rgba(124,58,237,0.05)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = notif.read
                    ? "transparent"
                    : "rgba(124,58,237,0.05)")
                }
              >
                {notif.avatar ? (
                  <img
                    src={notif.avatar}
                    alt=""
                    style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "rgba(124,58,237,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Icon size={16} color="#a78bfa" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>
                    {notif.title}
                  </div>
                  <div style={{
                    color: "#9ca3af", fontSize: "12px",
                    overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {notif.body}
                  </div>
                  <div style={{ color: "#4b5563", fontSize: "11px", marginTop: "4px" }}>
                    {notif.time}
                  </div>
                </div>
                {!notif.read && (
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: "#7c3aed", flexShrink: 0, marginTop: "4px",
                  }} />
                )}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        @keyframes menuFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
