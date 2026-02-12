"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = socketAuthMiddleware;
exports.ensureMembership = ensureMembership;
const jwt_1 = require("../utils/jwt");
const database_1 = require("../config/database");
function getToken(socket) {
    const auth = (socket.handshake.auth || {});
    if (auth.token && typeof auth.token === "string") {
        return auth.token.startsWith("Bearer ")
            ? auth.token.slice(7)
            : auth.token;
    }
    const q = socket.handshake.query?.token;
    if (typeof q === "string")
        return q;
    return null;
}
async function socketAuthMiddleware(socket, next) {
    try {
        const token = getToken(socket);
        if (!token)
            return next(new Error("Unauthorized: missing token"));
        const payload = (0, jwt_1.verifyAccessToken)(token);
        socket.user = { userId: payload.sub, email: payload.email };
        socket.orgIds = [];
        next();
    }
    catch {
        next(new Error("Unauthorized: invalid token"));
    }
}
async function ensureMembership(socket, orgId) {
    if (!socket.user)
        throw new Error("Unauthorized");
    const membership = await database_1.prisma.membership.findFirst({
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
