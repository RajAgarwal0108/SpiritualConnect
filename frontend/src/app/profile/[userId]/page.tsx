"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/services/api";
import { getMediaUrl } from "@/lib/media";
import { useAuthStore } from "@/store/globalStore";
import { Loader2, Calendar, Edit, UserPlus, UserCheck, Sparkles, LogOut, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { Post, UserProfile } from "@/types";
import { motion } from "framer-motion";
import { SACRED_EASE, FADE_IN_UP } from "@/lib/motion-config";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import PostCard from "@/components/PostCard";
import React, { useState } from "react";

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posts" | "communities" | "bookmarks">("posts");
  
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const res = await api.get(`/users/${userId}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/users/${userId}/follow`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
    },
  });

  // Calculate ownership safe for hooks
  const profileIdString = Array.isArray(userId) ? userId[0] : userId;
  const isOwnProfile = currentUser?.id.toString() === profileIdString;

  // Query for bookmarked posts (only for own profile)  
  const { data: bookmarkedPosts = [], isLoading: isLoadingBookmarks } = useQuery({
    queryKey: ["bookmarkedPosts"],
    queryFn: async () => {
      const res = await api.get("/users/me/bookmarks");
      return res.data;
    },
    enabled: !!isOwnProfile && activeTab === "bookmarks"
  });

  // Query for user's posts
  const { data: userPosts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: async () => {
      const res = await api.get(`/posts/user/${userId}`);
      return res.data;
    },
    enabled: activeTab === "posts"
  });

  // Ensure loading state is handled AFTER all hooks are declared
  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-sacred-gold" size={40} /></div>;
  if (!profile) return <div className="text-center py-32 font-serif italic text-sacred-muted">The seeker could not be found.</div>;

  // Verify ownership with loaded profile to be extra sure (for UI rendering)
  // const isOwnProfileVerified = currentUser?.id === profile.id; 
  // We can use the calculated isOwnProfile which matches the hooks logic.

  return (
    <main className="max-w-4xl mx-auto py-16 px-4">
      <motion.div
        initial="initial"
        animate="animate"
        variants={FADE_IN_UP}
      >
        <Card className="overflow-hidden border-none shadow-[0_20px_50px_rgba(217,160,91,0.05)] bg-white">
          {/* Header/Cover */}
          <div className="h-64 bg-sacred-beige flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,160,91,0.1)_0,transparent_70%)]" />
            <Sparkles className="text-sacred-gold/20 absolute top-8 right-8" size={32} />
          </div>
          
          <div className="px-12 pb-12">
            <div className="relative flex justify-between items-end -mt-20 mb-10">
              <div className="w-40 h-40 rounded-4xl bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
                {profile.profile?.avatar ? (
                  <img src={getMediaUrl(profile.profile.avatar) as string} alt={profile.name} className="w-full h-full object-cover rounded-3xl" />
                ) : (
                  <div className="w-full h-full rounded-3xl bg-sacred-beige flex items-center justify-center text-sacred-gold text-5xl font-light">
                    {profile.name[0]}
                  </div>
                )}
              </div>
              <div className="flex space-x-4 mb-4">
                {isOwnProfile ? (
                  <div className="flex items-center space-x-3">
                    <a href="/settings/profile">
                      <Button variant="secondary" className="flex items-center space-x-2">
                        <Edit size={16} />
                        <span className="text-sm font-medium">Refine Presence</span>
                      </Button>
                    </a>
                  </div>
                ) : currentUser && (
                  <Button 
                    onClick={() => followMutation.mutate()}
                    variant={profile._count.followers > 0 ? "secondary" : "primary"}
                    className="min-w-35"
                  >
                    {followMutation.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : profile._count.followers > 0 ? (
                      <><UserCheck size={18} className="mr-2" /><span>Connected</span></>
                    ) : (
                      <><UserPlus size={18} className="mr-2" /><span>Connect</span></>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-light text-sacred-text tracking-tight">{profile.name}</h1>
                <span className="bg-sacred-beige px-3 py-1 rounded-full text-[10px] text-sacred-gold font-bold uppercase tracking-widest mt-1">Seeks Wisdom</span>
              </div>
              
              {profile.profile?.bio && (
                <p className="text-sacred-muted text-lg font-serif italic leading-relaxed max-w-2xl py-2 line-clamp-3">
                  "{profile.profile.bio}"
                </p>
              )}
              
              <div className="flex items-center space-x-2 text-sacred-muted/60 pt-2">
                <Calendar size={16} />
                <span className="text-[11px] font-bold uppercase tracking-widest">Walking the path since {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 pt-12 border-t border-sacred-gold/10">
              <div className="flex flex-col">
                <span className="text-2xl font-light text-sacred-text">{profile._count.followers}</span>
                <span className="text-[10px] text-sacred-muted/50 font-bold uppercase tracking-widest mt-1">Seekers</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-light text-sacred-text">{profile._count.following}</span>
                <span className="text-[10px] text-sacred-muted/50 font-bold uppercase tracking-widest mt-1">Following</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-light text-sacred-gold">{profile._count.posts}</span>
                <span className="text-[10px] text-sacred-muted/50 font-bold uppercase tracking-widest mt-1">Reflections</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-light text-sacred-text">{profile._count.memberships}</span>
                <span className="text-[10px] text-sacred-muted/50 font-bold uppercase tracking-widest mt-1">Circles</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs Section */}
        <div className="mt-12 space-y-8">
          <div className="flex items-center justify-between border-b border-sacred-gold/10 pb-4">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("posts")}
                className={`text-xl font-light font-serif italic transition-colors ${
                  activeTab === "posts"
                    ? "text-sacred-text border-b-2 border-sacred-gold pb-2"
                    : "text-sacred-muted hover:text-sacred-text"
                }`}
              >
                Soulful Posts
              </button>
              <button
                onClick={() => setActiveTab("communities")}
                className={`text-xl font-light font-serif italic transition-colors ${
                  activeTab === "communities"
                    ? "text-sacred-text border-b-2 border-sacred-gold pb-2"
                    : "text-sacred-muted hover:text-sacred-text"
                }`}
              >
                Circles of Belonging
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab("bookmarks")}
                  className={`text-xl font-light font-serif italic transition-colors flex items-center gap-2 ${
                    activeTab === "bookmarks"
                      ? "text-sacred-text border-b-2 border-sacred-gold pb-2"
                      : "text-sacred-muted hover:text-sacred-text"
                  }`}
                >
                  <Bookmark size={18} />
                  Sacred Bookmarks
                </button>
              )}
            </div>
            <span className="text-[10px] text-sacred-gold font-bold uppercase tracking-widest bg-sacred-beige px-3 py-1 rounded-full">
              {activeTab === "posts" 
                ? `${userPosts.length} Posts`
                : activeTab === "communities" 
                ? `${profile._count.memberships} Communities`
                : `${bookmarkedPosts.length} Saved`
              }
            </span>
          </div>

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div className="space-y-6">
              {isLoadingPosts ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-sacred-gold" size={32} />
                </div>
              ) : userPosts.length > 0 ? (
                <div className="grid gap-6">
                  {userPosts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-sacred-gold/10 rounded-4xl">
                  <Sparkles className="mx-auto text-sacred-gold/40 mb-4" size={48} />
                  <p className="text-sacred-muted italic font-serif text-lg">
                    {isOwnProfile ? "You haven't shared your wisdom yet..." : `${profile.name} hasn't shared any posts yet...`}
                  </p>
                  {isOwnProfile && (
                    <>
                      <p className="text-sacred-muted text-sm mt-2">
                        Join a community and start sharing your spiritual journey
                      </p>
                      <Button variant="secondary" className="mt-6" onClick={() => window.location.href = '/'}>
                        Discover Communities
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Communities Tab */}
          {activeTab === "communities" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.memberships && profile.memberships.length > 0 ? (
                profile.memberships.map((membership) => (
                  <motion.a 
                    key={membership.community.id}
                    href={`/communities/${membership.community.id}`}
                    whileHover={{ y: -4 }}
                    className="group block"
                  >
                    <Card className="p-6 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(217,160,91,0.08)] bg-white/50 backdrop-blur-sm border-sacred-gold/5">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-sacred-beige shrink-0 flex items-center justify-center text-sacred-gold text-2xl overflow-hidden">
                          {membership.community.image ? (
                            <img src={membership.community.image} alt={membership.community.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{membership.community.name[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-sacred-text group-hover:text-sacred-gold transition-colors truncate">
                            {membership.community.name}
                          </h3>
                          <p className="text-sacred-muted text-sm line-clamp-2 font-serif italic mt-1 leading-relaxed">
                            {membership.community.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.a>
                ))
              ) : (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-sacred-gold/10 rounded-4xl">
                  <p className="text-sacred-muted italic font-serif">Awaiting the call of a spiritual vessel...</p>
                  {isOwnProfile && (
                    <Button variant="secondary" className="mt-4" onClick={() => window.location.href = '/'}>
                      Discover Communities
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === "bookmarks" && isOwnProfile && (
            <div className="space-y-6">
              {isLoadingBookmarks ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-sacred-gold" size={32} />
                </div>
              ) : bookmarkedPosts.length > 0 ? (
                <div className="grid gap-6">
                  {bookmarkedPosts.map((post: Post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-sacred-gold/10 rounded-4xl">
                  <Bookmark className="mx-auto text-sacred-gold/40 mb-4" size={48} />
                  <p className="text-sacred-muted italic font-serif text-lg">No sacred texts saved yet...</p>
                  <p className="text-sacred-muted text-sm mt-2">
                    Bookmark inspiring posts to revisit them later
                  </p>
                  <Button variant="secondary" className="mt-6" onClick={() => window.location.href = '/'}>
                    Explore Feed
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
