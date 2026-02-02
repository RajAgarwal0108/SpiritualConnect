"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Loader2, Users, FileText, Trash2, ArrowLeft, UserCircle2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminCommunityDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: community, isLoading: isLoadingComm } = useQuery({
    queryKey: ["adminCommunityDetail", id],
    queryFn: async () => {
      const res = await api.get(`/communities/${id}`);
      return res.data;
    },
  });

  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ["adminCommunityMembers", id],
    queryFn: async () => {
      const res = await api.get(`/communities/${id}/members`);
      return res.data;
    },
  });

  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ["adminCommunityPosts", id],
    queryFn: async () => {
      const res = await api.get(`/communities/${id}/posts`);
      // Note: Backend returns an array directly based on current search
      return res.data;
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await api.delete(`/admin/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCommunityPosts", id] });
      alert("Reflection removed from sanctuary.");
    }
  });

  if (isLoadingComm) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sacred-gold" /></div>;
  if (!community) return <div className="text-center py-20 font-serif italic">Community not found.</div>;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-sacred-gold/10 text-sacred-muted transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-serif font-bold text-sacred-text">{community.name}</h1>
            <p className="text-sacred-muted">Managing Circle Ecosystem</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="bg-white px-6 py-2 rounded-2xl border border-sacred-border flex items-center gap-2">
              <Users size={16} className="text-sacred-gold" />
              <span className="text-sm font-bold text-sacred-text">{community._count?.members || 0} Members</span>
           </div>
           <div className="bg-white px-6 py-2 rounded-2xl border border-sacred-border flex items-center gap-2">
              <FileText size={16} className="text-sacred-gold" />
              <span className="text-sm font-bold text-sacred-text">{community._count?.posts || 0} Posts</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Members List */}
        <div className="space-y-6">
          <h3 className="text-xl font-serif font-bold text-sacred-text flex items-center gap-2">
            <Users size={20} className="text-sacred-gold" />
            Active Members
          </h3>
          <div className="bg-white rounded-3xl border border-sacred-border shadow-sm overflow-hidden">
             {isLoadingMembers ? (
               <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-sacred-gold/40" /></div>
             ) : members.length === 0 ? (
               <div className="p-8 text-center text-sacred-muted italic">No members found.</div>
             ) : (
               <div className="divide-y divide-sacred-border/10">
                 {members.map((member: any) => (
                   <div key={member.id} className="p-4 flex items-center justify-between hover:bg-sacred-beige/5 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sacred-beige flex items-center justify-center text-sacred-gold font-bold">
                           {member.profile?.avatar ? (
                             <img src={member.profile.avatar} alt={member.name} className="w-full h-full object-cover rounded-xl" />
                           ) : member.name[0]}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-sacred-text">{member.name}</p>
                           <p className="text-[11px] text-sacred-muted uppercase tracking-wider">{member.role || 'Member'}</p>
                        </div>
                     </div>
                     <Link href={`/profile/${member.id}`} className="text-xs font-bold text-sacred-gold hover:underline">View Profile</Link>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Posts Management */}
        <div className="space-y-6">
          <h3 className="text-xl font-serif font-bold text-sacred-text flex items-center gap-2">
            <FileText size={20} className="text-sacred-gold" />
            Recent Reflections
          </h3>
          <div className="space-y-4">
             {isLoadingPosts ? (
               <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-sacred-gold/40" /></div>
             ) : posts.length === 0 ? (
               <div className="p-8 bg-white rounded-3xl border border-dashed border-sacred-border text-center text-sacred-muted italic">No posts found in this circle.</div>
             ) : (
               posts.map((post: any) => (
                 <div key={post.id} className="bg-white p-5 rounded-3xl border border-sacred-border shadow-sm flex items-start justify-between group">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-sacred-muted uppercase tracking-widest">{post.author.name}</span>
                          <span className="w-1 h-1 rounded-full bg-sacred-border" />
                          <span className="text-[10px] text-sacred-muted">{new Date(post.createdAt).toLocaleDateString()}</span>
                       </div>
                       <p className="text-sm text-sacred-text line-clamp-2 leading-relaxed">{post.content}</p>
                    </div>
                    <button 
                      onClick={() => confirm("Remove this reflection?") && deletePostMutation.mutate(post.id)}
                      disabled={deletePostMutation.isPending}
                      className="p-2 text-sacred-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                       <Trash2 size={16} />
                    </button>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
