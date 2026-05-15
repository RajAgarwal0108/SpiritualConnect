"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Conversation, ChatUser } from "@/types/chat";

export function useConversationsList(userId: number | undefined) {
  return useQuery<Conversation[]>({
    queryKey: ["dmConversations", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await api.get(`/messages/conversations/${userId}`);
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
