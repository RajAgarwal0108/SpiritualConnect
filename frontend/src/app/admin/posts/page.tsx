"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Loader2, Trash2, MessageSquare, Heart, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminPostsPage() {
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["adminPosts"],
    queryFn: async () => {
      const res = await api.get("/admin/posts");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      await api.delete(`/admin/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPosts"] });
      alert("Post deleted");
    }
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Content Moderation</h2>
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
          {posts?.length} Total Posts
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Author</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Content Preview</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Stats</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts?.map((post: any) => (
              <tr key={post.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-xs">
                      {post.author.name[0]}
                    </div>
                    <div className="text-sm font-bold text-gray-900">{post.author.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 truncate max-w-xs">{post.content}</div>
                  <div className="text-[10px] text-gray-400 mt-1">{new Date(post.createdAt).toLocaleString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4 text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Heart size={14} />
                      <span className="text-xs">{post._count.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare size={14} />
                      <span className="text-xs">{post._count.comments}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <Link 
                      href={`/profile/${post.authorId}`}
                      className="text-gray-400 hover:text-indigo-600 transition p-2"
                    >
                      <ExternalLink size={18} />
                    </Link>
                    <button 
                      onClick={() => confirm("Delete this post?") && deleteMutation.mutate(post.id)}
                      className="text-gray-400 hover:text-red-600 transition p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
