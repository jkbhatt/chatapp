"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  MessageCircle, LogOut, Search, Send,
  Bell, Settings, Phone, Video,
  MoreVertical, Smile, Paperclip, X, User, Reply,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import useChatStore from "@/store/chatStore";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import MessageBubble from "@/components/chat/MessageBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { UserSkeleton, MessageSkeleton } from "@/components/ui/Skeleton";
import SearchMessages from "@/components/chat/SearchMessages";

export default function ChatPage() {
  const router = useRouter();
  const { user, loadUserFromStorage, logout } = useAuthStore();
  const {
    users, messages, selectedUser, onlineUsers,
    isUsersLoading, isMessagesLoading, replyTo,
    getUsers, getMessages, sendMessage, deleteMessage,
    setSelectedUser, setOnlineUsers, addMessage, setReplyTo,
  } = useChatStore();

  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showEmojiHint, setShowEmojiHint] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const quickEmojis = ["😊","😂","❤️","👍","🔥","🎉","😎","🙏","💯","✨"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) { window.location.replace("/login"); return; }
    loadUserFromStorage();
    setIsAuthChecked(true);
  }, []);

  useEffect(() => {
    if (!isAuthChecked || !user) return;
    const socket = connectSocket(user._id);
    socket.on("getOnlineUsers", (userIds: string[]) => setOnlineUsers(userIds));
    socket.on("newMessage", (message: any) => {
      addMessage(message);
      if (message.sender._id !== user._id) {
        toast(`💬 ${message.sender.username}: ${message.type === "image" ? "📸 Image" : message.content.slice(0, 40)}`, {
          style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px" },
        });
      }
    });
    socket.on("userTyping", () => setIsTyping(true));
    socket.on("userStoppedTyping", () => setIsTyping(false));
    getUsers();
    return () => {
      socket.off("getOnlineUsers");
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [isAuthChecked, user]);

  useEffect(() => {
    if (selectedUser) { getMessages(selectedUser._id); setShowSearch(false); }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser) return;
    const content = messageInput.trim();
    setMessageInput("");
    await sendMessage(content);
    const socket = getSocket();
    if (socket) socket.emit("stopTyping", { receiverId: selectedUser._id });
    inputRef.current?.focus();
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (!selectedUser) return;
    const socket = getSocket();
    if (!socket) return;
    socket.emit("typing", { receiverId: selectedUser._id });
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }, 2000);
    setTypingTimeout(timeout);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
    if (e.key === "Escape" && replyTo) {
      setReplyTo(null);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be less than 2MB"); return; }
    setIsUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await sendMessage(base64, "image");
      toast.success("Image sent! 📸");
    } catch { toast.error("Failed to send image"); }
    finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogout = async () => {
    disconnectSocket();
    await logout();
    window.location.replace("/login");
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
    toast.success("Message deleted");
  };

  const handleReply = (message: any) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };

  const insertEmoji = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    inputRef.current?.focus();
    setShowEmojiHint(false);
  };

  const handleSearchMessageClick = (messageId: string) => {
    setShowSearch(false);
    setTimeout(() => {
      const el = messageRefs.current[messageId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.background = "rgba(124,58,237,0.2)";
        el.style.borderRadius = "12px";
        setTimeout(() => { el.style.background = "transparent"; }, 2000);
      }
    }, 100);
  };

  const getDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === today.toDateString()) return "Today";
      if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
      return date.toLocaleDateString([], { month: "long", day: "numeric" });
    } catch { return ""; }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const isOnline = (userId: string) => onlineUsers.includes(userId);

  if (!isAuthChecked || !user) {
    return (
      <div style={{
        height: "100vh", background: "#0a0a0f",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "16px",
      }}>
        <div style={{
          width: "40px", height: "40px",
          border: "3px solid rgba(124,58,237,0.3)",
          borderTopColor: "#7c3aed", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading ChatApp...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      height: "100vh", background: "#0a0a0f",
      display: "flex", overflow: "hidden",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* SIDEBAR */}
      <div style={{
        width: "320px", background: "#111118",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column", flexShrink: 0,
      }}>
        <div style={{
          padding: "16px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px",
              background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
              borderRadius: "10px", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <MessageCircle size={17} color="white" />
            </div>
            <span style={{ fontSize: "17px", fontWeight: 700, color: "#fff" }}>ChatApp</span>
          </div>
          <div style={{ display: "flex", gap: "2px" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "7px", borderRadius: "8px", display: "flex" }}>
              <Bell size={17} />
            </button>
            <button onClick={() => router.push("/settings")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "7px", borderRadius: "8px", display: "flex" }}>
              <Settings size={17} />
            </button>
          </div>
        </div>

        <div style={{ padding: "12px 14px" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} color="#4b5563" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              style={{
                width: "100%", padding: "9px 11px 9px 32px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px", color: "#fff",
                fontSize: "13px", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {onlineUsers.length > 0 && (
          <div style={{ padding: "0 14px 10px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: "100px", padding: "4px 10px",
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
              <span style={{ color: "#10b981", fontSize: "12px", fontWeight: 500 }}>{onlineUsers.length} online</span>
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
          {isUsersLoading ? Array(5).fill(0).map((_, i) => <UserSkeleton key={i} />) :
            filteredUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#4b5563" }}>
                <p style={{ fontSize: "14px" }}>No users found</p>
              </div>
            ) : filteredUsers.map((u) => (
              <div key={u._id} onClick={() => setSelectedUser(u)} style={{
                padding: "10px 11px", borderRadius: "12px",
                display: "flex", alignItems: "center", gap: "11px",
                cursor: "pointer", marginBottom: "2px",
                background: selectedUser?._id === u._id ? "rgba(124,58,237,0.15)" : "transparent",
                border: selectedUser?._id === u._id ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
                transition: "all 0.15s",
              }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt={u.username}
                    style={{ width: "42px", height: "42px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)" }} />
                  <div style={{
                    position: "absolute", bottom: "1px", right: "1px",
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: isOnline(u._id) ? "#10b981" : "#374151", border: "2px solid #111118",
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#f1f1f3", fontSize: "14px", fontWeight: 600 }}>{u.username}</span>
                    {isOnline(u._id) && <span style={{ color: "#10b981", fontSize: "11px" }}>Online</span>}
                  </div>
                  <span style={{ color: "#6b7280", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                    {u.bio || "Hey there!"}
                  </span>
                </div>
              </div>
            ))
          }
        </div>

        <div style={{
          padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: "11px",
        }}>
          <div style={{ position: "relative" }}>
            <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username}
              style={{ width: "36px", height: "36px", borderRadius: "50%", border: "2px solid rgba(124,58,237,0.4)" }} />
            <div style={{ position: "absolute", bottom: "0", right: "0", width: "9px", height: "9px", borderRadius: "50%", background: "#10b981", border: "2px solid #111118" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div onClick={() => router.push("/profile")} style={{ color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              {user.username}
            </div>
            <div style={{ color: "#10b981", fontSize: "11px" }}>● Online</div>
          </div>
          <button onClick={() => router.push("/profile")} style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "8px", color: "#a78bfa", padding: "7px", cursor: "pointer", display: "flex" }}>
            <User size={14} />
          </button>
          <button onClick={handleLogout} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", color: "#ef4444", padding: "7px", cursor: "pointer", display: "flex" }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: "13px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#111118", flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ position: "relative" }}>
                  <img src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`}
                    alt={selectedUser.username}
                    style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)" }} />
                  <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "10px", height: "10px", borderRadius: "50%", background: isOnline(selectedUser._id) ? "#10b981" : "#374151", border: "2px solid #111118" }} />
                </div>
                <div>
                  <div style={{ color: "#fff", fontSize: "15px", fontWeight: 600 }}>{selectedUser.username}</div>
                  <div style={{ fontSize: "12px", color: isTyping ? "#a78bfa" : "#6b7280" }}>
                    {isTyping ? "✍️ typing..." : isOnline(selectedUser._id) ? "🟢 Online" : "⚫ Offline"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => setShowSearch(!showSearch)} style={{
                  background: showSearch ? "rgba(124,58,237,0.2)" : "none",
                  border: showSearch ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
                  cursor: "pointer", color: showSearch ? "#a78bfa" : "#6b7280",
                  padding: "8px", borderRadius: "8px", display: "flex",
                }}>
                  <Search size={18} />
                </button>
                {([Phone, Video, MoreVertical] as const).map((Icon, i) => (
                  <button key={i} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "8px", borderRadius: "8px", display: "flex" }}>
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto", padding: "20px 22px",
              display: "flex", flexDirection: "column", gap: "2px", background: "#0a0a0f",
            }}>
              {isMessagesLoading ? Array(5).fill(0).map((_, i) => <MessageSkeleton key={i} isMine={i % 3 === 0} />) :
                messages.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px" }}>
                    <span style={{ fontSize: "40px" }}>👋</span>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ color: "#fff", fontSize: "16px", fontWeight: 600, margin: "0 0 6px" }}>Say hi to {selectedUser.username}!</p>
                      <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Start the conversation</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const currentDate = getDateLabel(msg.createdAt);
                      const prevDate = i > 0 ? getDateLabel(messages[i - 1].createdAt) : null;
                      const showDivider = currentDate !== prevDate;
                      return (
                        <div key={msg._id} ref={(el) => { messageRefs.current[msg._id] = el; }} style={{ transition: "background 0.5s" }}>
                          {showDivider && (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0 12px" }}>
                              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                              <span style={{ color: "#6b7280", fontSize: "11px", background: "#111118", padding: "3px 10px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.06)" }}>{currentDate}</span>
                              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                            </div>
                          )}
                          <MessageBubble
                            message={msg}
                            currentUserId={user._id}
                            onDelete={handleDeleteMessage}
                            onReply={handleReply}
                          />
                        </div>
                      );
                    })}
                    {isTyping && <TypingIndicator />}
                  </>
                )
              }
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Emojis */}
            {showEmojiHint && (
              <div style={{ padding: "10px 22px", background: "#111118", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "8px", alignItems: "center" }}>
                {quickEmojis.map((emoji) => (
                  <button key={emoji} onClick={() => insertEmoji(emoji)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "8px", padding: "6px 8px", cursor: "pointer", fontSize: "18px" }}>{emoji}</button>
                ))}
                <button onClick={() => setShowEmojiHint(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", marginLeft: "auto", display: "flex" }}>
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Reply Preview Bar */}
            {replyTo && (
              <div style={{
                padding: "10px 22px", background: "#111118",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: "12px",
              }}>
                <Reply size={16} color="#7c3aed" />
                <div style={{
                  flex: 1, background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  borderRadius: "8px", padding: "6px 10px",
                }}>
                  <div style={{ color: "#a78bfa", fontSize: "12px", fontWeight: 600, marginBottom: "2px" }}>
                    Replying to {replyTo.sender._id === user._id ? "yourself" : replyTo.sender.username}
                  </div>
                  <div style={{ color: "#9ca3af", fontSize: "12px" }}>
                    {replyTo.type === "image" ? "📸 Image" : replyTo.content.slice(0, 60)}
                  </div>
                </div>
                <button onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex" }}>
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Upload progress */}
            {isUploading && (
              <div style={{ padding: "8px 22px", background: "#111118", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "16px", height: "16px", border: "2px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span style={{ color: "#9ca3af", fontSize: "13px" }}>Sending image...</span>
              </div>
            )}

            {/* Input */}
            <div style={{ padding: "12px 22px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#111118", flexShrink: 0 }}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              <form onSubmit={handleSendMessage}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px", padding: "6px 6px 6px 14px",
                }}>
                  <button type="button" onClick={() => setShowEmojiHint(!showEmojiHint)} style={{ background: showEmojiHint ? "rgba(124,58,237,0.2)" : "none", border: "none", cursor: "pointer", color: showEmojiHint ? "#a78bfa" : "#6b7280", padding: "6px", display: "flex", borderRadius: "8px" }}>
                    <Smile size={20} />
                  </button>
                  <input
                    ref={inputRef}
                    value={messageInput}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    placeholder={replyTo ? `Reply to ${replyTo.sender.username}...` : `Message ${selectedUser.username}...`}
                    style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: "14px", outline: "none", padding: "6px 0" }}
                  />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "6px", display: "flex" }}>
                    <Paperclip size={18} />
                  </button>
                  <button type="submit" disabled={!messageInput.trim()} style={{
                    background: messageInput.trim() ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(255,255,255,0.06)",
                    border: "none", borderRadius: "12px", padding: "9px 16px",
                    cursor: messageInput.trim() ? "pointer" : "not-allowed",
                    color: "white", display: "flex", alignItems: "center",
                    gap: "6px", fontSize: "13px", fontWeight: 600, transition: "all 0.2s",
                  }}>
                    <Send size={15} />
                    Send
                  </button>
                </div>
              </form>
              <p style={{ color: "#4b5563", fontSize: "11px", marginTop: "6px", textAlign: "center" }}>
                Press Enter to send · Esc to cancel reply
              </p>
            </div>

            {showSearch && selectedUser && (
              <SearchMessages
                selectedUserId={selectedUser._id}
                currentUserId={user._id}
                onClose={() => setShowSearch(false)}
                onMessageClick={handleSearchMessageClick}
              />
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a0f", gap: "20px" }}>
            <div style={{ width: "88px", height: "88px", background: "linear-gradient(135deg, #7c3aed, #3b82f6)", borderRadius: "26px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(124,58,237,0.25)" }}>
              <MessageCircle size={42} color="white" />
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>Welcome, {user.username}! 👋</h2>
              <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>Select a user from the sidebar to start chatting</p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              {[
                { emoji: "👥", label: "Users Online", value: onlineUsers.length },
                { emoji: "💬", label: "Total Users", value: users.length },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "18px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>{s.emoji}</div>
                  <div style={{ color: "#fff", fontSize: "22px", fontWeight: 700 }}>{s.value}</div>
                  <div style={{ color: "#6b7280", fontSize: "12px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        input::placeholder { color: #4b5563; }
      `}</style>
    </div>
  );
}
