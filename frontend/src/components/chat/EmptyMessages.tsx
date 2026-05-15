"use client";

import { Sparkles, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyMessagesProps {
  type: "no-conversations" | "no-messages" | "select-chat";
  peerName?: string;
  layout?: "sidebar" | "page";
}

export default function EmptyMessages({ type, peerName, layout = "sidebar" }: EmptyMessagesProps) {
  if (type === "no-conversations") {
    return (
      <div className="py-20 text-center space-y-4 col-span-full">
        <Sparkles size={32} className="mx-auto text-sacred-gold/20" />
        <p className="text-sm italic text-sacred-muted">No active conversations yet.</p>
      </div>
    );
  }

  if (type === "no-messages") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
        <div className="w-20 h-20 rounded-full bg-sacred-gold/10 flex items-center justify-center">
          <Sparkles size={32} className="text-sacred-gold/40" />
        </div>
        <p className="text-sm italic text-sacred-muted">Begin your sacred conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-sacred-beige/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="text-center"
      >
        <div className={`bg-white rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-xl border border-sacred-gold/5 ${
          layout === "page" ? "w-16 h-16 md:w-24 md:h-24" : "w-16 h-16"
        }`}>
          <MessageCircle size={layout === "page" ? 32 : 24} className="text-sacred-gold/40" />
        </div>
        {layout === "page" ? (
          <>
            <h3 className="text-2xl md:text-3xl font-light text-sacred-text mb-4">Ancient Echoes</h3>
            <p className="text-sacred-muted font-serif italic text-sm md:text-base max-w-xs mx-auto">
              Select a seeker from the left to begin an enlightened dialogue.
            </p>
          </>
        ) : (
          <p className="text-sacred-muted font-serif italic text-sm max-w-xs mx-auto">
            {peerName ? `Send a message to ${peerName}` : "Select a conversation to begin"}
          </p>
        )}
      </motion.div>
    </div>
  );
}
