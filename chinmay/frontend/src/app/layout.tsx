import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "../providers/auth-provider";
import { SocketProvider } from "../providers/socket-provider";

export const metadata = {
  title: "PM SaaS",
  description: "Project management SaaS"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

