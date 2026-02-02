const socketToUser = new Map<string, number>();
const userToSockets = new Map<number, Set<string>>();

export const registerUserSocket = (userId: number, socketId: string) => {
  if (!userToSockets.has(userId)) {
    userToSockets.set(userId, new Set());
  }
  userToSockets.get(userId)?.add(socketId);
  socketToUser.set(socketId, userId);
};

export const unregisterUserSocket = (socketId: string) => {
  const userId = socketToUser.get(socketId);
  if (userId === undefined) {
    return undefined;
  }
  socketToUser.delete(socketId);
  const sockets = userToSockets.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) {
      userToSockets.delete(userId);
    }
  }
  return userId;
};

export const getOnlineUserIds = () => Array.from(userToSockets.keys());
