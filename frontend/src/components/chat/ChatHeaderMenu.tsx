"use client";

import { useEffect, useRef } from "react";
import { Trash2, UserX, User, Bell, BellOff } from "lucide-react";

interface ChatHeaderMenuProps {
  onClose: () => void;
  onClearChat: () => void;
  onViewProfile: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

export default function ChatHeaderMenu({
  onClose,
  onClearChat,
  onViewProfile,
  onToggleMute,
  isMuted,
}: ChatHeaderMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const menuItems = [
    {
      icon: User,
      label: "View Profile",
      onClick: onViewProfile,
      danger: false,
    },
    {
      icon: isMuted ? Bell : BellOff,
      label: isMuted ? "Unmute Notifications" : "Mute Notifications",
      onClick: onToggleMute,
      danger: false,
    },
    {
      icon: Trash2,
      label: "Clear Chat",
      onClick: onClearChat,
      danger: true,
    },
  ];

  return (
    <div
      ref={menuRef}
      style={{
        position: "absolute",
        top: "100%",
        right: "0",
        marginTop: "8px",
        background: "#1a1a2e",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        padding: "6px",
        minWidth: "200px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
        zIndex: 50,
        animation: "menuFadeIn 0.15s ease-out",
      }}
    >
      {menuItems.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            background: "none",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            color: item.danger ? "#ef4444" : "#e5e7eb",
            fontSize: "13px",
            fontWeight: 500,
            textAlign: "left",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = item.danger
              ? "rgba(239,68,68,0.1)"
              : "rgba(255,255,255,0.06)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <item.icon size={15} />
          {item.label}
        </button>
      ))}

      <style>{`
        @keyframes menuFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
