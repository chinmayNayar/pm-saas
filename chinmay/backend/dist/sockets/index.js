"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIo = getIo;
exports.initSocket = initSocket;
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const events_1 = require("./events");
const socketAuth_1 = require("./socketAuth");
let ioInstance = null;
function getIo() {
    if (!ioInstance) {
        throw new Error("Socket.io not initialized");
    }
    return ioInstance;
}
async function initSocket(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    const pubClient = (0, redis_1.createClient)({ url: env_1.env.redisUrl });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
    io.use(socketAuth_1.socketAuthMiddleware);
    io.on(events_1.SOCKET_EVENTS.CONNECTION, (socket) => {
        logger_1.logger.info(`Socket connected: ${socket.id} user=${socket.user?.userId}`);
        if (socket.user) {
            socket.join(events_1.rooms.user(socket.user.userId));
        }
        registerCoreHandlers(io, socket);
        socket.on(events_1.SOCKET_EVENTS.DISCONNECT, () => {
            logger_1.logger.info(`Socket disconnected: ${socket.id}`);
        });
    });
    ioInstance = io;
    logger_1.logger.info("Socket.io initialized with Redis adapter");
    return io;
}
function registerCoreHandlers(io, socket) {
    socket.on(events_1.SOCKET_EVENTS.ORG_JOIN, async (orgId, cb) => {
        try {
            await (0, socketAuth_1.ensureMembership)(socket, orgId);
            const room = events_1.rooms.org(orgId);
            await socket.join(room);
            socket.orgIds = Array.from(new Set([...(socket.orgIds || []), orgId]));
            cb?.(true);
        }
        catch (err) {
            cb?.(false, err.message || "Failed to join organization");
        }
    });
    socket.on(events_1.SOCKET_EVENTS.ORG_LEAVE, async (orgId, cb) => {
        try {
            const room = events_1.rooms.org(orgId);
            await socket.leave(room);
            socket.orgIds = (socket.orgIds || []).filter((id) => id !== orgId);
            cb?.(true);
        }
        catch (err) {
            cb?.(false, err.message || "Failed to leave organization");
        }
    });
    socket.on(events_1.SOCKET_EVENTS.BOARD_JOIN, async (boardId, cb) => {
        try {
            const room = events_1.rooms.board(boardId);
            await socket.join(room);
            cb?.(true);
        }
        catch (err) {
            cb?.(false, err.message || "Failed to join board");
        }
    });
    socket.on(events_1.SOCKET_EVENTS.BOARD_LEAVE, async (boardId, cb) => {
        try {
            const room = events_1.rooms.board(boardId);
            await socket.leave(room);
            cb?.(true);
        }
        catch (err) {
            cb?.(false, err.message || "Failed to leave board");
        }
    });
}
