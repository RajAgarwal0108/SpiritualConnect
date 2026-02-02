"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Loader2, Trash2, UserCheck, Shield, ExternalLink } from "lucide-react";
import { getMediaUrl } from "@/lib/media";
import Link from "next/link";
import { useAuthStore } from "@/store/globalStore";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const { data: users, isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await api.get("/admin/users");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      alert("User deleted");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to delete user");
    }
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Manage Users</h2>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
          {users?.length} Total
        </span>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">User</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Joined</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users?.map((user: any) => (
            <tr key={user.id} className="hover:bg-gray-50 transition group">
              <td className="px-6 py-4">
                <Link href={`/profile/${user.id}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center text-indigo-700 font-bold">
                    {user.profile?.avatar ? (
                      <img 
                        src={getMediaUrl(user.profile.avatar) as string} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name[0]
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-1">
                      {user.name}
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 text-sacred-gold transition-opacity" />
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 w-fit ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.role === 'ADMIN' && <Shield size={12} />}
                  <span>{user.role}</span>
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => confirm("Delete this user?") && deleteMutation.mutate(user.id)}
                  disabled={user.id === currentUser?.id || deleteMutation.isPending}
                  className={`p-2 transition h-10 w-10 flex items-center justify-center rounded-xl ${
                    user.id === currentUser?.id 
                      ? 'text-gray-200 cursor-not-allowed' 
                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                  }`}
                  title={user.id === currentUser?.id ? "You cannot delete yourself" : "Delete user"}
                >
                  {deleteMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 size={20} />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
