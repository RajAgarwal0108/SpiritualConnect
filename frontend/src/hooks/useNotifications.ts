"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Socket } from "socket.io-client";
import { notificationService } from "@/services/notification.service";
import type { NotificationItem } from "@/types/notification";

export const useNotifications = (socket: Socket | null, enabled: boolean) => {
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    refetch: refetchNotifications,
  } = useQuery<NotificationItem[]>({
    queryKey: ["notifications"],
    queryFn: () => notificationService.list(20),
    enabled,
  });

  const {
    data: unreadCount = 0,
    refetch: refetchUnreadCount,
  } = useQuery<number>({
    queryKey: ["notificationUnreadCount"],
    queryFn: () => notificationService.unreadCount(),
    enabled,
  });

  useEffect(() => {
    if (!socket || !enabled) return;

    const handler = (notification: NotificationItem) => {
      queryClient.setQueryData<NotificationItem[]>(["notifications"], (old = []) => {
        const next = [notification, ...old];
        return next.slice(0, 20);
      });
      queryClient.setQueryData<number>(["notificationUnreadCount"], (old = 0) => old + 1);
    };

    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, [socket, enabled, queryClient]);

  const markAllRead = async () => {
    await notificationService.markAllRead();
    queryClient.setQueryData<number>(["notificationUnreadCount"], 0);
    queryClient.setQueryData<NotificationItem[]>(["notifications"], (old = []) =>
      old.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
    );
  };

  const markRead = async (id: number) => {
    await notificationService.markRead(id);
    queryClient.setQueryData<NotificationItem[]>(["notifications"], (old = []) =>
      old.map((n) => (n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n))
    );
    queryClient.setQueryData<number>(["notificationUnreadCount"], (old = 0) => Math.max(0, old - 1));
  };

  return {
    notifications,
    isLoading,
    unreadCount,
    markAllRead,
    markRead,
    refetchNotifications,
    refetchUnreadCount,
  };
};
