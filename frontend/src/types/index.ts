// ============================================================
// USER TYPES
// ============================================================
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: string;
  lastMessage?: {
    content: string;
    type: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount?: number;
}

// ============================================================
// MESSAGE TYPES
// ============================================================
export interface Message {
  _id: string;
  sender: User;
  receiver?: string | User;
  room?: string;
  content: string;
  type: "text" | "image" | "file";
  seen: boolean;
  delivered: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// AUTH TYPES
// ============================================================
export interface AuthResponse {
  status: string;
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// ============================================================
// CHAT ROOM TYPES
// ============================================================
export interface ChatRoom {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  members: User[];
  lastMessage?: Message;
  unreadCount?: number;
  isGroup: boolean;
  createdAt: string;
}

// ============================================================
// API RESPONSE
// ============================================================
export interface ApiResponse<T> {
  status: string;
  message: string;
  data?: T;
}

// ============================================================
// NOTIFICATION TYPE
// ============================================================
export interface Notification {
  id: string;
  type: "message" | "online" | "system";
  title: string;
  body: string;
  avatar?: string;
  createdAt: string;
  read: boolean;
}