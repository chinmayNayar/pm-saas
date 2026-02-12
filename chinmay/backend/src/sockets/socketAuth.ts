import { Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../config/database";

export interface SocketUserContext {
  userId: string;
  email: string;
}

declare module "socket.io" {
  interface Socket {
    user?: SocketUserContext;
    orgIds?: string[];
  }
}

function getToken(socket: Socket): string | null {
  const auth = (socket.handshake.auth || {}) as any;

  if (auth.token && typeof auth.token === "string") {
    return auth.token.startsWith("Bearer ")
      ? auth.token.slice(7)
      : auth.token;
  }

  const q = socket.handshake.query?.token;
  if (typeof q === "string") return q;

  return null;
}

export async function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  try {
    const token = getToken(socket);
    if (!token) return next(new Error("Unauthorized: missing token"));

    const payload = verifyAccessToken(token);
    socket.user = { userId: payload.sub, email: payload.email };
    socket.orgIds = [];

    next();
  } catch {
    next(new Error("Unauthorized: invalid token"));
  }
}

export async function ensureMembership(socket: Socket, orgId: string): Promise<void> {
  if (!socket.user) throw new Error("Unauthorized");

  const membership = await prisma.membership.findFirst({
    where: {
      userId: socket.user.userId,
      orgId,
      deletedAt: null
    },
    select: { id: true }
  });

  if (!membership) {
    throw new Error("Forbidden: not a member of this organization");
  }
}

