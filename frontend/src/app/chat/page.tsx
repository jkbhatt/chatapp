"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  MessageCircle, LogOut, Search, Send,
  Bell, Settings, Phone, Video,
  MoreVertical, Smile, Paperclip, X, User, Reply, ArrowLeft,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import useChatStore from "@/store/chatStore";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import MessageBubble from "@/components/chat/MessageBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { UserSkeleton, MessageSkeleton } from "@/components/ui/Skeleton";
import SearchMessages from "@/components/chat/SearchMessages";
import UserProfilePanel from "@/components/chat/UserProfilePanel";
import ChatHeaderMenu from "@/components/chat/ChatHeaderMenu";
import CallModal from "@/components/chat/CallModal";
import NotificationPanel from "@/components/chat/NotificationPanel";

interface AppNotification {
  id: string;
  type: "message" | "online" | "system";
  title: string;
  body: string;
  avatar?: string;
  time: string;
  read: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, loadUserFromStorage, logout } = useAuthStore();
  const {
    users, messages, selectedUser, onlineUsers,
    isUsersLoading, isMessagesLoading, replyTo,
    getUsers, getMessages, sendMessage, deleteMessage,
    setSelectedUser, setOnlineUsers, addMessage, setReplyTo,
    removeMessageLocally,
  } = useChatStore();

  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showEmojiHint, setShowEmojiHint] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeCall, setActiveCall] = useState<"audio" | "video" | null>(null);
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Mobile: track which panel to show
  const [mobileView, setMobileView] = useState<"sidebar" | "chat">("sidebar");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const quickEmojis = ["😊","😂","❤","👍","🔥","🎉","😎","🙏","💯","✨"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) { window.location.replace("/login"); return; }
    loadUserFromStorage();
    setIsAuthChecked(true);
  }, []);

  const pushNotification = (notif: Omit<AppNotification, "id" | "time" | "read">) => {
    setNotifications((prev) => [
      {
        ...notif,
        id: `${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: false,
      },
      ...prev,
    ].slice(0, 30));
  };

  useEffect(() => {
    if (!isAuthChecked || !user) return;
    const socket = connectSocket(user._id);
    socket.on("getOnlineUsers", (userIds: string[]) => setOnlineUsers(userIds));
    socket.on("newMessage", (message: any) => {
      addMessage(message);
      if (message.sender._id !== user._id) {
        const isMuted = mutedUsers.includes(message.sender._id);
        pushNotification({
          type: "message",
          title: message.sender.username,
          body: message.type === "image" ? "📸 Sent an image" : message.content,
          avatar: message.sender.avatar,
        });
        if (!isMuted) {
          toast(`💬 ${message.sender.username}: ${message.type === "image" ? "📸 Image" : message.content.slice(0,40)}`, {
            style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px" },
          });
        }
      }
    });
    socket.on("userTyping", () => setIsTyping(true));
    socket.on("userStoppedTyping", () => setIsTyping(false));
    socket.on("messageDeleted", ({ messageId }: { messageId: string }) => {
      removeMessageLocally(messageId);
    });
    getUsers();
    return () => {
      socket.off("getOnlineUsers");
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("messageDeleted");
    };
  }, [isAuthChecked, user, mutedUsers]);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      setShowSearch(false);
      // Switch to chat view on mobile when user selected
      setMobileView("chat");
    }
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
    if (e.key === "Escape" && replyTo) setReplyTo(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedUser) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 10) { toast.error(`Image too large (${sizeMB.toFixed(1)}MB). Max 10MB allowed.`); return; }
    setIsUploading(true);
    try {
      let base64: string;
      if (sizeMB > 1) {
        toast("🗜️ Compressing image...", { duration: 2000 });
        base64 = await new Promise<string>((resolve, reject) => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new Image();
          img.onload = () => {
            let width = img.width; let height = img.height;
            const maxSize = 1280;
            if (width > maxSize) { height = Math.round((height * maxSize) / width); width = maxSize; }
            if (height > maxSize) { width = Math.round((width * maxSize) / height); height = maxSize; }
            canvas.width = width; canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.75));
          };
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
      } else {
        base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      await sendMessage(base64, "image");
      toast.success("Image sent! 📸");
    } catch { toast.error("Failed to send image. Try again."); }
    finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogout = async () => { disconnectSocket(); await logout(); window.location.replace("/login"); };
  const handleDeleteMessage = async (messageId: string) => { await deleteMessage(messageId); toast.success("Message deleted"); };
  const handleReply = (message: any) => { setReplyTo(message); inputRef.current?.focus(); };
  const insertEmoji = (emoji: string) => { setMessageInput((prev) => prev + emoji); inputRef.current?.focus(); setShowEmojiHint(false); };

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

  // Formats a last-message timestamp the way WhatsApp's chat list does:
  // time if today, "Yesterday" if yesterday, otherwise a short date.
  const formatMessageTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    } catch { return ""; }
  };

  const handleStartCall = (type: "audio" | "video") => {
    if (!selectedUser) return;
    setActiveCall(type);
    toast(`${type === "video" ? "📹" : "📞"} Calling ${selectedUser.username}...`, {
      style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px" },
    });
  };

  const handleEndCall = () => { setActiveCall(null); toast.success("Call ended"); };

  const handleClearChat = () => {
    if (!selectedUser) return;
    if (confirm(`Clear all messages with ${selectedUser.username}?`)) {
      messages.forEach((msg) => deleteMessage(msg._id));
      toast.success("Chat cleared");
    }
  };

  const handleToggleMute = () => {
    if (!selectedUser) return;
    setMutedUsers((prev) => prev.includes(selectedUser._id) ? prev.filter((id) => id !== selectedUser._id) : [...prev, selectedUser._id]);
    toast.success(mutedUsers.includes(selectedUser._id) ? `Unmuted ${selectedUser.username}` : `Muted ${selectedUser.username}`);
  };

  const handleMarkAllNotificationsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  const filteredUsers = users.filter((u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()));
  const isOnline = (userId: string) => onlineUsers.includes(userId);

  // Handle back button on mobile
  const handleBackToSidebar = () => {
    setMobileView("sidebar");
    setSelectedUser(null);
  };

  if (!isAuthChecked || !user) {
    return (
      <div style={{ height: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading ChatApp...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="chat-container">

      {/* ═══════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════ */}
      <div className={`sidebar ${mobileView === "chat" ? "sidebar-hidden" : "sidebar-visible"}`}>

        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "34px", height: "34px", background: "linear-gradient(135deg, #7c3aed, #3b82f6)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageCircle size={17} color="white" />
            </div>
            <span style={{ fontSize: "17px", fontWeight: 700, color: "#fff" }}>ChatApp</span>
          </div>
          <div style={{ display: "flex", gap: "2px", position: "relative" }}>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowNotifications(!showNotifications)} style={{ background: showNotifications ? "rgba(124,58,237,0.15)" : "none", border: "none", cursor: "pointer", color: showNotifications ? "#a78bfa" : "#6b7280", padding: "7px", borderRadius: "8px", display: "flex", position: "relative" }}>
                <Bell size={17} />
                {unreadNotificationCount > 0 && (
                  <span style={{ position: "absolute", top: "2px", right: "2px", width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", border: "2px solid #111118" }} />
                )}
              </button>
              {showNotifications && (
                <NotificationPanel notifications={notifications} onClose={() => setShowNotifications(false)} onMarkAllRead={handleMarkAllNotificationsRead} />
              )}
            </div>
            <button onClick={() => router.push("/settings")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "7px", borderRadius: "8px", display: "flex" }}>
              <Settings size={17} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 14px" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} color="#4b5563" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              style={{ width: "100%", padding: "9px 11px 9px 32px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* Online count */}
        {onlineUsers.length > 0 && (
          <div style={{ padding: "0 14px 10px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "100px", padding: "4px 10px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
              <span style={{ color: "#10b981", fontSize: "12px", fontWeight: 500 }}>{onlineUsers.length} online</span>
            </div>
          </div>
        )}

        {/* Users list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
          {isUsersLoading ? Array(5).fill(0).map((_, i) => <UserSkeleton key={i} />) :
            filteredUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#4b5563" }}>
                <p style={{ fontSize: "14px" }}>No users found</p>
              </div>
            ) : filteredUsers.map((u) => {
              const hasUnread = (u.unreadCount || 0) > 0;
              const lastMsg = u.lastMessage;
              const isMyLastMessage = lastMsg && lastMsg.senderId === user._id;
              const previewText = lastMsg
                ? (lastMsg.type === "image" ? "📸 Photo" : lastMsg.content)
                : (u.bio || "Hey there!");

              return (
                <div
                  key={u._id}
                  onClick={() => setSelectedUser(u)}
                  style={{
                    padding: "10px 11px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "11px",
                    cursor: "pointer", marginBottom: "2px",
                    background: selectedUser?._id === u._id ? "rgba(124,58,237,0.15)" : "transparent",
                    border: selectedUser?._id === u._id ? "1px solid rgba(124,58,237,0.25)" : "1px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                      alt={u.username}
                      style={{ width: "42px", height: "42px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.08)" }}
                    />
                    <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "10px", height: "10px", borderRadius: "50%", background: isOnline(u._id) ? "#10b981" : "#374151", border: "2px solid #111118" }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#f1f1f3", fontSize: "14px", fontWeight: hasUnread ? 700 : 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {u.username}
                      </span>
                      {lastMsg && (
                        <span style={{ color: hasUnread ? "#10b981" : "#6b7280", fontSize: "11px", flexShrink: 0, marginLeft: "8px" }}>
                          {formatMessageTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px", gap: "8px" }}>
                      <span style={{
                        color: hasUnread ? "#e5e7eb" : "#6b7280",
                        fontWeight: hasUnread ? 600 : 400,
                        fontSize: "12px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        flex: 1, minWidth: 0,
                      }}>
                        {isMyLastMessage && <span style={{ color: "#9ca3af" }}>You: </span>}
                        {previewText}
                      </span>
                      {hasUnread && (
                        <span style={{
                          background: "#10b981", color: "#fff", fontSize: "11px", fontWeight: 700,
                          borderRadius: "100px", minWidth: "20px", height: "20px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: "0 6px", flexShrink: 0,
                        }}>
                          {u.unreadCount! > 99 ? "99+" : u.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>

        {/* Current user footer */}
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "11px" }}>
          <div style={{ position: "relative" }}>
            <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt={user.username} style={{ width: "36px", height: "36px", borderRadius: "50%", border: "2px solid rgba(124,58,237,0.4)" }} />
            <div style={{ position: "absolute", bottom: "0", right: "0", width: "9px", height: "9px", borderRadius: "50%", background: "#10b981", border: "2px solid #111118" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div onClick={() => router.push("/profile")} style={{ color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>{user.username}</div>
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

      {/* ═══════════════════════════════════════
          MAIN CHAT AREA
      ═══════════════════════════════════════ */}
      <div className={`main-area ${mobileView === "sidebar" ? "main-hidden" : "main-visible"}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111118", flexShrink: 0, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                {/* Back button — mobile only */}
                <button
                  className="back-btn"
                  onClick={handleBackToSidebar}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#a78bfa", padding: "6px", display: "flex", borderRadius: "8px" }}
                >
                  <ArrowLeft size={20} />
                </button>

                <div onClick={() => setViewingProfile(true)} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <div style={{ position: "relative" }}>
                    <img src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`} alt={selectedUser.username} style={{ width: "38px", height: "38px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)" }} />
                    <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "9px", height: "9px", borderRadius: "50%", background: isOnline(selectedUser._id) ? "#10b981" : "#374151", border: "2px solid #111118" }} />
                  </div>
                  <div>
                    <div style={{ color: "#fff", fontSize: "15px", fontWeight: 600 }}>{selectedUser.username}</div>
                    <div style={{ fontSize: "12px", color: isTyping ? "#a78bfa" : "#6b7280" }}>
                      {isTyping ? "✏️ typing..." : isOnline(selectedUser._id) ? "🟢 Online" : "⚫ Offline"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "2px" }}>
                <button onClick={() => setShowSearch(!showSearch)} style={{ background: showSearch ? "rgba(124,58,237,0.2)" : "none", border: showSearch ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent", cursor: "pointer", color: showSearch ? "#a78bfa" : "#6b7280", padding: "7px", borderRadius: "8px", display: "flex" }}>
                  <Search size={17} />
                </button>
                <button onClick={() => handleStartCall("audio")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "7px", borderRadius: "8px", display: "flex" }}>
                  <Phone size={17} />
                </button>
                <button onClick={() => handleStartCall("video")} className="hide-on-small" style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "7px", borderRadius: "8px", display: "flex" }}>
                  <Video size={17} />
                </button>
                <div style={{ position: "relative" }}>
                  <button onClick={() => setShowHeaderMenu(!showHeaderMenu)} style={{ background: showHeaderMenu ? "rgba(124,58,237,0.15)" : "none", border: "none", cursor: "pointer", color: showHeaderMenu ? "#a78bfa" : "#6b7280", padding: "7px", borderRadius: "8px", display: "flex" }}>
                    <MoreVertical size={17} />
                  </button>
                  {showHeaderMenu && (
                    <ChatHeaderMenu onClose={() => setShowHeaderMenu(false)} onClearChat={handleClearChat} onViewProfile={() => setViewingProfile(true)} onToggleMute={handleToggleMute} isMuted={mutedUsers.includes(selectedUser._id)} />
                  )}
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "2px", background: "#0a0a0f" }}>
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
                          <MessageBubble message={msg} currentUserId={user._id} onDelete={handleDeleteMessage} onReply={handleReply} />
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
              <div style={{ padding: "8px 16px", background: "#111118", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "6px", alignItems: "center", overflowX: "auto" }}>
                {quickEmojis.map((emoji) => (
                  <button key={emoji} onClick={() => insertEmoji(emoji)} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "8px", padding: "6px 8px", cursor: "pointer", fontSize: "18px", flexShrink: 0 }}>{emoji}</button>
                ))}
                <button onClick={() => setShowEmojiHint(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", marginLeft: "auto", display: "flex", flexShrink: 0 }}>
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Reply Preview */}
            {replyTo && (
              <div style={{ padding: "10px 16px", background: "#111118", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "12px" }}>
                <Reply size={16} color="#7c3aed" />
                <div style={{ flex: 1, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "8px", padding: "6px 10px" }}>
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
              <div style={{ padding: "8px 16px", background: "#111118", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "16px", height: "16px", border: "2px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <span style={{ color: "#9ca3af", fontSize: "13px" }}>Sending image...</span>
              </div>
            )}

            {/* Message Input */}
            <div style={{ padding: "10px 16px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#111118", flexShrink: 0 }}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              <form onSubmit={handleSendMessage}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "5px 5px 5px 12px" }}>
                  <button type="button" onClick={() => setShowEmojiHint(!showEmojiHint)} style={{ background: showEmojiHint ? "rgba(124,58,237,0.2)" : "none", border: "none", cursor: "pointer", color: showEmojiHint ? "#a78bfa" : "#6b7280", padding: "6px", display: "flex", borderRadius: "8px", flexShrink: 0 }}>
                    <Smile size={20} />
                  </button>
                  <input
                    ref={inputRef}
                    value={messageInput}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    placeholder={replyTo ? `Reply to ${replyTo.sender.username}...` : `Message ${selectedUser.username}...`}
                    style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: "14px", outline: "none", padding: "6px 0", minWidth: 0 }}
                  />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "6px", display: "flex", flexShrink: 0 }}>
                    <Paperclip size={18} />
                  </button>
                  <button type="submit" disabled={!messageInput.trim()} style={{ background: messageInput.trim() ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(255,255,255,0.06)", border: "none", borderRadius: "12px", padding: "9px 14px", cursor: messageInput.trim() ? "pointer" : "not-allowed", color: "white", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", fontWeight: 600, transition: "all 0.2s", flexShrink: 0 }}>
                    <Send size={15} />
                    <span className="send-label">Send</span>
                  </button>
                </div>
              </form>
              <p style={{ color: "#4b5563", fontSize: "11px", marginTop: "6px", textAlign: "center" }}>
                Enter to send · Esc to cancel reply
              </p>
            </div>

            {showSearch && selectedUser && (
              <SearchMessages selectedUserId={selectedUser._id} currentUserId={user._id} onClose={() => setShowSearch(false)} onMessageClick={handleSearchMessageClick} />
            )}
            {viewingProfile && selectedUser && (
              <UserProfilePanel user={selectedUser} isOnline={isOnline(selectedUser._id)} onClose={() => setViewingProfile(false)} onMessage={() => setViewingProfile(false)} />
            )}
            {activeCall && selectedUser && (
              <CallModal type={activeCall} user={selectedUser} onEnd={handleEndCall} />
            )}
          </>
        ) : (
          /* Welcome screen — only shows on desktop when no chat selected */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a0f", gap: "20px", padding: "20px" }}>
            <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg, #7c3aed, #3b82f6)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(124,58,237,0.25)" }}>
              <MessageCircle size={38} color="white" />
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, margin: "0 0 8px" }}>Welcome, {user.username}! 👋</h2>
              <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>Select a user from the sidebar to start chatting</p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              {[
                { emoji: "👥", label: "Users Online", value: onlineUsers.length },
                { emoji: "💬", label: "Total Users", value: users.length },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "16px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "22px", marginBottom: "6px" }}>{s.emoji}</div>
                  <div style={{ color: "#fff", fontSize: "20px", fontWeight: 700 }}>{s.value}</div>
                  <div style={{ color: "#6b7280", fontSize: "12px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* ── Reset & base ── */
        * { box-sizing: border-box; }

        /* ── Layout ── */
        .chat-container {
          height: 100vh;
          background: #0a0a0f;
          display: flex;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 320px;
          background: #111118;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .sidebar-header {
          padding: 16px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        /* ── Main area ── */
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        /* ── Back button — hidden on desktop ── */
        .back-btn {
          display: none !important;
        }

        /* ── Hide video on very small screens ── */
        .hide-on-small { display: flex; }

        /* ══════════════════════════════════════
           MOBILE STYLES (max-width: 768px)
        ══════════════════════════════════════ */
        @media (max-width: 768px) {

          /* Full width layout — show one panel at a time */
          .sidebar {
            position: fixed;
            top: 0; left: 0;
            width: 100%;
            height: 100vh;
            z-index: 10;
            transition: transform 0.3s ease;
          }

          .main-area {
            position: fixed;
            top: 0; left: 0;
            width: 100%;
            height: 100vh;
            z-index: 10;
            transition: transform 0.3s ease;
          }

          /* Sidebar visible = slide in from left */
          .sidebar-visible {
            transform: translateX(0);
          }

          /* Sidebar hidden = slide out to left */
          .sidebar-hidden {
            transform: translateX(-100%);
          }

          /* Main visible = slide in from right */
          .main-visible {
            transform: translateX(0);
          }

          /* Main hidden = slide out to right */
          .main-hidden {
            transform: translateX(100%);
          }

          /* Show back button on mobile */
          .back-btn {
            display: flex !important;
          }

          /* Hide video button on small screens */
          .hide-on-small {
            display: none !important;
          }

          /* Hide "Send" text on mobile — icon only */
          .send-label {
            display: none;
          }
        }

        /* ══════════════════════════════════════
           DESKTOP STYLES (min-width: 769px)
        ══════════════════════════════════════ */
        @media (min-width: 769px) {
          /* Always show both panels side by side */
          .sidebar {
            transform: translateX(0) !important;
            position: relative;
          }
          .main-area {
            transform: translateX(0) !important;
            position: relative;
          }
        }

        /* ── Animations ── */
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        /* ── Input placeholder ── */
        input::placeholder { color: #4b5563; }
      `}</style>
    </div>
  );
}