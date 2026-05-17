import type { NotificationTargetType, NotificationType } from "@prisma/client";
import type { Server } from "socket.io";
import { prisma } from "../lib/prisma";

let ioRef: Server | null = null;

export const setNotificationEmitter = (io: Server) => {
  ioRef = io;
};

type CreateNotificationInput = {
  userId: number;
  actorId?: number | null;
  type: NotificationType;
  targetType: NotificationTargetType;
  targetId?: string | null;
};

const emitNotification = (userId: number, payload: any) => {
  if (!ioRef) return;
  ioRef.to(`user_${userId}`).emit("notification", payload);
};

export const createNotification = async (input: CreateNotificationInput) => {
  if (input.actorId && input.actorId === input.userId) return null;

  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      actorId: input.actorId ?? null,
      type: input.type,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          profile: { select: { avatar: true } },
        },
      },
    },
  });

  emitNotification(input.userId, notification);
  return notification;
};

export const createNotificationsBulk = async (inputs: CreateNotificationInput[]) => {
  const filtered = inputs.filter((input) => !input.actorId || input.actorId !== input.userId);
  if (filtered.length === 0) return [];

  const notifications = await Promise.all(
    filtered.map((input) =>
      prisma.notification.create({
        data: {
          userId: input.userId,
          actorId: input.actorId ?? null,
          type: input.type,
          targetType: input.targetType,
          targetId: input.targetId ?? null,
        },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              profile: { select: { avatar: true } },
            },
          },
        },
      })
    )
  );

  notifications.forEach((notification) => emitNotification(notification.userId, notification));
  return notifications;
};
