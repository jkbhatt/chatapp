import { create } from "zustand";
import { User, Message } from "@/types";
import useAuthStore from "@/store/authStore";

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

// Keeps the sidebar sorted with the most recent conversation on top,
// same as WhatsApp's chat list.
const sortByRecency = (users: User[]) => {
  return [...users].sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });
};

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
    const { selectedUser, messages, replyTo, users } = get();
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

        // Update this user's row in the sidebar — new preview, floats to top
        const myId = useAuthStore.getState().user?._id;
        const previewText = type === "image" ? "📸 Photo" : content;
        const updatedUsers = users.map((u) =>
          u._id === selectedUser._id
            ? {
                ...u,
                lastMessage: {
                  content: previewText,
                  type,
                  senderId: myId || "",
                  createdAt: msgWithReply.createdAt,
                },
                unreadCount: 0,
              }
            : u
        );
        set({ users: sortByRecency(updatedUsers) });

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

      set({ messages: messages.filter((m) => m._id !== messageId) });

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

  removeMessageLocally: (messageId: string) => {
    const { messages } = get();
    set({ messages: messages.filter((m) => m._id !== messageId) });
  },

  // Selecting a user now also zeroes their unread badge instantly —
  // no need to wait for the next getUsers() refetch.
  setSelectedUser: (user) => {
    set((state) => ({
      selectedUser: user,
      messages: [],
      replyTo: null,
      users: user
        ? state.users.map((u) =>
            u._id === user._id ? { ...u, unreadCount: 0 } : u
          )
        : state.users,
    }));
  },

  setOnlineUsers: (userIds) => set({ onlineUsers: userIds }),

  // Incoming message (via socket) — updates the open chat AND
  // the sidebar preview/unread count/sort order for that user.
  addMessage: (message: Message) => {
    const { messages, selectedUser, users } = get();
    const myId = useAuthStore.getState().user?._id;

    const senderId = typeof message.sender === "string"
      ? message.sender
      : message.sender._id;
    const receiverId = typeof message.receiver === "string"
      ? message.receiver
      : message.receiver?._id;

    // Whichever side of this message isn't me
    const otherUserId = senderId === myId ? receiverId : senderId;
    const isCurrentChat = otherUserId === selectedUser?._id;

    if (isCurrentChat) {
      set({ messages: [...messages, message] });
    }

    const previewText = message.type === "image" ? "📸 Photo" : message.content;
    const updatedUsers = users.map((u) => {
      if (u._id !== otherUserId) return u;
      return {
        ...u,
        lastMessage: {
          content: previewText,
          type: message.type || "text",
          senderId,
          createdAt: message.createdAt,
        },
        unreadCount:
          senderId !== myId && !isCurrentChat
            ? (u.unreadCount || 0) + 1
            : isCurrentChat
            ? 0
            : u.unreadCount || 0,
      };
    });

    set({ users: sortByRecency(updatedUsers) });
  },

  setReplyTo: (message) => set({ replyTo: message }),
}));

export default useChatStore;