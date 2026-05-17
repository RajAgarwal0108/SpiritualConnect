import api from "@/services/api";
import type { NotificationItem } from "@/types/notification";

export const notificationService = {
  async list(limit = 20, cursor?: string | null): Promise<NotificationItem[]> {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (cursor) params.set("cursor", cursor);
    const res = await api.get(`/notifications?${params.toString()}`);
    return res.data || [];
  },
  async unreadCount(): Promise<number> {
    const res = await api.get("/notifications/unread-count");
    return res.data?.count ?? 0;
  },
  async markAllRead(): Promise<void> {
    await api.patch("/notifications/mark-read");
  },
  async markRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },
};
