'use client';

import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";
import { useAuthStore } from "@/store/globalStore";
import { useChatSocket } from "@/hooks/useChatSocket";
import { GuideNotes } from "@/components/guidance/GuideNotes";
import { SessionCloser } from "@/components/guidance/SessionCloser";
import { Send, Phone, Sparkles, Target, Smile, MessageCircle, ClipboardCheck, ChevronLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { guidanceService } from "@/services/guidance.service";
import { GuidanceMessage } from "@/types/guidance";
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
  const [showMobileTools, setShowMobileTools] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['guidanceSessions'],
    queryFn: guidanceService.getSessions,
  });

  const session = sessions?.find(s => s.id === sessionId);

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
    onError: () => toast.error('Failed to update session'),
  });

  const completeMutation = useMutation({
    mutationFn: ({ summary, blessing }: { summary: string; blessing: string }) =>
      guidanceService.completeSession(sessionId as string, { summary, blessing }),
    onSuccess: () => {
      toast.success('Session completed with blessing');
      queryClient.invalidateQueries({ queryKey: ['guidanceSessions'] });
      router.push('/profile/guidance');
    },
    onError: () => toast.error('Failed to close session'),
  });

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

  const { socket } = useChatSocket();

  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    if (!socket || !sessionId) return;

    socket.emit("join_guidance_session", sessionId);

    const handleMessage = (msg: GuidanceMessage) => {
      setMessages((prev) => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    socket.on("receive_guidance_message", handleMessage);

    return () => {
      socket.off("receive_guidance_message", handleMessage);
    };
  }, [socket, sessionId]);

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
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
      metadata,
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
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] flex flex-col bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-[#D4AF37]/10 px-3 md:px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.push('/profile/guidance')} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 md:hidden">
            <ChevronLeft size={20} />
          </button>
          <div className="relative shrink-0">
            <img
              src={otherPerson?.profile?.avatar || '/default-avatar.png'}
              alt={otherPerson?.name}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover ring-2 ring-[#D4AF37]/10"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm md:text-base text-slate-900 truncate">{otherPerson?.name}</h2>
              <Badge variant="outline" className="text-[9px] md:text-[10px] shrink-0 text-[#B8860B] border-[#D4AF37]/30 bg-[#FBF7E9]">
                {isSeeker ? 'Guide' : 'Seeker'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5 overflow-x-auto no-scrollbar">
              <span className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold uppercase whitespace-nowrap">{sessionStatus}</span>
              {session.mood && (
                <span className="text-[9px] md:text-[10px] flex items-center gap-0.5 text-slate-400 whitespace-nowrap">
                  <Smile size={10} className="text-[#D4AF37]" /> {session.mood}
                </span>
              )}
              {session.goal && !session.goal.startsWith('Blessing:') && (
                <span className="text-[9px] md:text-[10px] flex items-center gap-0.5 text-slate-400 whitespace-nowrap">
                  <Target size={10} className="text-[#D4AF37]" /> {session.goal}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isGuide && sessionStatus === 'PENDING' && (
            <div className="flex gap-1">
              <button onClick={() => respondMutation.mutate({ id: session.id, status: 'REJECTED' })}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                disabled={respondMutation.isPending}>Decline</button>
              <button onClick={() => respondMutation.mutate({ id: session.id, status: 'ACCEPTED' })}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                disabled={respondMutation.isPending}>Accept</button>
            </div>
          )}

          {isGuide && sessionStatus === 'ACCEPTED' && (
            <SessionCloser
              onClose={(summary, blessing) => completeMutation.mutate({ summary, blessing })}
              isPending={completeMutation.isPending}
            />
          )}

          {isSeeker && (
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                  <Smile size={18} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 rounded-2xl shadow-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 px-2 tracking-wider">How is your heart?</p>
                <div className="grid grid-cols-2 gap-1">
                  {moods.map(m => (
                    <button key={m} onClick={() => updateIntent.mutate({ mood: m })}
                      className="text-xs text-left px-3 py-2 hover:bg-slate-50 rounded-lg text-slate-700 font-medium">{m}</button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {isSeeker && !session.isDetailsShared && (
            <button onClick={() => shareDetailsMutation.mutate()} disabled={shareDetailsMutation.isPending}
              className="hidden md:flex text-xs bg-[#D4AF37] text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-[#D4AF37]/20 hover:scale-105 transition-all active:scale-95 items-center gap-1.5">
              <Phone size={12} /> Share Profile
            </button>
          )}

          {isGuide && session.isDetailsShared && session.user?.phoneNumber && (
            <a href={`tel:${session.user.phoneNumber}`}
              className="hidden md:flex gap-1.5 items-center text-xs bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
              <Phone size={12} /> Call
            </a>
          )}
        </div>
      </div>

      {/* Messages Canvas */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 space-y-4 scroll-smooth">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-sm mx-auto mt-6 md:mt-10 text-center space-y-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#FBF7E9] to-[#F1E4C3] rounded-2xl md:rounded-3xl mx-auto flex items-center justify-center text-[#D4AF37] shadow-inner">
              <Sparkles size={32} className="md:w-10 md:h-10" />
            </div>
            <h3 className="font-serif text-lg md:text-2xl font-bold text-slate-800">The Sacred Sanctuary</h3>
            <p className="text-slate-500 text-sm leading-relaxed italic">
              &ldquo;This space is dedicated to your spiritual growth.&rdquo;
            </p>
            {isSeeker && (
              <div className="pt-2 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">What brings you here?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Anxiety', 'Grief', 'Purpose', 'Healing'].map(g => (
                    <Button key={g} variant="secondary"
                      className="rounded-full text-[11px] border-[#D4AF37]/20 hover:bg-[#FBF7E9]"
                      onClick={() => {
                        updateIntent.mutate({ goal: g });
                        sendMessage('TEXT', null, `I am seeking guidance for ${g}.`);
                      }}>
                      {g}
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

            if (msg.type === 'ROUTINE' && msg.metadata) {
              return <RoutineCard key={msg.id || idx} metadata={msg.metadata as any}
                onAccept={() => sendMessage('TEXT', null, `I accept the practice: ${(msg.metadata as any).title}`)} />;
            }

            if (msg.type === 'QUESTION' && msg.metadata) {
              return <QuestionCard key={msg.id || idx} metadata={msg.metadata as any}
                onClick={() => setMessageInput((msg.metadata as any).question + ' ')} />;
            }

            return (
              <motion.div key={msg.id || idx}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl md:rounded-3xl px-4 md:px-5 py-2.5 md:py-3 shadow-sm ${
                  isMe
                    ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white rounded-tr-md'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-md'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                    {msg.type === 'TEXT' ? msg.content : `[${msg.type}] ${msg.content}`}
                  </p>
                  <div className={`flex items-center gap-2 mt-1 ${isMe ? 'text-white/60 justify-end' : 'text-slate-400'}`}>
                    <span className="text-[9px] md:text-[10px] font-medium">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="bg-white/90 backdrop-blur-md border-t border-[#D4AF37]/10 px-3 md:px-6 py-3 md:py-4 shrink-0 shadow-lg z-20">
        {isGuide && sessionStatus === 'ACCEPTED' && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button onClick={() => sendMessage('QUESTION',
              { question: 'What is standing between you and your peace right now?', category: 'Reflection' },
              'Deep reflection prompt')}
              className="shrink-0 flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] md:text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-200 transition-colors">
              <MessageCircle size={12} className="text-[#D4AF37]" /> Reflection
            </button>
            <button onClick={() => sendMessage('ROUTINE',
              { title: 'Evening Heart Healing', steps: ['5 min deep breathing', 'Write 3 releases', 'Sip tea in silence'], focus: 'Healing', duration: '15 min' },
              'Proposed healing routine')}
              className="shrink-0 flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] md:text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-200 transition-colors">
              <ClipboardCheck size={12} className="text-emerald-500" /> Practice
            </button>
          </div>
        )}

        <div className="flex gap-2 md:gap-3 items-end">
          <div className="relative flex-1">
            <textarea
              className="w-full bg-slate-100 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-3.5 text-sm md:text-base text-slate-900 border-2 border-transparent focus:border-[#D4AF37]/30 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 resize-none"
              placeholder="Speak with intention..."
              rows={1}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!(sessionStatus === 'ACCEPTED' || (sessionStatus === 'PENDING' && isSeeker && messages.length === 0) || isGuide)}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            disabled={!messageInput.trim() || !(sessionStatus === 'ACCEPTED' || (sessionStatus === 'PENDING' && isSeeker && messages.length === 0) || isGuide)}
            className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-white rounded-xl md:rounded-2xl flex items-center justify-center hover:shadow-lg shadow-[#D4AF37]/20 transition-all disabled:opacity-30 disabled:grayscale shrink-0"
          >
            <Send size={18} className="md:w-5 md:h-5" />
          </motion.button>
        </div>
      </div>

      {/* Guide Notes Panel (floating button + slide-out) */}
      {isGuide && <GuideNotes sessionId={sessionId as string} />}
    </div>
  );
}
