"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Socket } from "socket.io-client";
import api from "@/services/api";
import { DMMessage, SocketMessagePayload, normalizeIncomingMessage, upsertMessage, getRoomId } from "@/types/chat";
import { useTypingIndicator } from "./useTypingIndicator";

export function useDMChat(
  peerUserId: number | null,
  currentUser: { id: number; name: string } | null,
  socket: Socket | null
) {
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const roomId = currentUser && peerUserId ? getRoomId(currentUser.id, peerUserId) : null;

  const { isPeerTyping, startTyping, stopTyping } = useTypingIndicator(
    roomId,
    socket,
    currentUser?.id ?? 0,
    peerUserId
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, version]);

  const fetchMessages = useCallback(async () => {
    if (!roomId || !socket) return;
    setIsLoading(true);
    socket.emit("join_room", roomId);

    try {
      const res = await api.get<DMMessage[]>(`/messages/room/${roomId}?limit=50`);
      const msgs = (res.data || []).map((m) => ({ ...m, status: "sent" as const }));
      setMessages(msgs);
      setCursor(msgs.length > 0 ? msgs[0].createdAt || null : null);
      setHasMore(msgs.length === 50);
    } catch {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, socket]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!roomId || !socket) return;

    const handler = (data: SocketMessagePayload) => {
      const incoming = normalizeIncomingMessage(data);
      setMessages((prev) => {
        const updated = upsertMessage(prev, incoming);
        setVersion((v) => v + 1);
        return updated;
      });
      queryClient.invalidateQueries({ queryKey: ["dmConversations"] });
    };

    socket.on("receive_message", handler);
    return () => {
      socket.off("receive_message", handler);
    };
  }, [roomId, socket, queryClient]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !roomId || !socket || !currentUser) return;

      const optimistic: DMMessage = {
        room: roomId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        status: "sending",
      };

      setMessages((prev) => [...prev, optimistic]);

      socket.emit("send_message", {
        room: roomId,
        message: content.trim(),
        sender: currentUser.name,
        senderId: currentUser.id,
        timestamp: new Date().toISOString(),
      });

      stopTyping();
      queryClient.invalidateQueries({ queryKey: ["dmConversations"] });
    },
    [roomId, socket, currentUser, queryClient, stopTyping]
  );

  const loadMore = useCallback(async () => {
    if (!cursor || !hasMore || !roomId) return;
    try {
      const res = await api.get<DMMessage[]>(
        `/messages/room/${roomId}?cursor=${encodeURIComponent(cursor)}&limit=50`
      );
      const older = (res.data || []).reverse();
      setMessages((prev) => [...older, ...prev]);
      setCursor(older.length > 0 ? older[0].createdAt || null : null);
      setHasMore(older.length === 50);
    } catch {
      // silently fail
    }
  }, [cursor, hasMore, roomId]);

  return {
    messages,
    sendMessage,
    isLoading,
    hasMore,
    loadMore,
    messagesEndRef,
    isPeerTyping,
    startTyping,
    stopTyping,
    roomId,
  };
}
