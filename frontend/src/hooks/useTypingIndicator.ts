"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Socket } from "socket.io-client";

export function useTypingIndicator(
  roomId: string | null,
  socket: Socket | null,
  currentUserId: number,
  peerUserId: number | null
) {
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!socket || !peerUserId) return;

    const onTyping = ({ userId }: { userId: number }) => {
      if (userId === peerUserId) setIsPeerTyping(true);
    };
    const onStopTyping = ({ userId }: { userId: number }) => {
      if (userId === peerUserId) setIsPeerTyping(false);
    };

    socket.on("user_typing", onTyping);
    socket.on("user_stop_typing", onStopTyping);

    return () => {
      socket.off("user_typing", onTyping);
      socket.off("user_stop_typing", onStopTyping);
      setIsPeerTyping(false);
    };
  }, [socket, peerUserId]);

  const startTyping = useCallback(() => {
    if (!roomId || !socket) return;
    socket.emit("typing", { room: roomId, userId: currentUserId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { room: roomId, userId: currentUserId });
    }, 2000);
  }, [roomId, socket, currentUserId]);

  const stopTyping = useCallback(() => {
    if (!roomId || !socket) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("stop_typing", { room: roomId, userId: currentUserId });
  }, [roomId, socket, currentUserId]);

  return { isPeerTyping, startTyping, stopTyping };
}
