export type NotificationType =
  | "FOLLOW"
  | "BLOG_PUBLISHED"
  | "POST_LIKED"
  | "POST_COMMENTED"
  | "BLOG_LIKED"
  | "BLOG_COMMENTED"
  | "MESSAGE_RECEIVED"
  | "GUIDANCE_REQUESTED"
  | "GUIDANCE_ACCEPTED"
  | "GUIDANCE_REJECTED"
  | "GUIDANCE_UPDATED";

export type NotificationTargetType =
  | "USER"
  | "POST"
  | "BLOG"
  | "MESSAGE"
  | "GUIDANCE_SESSION";

export interface NotificationActor {
  id: number;
  name: string;
  profile?: {
    avatar?: string | null;
  } | null;
}

export interface NotificationItem {
  id: number;
  userId: number;
  actorId?: number | null;
  type: NotificationType;
  targetType: NotificationTargetType;
  targetId?: string | null;
  readAt?: string | null;
  createdAt: string;
  actor?: NotificationActor | null;
}
