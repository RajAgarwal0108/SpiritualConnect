export interface ChatUser {
  id: number;
  name: string;
  email: string;
  bio?: string;
  profile?: {
    avatar?: string;
  };
  isOnline?: boolean;
}

export interface DMMessage {
  id?: number;
  room?: string;
  senderId: number;
  senderName: string;
  content: string;
  createdAt?: string;
  status?: "sending" | "sent" | "failed";
}

export interface Conversation {
  room: string;
  peer: ChatUser;
  latestMessage: string;
  latestAt: string;
  isOwnLastMessage: boolean;
  unreadCount?: number;
  type?: "dm" | "guidance";
}

export interface SocketMessagePayload {
  id?: number;
  room?: string;
  senderId?: number;
  senderName?: string;
  sender?: string;
  content?: string;
  message?: string;
  createdAt?: string;
  timestamp?: string;
}

export function normalizeIncomingMessage(data: SocketMessagePayload): DMMessage {
  return {
    id: data.id,
    room: data.room,
    senderId: data.senderId || 0,
    senderName: data.senderName || data.sender || "",
    content: data.content || data.message || "",
    createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
    status: "sent",
  };
}

export function upsertMessage(prev: DMMessage[], incoming: DMMessage): DMMessage[] {
  if (incoming.id) {
    const pendingIdx = prev.findIndex(
      (m) => m.status === "sending" && m.senderId === incoming.senderId && m.content === incoming.content
    );
    if (pendingIdx >= 0) {
      const updated = [...prev];
      updated[pendingIdx] = { ...incoming, status: "sent" };
      return updated;
    }
  }
  if (incoming.id && prev.some((m) => m.id === incoming.id)) return prev;
  return [...prev, incoming];
}

export function getRoomId(a: number, b: number): string {
  return [a, b].sort().join("-");
}
