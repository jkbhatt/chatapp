import { create } from "zustand";
import { User, Message } from "@/types";
import { getSocket } from "@/lib/socket";

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

  // ── Get all users for sidebar ─────────────────────────────
  // FIX: removed duplicate set() call and debug console.log
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

  // ── Get messages for a conversation ──────────────────────
  // FIX: removed alert() and debug console.logs
  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await fetch(`${API_URL}/messages/${userId}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      set({
        messages: data.messages || [],
        isMessagesLoading: false,
      });
    } catch (error) {
      console.error("getMessages error:", error);
      set({ isMessagesLoading: false });
    }
  },

  // ── Send a message ────────────────────────────────────────
  // FIX: removed dynamic import — use static import at top of file
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

        // Emit to receiver via socket
        const socket = getSocket();
        if (socket) {
          socket.emit("sendMessage", {
            receiverId: selectedUser._id,
            message: msgWithReply,
          });
        }
      }
    } catch (error) {
      console.error("sendMessage error:", error);
    }
  },

  // ── Delete a message ──────────────────────────────────────
  // FIX: also emit socket event so receiver's UI updates instantly
  deleteMessage: async (messageId: string) => {
    const { messages, selectedUser } = get();
    try {
      await fetch(`${API_URL}/messages/${messageId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      // Remove from local state immediately
      set({ messages: messages.filter((m) => m._id !== messageId) });

      // Notify receiver via socket
      const socket = getSocket();
      if (socket && selectedUser) {
        socket.emit("deleteMessage", {
          messageId,
          receiverId: selectedUser._id,
        });
      }
    } catch (error) {
      console.error("deleteMessage error:", error);
    }
  },

  // ── Set selected user (clears old messages + replyTo) ────
  setSelectedUser: (user) =>
    set({ selectedUser: user, messages: [], replyTo: null }),

  setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),

  // ── Add incoming message from socket ─────────────────────
  // FIX: properly normalise receiver to string before comparing
  addMessage: (message: Message) => {
    const { messages, selectedUser } = get();

    const senderId =
      typeof message.sender === "string"
        ? message.sender
        : message.sender._id;

    const receiverId =
      typeof message.receiver === "object" && message.receiver !== null
        ? (message.receiver as User)._id
        : (message.receiver as string);

    const isRelevant =
      senderId === selectedUser?._id ||
      receiverId === selectedUser?._id;

    if (isRelevant) {
      set({ messages: [...messages, message] });
    }
  },

  setReplyTo: (message) => set({ replyTo: message }),
}));

export default useChatStore;