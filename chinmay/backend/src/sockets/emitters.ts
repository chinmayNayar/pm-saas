import { getIo } from "./index";
import { rooms, SOCKET_EVENTS } from "./events";

type TaskPayload = {
  id: string;
  boardId: string;
  columnId: string;
  organizationId: string;
};

type CommentPayload = {
  id: string;
  taskId: string;
  boardId: string;
  organizationId: string;
};

type NotificationPayload = {
  id: string;
  userId: string;
  organizationId?: string;
  type: string;
  message: string;
};

export function emitTaskCreated(task: TaskPayload) {
  const io = getIo();
  const orgRoom = rooms.org(task.organizationId);
  const boardRoom = rooms.board(task.boardId);
  io.to(orgRoom).to(boardRoom).emit(SOCKET_EVENTS.TASK_CREATED, task);
}

export function emitTaskUpdated(task: TaskPayload) {
  const io = getIo();
  const orgRoom = rooms.org(task.organizationId);
  const boardRoom = rooms.board(task.boardId);
  io.to(orgRoom).to(boardRoom).emit(SOCKET_EVENTS.TASK_UPDATED, task);
}

export function emitTaskDeleted(task: TaskPayload) {
  const io = getIo();
  const orgRoom = rooms.org(task.organizationId);
  const boardRoom = rooms.board(task.boardId);
  io.to(orgRoom).to(boardRoom).emit(SOCKET_EVENTS.TASK_DELETED, { id: task.id });
}

export function emitCommentCreated(comment: CommentPayload) {
  const io = getIo();
  const orgRoom = rooms.org(comment.organizationId);
  const boardRoom = rooms.board(comment.boardId);
  io.to(orgRoom).to(boardRoom).emit(SOCKET_EVENTS.COMMENT_CREATED, comment);
}

export function emitNotificationCreated(notification: NotificationPayload) {
  const io = getIo();
  if (notification.organizationId) {
    const orgRoom = rooms.org(notification.organizationId);
    io.to(orgRoom).emit(SOCKET_EVENTS.NOTIFICATION_CREATED, notification);
  }
  const userRoom = rooms.user(notification.userId);
  io.to(userRoom).emit(SOCKET_EVENTS.NOTIFICATION_CREATED, notification);
}

