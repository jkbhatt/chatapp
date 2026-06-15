"use client";

import { useState } from "react";
import { Trash2, Check, CheckCheck, Download, Reply } from "lucide-react";

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
    replyTo?: {
      _id: string;
      content: string;
      type: string;
      sender: Sender;
    };
  };
  currentUserId: string;
  onDelete?: (messageId: string) => void;
  onReply?: (message: any) => void;
}

export default function MessageBubble({
  message,
  currentUserId,
  onDelete,
  onReply,
}: MessageBubbleProps) {
  const isMine = message.sender._id === currentUserId;
  const [showActions, setShowActions] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const isImage = message.type === "image";

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <>
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
        {!isMine && (
          <img
            src={
              message.sender.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.username}`
            }
            alt={message.sender.username}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
        )}

        <div style={{ maxWidth: "65%", position: "relative" }}>
          {showActions && (
            <div
              style={{
                position: "absolute",
                top: "-34px",
                right: isMine ? "0" : "auto",
                left: isMine ? "auto" : "0",
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                padding: "4px",
                display: "flex",
                zIndex: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                gap: "2px",
              }}
            >
              {onReply && (
                <button
                  onClick={() => onReply(message)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#a78bfa",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                  }}
                >
                  <Reply size={12} />
                  Reply
                </button>
              )}

              {isMine && onDelete && (
                <button
                  onClick={() => onDelete(message._id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#ef4444",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                  }}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              )}
            </div>
          )}

          <div
            style={{
              padding: isImage ? "6px" : "10px 14px",
              borderRadius: isMine
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              background: isMine
                ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                : "rgba(255,255,255,0.07)",
              color: "#fff",
              fontSize: "14px",
              lineHeight: 1.5,
              border: isMine
                ? "none"
                : "1px solid rgba(255,255,255,0.06)",
              wordBreak: "break-word",
              overflow: "hidden",
            }}
          >
            {message.replyTo && (
              <div
                style={{
                  background: isMine
                    ? "rgba(0,0,0,0.2)"
                    : "rgba(255,255,255,0.08)",
                  borderLeft: "3px solid",
                  borderColor: isMine
                    ? "rgba(255,255,255,0.5)"
                    : "#7c3aed",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  marginBottom: "8px",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    color: isMine
                      ? "rgba(255,255,255,0.7)"
                      : "#a78bfa",
                    fontWeight: 600,
                  }}
                >
                  {message.replyTo.sender._id === currentUserId
                    ? "You"
                    : message.replyTo.sender.username}
                </div>

                <div
                  style={{
                    color: isMine
                      ? "rgba(255,255,255,0.6)"
                      : "#9ca3af",
                  }}
                >
                  {message.replyTo.type === "image"
                    ? "📸 Image"
                    : message.replyTo.content.slice(0, 60)}
                </div>
              </div>
            )}

            {isImage ? (
              <div style={{ position: "relative" }}>
                {!imgLoaded && (
                  <div
                    style={{
                      width: "240px",
                      height: "160px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        color: "#6b7280",
                        fontSize: "12px",
                      }}
                    >
                      Loading...
                    </span>
                  </div>
                )}

                <img
                  src={message.content}
                  alt="Shared image"
                  onLoad={() => setImgLoaded(true)}
                  onClick={() => setShowImage(true)}
                  style={{
                    maxWidth: "240px",
                    maxHeight: "320px",
                    borderRadius: "10px",
                    display: imgLoaded ? "block" : "none",
                    cursor: "pointer",
                  }}
                />

                {imgLoaded && (
                  <a
                    href={message.content}
                    download="image"
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "rgba(0,0,0,0.5)",
                      borderRadius: "8px",
                      padding: "6px",
                      display: "flex",
                      color: "white",
                      textDecoration: "none",
                    }}
                  >
                    <Download size={14} />
                  </a>
                )}

                <div
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.7)",
                    marginTop: "4px",
                    textAlign: "right",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {formatTime(message.createdAt)}
                  {isMine &&
                    (message.seen ? (
                      <CheckCheck size={12} color="#60a5fa" />
                    ) : (
                      <Check
                        size={12}
                        color="rgba(255,255,255,0.5)"
                      />
                    ))}
                </div>
              </div>
            ) : (
              <>
                <p style={{ margin: 0 }}>{message.content}</p>

                <div
                  style={{
                    fontSize: "10px",
                    color: isMine
                      ? "rgba(255,255,255,0.55)"
                      : "#6b7280",
                    marginTop: "5px",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {formatTime(message.createdAt)}
                  {isMine &&
                    (message.seen ? (
                      <CheckCheck size={12} color="#60a5fa" />
                    ) : (
                      <Check
                        size={12}
                        color="rgba(255,255,255,0.5)"
                      />
                    ))}
                </div>
              </>
            )}
          </div>
        </div>

        {isMine && <div style={{ width: "28px", flexShrink: 0 }} />}
      </div>

      {showImage && (
        <div
          onClick={() => setShowImage(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.95)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "pointer",
          }}
        >
          <img
            src={message.content}
            alt="Preview"
            style={{
              maxWidth: "95%",
              maxHeight: "95%",
              borderRadius: "12px",
            }}
          />
        </div>
      )}
    </>
  );
}