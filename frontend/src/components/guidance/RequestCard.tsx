'use client';

import { motion } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';
import type { GuidanceSession } from '@/types/guidance';

interface RequestCardProps {
  request: GuidanceSession;
  onAccept: () => void;
  onDecline: () => void;
  isPending: boolean;
}

const moodEmoji: Record<string, string> = {
  anxious: '😟', struggling: '😮‍💨', seeking: '🧘', grateful: '🙏',
  peaceful: '🕊️', healing: '🌱', 'open and curious': '✨',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function RequestCard({ request, onAccept, onDecline, isPending }: RequestCardProps) {
  const seeker = request.user;
  const mood = request.mood?.toLowerCase() || '';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="group bg-white border border-[#D4AF37]/10 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="relative shrink-0">
          <img
            src={seeker?.profile?.avatar || '/default-avatar.png'}
            alt={seeker?.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-[#D4AF37]/10"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center border-2 border-white">
            <Sparkles size={10} className="text-amber-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900">{seeker?.name || 'A Seeker'}</h3>
            {mood && moodEmoji[mood] && (
              <span className="text-sm" title={mood}>{moodEmoji[mood]}</span>
            )}
          </div>
          {request.goal && (
            <p className="text-sm text-slate-600 mt-1 italic line-clamp-2">
              &ldquo;{request.goal}&rdquo;
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(request.createdAt)}</span>
            {mood && <span className="capitalize">Mood: {mood}</span>}
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={onDecline}
            disabled={isPending}
            className="flex-1 md:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            disabled={isPending}
            className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-xl text-sm font-bold shadow-md shadow-[#D4AF37]/20 hover:shadow-lg transition-all disabled:opacity-50"
          >
            Accept ☀
          </button>
        </div>
      </div>
    </motion.div>
  );
}
