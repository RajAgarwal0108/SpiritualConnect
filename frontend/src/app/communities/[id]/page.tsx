"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/globalStore";
import { Loader2, Users, LayoutGrid, Image as ImageIcon, UserCircle2, MessageCircle } from "lucide-react";
import { useState, useRef } from "react";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/Button";
import ChatSidebar from "@/components/ChatSidebar";
import { motion, AnimatePresence } from "framer-motion";

export default function CommunityHall() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "members">("posts");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: community, isLoading: isLoadingCommunity } = useQuery({
    queryKey: ["community", id],
    queryFn: async () => {
      const res = await api.get(`/communities/${id}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ["communityPosts", id],
    queryFn: async () => {
      const res = await api.get(`/communities/${id}/posts`);
      return res.data;
    },
    enabled: activeTab === "posts",
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000
  });

  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ["communityMembers", id],
    queryFn: async () => {
      const res = await api.get(`/communities/${id}/members`);
      return res.data;
    },
    enabled: activeTab === "members" && !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

  const { data: joinedCommunities = [], refetch: refetchJoined } = useQuery({
    queryKey: ["joinedCommunities"],
    queryFn: async () => {
      const res = await api.get("/communities/joined");
      return res.data || [];
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000 // 15 minutes
  });

  const isJoined = joinedCommunities.some((c: any) => c.id === parseInt(id as string));

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/communities/${id}/join`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["joinedCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["community", id] });
      refetchJoined();
    },
    onError: (error: any) => {
      console.error("Join error:", error.response?.data?.message || error.message);
    }
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/communities/${id}/leave`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["joinedCommunities"] });
      queryClient.invalidateQueries({ queryKey: ["community", id] });
      refetchJoined();
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (newPost: { content: string; media?: string; communityId: number; status?: string }) => {
      const res = await api.post("/posts", newPost);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts", id] });
      setContent("");
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  });

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;
    
    let mediaUrl: string | undefined = undefined;
    
    // Upload file if selected
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        mediaUrl = uploadRes.data.url;
      } catch (error) {
        console.error("Failed to upload file:", error);
        alert("Failed to upload file. Please try again.");
        return;
      }
    }
    
    createPostMutation.mutate({ 
      content, 
      media: mediaUrl,
      communityId: parseInt(id as string),
      status: "PUBLISHED"
    });
  };

  // Handle file selection and preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoadingCommunity) {
    return (
      <div className="flex justify-center items-center h-screen bg-sacred-beige/20">
        <Loader2 className="animate-spin text-sacred-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden relative bg-sacred-beige/10 text-sacred-text">

      {/* Main Hall */}
      <main className="flex-1 overflow-y-auto relative no-scrollbar bg-white/30">
        {/* Community Hero */}
        <div className="relative h-64 bg-sacred-gold/10 flex items-center justify-center overflow-hidden border-b border-white/20">
            <div className="absolute inset-0 opacity-5 pointer-events-none scale-150 rotate-12">
                <LayoutGrid size={200} />
            </div>
            <div className="text-center space-y-4 relative z-10 px-4">
                <h1 className="font-serif text-5xl font-bold tracking-tight text-sacred-text">{community?.name}</h1>
                <p className="text-sacred-muted italic max-w-lg mx-auto leading-relaxed">{community?.description}</p>
                
                <div className="flex items-center justify-center gap-6 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sacred-muted">
                        <Users size={14} className="text-sacred-gold" />
                        {community?.memberCount} Members
                    </div>
                    {!isJoined ? (
                        <Button 
                            onClick={() => joinMutation.mutate()} 
                            disabled={joinMutation.isPending || !user}
                            className="rounded-full px-8 bg-sacred-gold hover:bg-sacred-gold-dark text-white border-none shadow-md"
                        >
                            {joinMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Join Sangha"}
                        </Button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border border-green-200">
                                ✓ Joined Member
                            </span>
                            <Button 
                                onClick={() => leaveMutation.mutate()} 
                                disabled={leaveMutation.isPending}
                                className="rounded-full px-6 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 text-xs"
                            >
                                {leaveMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : "Leave"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Tab Selection (Simplified for now) */}
        <div className="sticky top-0 z-20 bg-white/60 backdrop-blur-xl border-b border-sacred-border/30 flex px-8">
            <div className="max-w-xl mx-auto flex gap-12">
                {[{key:"posts", label:"Discussion"}, {key:"members", label:"Members"}].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-4 border-b-2 font-bold text-sm uppercase tracking-widest transition-colors ${activeTab === tab.key ? "border-sacred-gold text-sacred-gold" : "border-transparent text-sacred-muted hover:text-sacred-text"}`}
                  >
                    {tab.label}
                  </button>
                ))}
            </div>
        </div>

        <div className="max-w-xl mx-auto py-12 px-4 space-y-12">
          {/* Composer for Posts or Discussions */}
      {isJoined && activeTab !== "members" && (
            <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-6 shadow-sm border border-white/40">
                <form onSubmit={handlePostSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-sacred-beige shrink-0 flex items-center justify-center font-bold text-sacred-text">
                            {user?.name[0]}
                        </div>
                        <textarea 
                            className="flex-1 bg-transparent border-none outline-none py-2 text-sacred-text placeholder:text-sacred-muted/60 font-serif italic text-lg resize-none min-h-25"
              placeholder={`Share your resonance with the ${community?.name.split(' ').pop()} Sangha`}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    
                    {/* Media Preview */}
                    {previewUrl && selectedFile && (
                      <div className="relative rounded-2xl overflow-hidden border border-sacred-border/30">
                        {selectedFile.type.startsWith("video/") ? (
                          <video src={previewUrl} controls className="w-full max-h-64 object-cover" />
                        ) : (
                          <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-cover" />
                        )}
                        <button 
                          type="button"
                          onClick={removeSelectedFile}
                          className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-sacred-border/20">
                        <div className="flex gap-4">
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sacred-muted hover:text-sacred-gold transition-colors flex items-center gap-2">
                                <ImageIcon size={18} />
                                <span className="text-xs font-medium">{selectedFile ? "Change Media" : "Add Media"}</span>
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                            {selectedFile && <span className="text-xs text-green-600 font-medium italic">{selectedFile.name}</span>}
                        </div>
            <Button type="submit" disabled={createPostMutation.isPending || (!content.trim() && !selectedFile)} className="px-8 py-2.5 rounded-full text-sm font-bold tracking-wide">
              {createPostMutation.isPending ? <Loader2 className="animate-spin" size={16}/> : <span>Post Experience</span>}
                        </Button>
                    </div>
                </form>
            </div>
          )}

          {/* Content per tab */}
          {activeTab === "posts" && (
            <div className="space-y-16 pb-20">
              {posts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
              ))}
              {posts.length === 0 && !isLoadingPosts && (
                  <div className="text-center py-24 bg-white/20 rounded-4xl border border-dashed border-sacred-border/50">
                      <p className="font-serif text-sacred-muted italic">No one has shared their reflection here yet.</p>
                      <p className="text-xs text-sacred-muted/60 mt-2 lowercase">Be the first to speak into the silence.</p>
                  </div>
              )}
              {isLoadingPosts && (
                  <div className="flex justify-center py-10">
                      <Loader2 className="animate-spin text-sacred-gold/40" size={32} />
                  </div>
              )}
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-4 pb-16">
              {members.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between bg-white/70 rounded-2xl border border-sacred-border/30 p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-sacred-beige flex items-center justify-center text-sacred-gold font-semibold">
                      {member.profile?.avatar ? (
                        <img src={member.profile.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle2 size={32} className="text-sacred-gold" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sacred-text">{member.name}</p>
                      <p className="text-sm text-sacred-muted line-clamp-1">{member.profile?.bio || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${member.id}`} className="text-sacred-gold text-sm font-semibold hover:underline">Profile</Link>
                    {user?.id !== member.id && (
                      <Link href={`/chat?userId=${member.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sacred-gold/40 text-sacred-gold text-sm hover:bg-sacred-gold hover:text-white transition-colors">
                        <MessageCircle size={16} /> Chat
                      </Link>
                    )}
                  </div>
                </div>
              ))}
              {members.length === 0 && !isLoadingMembers && (
                <div className="text-center py-20 bg-white/20 rounded-2xl border border-dashed border-sacred-border/50 text-sacred-muted">
                  No members yet.
                </div>
              )}
              {isLoadingMembers && (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-sacred-gold/40" size={32} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden xl:block w-80 shrink-0 h-full border-l border-sacred-border/50">
        <ChatSidebar />
      </aside>
    </div>
  );
}
