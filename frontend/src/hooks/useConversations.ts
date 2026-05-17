"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Conversation, ChatUser } from "@/types/chat";

const STORAGE_KEY = "lastReadTimestamps";

function getLastReadTimestamps(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveLastReadTimestamps(ts: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ts));
}

export function markConversationRead(room: string) {
  const ts = getLastReadTimestamps();
  ts[room] = new Date().toISOString();
  saveLastReadTimestamps(ts);
}

export function useConversationsList(userId: number | undefined) {
  const queryClient = useQueryClient();

  return useQuery<Conversation[]>({
    queryKey: ["dmConversations", userId],
    queryFn: async () => {
      if (!userId) return [];
      const lastReadTimestamps = getLastReadTimestamps();
      const params = new URLSearchParams();
      if (Object.keys(lastReadTimestamps).length > 0) {
        params.set("lastReadTimestamps", JSON.stringify(lastReadTimestamps));
      }
      const qs = params.toString();
      const res = await api.get(`/messages/conversations/${userId}${qs ? `?${qs}` : ""}`);
      return res.data || [];
    },
    enabled: !!userId,
  });
}

export function useOnlineUsers(enabled = true) {
  const { data: onlineUsers = [] } = useQuery<ChatUser[]>({
    queryKey: ["onlineUsers"],
    queryFn: async () => {
      const res = await api.get("/users/online");
      return (res.data || []).map((u: ChatUser) => ({ ...u, isOnline: true }));
    },
    enabled,
    refetchInterval: 30000,
  });

  const onlineUserSet = new Set<number>(onlineUsers.map((u) => u.id));

  return { onlineUsers, onlineUserSet };
}
