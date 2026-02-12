"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rooms = exports.SOCKET_EVENTS = void 0;
exports.SOCKET_EVENTS = {
    CONNECTION: "connection",
    DISCONNECT: "disconnect",
    ORG_JOIN: "org:join",
    ORG_LEAVE: "org:leave",
    BOARD_JOIN: "board:join",
    BOARD_LEAVE: "board:leave",
    TASK_CREATED: "task:created",
    TASK_UPDATED: "task:updated",
    TASK_DELETED: "task:deleted",
    COMMENT_CREATED: "comment:created",
    NOTIFICATION_CREATED: "notification:created"
};
exports.rooms = {
    org: (orgId) => `org:${orgId}`,
    board: (boardId) => `board:${boardId}`,
    user: (userId) => `user:${userId}`
};
