'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { guidanceService } from '@/services/guidance.service';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function GuideProfilePage() {
  const { guideId } = useParams();
  const router = useRouter();

  const { data: guide, isLoading } = useQuery({
    queryKey: ['guide', guideId],
    queryFn: () => guidanceService.getGuideById(Number(guideId)),
    enabled: !!guideId,
  });

  const requestSession = useMutation({
    mutationFn: (id: number) => guidanceService.requestSession(id),
    onSuccess: () => {
      toast.success('Session requested successfully!');
      router.push('/profile/guidance');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to request session');
    }
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!guide) {
    return <div className="text-center py-20 text-gray-500">Guide not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-indigo-600"></div>
        <div className="px-8 pb-8 -mt-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex items-end gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-white shadow-md">
                <img 
                  src={guide.profile?.avatar || '/default-avatar.png'} 
                  alt={guide.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="pb-2">
                <h1 className="text-3xl font-bold text-gray-900">{guide.name}</h1>
                <p className="text-indigo-600 font-medium text-lg">{guide.guideTitle || 'Spiritual Guide'}</p>
              </div>
            </div>
            
            <button 
              onClick={() => requestSession.mutate(Number(guideId))}
              disabled={requestSession.isPending}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 min-w-[200px]"
            >
              {requestSession.isPending ? 'Requesting...' : 'Request 1-on-1 Guidance'}
            </button>
          </div>

          <div className="mt-8 space-y-6">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">About Me</h2>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {guide.guideBio || guide.profile?.bio || 'No bio available.'}
              </div>
            </section>
            
            <section className="bg-gray-50 p-6 rounded-xl">
               <h3 className="font-semibold text-gray-900 mb-2">How 1-on-1 Guidance Works</h3>
               <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                 <li>Request a session by clicking the button above.</li>
                 <li>The guide will review and accept your request.</li>
                 <li>Once accepted, you'll enter a private 1-on-1 chat room.</li>
                 <li>You have the option to share your phone number for external calls if needed.</li>
               </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}