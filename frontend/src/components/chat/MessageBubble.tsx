"use client";

import { motion } from "framer-motion";
import { DMMessage } from "@/types/chat";
import { Loader2, AlertCircle } from "lucide-react";

interface MessageBubbleProps {
  message: DMMessage;
  isOwn: boolean;
  layout?: "sidebar" | "page";
}

function formatTime(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = Date.now();
  const diff = now - d.getTime();

  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message, isOwn, layout = "sidebar" }: MessageBubbleProps) {
  const isSending = message.status === "sending";
  const isFailed = message.status === "failed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative ${
          isOwn
            ? "bg-sacred-gold text-white rounded-tr-none"
            : "bg-white text-sacred-text rounded-tl-none border border-sacred-gold/5"
        } ${
          isFailed ? "opacity-60" : ""
        } ${
          layout === "page"
            ? "max-w-[90%] md:max-w-[70%] px-3.5 md:px-6 py-2.5 md:py-4 rounded-2xl md:rounded-4xl text-sm leading-relaxed shadow-sm"
            : "max-w-[85%] px-6 py-4 rounded-[28px] text-sm leading-relaxed shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)]"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <div className={`flex items-center gap-1.5 mt-1.5 ${
          isOwn ? "justify-end text-white/70" : "text-sacred-muted/60"
        }`}>
          <span className="text-[9px] font-bold uppercase tracking-tighter">
            {message.createdAt ? formatTime(message.createdAt) : ""}
          </span>
          {isSending && <Loader2 size={10} className="animate-spin" />}
          {isFailed && <AlertCircle size={10} />}
        </div>
      </div>
    </motion.div>
  );
}
