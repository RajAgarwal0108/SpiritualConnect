"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getMediaUrl } from "@/lib/media";
import type { Conversation } from "@/types/chat";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  isOnline: boolean;
  onSelect: () => void;
  layout?: "sidebar" | "page";
}

export default function ConversationItem({
  conversation,
  isSelected,
  isOnline,
  onSelect,
  layout = "sidebar",
}: ConversationItemProps) {
  const peer = conversation.peer;

  if (layout === "page") {
    return (
      <motion.button
        onClick={onSelect}
        className={`w-full p-3.5 md:p-4 rounded-2xl md:rounded-3xl text-left transition-all duration-500 group relative ${
          isSelected
            ? "bg-white shadow-[0_4px_20px_rgba(217,160,91,0.08)] ring-1 ring-sacred-gold/20"
            : "hover:bg-white/40"
        }`}
      >
        <div className="flex items-center">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-sacred-gold/10 overflow-hidden shrink-0 mr-3 md:mr-4 bg-sacred-beige group-hover:scale-105 transition-transform duration-500">
                      {peer.profile?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getMediaUrl(peer.profile.avatar) as string}
                          alt={peer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
              <div className="w-full h-full flex items-center justify-center text-sacred-gold font-medium text-sm">
                {peer.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`font-medium text-sm transition-colors truncate ${isSelected ? "text-sacred-gold" : "text-sacred-text"}`}>
                {peer.name}
              </p>
              <span className="text-[10px] text-sacred-muted/50 shrink-0">
                {conversation.latestAt
                  ? new Date(conversation.latestAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-sacred-muted/20"}`} />
              <p className="text-xs text-sacred-muted/70 truncate font-serif italic">
                {conversation.isOwnLastMessage ? "You: " : ""}
                {conversation.latestMessage}
              </p>
            </div>
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      layoutId={`user-${peer.id}`}
      onClick={onSelect}
      className={`flex items-center gap-5 rounded-3xl hover:bg-white/60 cursor-pointer transition-all group active:scale-[0.98] ${
        layout === "sidebar" ? "p-5" : "p-6 bg-white/40 border border-white/60 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="relative">
        {peer.profile?.avatar ? (
          <Image
            src={getMediaUrl(peer.profile.avatar) as string}
            alt={peer.name}
            width={layout === "sidebar" ? 56 : 64}
            height={layout === "sidebar" ? 56 : 64}
            className="rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className={`rounded-full bg-sacred-gold/5 flex items-center justify-center text-sacred-gold font-bold border border-sacred-gold/10 group-hover:scale-105 transition-transform ${
            layout === "sidebar" ? "w-14 h-14 text-lg" : "w-16 h-16 text-xl"
          }`}>
            {peer.name[0]}
          </div>
        )}
        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-sacred-beige rounded-full shadow-sm ${
          isOnline ? "bg-green-500" : "bg-sacred-muted/30"
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1 gap-2">
          <h4 className="font-bold text-sacred-text truncate">{peer.name}</h4>
          <span className="text-[10px] text-sacred-muted/50 shrink-0">
            {conversation.latestAt
              ? new Date(conversation.latestAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-sacred-muted/30"}`} />
          <p className="text-xs text-sacred-muted/70 truncate italic font-medium">
            {conversation.isOwnLastMessage ? "You: " : ""}
            {conversation.latestMessage}
          </p>
        </div>
        <div className="flex justify-end mt-0.5">
          <span className={`text-[10px] uppercase tracking-tighter ${
            isOnline ? "text-green-500" : "text-sacred-muted/40"
          }`}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
