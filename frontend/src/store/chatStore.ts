import { create } from "zustand";
import { User, Message } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

interface ChatStore {
  users: User[];
  messages: Message[];
  selectedUser: User | null;
  onlineUsers: string[];
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  replyTo: Message | null;
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (content: string, type?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  removeMessageLocally: (messageId: string) => void;
  setSelectedUser: (user: User | null) => void;
  setOnlineUsers: (userIds: string[]) => void;
  addMessage: (message: Message) => void;
  setReplyTo: (message: Message | null) => void;
}

const useChatStore = create<ChatStore>((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  onlineUsers: [],
  isUsersLoading: false,
  isMessagesLoading: false,
  replyTo: null,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await fetch(`${API_URL}/messages/users`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      set({ users: data.users || [], isUsersLoading: false });
    } catch {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await fetch(`${API_URL}/messages/${userId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      set({ messages: data.messages || [], isMessagesLoading: false });
    } catch {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (content: string, type = "text") => {
    const { selectedUser, messages, replyTo } = get();
    if (!selectedUser) return;
    try {
      const res = await fetch(`${API_URL}/messages/send/${selectedUser._id}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ content, type }),
      });
      const data = await res.json();
      if (data.message) {
        const msgWithReply = replyTo
          ? { ...data.message, replyTo }
          : data.message;
        set({ messages: [...messages, msgWithReply], replyTo: null });

        if (typeof window !== "undefined") {
          const { getSocket } = await import("@/lib/socket");
          const socket = getSocket();
          if (socket) {
            socket.emit("sendMessage", {
              receiverId: selectedUser._id,
              message: msgWithReply,
            });
          }
        }
      }
    } catch (error) {
      console.error("sendMessage error:", error);
    }
  },

  // ============================================================
  // DELETE MESSAGE — now emits socket event so other user
  // sees the deletion in real-time, without needing to refresh.
  // ============================================================
  deleteMessage: async (messageId: string) => {
    const { messages } = get();
    try {
      const res = await fetch(`${API_URL}/messages/${messageId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      // Remove locally for the sender immediately
      set({ messages: messages.filter((m) => m._id !== messageId) });

      // Notify the other user in real-time via socket
      if (data.receiverId && typeof window !== "undefined") {
        const { getSocket } = await import("@/lib/socket");
        const socket = getSocket();
        if (socket) {
          socket.emit("deleteMessage", {
            receiverId: data.receiverId,
            messageId,
          });
        }
      }
    } catch (error) {
      console.error("deleteMessage error:", error);
    }
  },

  // Used by the socket listener (in chat page) when the OTHER
  // user deletes a message — removes it from our local view too.
  removeMessageLocally: (messageId: string) => {
    const { messages } = get();
    set({ messages: messages.filter((m) => m._id !== messageId) });
  },

  setSelectedUser: (user) => set({ selectedUser: user, messages: [], replyTo: null }),
  setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),

  addMessage: (message: Message) => {
    const { messages, selectedUser } = get();
    const senderId = typeof message.sender === "string"
      ? message.sender
      : message.sender._id;
    const isRelevant = senderId === selectedUser?._id ||
      (message.receiver && message.receiver === selectedUser?._id);
    if (isRelevant) {
      set({ messages: [...messages, message] });
    }
  },

  setReplyTo: (message) => set({ replyTo: message }),
}));

export default useChatStore;