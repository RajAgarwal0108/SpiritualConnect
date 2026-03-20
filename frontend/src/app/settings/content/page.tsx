"use client";

import { useAuthStore } from "@/store/globalStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { FileText, BookOpen, Trash2, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { getMediaUrl } from '@/lib/media';

export default function ContentManagementPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'posts' | 'blogs'>('posts');

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["user-posts", user?.id],
    queryFn: async () => {
      const res = await api.get(`/posts/user/${user?.id}`);
      return res.data;
    },
    enabled: !!user?.id
  });

  const { data: blogs, isLoading: blogsLoading } = useQuery({
    queryKey: ["user-blogs", user?.id],
    queryFn: async () => {
      const res = await api.get(`/blogs/user/${user?.id}`);
      return res.data;
    },
    enabled: !!user?.id
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'post' | 'blog', id: string }) => {
      await api.delete(`/${type}s/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["user-blogs"] });
    }
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-6 md:space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Content Archive</h3>
          <p className="text-gray-500 font-medium">Manage your contributions to the spiritual collective.</p>
        </div>
      </div>

      <section className="space-y-5 md:space-y-8">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-3 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`text-base md:text-lg font-black pb-3 -mb-4 transition whitespace-nowrap ${activeTab === 'posts' ? 'text-gray-900 border-b-4 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Soulful Posts
          </button>
          <button 
            onClick={() => setActiveTab('blogs')}
            className={`text-base md:text-lg font-black pb-3 -mb-4 transition whitespace-nowrap ${activeTab === 'blogs' ? 'text-gray-900 border-b-4 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Wisdom Blogs
          </button>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          key={activeTab}
          className="grid grid-cols-1 gap-4"
        >
          {activeTab === 'posts' ? (
            posts?.map((post: any) => (
              <motion.div 
                key={post.id}
                variants={item}
                className="bg-white border-2 border-gray-100 hover:border-indigo-100 rounded-3xl p-4 md:p-6 transition-all group flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 md:space-x-6 min-w-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                    <FileText size={28} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-base md:text-xl font-bold text-gray-900 mb-1 line-clamp-1">{post.content.substring(0, 50)}...</h5>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm font-bold">
                      <span className="flex items-center text-gray-400">
                        <Clock size={14} className="mr-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center text-emerald-500 bg-emerald-50 px-3 py-0.5 rounded-full">
                        <CheckCircle size={14} className="mr-1" />
                        Published
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                  <button 
                    onClick={() => confirm("Delete this piece of wisdom?") && deleteMutation.mutate({ type: 'post', id: post.id })}
                    className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            blogs?.map((blog: any) => (
              <motion.div 
                key={blog.id}
                variants={item}
                className="bg-white border-2 border-gray-100 hover:border-indigo-100 rounded-3xl p-4 md:p-6 transition-all group flex items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 md:space-x-6 min-w-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors overflow-hidden shrink-0">
                    {blog.thumbnailUrl ? (
                      <img src={getMediaUrl(blog.thumbnailUrl) as string} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <BookOpen size={28} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-base md:text-xl font-bold text-gray-900 mb-1 line-clamp-1">{blog.title}</h5>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm font-bold">
                      <span className="flex items-center text-gray-400">
                        <Clock size={14} className="mr-1" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center text-indigo-500 bg-indigo-50 px-3 py-0.5 rounded-full">
                        <BookOpen size={14} className="mr-1" />
                        Blog
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                  <button 
                    onClick={() => confirm("Delete this wisdom blog?") && deleteMutation.mutate({ type: 'blog', id: blog.id })}
                    className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
          
          {((activeTab === 'posts' && (!posts || posts.length === 0)) || (activeTab === 'blogs' && (!blogs || blogs.length === 0))) && !postsLoading && !blogsLoading && (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                {activeTab === 'posts' ? <FileText size={40} /> : <BookOpen size={40} />}
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Silence is Wisdom, but your voice matters.</p>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
