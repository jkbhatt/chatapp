"use client";

import { useEffect, useState } from "react";
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff } from "lucide-react";

interface CallModalProps {
  type: "audio" | "video";
  user: {
    username: string;
    avatar?: string;
  };
  onEnd: () => void;
}

export default function CallModal({ type, user, onEnd }: CallModalProps) {
  const [callStatus, setCallStatus] = useState<"calling" | "connected">("calling");
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    // Simulate connecting after 2 seconds
    const connectTimer = setTimeout(() => {
      setCallStatus("connected");
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (callStatus !== "connected") return;
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)",
      zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: "380px",
        background: "linear-gradient(180deg, #1a1a2e 0%, #0a0a0f 100%)",
        borderRadius: "28px",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "40px 32px",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "8px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}>

        {/* Avatar with pulse animation */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          {callStatus === "calling" && (
            <>
              <div style={{
                position: "absolute", inset: "-12px",
                borderRadius: "50%",
                border: "2px solid rgba(124,58,237,0.4)",
                animation: "pulseRing 1.5s ease-out infinite",
              }} />
              <div style={{
                position: "absolute", inset: "-12px",
                borderRadius: "50%",
                border: "2px solid rgba(124,58,237,0.4)",
                animation: "pulseRing 1.5s ease-out infinite 0.5s",
              }} />
            </>
          )}
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.username}
            style={{
              width: "110px", height: "110px",
              borderRadius: "50%",
              border: "3px solid rgba(124,58,237,0.5)",
              position: "relative", zIndex: 1,
            }}
          />
        </div>

        <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, margin: 0 }}>
          {user.username}
        </h2>

        <p style={{
          color: callStatus === "calling" ? "#a78bfa" : "#10b981",
          fontSize: "14px", margin: "4px 0 0", fontWeight: 500,
        }}>
          {callStatus === "calling"
            ? `${type === "video" ? "Video calling" : "Calling"}...`
            : formatDuration(duration)}
        </p>

        <p style={{ color: "#6b7280", fontSize: "12px", margin: "2px 0 0" }}>
          {type === "video" ? "📹 Video Call" : "📞 Voice Call"} (Demo)
        </p>

        {/* Controls */}
        <div style={{
          display: "flex", gap: "16px",
          marginTop: "32px",
        }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              width: "52px", height: "52px",
              borderRadius: "50%",
              background: isMuted ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.08)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: isMuted ? "#ef4444" : "#fff",
              transition: "all 0.2s",
            }}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {type === "video" && (
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              style={{
                width: "52px", height: "52px",
                borderRadius: "50%",
                background: isVideoOff ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.08)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isVideoOff ? "#ef4444" : "#fff",
                transition: "all 0.2s",
              }}
            >
              {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
          )}

          <button
            onClick={onEnd}
            style={{
              width: "52px", height: "52px",
              borderRadius: "50%",
              background: "#ef4444",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white",
              boxShadow: "0 4px 16px rgba(239,68,68,0.4)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
