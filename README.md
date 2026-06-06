# 💬 ChatApp — Real-time Chat Application

<div align="center">

![ChatApp Banner](https://via.placeholder.com/800x200/7c3aed/ffffff?text=ChatApp+%E2%80%94+Real-time+Chat+Application)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-black?style=for-the-badge&logo=socket.io)](https://socket.io/)

**A full-stack real-time chat application built with modern technologies**

[🚀 Live Demo](#) · [📖 Documentation](#) · [🐛 Report Bug](https://github.com/jkbhatt/chatapp/issues)

</div>

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login/register with bcrypt password hashing
- ⚡ **Real-time Messaging** — Instant messages using Socket.io
- 👥 **Online/Offline Status** — See who's online in real-time
- ✍️ **Typing Indicators** — Know when someone is typing
- 💬 **Reply to Messages** — Quote and reply to specific messages
- 📸 **Image Sharing** — Send images in conversations
- 🔍 **Message Search** — Search through conversation history
- 👤 **User Profiles** — Customizable avatars and bio
- ⚙️ **Settings Page** — Notifications, privacy controls
- 🗑️ **Delete Messages** — Remove your own messages
- 🌙 **Dark Mode UI** — Beautiful dark theme throughout
- 📱 **Responsive Design** — Works on all screen sizes
- 🔒 **Rate Limiting** — Protection against spam and abuse
- 🛡️ **Security Headers** — Helmet.js for HTTP security

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 14 | React framework with App Router |
| TypeScript | Type-safe JavaScript |
| Tailwind CSS | Utility-first styling |
| Zustand | Global state management |
| Socket.io Client | Real-time communication |
| Axios | HTTP client |
| React Hot Toast | Toast notifications |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| TypeScript | Type-safe JavaScript |
| MongoDB | NoSQL database |
| Mongoose | MongoDB ODM |
| Socket.io | Real-time WebSocket server |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| Zod | Input validation |
| Morgan | HTTP request logger |

---

## 📁 Project Structure

```
chatapp/
├── frontend/                 # Next.js App
│   ├── src/
│   │   ├── app/             # Pages (App Router)
│   │   │   ├── (auth)/      # Login & Register
│   │   │   ├── chat/        # Main chat page
│   │   │   ├── profile/     # User profile
│   │   │   └── settings/    # App settings
│   │   ├── components/      # Reusable components
│   │   │   ├── chat/        # Chat-specific components
│   │   │   └── ui/          # Generic UI components
│   │   ├── store/           # Zustand state stores
│   │   ├── lib/             # Utilities (axios, socket)
│   │   └── types/           # TypeScript interfaces
│   └── package.json
│
└── backend/                  # Express.js API
    ├── src/
    │   ├── controllers/     # Route handlers
    │   ├── models/          # MongoDB schemas
    │   ├── routes/          # API endpoints
    │   ├── middleware/      # Auth, rate limiting, errors
    │   ├── socket/          # Socket.io handlers
    │   ├── config/          # Database config
    │   └── utils/           # Helper functions
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/jkbhatt/chatapp.git
cd chatapp
```

**2. Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Fill in your environment variables
npm run dev
```

**3. Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in your environment variables
npm run dev
```

**4. Open the app**
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

---

## ⚙️ Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/users` | Get all users |
| GET | `/api/messages/:userId` | Get messages with user |
| POST | `/api/messages/send/:userId` | Send message |
| DELETE | `/api/messages/:messageId` | Delete message |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:userId` | Get user profile |
| PUT | `/api/users/profile/update` | Update profile |
| GET | `/api/users/search?q=` | Search users |

---

## 🔒 Security Features

- ✅ JWT authentication with expiry
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Rate limiting (10 auth attempts/15min)
- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Input validation with Zod
- ✅ Environment variables for secrets

---

## 📸 Screenshots

> Screenshots coming soon

---

## 🚀 Deployment

- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: MongoDB Atlas

---

## 👨‍💻 Author

**Jay Bhatt**
- GitHub: [@jkbhatt](https://github.com/jkbhatt)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <p>Built with ❤️ by Jay Bhatt</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
