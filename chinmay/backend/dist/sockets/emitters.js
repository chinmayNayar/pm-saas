"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitTaskCreated = emitTaskCreated;
exports.emitTaskUpdated = emitTaskUpdated;
exports.emitTaskDeleted = emitTaskDeleted;
exports.emitCommentCreated = emitCommentCreated;
exports.emitNotificationCreated = emitNotificationCreated;
const index_1 = require("./index");
const events_1 = require("./events");
function emitTaskCreated(task) {
    const io = (0, index_1.getIo)();
    const orgRoom = events_1.rooms.org(task.organizationId);
    const boardRoom = events_1.rooms.board(task.boardId);
    io.to(orgRoom).to(boardRoom).emit(events_1.SOCKET_EVENTS.TASK_CREATED, task);
}
function emitTaskUpdated(task) {
    const io = (0, index_1.getIo)();
    const orgRoom = events_1.rooms.org(task.organizationId);
    const boardRoom = events_1.rooms.board(task.boardId);
    io.to(orgRoom).to(boardRoom).emit(events_1.SOCKET_EVENTS.TASK_UPDATED, task);
}
function emitTaskDeleted(task) {
    const io = (0, index_1.getIo)();
    const orgRoom = events_1.rooms.org(task.organizationId);
    const boardRoom = events_1.rooms.board(task.boardId);
    io.to(orgRoom).to(boardRoom).emit(events_1.SOCKET_EVENTS.TASK_DELETED, { id: task.id });
}
function emitCommentCreated(comment) {
    const io = (0, index_1.getIo)();
    const orgRoom = events_1.rooms.org(comment.organizationId);
    const boardRoom = events_1.rooms.board(comment.boardId);
    io.to(orgRoom).to(boardRoom).emit(events_1.SOCKET_EVENTS.COMMENT_CREATED, comment);
}
function emitNotificationCreated(notification) {
    const io = (0, index_1.getIo)();
    if (notification.organizationId) {
        const orgRoom = events_1.rooms.org(notification.organizationId);
        io.to(orgRoom).emit(events_1.SOCKET_EVENTS.NOTIFICATION_CREATED, notification);
    }
    const userRoom = events_1.rooms.user(notification.userId);
    io.to(userRoom).emit(events_1.SOCKET_EVENTS.NOTIFICATION_CREATED, notification);
}
