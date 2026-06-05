"use client";

import { useState } from "react";
import { Trash2, Check, CheckCheck } from "lucide-react";

interface Sender {
  _id: string;
  username: string;
  avatar?: string;
}

interface MessageBubbleProps {
  message: {
    _id: string;
    sender: Sender;
    content: string;
    type: string;
    seen: boolean;
    delivered: boolean;
    createdAt: string;
  };
  currentUserId: string;
  onDelete?: (messageId: string) => void;
}

export default function MessageBubble({ message, currentUserId, onDelete }: MessageBubbleProps) {
  const isMine = message.sender._id === currentUserId;
  const [showActions, setShowActions] = useState(false);

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: "8px",
        marginBottom: "4px",
        position: "relative",
      }}
    >
      {/* Avatar for received */}
      {!isMine && (
        <img
          src={message.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.username}`}
          alt={message.sender.username}
          style={{ width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0 }}
        />
      )}

      <div style={{ maxWidth: "65%", position: "relative" }}>
        {/* Delete button on hover */}
        {showActions && isMine && onDelete && (
          <div style={{
            position: "absolute", top: "-34px", right: "0",
            background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px", padding: "4px", display: "flex",
            zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}>
            <button
              onClick={() => onDelete(message._id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#ef4444", padding: "4px 8px", borderRadius: "6px",
                display: "flex", alignItems: "center", gap: "4px", fontSize: "12px",
              }}
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        )}

        {/* Bubble */}
        <div style={{
          padding: "10px 14px",
          borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isMine ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(255,255,255,0.07)",
          color: "#fff", fontSize: "14px", lineHeight: 1.5,
          border: isMine ? "none" : "1px solid rgba(255,255,255,0.06)",
          boxShadow: isMine ? "0 4px 12px rgba(124,58,237,0.2)" : "none",
          wordBreak: "break-word",
        }}>
          <p style={{ margin: 0 }}>{message.content}</p>
          <div style={{
            fontSize: "10px",
            color: isMine ? "rgba(255,255,255,0.55)" : "#6b7280",
            marginTop: "5px", display: "flex",
            justifyContent: "flex-end", alignItems: "center", gap: "4px",
          }}>
            {formatTime(message.createdAt)}
            {isMine && (
              message.seen
                ? <CheckCheck size={12} color="#60a5fa" />
                : <Check size={12} color="rgba(255,255,255,0.5)" />
            )}
          </div>
        </div>
      </div>

      {isMine && <div style={{ width: "28px", flexShrink: 0 }} />}
    </div>
  );
}
