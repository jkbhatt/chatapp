"use client";

export default function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "4px" }}>
      <div style={{
        padding: "12px 16px",
        borderRadius: "18px 18px 18px 4px",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: "5px",
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: "#7c3aed",
            animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
