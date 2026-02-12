"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { createSocket } from "../lib/socket";

export function SocketProvider({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;
    const socket = createSocket(accessToken);

    // Example listeners; wire to stores as needed
    socket.on("connect", () => {
      // console.log("socket connected");
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken]);

  return <>{children}</>;
}

