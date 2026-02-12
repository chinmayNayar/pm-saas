import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { SOCKET_EVENTS, rooms } from "./events";
import { socketAuthMiddleware, ensureMembership } from "./socketAuth";

let ioInstance: Server | null = null;

export function getIo(): Server {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized");
  }
  return ioInstance;
}

export async function initSocket(server: HttpServer): Promise<Server> {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const pubClient = createClient({ url: env.redisUrl });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));

  io.use(socketAuthMiddleware);

  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id} user=${socket.user?.userId}`);

    if (socket.user) {
      socket.join(rooms.user(socket.user.userId));
    }

    registerCoreHandlers(io, socket);

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  logger.info("Socket.io initialized with Redis adapter");

  return io;
}

function registerCoreHandlers(io: Server, socket: Socket) {
  socket.on(SOCKET_EVENTS.ORG_JOIN, async (orgId: string, cb?: (ok: boolean, err?: string) => void) => {
    try {
      await ensureMembership(socket, orgId);
      const room = rooms.org(orgId);
      await socket.join(room);
      socket.orgIds = Array.from(new Set([...(socket.orgIds || []), orgId]));
      cb?.(true);
    } catch (err: any) {
      cb?.(false, err.message || "Failed to join organization");
    }
  });

  socket.on(SOCKET_EVENTS.ORG_LEAVE, async (orgId: string, cb?: (ok: boolean, err?: string) => void) => {
    try {
      const room = rooms.org(orgId);
      await socket.leave(room);
      socket.orgIds = (socket.orgIds || []).filter((id) => id !== orgId);
      cb?.(true);
    } catch (err: any) {
      cb?.(false, err.message || "Failed to leave organization");
    }
  });

  socket.on(SOCKET_EVENTS.BOARD_JOIN, async (boardId: string, cb?: (ok: boolean, err?: string) => void) => {
    try {
      const room = rooms.board(boardId);
      await socket.join(room);
      cb?.(true);
    } catch (err: any) {
      cb?.(false, err.message || "Failed to join board");
    }
  });

  socket.on(SOCKET_EVENTS.BOARD_LEAVE, async (boardId: string, cb?: (ok: boolean, err?: string) => void) => {
    try {
      const room = rooms.board(boardId);
      await socket.leave(room);
      cb?.(true);
    } catch (err: any) {
      cb?.(false, err.message || "Failed to leave board");
    }
  });
}

