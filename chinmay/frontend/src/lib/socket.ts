import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function createSocket(token: string) {
  socket = io(
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1").replace(
      "/api/v1",
      ""
    ),
    {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket"]
    }
  );
  return socket;
}

export function getSocket() {
  return socket;
}

