"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/globalStore";
import { useQueryClient } from "@tanstack/react-query";

function resolveSocketHost(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
  if (typeof window !== "undefined" && window.location.hostname === "localhost") return "http://localhost:3001";
  return "https://spiritualconnect.onrender.com";
}

const HOST = resolveSocketHost();

export function useChatSocket() {
  const { user, token } = useAuthStore();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!user || !token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      return;
    }

    const s = io(HOST, {
      transports: ["websocket"],
      auth: { token },
    });

    socketRef.current = s;
    setVersion((v) => v + 1);

    const onConnect = () => {
      setIsConnected(true);
      s.emit("user_online", user.id);
    };

    const onDisconnect = () => setIsConnected(false);

    const onOnline = (payload: { id: number; name: string; profile?: { avatar?: string; bio?: string } }[]) => {
      queryClient.setQueryData(
        ["onlineUsers"],
        payload.map((u) => ({ ...u, isOnline: true }))
      );
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("online_users", onOnline);

    if (s.connected) {
      setIsConnected(true);
      s.emit("user_online", user.id);
    }

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("online_users", onOnline);
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, token, queryClient]);

  return { socket: socketRef.current, isConnected, version };
}
