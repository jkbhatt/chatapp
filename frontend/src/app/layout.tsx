import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatApp — Real-time Chat",
  description: "A modern real-time chat application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1a1a1f",
              color: "#f1f1f3",
              border: "1px solid #2d2d3a",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#1a1a1f",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#1a1a1f",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
