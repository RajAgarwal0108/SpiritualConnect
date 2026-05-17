'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { GuidanceSession } from '@/types/guidance';

interface SessionCardProps {
  session: GuidanceSession;
  isSeeker: boolean;
  lastMessage?: string;
  index?: number;
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

export function SessionCard({ session, isSeeker, lastMessage, index = 0 }: SessionCardProps) {
  const otherPerson = isSeeker ? session.guide : session.user;
  const mood = session.mood?.toLowerCase() || '';
  const isCompleted = session.status === 'COMPLETED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/guidance/session/${session.id}`} className="block group">
        <div className={`relative bg-white border ${isCompleted ? 'border-slate-200/60' : 'border-[#D4AF37]/10'} rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}>
          <div className={`absolute top-0 left-0 w-1 h-full ${isCompleted ? 'bg-slate-300' : 'bg-gradient-to-b from-[#D4AF37] to-[#B8860B]'} rounded-r`} />

          <div className="flex items-center gap-4 pl-2">
            <div className="relative shrink-0">
              <img
                src={otherPerson?.profile?.avatar || '/default-avatar.png'}
                alt={otherPerson?.name}
                className={`w-14 h-14 rounded-full object-cover ${isCompleted ? 'opacity-70 grayscale-[0.3]' : 'ring-2 ring-[#D4AF37]/10'}`}
              />
              {!isCompleted && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 group-hover:text-[#B8860B] transition-colors">
                  {otherPerson?.name || 'Unknown'}
                </h3>
                {isCompleted && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                    Completed
                  </span>
                )}
                {!isCompleted && isSeeker && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FBF7E9] text-[#B8860B] uppercase tracking-wider">
                    Your Guide
                  </span>
                )}
                {!isCompleted && !isSeeker && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 uppercase tracking-wider">
                    Seeking
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {otherPerson && 'guideTitle' in otherPerson && (otherPerson as any).guideTitle && (
                  <span className="text-xs text-slate-500">{(otherPerson as any).guideTitle}</span>
                )}
                {session.goal && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Sparkles size={10} /> {session.goal}
                  </span>
                )}
                {mood && moodEmoji[mood] && (
                  <span className="text-sm" title={mood}>{moodEmoji[mood]}</span>
                )}
              </div>

              {lastMessage && !isCompleted && (
                <p className="text-xs text-slate-400 mt-1.5 truncate max-w-[200px] md:max-w-[300px]">
                  {lastMessage}
                </p>
              )}

              <p className="text-[10px] text-slate-300 font-medium mt-1">
                Updated {timeAgo(session.updatedAt)}
              </p>
            </div>

            <div className="shrink-0 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
