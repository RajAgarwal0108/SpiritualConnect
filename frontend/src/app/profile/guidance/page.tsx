'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guidanceService } from '@/services/guidance.service';
import { useAuthStore } from '@/store/globalStore';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function GuidanceDashboard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['guidanceSessions'],
    queryFn: guidanceService.getSessions,
  });

  const { data: incomingReqs, isLoading: incomingLoading } = useQuery({
    queryKey: ['incomingSessions'],
    queryFn: guidanceService.getIncomingSessions,
    // Try both checks in case state is refreshing
    enabled: !!user && (user.isGuide === true || (Number(user.id) === 1)), 
  });

  const { data: myRequests, isLoading: myRequestsLoading } = useQuery({
    queryKey: ['myRequests'],
    queryFn: guidanceService.getSessions, // This returns all sessions where I am seeker or guide
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'REJECTED' }) => 
      guidanceService.respondToSession(id, status),
    onSuccess: () => {
      toast.success('Responded to request');
      queryClient.invalidateQueries({ queryKey: ['incomingSessions'] });
      queryClient.invalidateQueries({ queryKey: ['guidanceSessions'] });
    },
    onError: () => {
      toast.error('Failed to respond');
    }
  });

  if (sessionsLoading || incomingLoading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const isGuideUser = user?.isGuide || Number(user?.id) === 1;

  // Separate active sessions from pending requests sent by user
  const activeSessions = sessions?.filter(s => s.status === 'ACCEPTED') || [];
  const pendingSentRequests = sessions?.filter(s => s.status === 'PENDING' && Number(s.userId) === Number(user?.id)) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Guidance Dashboard</h1>
        {!isGuideUser && (
          <Link href="/guidance" className="text-indigo-600 font-medium hover:underline text-sm md:text-base">
            Find more Guides
          </Link>
        )}
      </div>

      {/* Guide View: Incoming Requests */}
      {isGuideUser && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Incoming Requests</h2>
          {incomingReqs && incomingReqs.length > 0 ? (
            <div className="space-y-4">
              {incomingReqs.map(req => (
                <div key={req.id} className="bg-white border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <img 
                      src={req.user?.profile?.avatar || '/default-avatar.png'} 
                      alt={req.user?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{req.user?.name}</p>
                      <p className="text-sm text-gray-500">Requested a session with you</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button 
                      className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                      onClick={() => respondMutation.mutate({ id: req.id, status: 'ACCEPTED' })}
                      disabled={respondMutation.isPending}
                    >
                      Accept
                    </button>
                    <button 
                      className="flex-1 md:flex-none px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
                      onClick={() => respondMutation.mutate({ id: req.id, status: 'REJECTED' })}
                      disabled={respondMutation.isPending}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-gray-500 py-4 bg-gray-50 rounded-xl text-center border border-dashed">
               No pending requests at the moment.
             </div>
          )}
        </div>
      )}

      {/* Seeker View: My Sent Requests */}
      {!isGuideUser && pendingSentRequests.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Your Sent Requests</h2>
          <div className="space-y-4">
            {pendingSentRequests.map(req => (
              <div key={req.id} className="bg-white border rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm opacity-75">
                <div className="flex items-center gap-4">
                  <img 
                    src={req.guide?.profile?.avatar || '/default-avatar.png'} 
                    alt={req.guide?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{req.guide?.name}</p>
                    <p className="text-sm text-gray-500">{req.guide?.guideTitle || 'Spiritual Guide'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    Pending
                  </span>
                  <p className="text-xs text-gray-400 font-medium whitespace-nowrap">Waiting for response...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Active Sessions</h2>
        {activeSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map(session => {
              const sessionUserId = Number(session.userId);
              const currentUserId = Number(user?.id);
              const isSeeker = sessionUserId === currentUserId;
              const otherPerson = isSeeker ? session.guide : session.user;
              
              return (
                <Link key={session.id} href={`/guidance/session/${session.id}`}>
                  <div className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition flex items-center gap-4">
                    <img 
                      src={otherPerson?.profile?.avatar || '/default-avatar.png'} 
                      alt={otherPerson?.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{otherPerson?.name}</p>
                      <p className="text-xs text-gray-500">
                        {isSeeker ? 'Your Guide' : 'Your Seeker'}
                      </p>
                    </div>
                    <div className="text-indigo-600 text-sm font-medium flex items-center">
                      Join Chat <span className="ml-1 text-lg">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-500 py-8 bg-gray-50 rounded-xl text-center border border-dashed">
             {isGuideUser 
               ? "You don't have any active guidance sessions with seekers." 
               : "You don't have any active guidance sessions. Find a guide to get started!"}
          </div>
        )}
      </div>
    </div>
  );
}