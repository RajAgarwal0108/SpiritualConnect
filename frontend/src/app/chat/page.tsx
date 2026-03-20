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

interface Conversation {
  room: string;
  peer: User;
  latestMessage: string;
  latestAt: string;
  isOwnLastMessage: boolean;
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

  const { data: conversations = [], refetch: refetchConversations } = useQuery<Conversation[]>({
    queryKey: ["dmConversations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await api.get(`/messages/conversations/${user.id}`);
      return res.data || [];
    },
    enabled: !!user?.id,
  });

  const { data: onlineUsers = [] } = useQuery<User[]>({
    queryKey: ["onlineUsers"],
    queryFn: async () => {
      const res = await api.get("/users/online");
      return res.data || [];
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  const [liveOnlineUserIds, setLiveOnlineUserIds] = useState<number[]>([]);

  const onlineUserSet = new Set<number>([
    ...(onlineUsers || []).map((u) => u.id),
    ...liveOnlineUserIds,
  ]);

  const filteredConversations = (conversations || [])
    .filter((c) => c.peer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime());

  useEffect(() => {
    const socketHost = (() => {
      if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
      if (typeof window !== "undefined" && window.location.hostname === "localhost") return "http://localhost:3001";
      return "https://spiritualconnect.onrender.com";
    })();

    socketRef.current = io(socketHost, {
      transports: ["websocket"],
    });

    if (user?.id) {
      socketRef.current.emit("user_online", user.id);
    }

    const handleOnlineUsers = (payload: User[]) => {
      setLiveOnlineUserIds(payload.map((u) => u.id));
    };

    socketRef.current.on("online_users", handleOnlineUsers);

    return () => {
      socketRef.current?.off("online_users", handleOnlineUsers);
      socketRef.current?.disconnect();
    };
  }, [user?.id]);

  

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
      refetchConversations();
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
  }, [selectedUserId, user, refetchConversations]);

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
    refetchConversations();
  };

  const selectedConversation = conversations.find((c) => c.peer.id === selectedUserId);
  const selectedUserData = selectedConversation?.peer || allUsers.find((u: User) => u.id === selectedUserId);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
    <main className="max-w-7xl mx-auto md:py-8 md:px-4 h-[calc(100vh-56px)] md:h-[calc(100vh-120px)] flex flex-col">
      <Card className="flex-1 flex overflow-hidden border-none md:shadow-[0_20px_50px_rgba(217,160,91,0.05)] bg-white/70 backdrop-blur-xl md:rounded-3xl">
        {/* Left Sidebar - DM List */}
        <div className={`${selectedUserId ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-sacred-gold/10 flex-col bg-sacred-beige/20`}>
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
              filteredConversations.map((conversation: Conversation) => (
                <motion.button
                  variants={FADE_IN_UP}
                  key={conversation.peer.id}
                  onClick={() => setSelectedUserId(conversation.peer.id)}
                  className={`w-full p-3.5 md:p-4 rounded-2xl md:rounded-3xl text-left transition-all duration-500 group relative ${
                    selectedUserId === conversation.peer.id
                      ? "bg-white shadow-[0_4px_20px_rgba(217,160,91,0.08)] ring-1 ring-sacred-gold/20"
                      : "hover:bg-white/40"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-sacred-gold/10 overflow-hidden shrink-0 mr-3 md:mr-4 bg-sacred-beige group-hover:scale-105 transition-transform duration-500">
                      {conversation.peer.profile?.avatar ? (
                        <img 
                          src={getMediaUrl(conversation.peer.profile.avatar) as string} 
                          alt={conversation.peer.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sacred-gold font-medium text-sm">
                          {conversation.peer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-medium text-sm transition-colors truncate ${selectedUserId === conversation.peer.id ? "text-sacred-gold" : "text-sacred-text"}`}>{conversation.peer.name}</p>
                        <span className="text-[10px] text-sacred-muted/50 shrink-0">
                          {new Date(conversation.latestAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${onlineUserSet.has(conversation.peer.id) ? "bg-emerald-500" : "bg-sacred-muted/20"}`} />
                        <p className="text-xs text-sacred-muted/70 truncate font-serif italic">
                          {conversation.isOwnLastMessage ? "You: " : ""}{conversation.latestMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </motion.div>
        </div>

        {/* Right Pane - Conversation */}
        <div className={`${!selectedUserId ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col bg-white`}>
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
                <div className="px-3 md:px-8 py-3 md:py-6 border-b border-sacred-gold/10 flex items-center justify-between bg-white/60 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center">
                    <button 
                      onClick={() => setSelectedUserId(null)}
                      className="md:hidden mr-2 p-2 rounded-xl text-sacred-muted hover:bg-sacred-beige/40"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-sacred-gold/10 overflow-hidden flex items-center justify-center mr-3 md:mr-4 bg-sacred-beige shadow-sm">
                      {selectedUserData?.profile?.avatar ? (
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
                        <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-400"></span>
                        <p className="text-[8px] md:text-[10px] text-sacred-muted/60 font-bold uppercase tracking-widest">Present</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-3 md:p-8 space-y-3 md:space-y-6 scrollbar-elegant">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-sacred-muted/40">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-sacred-beige/30 flex items-center justify-center mb-4 md:mb-6">
                        <MessageCircle size={28} />
                      </div>
                      <p className="text-center italic font-serif text-base md:text-lg px-6">Send a message to begin your exchange with {selectedUserData?.name?.split(' ')[0] || 'fellow seeker'}</p>
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
                            className={`max-w-[90%] md:max-w-[70%] px-3.5 md:px-6 py-2.5 md:py-4 rounded-2xl md:rounded-4xl text-sm leading-relaxed shadow-sm ${
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
                <div className="p-3 md:p-8 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/60 backdrop-blur-md border-t border-sacred-gold/10">
                  <div className="flex items-center gap-2 md:gap-4 bg-sacred-beige/30 border border-sacred-gold/10 rounded-2xl md:rounded-3xl p-1.5 md:p-2 pl-3 md:pl-6 focus-within:ring-2 ring-sacred-gold/20 transition-all">
                    <input
                      type="text"
                      placeholder="Share a thought..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2 placeholder:text-sacred-muted/40 text-sacred-text"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                      className="rounded-xl md:rounded-2xl p-2 md:p-3 aspect-square min-w-0 flex items-center justify-center disabled:opacity-40"
                    >
                      <Send size={16} className="md:w-4.5 md:h-4.5" />
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
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-xl border border-sacred-gold/5">
                    <MessageCircle size={32} className="md:w-10 md:h-10 text-sacred-gold/40" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light text-sacred-text mb-4">Ancient Echoes</h3>
                  <p className="text-sacred-muted font-serif italic text-sm md:text-base max-w-xs mx-auto">Select a seeker from the left to begin an enlightened dialogue.</p>
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
