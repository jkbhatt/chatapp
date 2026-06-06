"use client";

export function UserSkeleton() {
  return (
    <div style={{
      padding: "10px 12px", borderRadius: "12px",
      display: "flex", alignItems: "center", gap: "12px", marginBottom: "2px",
    }}>
      <div style={{
        width: "42px", height: "42px", borderRadius: "50%",
        background: "rgba(255,255,255,0.06)", flexShrink: 0,
        animation: "skeletonPulse 1.5s ease-in-out infinite",
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          height: "12px", borderRadius: "6px",
          background: "rgba(255,255,255,0.06)",
          marginBottom: "8px", width: "55%",
          animation: "skeletonPulse 1.5s ease-in-out infinite",
        }} />
        <div style={{
          height: "10px", borderRadius: "6px",
          background: "rgba(255,255,255,0.04)", width: "80%",
          animation: "skeletonPulse 1.5s ease-in-out 0.2s infinite",
        }} />
      </div>
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export function MessageSkeleton({ isMine = false }: { isMine?: boolean }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: isMine ? "flex-end" : "flex-start",
      marginBottom: "8px",
    }}>
      <div style={{
        width: "160px", height: "44px", borderRadius: "18px",
        background: isMine ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)",
        animation: "skeletonPulse 1.5s ease-in-out infinite",
      }} />
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
