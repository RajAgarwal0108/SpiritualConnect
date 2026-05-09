'use client';

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/globalStore";
import { Send, Phone, Sparkles, Target, Settings, Plus, Smile, MessageCircle, ClipboardCheck, Info } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { guidanceService } from "@/services/guidance.service";
import { GuidanceSession, GuidanceMessage } from "@/types/guidance";
import { RoutineCard } from "@/components/guidance/RoutineCard";
import { QuestionCard } from "@/components/guidance/QuestionCard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function GuidanceSessionChat() {
  const { sessionId } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [messages, setMessages] = useState<GuidanceMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [showTools, setShowTools] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch session details
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['guidanceSessions'],
    queryFn: guidanceService.getSessions,
    refetchInterval: 5000, // Keep session metadata fresh
  });

  const session = sessions?.find(s => s.id === sessionId);

  // Intent Update Mutations
  const updateIntent = useMutation({
    mutationFn: (data: { mood?: string; goal?: string }) => guidanceService.updateSessionIntent(sessionId as string, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['guidanceSessions'] }),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'REJECTED' }) => guidanceService.respondToSession(id, status),
    onSuccess: () => {
      toast.success('Session updated');
      queryClient.invalidateQueries({ queryKey: ['guidanceSessions'] });
    },
    onError: () => {
      toast.error('Failed to update session');
    }
  });

  // Load message history
  useEffect(() => {
    if (sessionId) {
      guidanceService.getSessionMessages(sessionId as string)
        .then(data => {
          setMessages(data);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }), 100);
        })
        .catch(err => console.error("Failed to fetch messages:", err));
    }
  }, [sessionId]);


  // Setup socket
  useEffect(() => {
    if (!user || !sessionId) return;
    
    const socketHost = (() => {
      if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
      if (typeof window !== "undefined" && window.location.hostname === "localhost") return "http://localhost:3001";
      return "https://spiritualconnect.onrender.com";
    })();

    socketRef.current = io(socketHost, { transports: ["websocket"] });

    socketRef.current.emit("join_guidance_session", sessionId);

    const handleMessage = (msg: GuidanceMessage) => {
      setMessages((prev) => {
        // Prevent duplicate messages if already in list (e.g. from history load vs socket)
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };

    socketRef.current.on("receive_guidance_message", handleMessage);

    return () => {
      socketRef.current?.off("receive_guidance_message", handleMessage);
      socketRef.current?.disconnect();
    };
  }, [user, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const shareDetailsMutation = useMutation({
    mutationFn: () => guidanceService.shareSessionDetails(sessionId as string),
    onSuccess: () => {
      toast.success("Details shared successfully.");
      queryClient.invalidateQueries({ queryKey: ['guidanceSessions'] });
    },
    onError: () => toast.error("Failed to share details."),
  });

  if (sessionsLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-200px)]"><div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] flex-col gap-4">
        <p className="text-slate-500">Session not found or access denied.</p>
        <button onClick={() => router.push('/profile/guidance')} className="text-[#D4AF37] underline">Return to Dashboard</button>
      </div>
    );
  }

  const isSeeker = session.userId === user?.id;
  const isGuide = session.guideId === user?.id;
  const otherPerson = isSeeker ? session.guide : session.user;
  const sessionStatus = session.status;

  const sendMessage = (type: string = 'TEXT', metadata: any = null, customContent?: string) => {
    // Allow sending only when session is accepted, or allow seeker initial check-in before acceptance
    const canSendBeforeAccept = sessionStatus === 'PENDING' && isSeeker && messages.length === 0;
    if ((!messageInput.trim() && !customContent) || !socketRef.current || !user) return;
    if (sessionStatus !== 'ACCEPTED' && !canSendBeforeAccept && !isGuide) {
      toast.error('Waiting for the guide to accept the session.');
      return;
    }
    
    socketRef.current.emit("send_guidance_message", {
      sessionId,
      senderId: user.id,
      content: customContent || messageInput,
      type,
      metadata
    });
    
    setMessageInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const moods = ['Peaceful', 'Anxious', 'Seeking', 'Grateful', 'Healing', 'Struggling'];

  return (
    <div className="container mx-auto max-w-6xl h-[calc(100vh-80px)] flex flex-col pt-4 pb-8 bg-slate-50/30">
      
      {/* Session Context Header - "The Sanctuary" */}
      <div className="bg-white/80 backdrop-blur-md border-b border-[#D4AF37]/10 p-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm relative z-20 rounded-t-3xl">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="relative">
            <img 
              src={otherPerson?.profile?.avatar || '/default-avatar.png'} 
              alt={otherPerson?.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-[#D4AF37]/20 ring-offset-2"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-slate-900 tracking-tight">{otherPerson?.name}</h2>
              <Badge variant="outline" className="text-[10px] text-[#B8860B] border-[#D4AF37]/30 bg-[#FBF7E9]">
                {isSeeker ? 'Divine Guide' : 'Seeker'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-bold uppercase">{sessionStatus}</span>
               {session.mood && (
                 <span className="text-xs flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                   <Smile size={12} className="text-[#D4AF37]" /> {session.mood}
                 </span>
               )}
               {session.goal && (
                 <span className="text-xs flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                   <Target size={12} className="text-[#D4AF37]" /> {session.goal}
                 </span>
               )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          {isGuide && sessionStatus === 'PENDING' && (
            <div className="flex gap-2">
              <button
                onClick={() => respondMutation.mutate({ id: session.id, status: 'REJECTED' })}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg"
                disabled={respondMutation.isPending}
              >Decline</button>
              <button
                onClick={() => respondMutation.mutate({ id: session.id, status: 'ACCEPTED' })}
                className="px-3 py-2 bg-emerald-500 text-white rounded-lg font-bold"
                disabled={respondMutation.isPending}
              >Accept</button>
            </div>
          )}
          {/* Mood Selector for Seeker */}
          {isSeeker && (
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <Settings size={20} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 rounded-2xl shadow-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 px-2 tracking-wider">How is your heart today?</p>
                <div className="grid grid-cols-2 gap-1">
                  {moods.map(m => (
                    <button 
                      key={m}
                      onClick={() => updateIntent.mutate({ mood: m })}
                      className="text-xs text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700 font-medium"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {isSeeker && !session.isDetailsShared && (
            <button 
              onClick={() => shareDetailsMutation.mutate()}
              disabled={shareDetailsMutation.isPending}
              className="text-sm bg-[#D4AF37] text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-[#D4AF37]/20 hover:scale-105 transition-all active:scale-95"
            >
              Share Profile & Call
            </button>
          )}

          {isGuide && session.isDetailsShared && session.user?.phoneNumber && (
             <a href={`tel:\${session.user.phoneNumber}`} className="flex gap-2 items-center text-sm bg-emerald-500 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
               <Phone size={18} /> Connect Privately
             </a>
          )}
        </div>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 bg-white/40 p-4 md:p-8 overflow-y-auto border-x border-[#D4AF37]/5 flex flex-col gap-6 scroll-smooth">
        
        {/* Session Welcome Card */}
        {messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mt-10 text-center space-y-4"
          >
            <div className="w-20 h-20 bg-linear-to-br from-[#FBF7E9] to-[#F1E4C3] rounded-3xl mx-auto flex items-center justify-center text-[#D4AF37] shadow-inner">
              <Sparkles size={40} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-slate-800">The Sacred Sanctuary</h3>
            <p className="text-slate-500 leading-relaxed italic">
              "This space is dedicated to your spiritual growth. Every word shared here is a seed for transformation."
            </p>
            {isSeeker && (
              <div className="pt-4 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Initial Check-in</p>
                <div className="flex flex-wrap justify-center gap-2">
                   {['Anxiety', 'Grief', 'Purpose', 'Healing'].map(g => (
                     <Button 
                       key={g} 
                       variant="secondary" 
                       className="rounded-full text-xs border-[#D4AF37]/20 hover:bg-[#FBF7E9]"
                       onClick={() => {
                         updateIntent.mutate({ goal: g });
                         sendMessage('TEXT', null, `I am seeking guidance for ${g}.`);
                       }}
                     >
                       Focus on {g}
                     </Button>
                   ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            
            // Render specific components based on message type
            if (msg.type === 'ROUTINE' && msg.metadata) {
              return <RoutineCard key={msg.id || idx} metadata={msg.metadata as any} onAccept={() => sendMessage('TEXT', null, `I have accepted the practice: ${(msg.metadata as any).title}`)} />;
            }

            if (msg.type === 'QUESTION' && msg.metadata) {
              return <QuestionCard key={msg.id || idx} metadata={msg.metadata as any} onClick={() => setMessageInput((msg.metadata as any).question + " ")} />;
            }

            return (
              <motion.div 
                key={msg.id || idx} 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex \${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={[
                  'max-w-[80%] md:max-w-[70%] rounded-3xl px-5 py-3 shadow-sm relative group transition-all',
                  isMe 
                    ? 'bg-linear-to-br from-[#D4AF37] to-[#B8860B] text-white rounded-tr-md' 
                    : 'bg-white text-slate-800 border-b-2 border-slate-100 rounded-tl-md'
                ].join(' ')}>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.type === 'TEXT' ? msg.content : (
                      <span className="flex items-center gap-2 italic text-sm">
                        <Info size={14} /> Structured interaction message ({msg.type})
                      </span>
                    )}
                  </p>
                  <div className={`flex items-center gap-2 mt-1.5 \${isMe ? "text-white/60 justify-end" : "text-slate-400"}`}>
                    <span className="text-[10px] font-medium">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Sacred Input Area */}
      <div className="bg-white/90 backdrop-blur-md border border-[#D4AF37]/10 p-4 md:px-8 mt-2 rounded-b-3xl shadow-xl flex flex-col gap-3 relative z-20">
        
        {/* Guide Tools Quick Bar */}
        {isGuide && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button 
              onClick={() => sendMessage('QUESTION', { question: "What is standing between you and your peace right now?", category: "Reflection" }, "Deep reflection prompt")}
              className="shrink-0 flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
            >
              <MessageCircle size={14} className="text-[#D4AF37]" /> Send Reflection
            </button>
            <button 
              onClick={() => sendMessage('ROUTINE', { title: "Evening Heart Healing ritual", steps: ["5 min deep breathing", "Write 3 things you release", "Sip herbal tea in silence"], focus: "Healing", duration: "15 min" }, "Proposed healing routine")}
              className="shrink-0 flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
            >
              <ClipboardCheck size={14} className="text-emerald-500" /> Share Practice
            </button>
          </div>
        )}

        <div className="flex gap-3 items-end">
          <div className="relative flex-1 group">
            <textarea
              className="w-full bg-slate-100 rounded-2xl px-5 py-4 text-slate-900 border-2 border-transparent focus:border-[#D4AF37]/30 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 resize-none min-h-15"
              placeholder="Speak with intention..."
              rows={2}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!(sessionStatus === 'ACCEPTED' || (sessionStatus === 'PENDING' && isSeeker && messages.length === 0) || isGuide)}
            />
            <div className="absolute left-5 -top-2 px-2 bg-white text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-0 group-focus-within:opacity-100 transition-opacity">
              Focused Messenger
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            disabled={!messageInput.trim() || !(sessionStatus === 'ACCEPTED' || (sessionStatus === 'PENDING' && isSeeker && messages.length === 0) || isGuide)}
            className="h-15 w-15 bg-linear-to-br from-[#D4AF37] to-[#B8860B] text-white rounded-2xl flex items-center justify-center hover:shadow-lg shadow-[#D4AF37]/20 transition-all disabled:opacity-30 disabled:grayscale"
          >
            <Send size={24} />
          </motion.button>
        </div>
        {!(sessionStatus === 'ACCEPTED' || (sessionStatus === 'PENDING' && isSeeker && messages.length === 0) || isGuide) && (
          <p className="text-xs text-slate-500 mt-2">Waiting for the guide to accept this session before messaging.</p>
        )}
      </div>
    </div>
  );
}
