import type { Metadata } from "next";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemedToaster from "@/components/ui/ThemedToaster";
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
