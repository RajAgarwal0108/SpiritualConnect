"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2, User, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/globalStore";
import api from "@/services/api";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useConversationsList, useOnlineUsers } from "@/hooks/useConversations";
import { useDMChat } from "@/hooks/useDMChat";
import ConversationItem from "@/components/chat/ConversationItem";
import MessageBubble from "@/components/chat/MessageBubble";
import MessageInput from "@/components/chat/MessageInput";
import EmptyMessages from "@/components/chat/EmptyMessages";
import { getMediaUrl } from "@/lib/media";
import { motion, AnimatePresence } from "framer-motion";
import { STAGGER_CONTAINER, SACRED_EASE } from "@/lib/motion-config";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function ChatContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = searchParams.get("userId");
    if (q) {
      const id = parseInt(q);
      if (!Number.isNaN(id)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedUserId(id);
      }
    }
  }, [searchParams]);

  const { socket } = useChatSocket();
  const { data: allConversations = [] } = useConversationsList(user?.id);
  const { onlineUserSet } = useOnlineUsers(!!user);

  const {
    messages,
    sendMessage,
    messagesEndRef,
    isPeerTyping,
    startTyping,
    stopTyping,
    isBlocked,
  } = useDMChat(selectedUserId, user, socket);

  const { data: selectedProfile } = useQuery({
    queryKey: ["chatProfile", selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const res = await api.get(`/users/${selectedUserId}`);
      return res.data;
    },
    enabled: !!selectedUserId,
  });

  const canMessage = !!selectedProfile?.isConnected;

  const conversations = allConversations.filter((c) => c.peer.id !== user?.id);
  const filteredConversations = conversations
    .filter((c) => c.peer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime());

  const selectedConversation = conversations.find((c) => c.peer.id === selectedUserId);
  const selectedUserData = selectedConversation?.peer;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: SACRED_EASE }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-sacred-beige rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-sacred-gold" />
          </div>
          <h2 className="text-3xl font-light text-sacred-text mb-4">Join the Conversation</h2>
          <p className="text-sacred-muted font-serif italic mb-8 max-w-sm mx-auto">
            Please enter the temple by signing in to connect with fellow seekers.
          </p>
          <Button onClick={() => (window.location.href = "/login")}>Sign In</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto md:py-8 md:px-4 h-[calc(100vh-56px)] md:h-[calc(100vh-120px)] flex flex-col">
      <Card className="flex-1 flex overflow-hidden border-none md:shadow-[0_20px_50px_rgba(217,160,91,0.05)] bg-white/70 backdrop-blur-xl md:rounded-3xl">
        {/* Left Sidebar - Conversation List */}
        <div className={`${selectedUserId ? "hidden md:flex" : "flex"} w-full md:w-80 border-r border-sacred-gold/10 flex-col bg-sacred-beige/20`}>
          <div className="p-4 md:p-8 pb-4 sticky top-0 z-10 bg-sacred-beige/70 backdrop-blur-md border-b border-sacred-gold/10">
            <h1 className="text-xl md:text-2xl font-light text-sacred-text mb-4 md:mb-6 flex items-center gap-2">
              Conversations
              <Sparkles size={16} className="text-sacred-gold/50" />
            </h1>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sacred-muted/40" />
              <input
                type="text"
                placeholder="Find a seeker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/50 border border-sacred-gold/10 rounded-2xl pl-11 pr-4 py-2.5 md:py-3 focus:outline-none focus:ring-1 focus:ring-sacred-gold/30 text-sm transition-all placeholder:text-sacred-muted/30"
              />
            </div>
          </div>

          <motion.div
            variants={STAGGER_CONTAINER}
            initial="initial"
            animate="animate"
            className="flex-1 overflow-y-auto px-3 md:px-4 space-y-2 mt-2 md:mt-4 pb-4"
          >
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-sacred-muted/60">
                <p className="text-sm font-serif italic">No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.peer.id}
                  conversation={conversation}
                  isSelected={selectedUserId === conversation.peer.id}
                  isOnline={onlineUserSet.has(conversation.peer.id)}
                  onSelect={() => setSelectedUserId(conversation.peer.id)}
                  layout="page"
                />
              ))
            )}
          </motion.div>
        </div>

        {/* Right Pane - Active Conversation */}
        <div className={`${!selectedUserId ? "hidden md:flex" : "flex"} flex-1 flex-col bg-white`}>
          <AnimatePresence mode="wait">
            {selectedUserId ? (
              <motion.div
                key={selectedUserId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: SACRED_EASE }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Chat Header */}
                <div className="px-3 md:px-8 py-3 md:py-6 border-b border-sacred-gold/10 flex items-center justify-between bg-white/60 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center">
                    <button
                      onClick={() => setSelectedUserId(null)}
                      className="md:hidden mr-2 p-2 rounded-xl text-sacred-muted hover:bg-sacred-beige/40"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-sacred-gold/10 overflow-hidden flex items-center justify-center mr-3 md:mr-4 bg-sacred-beige shadow-sm">
                      {selectedUserData?.profile?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getMediaUrl(selectedUserData.profile.avatar) as string}
                          alt={selectedUserData.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sacred-gold font-bold text-sm">
                          {selectedUserData?.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-base md:text-lg font-medium text-sacred-text">{selectedUserData?.name}</h2>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-400" />
                        <p className="text-[8px] md:text-[10px] text-sacred-muted/60 font-bold uppercase tracking-widest">Present</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-3 md:p-8 space-y-3 md:space-y-6 scrollbar-elegant">
                  {messages.length === 0 ? (
                    <EmptyMessages type="select-chat" peerName={selectedUserData?.name} layout="page" />
                  ) : (
                    messages.map((msg, idx) => (
                      <MessageBubble
                        key={msg.id || `temp-${idx}`}
                        message={msg}
                        isOwn={msg.senderId === user.id}
                        layout="page"
                      />
                    ))
                  )}
                  {isPeerTyping && (
                    <div className="flex items-center gap-2 text-sacred-muted/50 text-xs italic px-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {selectedUserData?.name?.split(" ")[0]} is typing...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <MessageInput
                  onSend={sendMessage}
                  onStartTyping={startTyping}
                  onStopTyping={stopTyping}
                  placeholder="Share a thought..."
                  layout="page"
                  disabled={isBlocked || (!!selectedUserId && !canMessage)}
                  disabledReason={
                    isBlocked || (!!selectedUserId && !canMessage)
                      ? "You can message only after you both connect."
                      : undefined
                  }
                />
              </motion.div>
            ) : (
              <EmptyMessages type="select-chat" layout="page" />
            )}
          </AnimatePresence>
        </div>
      </Card>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <Loader2 className="animate-spin text-sacred-gold" size={40} />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
