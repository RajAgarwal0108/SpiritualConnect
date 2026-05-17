'use client';

import { motion } from 'framer-motion';
import { Users, MessageCircle, CheckCircle, Heart } from 'lucide-react';

interface GuideStatsBarProps {
  totalSeekers: number;
  activeSessions: number;
  completedSessions: number;
}

const stats = [
  { key: 'seekers', label: 'Seekers Guided', icon: Users, color: 'from-blue-50 to-blue-100 text-blue-700 border-blue-200' },
  { key: 'active', label: 'Active Sanctuaries', icon: MessageCircle, color: 'from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200' },
  { key: 'completed', label: 'Sacred Journeys', icon: CheckCircle, color: 'from-amber-50 to-amber-100 text-amber-700 border-amber-200' },
  { key: 'impact', label: 'Impact Score', icon: Heart, color: 'from-rose-50 to-rose-100 text-rose-700 border-rose-200' },
];

export function GuideStatsBar({ totalSeekers, activeSessions, completedSessions }: GuideStatsBarProps) {
  const values = [totalSeekers, activeSessions, completedSessions, Math.min(totalSeekers + completedSessions, 99)];
  const icons = [Users, MessageCircle, CheckCircle, Heart];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s, i) => {
        const Icon = icons[i];
        return (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`bg-gradient-to-br ${s.color} border rounded-2xl p-4 flex items-center gap-3`}
          >
            <div className="shrink-0 w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center backdrop-blur-sm">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none">{values[i]}</p>
              <p className="text-[11px] font-semibold opacity-70 mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
