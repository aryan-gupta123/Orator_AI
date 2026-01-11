import type { Metadata } from "next";
import "./globals.css";
import { WebSocketProvider } from "@/context/WebSocketContext";

export const metadata: Metadata = {
  title: "Orator - Master the Art of Conversation",
  description: "Practice conversations, get real-time coaching, and watch AI debates. Your personal flight simulator for communication.",
  keywords: ["conversation practice", "AI coaching", "debate", "communication skills", "interview prep"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </body>
    </html>
  );
}
