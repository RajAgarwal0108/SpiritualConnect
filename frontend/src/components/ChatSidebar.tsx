"use client";

import { useState, useEffect, useRef, startTransition } from "react";
import { Search, ChevronLeft, Send, X, Sparkles, Maximize2, Minimize2 } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/globalStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { io, Socket } from "socket.io-client";
import { getMediaUrl } from "@/lib/media";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id?: number;
  room?: string;
  senderName: string;
  senderId: number;
  content: string;
  createdAt?: string;
}

interface IncomingSocketMessage {
  id?: number;
  room?: string;
  senderId?: number;
  senderName?: string;
  sender?: string;
  content?: string;
  message?: string;
  createdAt?: string;
  timestamp?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  profile?: {
    avatar?: string;
  };
  isOnline?: boolean;
}

export default function ChatSidebar() {
  const { user } = useAuthStore();
  const { setRightSidebar, chatTarget, clearChatTarget, isChatExpanded, toggleChatExpanded } = useUIStore();
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["dmUsers"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data || [];
    },
    enabled: !!user,
  });

  const { data: onlineUsers = [] } = useQuery<User[]>({
    queryKey: ["onlineUsers"],
    queryFn: async () => {
      const res = await api.get("/users/online");
      return (res.data || []).map((u: User) => ({ ...u, isOnline: true }));
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  // When chatTarget is set from outside (e.g., clicking chat on a profile), auto-open that chat
  useEffect(() => {
    if (!chatTarget) return;
    startTransition(() => {
      setActiveChatId(chatTarget.id);
      setActiveChatUser({
        id: chatTarget.id,
        name: chatTarget.name,
        email: "",
        profile: { avatar: chatTarget.avatar },
      });
    });
    clearChatTarget();
  }, [chatTarget, clearChatTarget]);

  const onlinePeers = (onlineUsers as User[]).map((u) => ({ ...u, isOnline: true }));
  const offlineFallback = (allUsers as User[]).map((u) => ({ ...u, isOnline: false }));
  const hasOtherOnline = onlinePeers.some((u) => u.id !== user?.id);
  const roster = hasOtherOnline ? onlinePeers : offlineFallback;

  const filteredUsers = roster
    .filter((u: User) => u.id !== user?.id)
    .filter((u: User) => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    // Choose socket host: use NEXT_PUBLIC_API_URL when available, keep
    // localhost for local dev, otherwise default to deployed socket host.
    const socketHost = (() => {
      if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
      if (typeof window !== "undefined" && window.location.hostname === "localhost") return "http://localhost:3001";
      return "https://spiritualconnect.onrender.com";
    })();

    const socket = io(socketHost);
    socketRef.current = socket;

    if (user) {
      socket.emit("user_online", user.id);
    }

    const handleOnlineUsers = (payload: User[]) => {
      queryClient.setQueryData(["onlineUsers"], payload.map((u) => ({ ...u, isOnline: true })));
    };

    socket.on("online_users", handleOnlineUsers);

    return () => {
      socket.off("online_users", handleOnlineUsers);
      socket.disconnect();
    };
  }, [user, queryClient]);

  useEffect(() => {
    if (!activeChatId || !user) return;
    const roomId = [user.id, activeChatId].sort().join("-");
    socketRef.current?.emit("join_room", roomId);

    const handleMessage = (data: IncomingSocketMessage) => {
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

    socketRef.current?.on("receive_message", handleMessage);

    (async () => {
      try {
  const res = await api.get<Message[]>(`/messages/room/${roomId}`);
  setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load messages", err);
        setMessages([]);
      }
    })();

    return () => {
      socketRef.current?.off("receive_message", handleMessage);
    };
  }, [activeChatId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!messageInput.trim() || !activeChatId || !user || !socketRef.current) return;
    const roomId = [user.id, activeChatId].sort().join("-");
    const messageData = {
      room: roomId,
      message: messageInput,
      sender: user.name,
      senderId: user.id,
      timestamp: new Date().toISOString(),
    };
    socketRef.current.emit("send_message", messageData);
    setMessageInput("");
  };

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
          <div className={`mt-8 group relative transition-all duration-300 ${
            isChatExpanded ? "max-w-xl" : ""
          }`}>
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`pb-12 overflow-y-auto h-full no-scrollbar transition-all duration-300 ${
                isChatExpanded 
                  ? "px-12 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4 content-start" 
                  : "px-6 space-y-2"
              }`}
            >
              {filteredUsers.map((u: User) => (
                <motion.div 
                  key={u.id}
                  layoutId={`user-${u.id}`}
                  onClick={() => { setActiveChatId(u.id); setActiveChatUser(u); }}
                  className={`flex items-center gap-5 rounded-3xl hover:bg-white/60 cursor-pointer transition-all group active:scale-[0.98] ${
                    isChatExpanded 
                      ? "p-6 bg-white/40 border border-white/60 shadow-sm hover:shadow-md" 
                      : "p-5"
                  }`}
                >
                  <div className="relative">
                    {u.profile?.avatar ? (
                      <img src={getMediaUrl(u.profile.avatar) as string} alt={u.name} className={`rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform ${
                        isChatExpanded ? "w-16 h-16" : "w-14 h-14"
                      }`} />
                    ) : (
                      <div className={`rounded-full bg-sacred-gold/5 flex items-center justify-center text-sacred-gold font-bold border border-sacred-gold/10 group-hover:scale-105 transition-transform ${
                        isChatExpanded ? "w-16 h-16 text-xl" : "w-14 h-14 text-lg"
                      }`}>
                        {u.name[0]}
                      </div>
                    )}
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-sacred-beige rounded-full shadow-sm ${
                      u.isOnline ? "bg-green-500" : "bg-sacred-muted/30"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`font-bold text-sacred-text truncate ${isChatExpanded ? "text-lg" : "text-base"}`}>{u.name}</h4>
                      <span className={`text-[10px] uppercase tracking-tighter ${
                        u.isOnline ? "text-green-500" : "text-sacred-muted/40"
                      }`}>
                        {u.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <p className="text-xs text-sacred-muted/70 truncate italic font-medium">Start a thoughtful exchange...</p>
                  </div>
                </motion.div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="py-20 text-center space-y-4 col-span-full">
                  <Sparkles size={32} className="mx-auto text-sacred-gold/20" />
                  <p className="text-sm italic text-sacred-muted">The silence is deep here.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="messages"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className={`flex flex-col h-full transition-all duration-300 ${
                isChatExpanded ? "max-w-4xl mx-auto w-full" : ""
              }`}
            >
              <div className={`flex-1 overflow-y-auto py-8 space-y-8 flex flex-col no-scrollbar transition-all duration-300 ${
                isChatExpanded ? "px-12" : "px-8"
              }`}>
                {messages.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <div className="w-20 h-20 rounded-full bg-sacred-gold/10 flex items-center justify-center">
                      <Sparkles size={32} className="text-sacred-gold/40" />
                    </div>
                    <p className="text-sm italic text-sacred-muted">Begin your sacred conversation...</p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.02 }}
                      key={msg.id || i}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`px-6 py-4 rounded-[28px] text-sm leading-relaxed shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] transition-all duration-300 ${
                        isChatExpanded ? "max-w-[60%]" : "max-w-[85%]"
                      } ${
                        isMe 
                          ? 'bg-sacred-gold text-white rounded-tr-none' 
                          : 'bg-white text-sacred-text rounded-tl-none border border-sacred-gold/5'
                      }`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className={`shrink-0 transition-all duration-300 ${
                isChatExpanded ? "p-12 pt-4" : "p-8"
              }`}>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className={`flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-sacred-gold/5 group focus-within:ring-2 focus-within:ring-sacred-gold/5 transition-all ${
                    isChatExpanded ? "py-4 px-6" : ""
                  }`}
                >
                  <input 
                    type="text" 
                    placeholder="Write with intention..."
                    className={`flex-1 bg-transparent border-none outline-none py-1.5 text-sacred-text placeholder:text-sacred-muted/30 italic transition-all ${
                      isChatExpanded ? "text-base" : "text-sm"
                    }`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={!messageInput.trim()}
                    className={`rounded-full text-sacred-gold hover:bg-sacred-gold hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-sacred-gold transition-all active:scale-90 ${
                      isChatExpanded ? "p-3" : "p-2.5"
                    }`}
                  >
                    <Send size={isChatExpanded ? 22 : 20} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
