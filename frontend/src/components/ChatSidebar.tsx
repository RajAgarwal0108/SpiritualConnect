"use client";

import { useState, useEffect, startTransition } from "react";
import { Search, ChevronLeft, X, Maximize2, Minimize2 } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/globalStore";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useConversationsList, useOnlineUsers, markConversationRead } from "@/hooks/useConversations";
import { useDMChat } from "@/hooks/useDMChat";
import { useQueryClient } from "@tanstack/react-query";
import ConversationItem from "@/components/chat/ConversationItem";
import MessageBubble from "@/components/chat/MessageBubble";
import MessageInput from "@/components/chat/MessageInput";
import EmptyMessages from "@/components/chat/EmptyMessages";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatSidebar() {
  const { user } = useAuthStore();
  const { setRightSidebar, chatTarget, clearChatTarget, isChatExpanded, toggleChatExpanded } = useUIStore();
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<{ id: number; name: string; avatar?: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { socket } = useChatSocket();
  const { data: conversations = [] } = useConversationsList(user?.id);
  const { onlineUserSet } = useOnlineUsers(!!user);

  const { messages, sendMessage, messagesEndRef, isPeerTyping, startTyping, stopTyping } = useDMChat(
    activeChatId,
    user,
    socket
  );

  useEffect(() => {
    if (!chatTarget) return;
    startTransition(() => {
      setActiveChatId(chatTarget.id);
      setActiveChatUser({ id: chatTarget.id, name: chatTarget.name, avatar: chatTarget.avatar });
    });
    clearChatTarget();
  }, [chatTarget, clearChatTarget]);

  useEffect(() => {
    if (!socket || !user) return;
    const handler = (notification: any) => {
      if (notification.type === "MESSAGE_RECEIVED") {
        queryClient.invalidateQueries({ queryKey: ["dmConversations", user.id] });
      }
    };
    socket.on("notification", handler);
    return () => { socket.off("notification", handler); };
  }, [socket, user, queryClient]);

  const filteredConversations = (conversations || [])
    .filter((c) => c.peer.id !== user?.id)
    .filter((c) => c.peer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime());

  return (
    <div className={`flex flex-col h-full backdrop-blur-3xl overflow-hidden transition-all duration-500 ${
      isChatExpanded
        ? "bg-linear-to-br from-sacred-beige/95 via-white/90 to-sacred-beige/95"
        : "bg-sacred-beige/50"
    }`}>
      {/* Header */}
      <div className={`shrink-0 transition-all duration-300 ${
        isChatExpanded ? "px-12 pt-8 pb-6 max-w-4xl mx-auto w-full" : "px-8 pt-10 pb-6"
      }`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <h2 className={`font-serif font-bold text-sacred-text tracking-tight transition-all duration-300 ${
                isChatExpanded ? "text-4xl" : "text-3xl"
              }`}>
                {activeChatId ? activeChatUser?.name : "Conversations"}
              </h2>
              <p className="text-[11px] uppercase tracking-[0.2em] text-sacred-muted/60 font-medium">
                {activeChatId ? "Direct Presence" : "Private & Intentional"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeChatId && (
              <button
                onClick={() => { setActiveChatId(null); setActiveChatUser(null); }}
                className="p-2.5 hover:bg-white/40 rounded-full transition-all text-sacred-gold active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <button
              onClick={toggleChatExpanded}
              className={`p-2.5 rounded-full transition-all active:scale-95 ${
                isChatExpanded
                  ? "bg-sacred-gold/10 text-sacred-gold hover:bg-sacred-gold/20"
                  : "hover:bg-white/40 text-sacred-muted/60 hover:text-sacred-gold"
              }`}
              title={isChatExpanded ? "Collapse" : "Expand"}
            >
              {isChatExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              onClick={() => setRightSidebar(false)}
              className="p-2.5 hover:bg-white/40 rounded-full transition-all text-sacred-muted/40 active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {!activeChatId && (
          <div className={`mt-8 group relative transition-all duration-300 ${isChatExpanded ? "max-w-xl" : ""}`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sacred-muted/30 group-focus-within:text-sacred-gold transition-colors" size={18} />
            <input
              type="text"
              placeholder="Seek within your circles..."
              className="w-full bg-white/40 border-none rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:bg-white/60 outline-none transition-all placeholder:text-sacred-muted/30 italic"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {!activeChatId ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`pb-12 overflow-y-auto h-full no-scrollbar transition-all duration-300 ${
                isChatExpanded
                  ? "px-12 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4 content-start"
                  : "px-6 space-y-2"
              }`}
            >
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.peer.id}
                  conversation={conversation}
                  isSelected={false}
                  isOnline={onlineUserSet.has(conversation.peer.id)}
                  onSelect={() => {
                    setActiveChatId(conversation.peer.id);
                    setActiveChatUser(conversation.peer);
                    markConversationRead(conversation.room);
                  }}
                  layout="sidebar"
                />
              ))}
              {filteredConversations.length === 0 && <EmptyMessages type="no-conversations" />}
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col h-full transition-all duration-300 ${
                isChatExpanded ? "max-w-4xl mx-auto w-full" : ""
              }`}
            >
              <div className={`flex-1 overflow-y-auto py-8 space-y-8 flex flex-col no-scrollbar transition-all duration-300 ${
                isChatExpanded ? "px-12" : "px-8"
              }`}>
                {messages.length === 0 ? (
                  <EmptyMessages type="no-messages" layout="sidebar" />
                ) : (
                  messages.map((msg, i) => (
                    <MessageBubble
                      key={msg.id || `temp-${i}`}
                      message={msg}
                      isOwn={msg.senderId === user?.id}
                      layout="sidebar"
                    />
                  ))
                )}
                {isPeerTyping && (
                  <div className="flex items-center gap-2 text-sacred-muted/50 text-xs italic px-6">
                    <span className="w-2 h-2 rounded-full bg-sacred-gold/50 animate-pulse" />
                    {activeChatUser?.name} is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <MessageInput
                onSend={sendMessage}
                onStartTyping={startTyping}
                onStopTyping={stopTyping}
                placeholder="Write with intention..."
                layout="sidebar"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
