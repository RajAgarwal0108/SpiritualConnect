'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { guidanceService } from '@/services/guidance.service';
import { useAuthStore } from '@/store/globalStore';
import { GuideStatsBar } from '@/components/guidance/GuideStatsBar';
import { RequestCard } from '@/components/guidance/RequestCard';
import { SessionCard } from '@/components/guidance/SessionCard';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Sparkles, Users, Compass, ChevronDown, ChevronUp, HeartHandshake } from 'lucide-react';

export default function GuidanceDashboard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCompleted, setShowCompleted] = useState(false);

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['guidanceSessions'],
    queryFn: guidanceService.getSessions,
  });

  const { data: incomingReqs, isLoading: incomingLoading } = useQuery({
    queryKey: ['incomingSessions'],
    queryFn: guidanceService.getIncomingSessions,
    enabled: !!user && (user.isGuide === true || user.id === 1),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'REJECTED' }) =>
      guidanceService.respondToSession(id, status),
    onSuccess: () => {
      toast.success('Responded to request');
      queryClient.invalidateQueries({ queryKey: ['incomingSessions'] });
      queryClient.invalidateQueries({ queryKey: ['guidanceSessions'] });
    },
    onError: () => toast.error('Failed to respond'),
  });

  if (sessionsLoading || incomingLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isGuide = user?.isGuide || user?.id === 1;

  const activeSessions = sessions?.filter((s) => s.status === 'ACCEPTED') || [];
  const completedSessions = sessions?.filter((s) => s.status === 'COMPLETED') || [];
  const pendingSent = sessions?.filter((s) => s.status === 'PENDING' && Number(s.userId) === Number(user?.id)) || [];

  const uniqueSeekers = new Set(
    (sessions || []).filter((s) => s.guideId === user?.id).map((s) => s.userId)
  ).size;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Sacred Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">
                {isGuide ? 'My Sanctuary' : 'My Journey'}
              </h1>
              <span className="text-2xl">{isGuide ? '🕉' : '🧘'}</span>
            </div>
            <p className="text-slate-500 mt-1 text-sm">
              {isGuide
                ? 'Tend to the souls who have crossed your path.'
                : 'Walk your path with those who guide you.'}
            </p>
          </div>
          <div className="flex gap-2">
            {!isGuide && (
              <Link
                href="/guidance"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-xl text-sm font-bold shadow-md shadow-[#D4AF37]/20 hover:shadow-lg transition-all"
              >
                <Compass size={16} /> Find a Guide
              </Link>
            )}
            {isGuide && (
              <Link
                href="/guidance"
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D4AF37]/20 text-[#B8860B] rounded-xl text-sm font-bold hover:bg-[#FBF7E9] transition-all"
              >
                <Users size={16} /> Guides Directory
              </Link>
            )}
          </div>
        </motion.div>

        {/* Guide Stats */}
        {isGuide && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <GuideStatsBar
              totalSeekers={uniqueSeekers}
              activeSessions={activeSessions.length}
              completedSessions={completedSessions.length}
            />
          </motion.div>
        )}

        {/* ============ GUIDE VIEW ============ */}
        {isGuide && (
          <div className="space-y-8">
            {/* Incoming Requests */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#D4AF37]" />
                  Sacred Requests
                  {incomingReqs && incomingReqs.length > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {incomingReqs.length}
                    </span>
                  )}
                </h2>
              </div>
              {incomingReqs && incomingReqs.length > 0 ? (
                <div className="space-y-3">
                  {incomingReqs.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onAccept={() => respondMutation.mutate({ id: req.id, status: 'ACCEPTED' })}
                      onDecline={() => respondMutation.mutate({ id: req.id, status: 'REJECTED' })}
                      isPending={respondMutation.isPending}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white/60 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-300">
                    <HeartHandshake size={24} />
                  </div>
                  <p className="text-slate-500 font-medium text-sm">No incoming requests</p>
                  <p className="text-xs text-slate-400 mt-1">Your sanctuary is ready to welcome seekers.</p>
                </div>
              )}
            </motion.section>

            {/* Active Sanctuaries */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                Active Sanctuaries
                {activeSessions.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {activeSessions.length}
                  </span>
                )}
              </h2>
              {activeSessions.length > 0 ? (
                <div className="space-y-3">
                  {activeSessions.map((s, i) => (
                    <SessionCard key={s.id} session={s} isSeeker={false} index={i} />
                  ))}
                </div>
              ) : (
                <div className="bg-white/60 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
                  <p className="text-slate-400 text-sm">No active sessions yet. Accept a request to begin.</p>
                </div>
              )}
            </motion.section>

            {/* Completed Journeys */}
            {completedSessions.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-3"
                >
                  <h2 className="text-lg font-bold text-slate-500">Completed Journeys</h2>
                  <span className="text-xs font-bold text-slate-400">({completedSessions.length})</span>
                  {showCompleted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showCompleted && (
                  <div className="space-y-2">
                    {completedSessions.map((s, i) => (
                      <SessionCard key={s.id} session={s} isSeeker={false} index={i} />
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </div>
        )}

        {/* ============ SEEKER VIEW ============ */}
        {!isGuide && (
          <div className="space-y-8">
            {/* Active Guide */}
            {activeSessions.length > 0 ? (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <HeartHandshake size={18} className="text-[#D4AF37]" />
                  Your Guide
                </h2>
                <div className="space-y-3">
                  {activeSessions.map((s, i) => (
                    <SessionCard key={s.id} session={s} isSeeker={true} index={i} />
                  ))}
                </div>
              </motion.section>
            ) : (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-gradient-to-br from-[#FBF7E9] to-[#F1E4C3] border border-[#D4AF37]/20 rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 rounded-3xl bg-white/80 mx-auto flex items-center justify-center text-[#D4AF37] shadow-sm mb-4">
                  <Compass size={32} />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-800 mb-2">Begin Your Journey</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed mb-6">
                  A guide is a companion on your spiritual path. Browse our sacred guides and find the one who resonates with your heart.
                </p>
                <Link
                  href="/guidance"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-xl font-bold shadow-lg shadow-[#D4AF37]/20 hover:shadow-xl transition-all"
                >
                  <Sparkles size={16} /> Find Your Guide
                </Link>
              </motion.section>
            )}

            {/* Pending Sent Requests */}
            {pendingSent.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  Pending Requests
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {pendingSent.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {pendingSent.map((s, i) => (
                    <SessionCard key={s.id} session={s} isSeeker={true} index={i} />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Past Completed Sessions */}
            {completedSessions.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-3"
                >
                  <h2 className="text-lg font-bold text-slate-500">Past Sessions</h2>
                  <span className="text-xs font-bold text-slate-400">({completedSessions.length})</span>
                  {showCompleted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showCompleted && (
                  <div className="space-y-2">
                    {completedSessions.map((s, i) => (
                      <SessionCard key={s.id} session={s} isSeeker={true} index={i} />
                    ))}
                  </div>
                )}
              </motion.section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
