export const SOCKET_EVENTS = {
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
} as const;

export const rooms = {
  org: (orgId: string) => `org:${orgId}`,
  board: (boardId: string) => `board:${boardId}`,
  user: (userId: string) => `user:${userId}`
};

