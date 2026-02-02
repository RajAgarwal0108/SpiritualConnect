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
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-3xl font-black text-gray-900 mb-2">Content Archive</h3>
          <p className="text-gray-500 font-medium">Manage your contributions to the spiritual collective.</p>
        </div>
      </div>

      <section className="space-y-8">
        <div className="flex items-center space-x-4 border-b border-gray-100 pb-4">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`text-lg font-black pb-4 -mb-5 transition ${activeTab === 'posts' ? 'text-gray-900 border-b-4 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Soulful Posts
          </button>
          <button 
            onClick={() => setActiveTab('blogs')}
            className={`text-lg font-black pb-4 -mb-5 transition ${activeTab === 'blogs' ? 'text-gray-900 border-b-4 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
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
                className="bg-white border-2 border-gray-100 hover:border-indigo-100 rounded-3xl p-6 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{post.content.substring(0, 50)}...</h5>
                    <div className="flex items-center space-x-4 text-sm font-bold">
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

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                className="bg-white border-2 border-gray-100 hover:border-indigo-100 rounded-3xl p-6 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors overflow-hidden">
                    {blog.thumbnailUrl ? (
                      <img src={getMediaUrl(blog.thumbnailUrl) as string} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <BookOpen size={28} />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{blog.title}</h5>
                    <div className="flex items-center space-x-4 text-sm font-bold">
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

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
