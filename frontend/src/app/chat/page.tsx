"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/globalStore";
import { Send, Search, MessageCircle, Loader2, User, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { useSearchParams } from "next/navigation";
import { getMediaUrl } from "@/lib/media";
import { motion, AnimatePresence } from "framer-motion";
import { STAGGER_CONTAINER, FADE_IN_UP, SACRED_EASE } from "@/lib/motion-config";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Message {
  id?: number;
  room?: string;
  senderName: string;
  senderId: number;
  content: string;
  createdAt?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  profile?: {
    avatar?: string;
  };
}

function ChatContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get("userId");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(initialUserId ? parseInt(initialUserId) : null);

  useEffect(() => {
    const q = searchParams.get("userId");
    if (q) {
      const id = parseInt(q);
      if (!Number.isNaN(id)) setSelectedUserId(id);
    }
  }, [searchParams]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: allUsers = [] } = useQuery({
    queryKey: ["dmUsers"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data || [];
    },
  });

  const filteredConversations = (allUsers as User[])
    .filter((u: User) => u.id !== user?.id)
    .filter((u: User) => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    // When a conversation is selected, join its room and load history
    if (!selectedUserId || !user) return;
    const roomId = [user.id, selectedUserId].sort().join("-");
    socketRef.current?.emit("join_room", roomId);

    let mounted = true;

    // handler for incoming messages
    const handleMessage = (data: any) => {
      // incoming (from server) should be the saved message with fields: id, room, senderId, senderName, content, createdAt
      const incoming: Message = {
        id: data.id,
        room: data.room,
        senderId: data.senderId || 0,
        senderName: data.senderName || data.sender || "",
        content: data.content || data.message || "",
        createdAt: data.createdAt || data.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, incoming]);
    };

    // attach listener
    socketRef.current?.on("receive_message", handleMessage);

    // load existing messages
    (async () => {
      try {
        const res = await api.get(`/messages/room/${roomId}`);
        const msgs: Message[] = (res.data || []).map((m: any) => ({
          id: m.id,
          room: m.room,
          senderName: m.senderName,
          senderId: m.senderId,
          content: m.content,
          createdAt: m.createdAt,
        }));
        if (mounted) setMessages(msgs);
      } catch (err) {
        console.error("Failed to load messages", err);
        if (mounted) setMessages([]);
      }
    })();

    return () => {
      mounted = false;
      socketRef.current?.off("receive_message", handleMessage);
    };
  }, [selectedUserId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedUserId || !user || !socketRef.current) return;
    const roomId = [user.id, selectedUserId].sort().join("-");
    const messageData = {
      room: roomId,
      message: messageInput,
      sender: user.name,
      senderId: user.id,
      timestamp: new Date().toISOString(),
    };

    // emit via socket (server will persist and broadcast back the saved message)
    socketRef.current.emit("send_message", messageData);
    // do not add optimistic UI here: server will broadcast saved message (with id/createdAt) back to us
    setMessageInput("");
  };

  const selectedUserData = allUsers.find((u: User) => u.id === selectedUserId);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: SACRED_EASE as any }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-sacred-beige rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-sacred-gold" />
          </div>
          <h2 className="text-3xl font-light text-sacred-text mb-4">Join the Conversation</h2>
          <p className="text-sacred-muted font-serif italic mb-8 max-w-sm mx-auto">Please enter the temple by signing in to connect with fellow seekers.</p>
          <Button onClick={() => window.location.href='/login'}>Sign In</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-8 px-4 h-[calc(100vh-120px)] flex flex-col">
      <Card className="flex-1 flex overflow-hidden border-none shadow-[0_20px_50px_rgba(217,160,91,0.05)] bg-white/70 backdrop-blur-xl">
        {/* Left Sidebar - DM List */}
        <div className="w-80 border-r border-sacred-gold/10 flex flex-col bg-sacred-beige/20">
          <div className="p-8 pb-4">
            <h1 className="text-2xl font-light text-sacred-text mb-6 flex items-center gap-2">
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
                className="w-full bg-white/50 border border-sacred-gold/10 rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-sacred-gold/30 text-sm transition-all placeholder:text-sacred-muted/30"
              />
            </div>
          </div>

          <motion.div 
            variants={STAGGER_CONTAINER}
            initial="initial"
            animate="animate"
            className="flex-1 overflow-y-auto px-4 space-y-2 mt-4"
          >
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-sacred-muted/60">
                <p className="text-sm font-serif italic">No seekers found</p>
              </div>
            ) : (
              filteredConversations.map((dmUser: User) => (
                <motion.button
                  variants={FADE_IN_UP}
                  key={dmUser.id}
                  onClick={() => setSelectedUserId(dmUser.id)}
                  className={`w-full p-4 rounded-3xl text-left transition-all duration-500 group relative ${
                    selectedUserId === dmUser.id
                      ? "bg-white shadow-[0_4px_20px_rgba(217,160,91,0.08)] ring-1 ring-sacred-gold/20"
                      : "hover:bg-white/40"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full border border-sacred-gold/10 overflow-hidden shrink-0 mr-4 bg-sacred-beige group-hover:scale-105 transition-transform duration-500">
                      {dmUser.profile?.avatar ? (
                        <img 
                          src={getMediaUrl(dmUser.profile.avatar) as string} 
                          alt={dmUser.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sacred-gold font-medium">
                          {dmUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm transition-colors ${selectedUserId === dmUser.id ? "text-sacred-gold" : "text-sacred-text"}`}>{dmUser.name}</p>
                      <p className="text-[10px] text-sacred-muted/60 font-medium uppercase tracking-widest truncate">{dmUser.email?.split('@')[0] || 'seeker'}</p>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </motion.div>
        </div>

        {/* Right Pane - Conversation */}
        <div className="flex-1 flex flex-col bg-white">
          <AnimatePresence mode="wait">
            {selectedUserId ? (
              <motion.div 
                key={selectedUserId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: SACRED_EASE as any }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Chat Header */}
                <div className="px-8 py-6 border-b border-sacred-gold/10 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full border border-sacred-gold/10 overflow-hidden flex items-center justify-center mr-4 bg-sacred-beige shadow-sm">
                      {selectedUserData?.profile?.avatar ? (
                        <img 
                          src={getMediaUrl(selectedUserData.profile.avatar) as string} 
                          alt={selectedUserData.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sacred-gold font-bold">
                          {selectedUserData?.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-sacred-text">{selectedUserData?.name}</h2>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <p className="text-[10px] text-sacred-muted/60 font-bold uppercase tracking-widest">Present</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-elegant">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-sacred-muted/40">
                      <div className="w-16 h-16 rounded-full bg-sacred-beige/30 flex items-center justify-center mb-6">
                        <MessageCircle size={32} />
                      </div>
                      <p className="text-center italic font-serif text-lg">Send a message to begin your exchange with {selectedUserData?.name?.split(' ')[0] || 'fellow seeker'}</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.senderId === user.id;
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.4, ease: SACRED_EASE as any }}
                          key={msg.id || idx}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-6 py-4 rounded-4xl text-sm leading-relaxed shadow-sm ${
                              isMe
                                ? "bg-sacred-gold text-white rounded-tr-sm shadow-[0_5px_15px_rgba(217,160,91,0.2)]"
                                : "bg-sacred-beige/50 text-sacred-text rounded-tl-sm border border-sacred-gold/5"
                            }`}
                          >
                            {msg.content}
                            <div className={`mt-2 text-[9px] font-bold uppercase tracking-tighter opacity-70 ${isMe ? "text-white" : "text-sacred-muted"}`}>
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-8 bg-white/50 backdrop-blur-md border-t border-sacred-gold/10">
                  <div className="flex items-center gap-4 bg-sacred-beige/30 border border-sacred-gold/10 rounded-3xl p-2 pl-6 focus-within:ring-2 ring-sacred-gold/20 transition-all">
                    <input
                      type="text"
                      placeholder="Share a thought..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2 placeholder:text-sacred-muted/40 text-sacred-text"
                    />
                    <Button
                      onClick={sendMessage}
                      className="rounded-2xl p-3 aspect-square min-w-0 flex items-center justify-center"
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-sacred-beige/5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl border border-sacred-gold/5">
                    <MessageCircle size={40} className="text-sacred-gold/40" />
                  </div>
                  <h3 className="text-3xl font-light text-sacred-text mb-4">Ancient Echoes</h3>
                  <p className="text-sacred-muted font-serif italic max-w-xs mx-auto">Select a seeker from the left to begin an enlightened dialogue.</p>
                </motion.div>
              </div>
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
