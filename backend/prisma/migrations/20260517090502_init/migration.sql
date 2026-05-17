-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('FOLLOW', 'BLOG_PUBLISHED', 'POST_LIKED', 'POST_COMMENTED', 'BLOG_LIKED', 'BLOG_COMMENTED', 'MESSAGE_RECEIVED', 'GUIDANCE_REQUESTED', 'GUIDANCE_ACCEPTED', 'GUIDANCE_REJECTED', 'GUIDANCE_UPDATED');

-- CreateEnum
CREATE TYPE "NotificationTargetType" AS ENUM ('USER', 'POST', 'BLOG', 'MESSAGE', 'GUIDANCE_SESSION');

-- CreateEnum
CREATE TYPE "JourneyItemType" AS ENUM ('IMAGE', 'JOURNAL', 'ITINERARY', 'CHECKLIST');

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "actorId" INTEGER,
    "type" "NotificationType" NOT NULL,
    "targetType" "NotificationTargetType" NOT NULL,
    "targetId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journey" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyItem" (
    "id" SERIAL NOT NULL,
    "journeyId" INTEGER NOT NULL,
    "type" "JourneyItemType" NOT NULL,
    "content" TEXT,
    "mediaUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Journey_userId_isPrivate_idx" ON "Journey"("userId", "isPrivate");

-- CreateIndex
CREATE INDEX "Journey_createdAt_idx" ON "Journey"("createdAt");

-- CreateIndex
CREATE INDEX "JourneyItem_journeyId_idx" ON "JourneyItem"("journeyId");

-- CreateIndex
CREATE INDEX "JourneyItem_type_idx" ON "JourneyItem"("type");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyItem" ADD CONSTRAINT "JourneyItem_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
