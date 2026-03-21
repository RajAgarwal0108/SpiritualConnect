'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guidanceService } from '@/services/guidance.service';
import { useAuthStore } from '@/store/globalStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminGuidesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, router]);

  const { data: applications, isLoading } = useQuery({
    queryKey: ['adminGuideApplications'],
    queryFn: guidanceService.getAdminApplications,
    enabled: user?.role === 'ADMIN',
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) => 
      guidanceService.reviewAdminApplication(id, status),
    onSuccess: () => {
      toast.success('Application reviewed.');
      queryClient.invalidateQueries({ queryKey: ['adminGuideApplications'] });
    },
    onError: () => toast.error('Failed to review application.'),
  });

  if (isLoading || !user || user.role !== 'ADMIN') {
    return <div className="flex justify-center p-20">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Review Guide Applications</h1>
      
      {applications?.length === 0 ? (
        <div className="p-8 bg-gray-50 border border-dashed rounded-xl text-center text-gray-500">
           No pending applications to review.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Applicant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Report / Bio</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Document</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Applied Date</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications?.map(app => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{app.user?.name}</p>
                    <p className="text-sm text-gray-500">{app.user?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 max-w-sm truncate" title={app.reportText}>
                      {app.reportText}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {app.documentUrl ? (
                      <a 
                        href={app.documentUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline text-sm font-medium"
                      >
                        View Credential ↗
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No Document</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => reviewMutation.mutate({ id: app.id, status: 'APPROVED' })}
                      disabled={reviewMutation.isPending}
                      className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reviewMutation.mutate({ id: app.id, status: 'REJECTED' })}
                      disabled={reviewMutation.isPending}
                      className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-medium"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}