"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bell, Shield, Palette,
  MessageCircle, LogOut, ChevronRight,
  Moon, Volume2, Eye, Lock,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import { disconnectSocket } from "@/lib/socket";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loadUserFromStorage, logout } = useAuthStore();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.replace("/login");
      return;
    }
    loadUserFromStorage();
    setIsAuthChecked(true);
  }, []);

  const handleLogout = async () => {
    disconnectSocket();
    await logout();
    window.location.replace("/login");
  };

  if (!isAuthChecked || !user) {
    return (
      <div style={{
        height: "100vh", background: "#0a0a0f",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: "36px", height: "36px",
          border: "3px solid rgba(124,58,237,0.3)",
          borderTopColor: "#7c3aed", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <div
      onClick={onChange}
      style={{
        width: "44px", height: "24px", borderRadius: "12px",
        background: value ? "#7c3aed" : "rgba(255,255,255,0.1)",
        cursor: "pointer", position: "relative", transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: "2px",
        left: value ? "22px" : "2px",
        width: "20px", height: "20px",
        borderRadius: "50%", background: "white",
        transition: "left 0.2s",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }} />
    </div>
  );

  const SettingRow = ({
    icon: Icon, label, description, right, onClick, danger = false
  }: {
    icon: any; label: string; description?: string;
    right?: React.ReactNode; onClick?: () => void; danger?: boolean;
  }) => (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "14px",
        padding: "14px 0", cursor: onClick ? "pointer" : "default",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div style={{
        width: "36px", height: "36px", borderRadius: "10px",
        background: danger ? "rgba(239,68,68,0.1)" : "rgba(124,58,237,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={17} color={danger ? "#ef4444" : "#7c3aed"} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: danger ? "#ef4444" : "#fff", fontSize: "14px", fontWeight: 500 }}>
          {label}
        </div>
        {description && (
          <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>{description}</div>
        )}
      </div>
      {right || (onClick && <ChevronRight size={16} color="#4b5563" />)}
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "#111118",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "16px 24px",
        display: "flex", alignItems: "center", gap: "16px",
      }}>
        <button
          onClick={() => router.push("/chat")}
          style={{
            background: "rgba(255,255,255,0.06)", border: "none",
            borderRadius: "10px", color: "#fff", padding: "8px",
            cursor: "pointer", display: "flex",
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>Settings</h1>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Manage your preferences</p>
        </div>
      </div>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "24px" }}>

        {/* Profile Card */}
        <div
          onClick={() => router.push("/profile")}
          style={{
            background: "#111118",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "20px", padding: "20px",
            marginBottom: "16px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "14px",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)"}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
        >
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.username}
            style={{ width: "56px", height: "56px", borderRadius: "50%", border: "2px solid rgba(124,58,237,0.3)" }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ color: "#fff", fontSize: "16px", fontWeight: 700 }}>{user.username}</div>
            <div style={{ color: "#6b7280", fontSize: "13px" }}>{user.email}</div>
            <div style={{ color: "#7c3aed", fontSize: "12px", marginTop: "4px" }}>Edit profile →</div>
          </div>
          <ChevronRight size={18} color="#4b5563" />
        </div>

        {/* Notifications */}
        <div style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "20px", padding: "20px",
          marginBottom: "16px",
        }}>
          <h3 style={{ color: "#9ca3af", fontSize: "11px", fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Notifications
          </h3>
          <SettingRow
            icon={Bell} label="Push Notifications"
            description="Receive notifications for new messages"
            right={<Toggle value={notifications} onChange={() => setNotifications(!notifications)} />}
          />
          <SettingRow
            icon={Volume2} label="Message Sounds"
            description="Play sound when receiving messages"
            right={<Toggle value={sounds} onChange={() => setSounds(!sounds)} />}
          />
        </div>

        {/* Privacy */}
        <div style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "20px", padding: "20px",
          marginBottom: "16px",
        }}>
          <h3 style={{ color: "#9ca3af", fontSize: "11px", fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Privacy
          </h3>
          <SettingRow
            icon={Eye} label="Read Receipts"
            description="Show when you've read messages"
            right={<Toggle value={readReceipts} onChange={() => setReadReceipts(!readReceipts)} />}
          />
          <SettingRow
            icon={Shield} label="Privacy Policy"
            description="Read our privacy policy"
            onClick={() => {}}
          />
          <SettingRow
            icon={Lock} label="Change Password"
            description="Update your account password"
            onClick={() => {}}
          />
        </div>

        {/* Appearance */}
        <div style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "20px", padding: "20px",
          marginBottom: "16px",
        }}>
          <h3 style={{ color: "#9ca3af", fontSize: "11px", fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Appearance
          </h3>
          <SettingRow
            icon={Palette} label="Theme"
            description="Dark mode (more themes coming soon)"
            right={
              <div style={{
                background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: "100px", padding: "4px 10px",
                color: "#a78bfa", fontSize: "12px", fontWeight: 500,
              }}>Dark</div>
            }
          />
          <SettingRow
            icon={Moon} label="Dark Mode"
            description="Currently using dark theme"
            right={<Toggle value={true} onChange={() => {}} />}
          />
        </div>

        {/* About */}
        <div style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "20px", padding: "20px",
          marginBottom: "16px",
        }}>
          <h3 style={{ color: "#9ca3af", fontSize: "11px", fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            About
          </h3>
          <SettingRow
            icon={MessageCircle} label="ChatApp"
            description="Version 1.0.0 — Built with ❤️"
          />
        </div>

        {/* Logout */}
        <div style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "20px", padding: "20px",
        }}>
          <SettingRow
            icon={LogOut} label="Sign Out"
            description="Log out of your account"
            onClick={handleLogout}
            danger
          />
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
