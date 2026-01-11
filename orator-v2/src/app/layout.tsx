import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { WebSocketProvider } from "@/context/WebSocketContext";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Orator - Master the Art of Conversation",
  description: "Practice conversations, get real-time coaching, and watch AI debates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className={`${plusJakarta.className} antialiased`}>
        <WebSocketProvider>
          {children}
        </WebSocketProvider>
      </body>
    </html>
  );
}