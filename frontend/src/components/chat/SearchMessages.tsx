"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, MessageCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Message {
  _id: string;
  content: string;
  type: string;
  createdAt: string;
  sender: {
    _id: string;
    username: string;
    avatar: string;
  };
}

interface SearchMessagesProps {
  selectedUserId: string;
  currentUserId: string;
  onClose: () => void;
  onMessageClick: (messageId: string) => void;
}

export default function SearchMessages({
  selectedUserId,
  currentUserId,
  onClose,
  onMessageClick,
}: SearchMessagesProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load messages for this conversation ───────────────────
  // FIX: replaced axiosInstance with plain fetch
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/messages/${selectedUserId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        // FIX: only store text messages — images can't be searched by content
        const textOnly = (data.messages || []).filter(
          (m: Message) => m.type !== "image"
        );
        setAllMessages(textOnly);
      } catch (error) {
        console.error("Failed to load messages for search:", error);
      }
    };

    loadMessages();
    inputRef.current?.focus();
  }, [selectedUserId]);

  // ── Filter messages locally as user types ─────────────────
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    const filtered = allMessages.filter((msg) =>
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
    setIsLoading(false);
  }, [query, allMessages]);

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString([], {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return ""; }
  };

  // ── Highlight matching text ───────────────────────────────
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} style={{
          background: "rgba(124,58,237,0.4)",
          color: "#fff", borderRadius: "3px", padding: "0 2px",
        }}>
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      background: "#0a0a0f", zIndex: 100,
      display: "flex", flexDirection: "column",
    }}>

      {/* Header */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "#111118",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} color="#6b7280" style={{
            position: "absolute", left: "12px",
            top: "50%", transform: "translateY(-50%)",
          }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            style={{
              width: "100%", padding: "10px 12px 10px 36px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px", color: "#fff",
              fontSize: "14px", outline: "none", boxSizing: "border-box",
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
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.06)", border: "none",
            borderRadius: "10px", color: "#fff",
            padding: "8px", cursor: "pointer", display: "flex",
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
        {!query.trim() ? (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            height: "200px", gap: "12px",
          }}>
            <Search size={32} color="#374151" />
            <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
              Type to search messages
            </p>
          </div>
        ) : isLoading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
            Searching...
          </div>
        ) : results.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            height: "200px", gap: "12px",
          }}>
            <MessageCircle size={32} color="#374151" />
            <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
              No messages found for &quot;{query}&quot;
            </p>
          </div>
        ) : (
          <>
            <p style={{ color: "#6b7280", fontSize: "12px", margin: "0 0 12px" }}>
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </p>
            {results.map((msg) => {
              const isMine = msg.sender._id === currentUserId;
              return (
                <div
                  key={msg._id}
                  onClick={() => onMessageClick(msg._id)}
                  style={{
                    padding: "12px 14px", borderRadius: "12px",
                    marginBottom: "8px", cursor: "pointer",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(124,58,237,0.1)";
                    e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  }}
                >
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: "6px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img
                        src={msg.sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.username}`}
                        alt={msg.sender.username}
                        style={{ width: "22px", height: "22px", borderRadius: "50%" }}
                      />
                      <span style={{
                        color: isMine ? "#a78bfa" : "#9ca3af",
                        fontSize: "12px", fontWeight: 600,
                      }}>
                        {isMine ? "You" : msg.sender.username}
                      </span>
                    </div>
                    <span style={{ color: "#4b5563", fontSize: "11px" }}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                  <p style={{ color: "#d1d5db", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
                    {highlightText(msg.content, query)}
                  </p>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
