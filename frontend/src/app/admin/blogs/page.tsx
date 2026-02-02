"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Loader2, Plus, Type, FileText, Tag, Clock, Image as ImageIcon } from "lucide-react";

export default function AdminBlogsPage() {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Mindfulness",
    readTime: "5 min",
    coverImage: ""
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (newBlog: typeof formData) => {
      const res = await api.post("/admin/blogs", newBlog);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        category: "Mindfulness",
        readTime: "5 min",
        coverImage: ""
      });
      alert("Insight (Blog) published successfully!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div>
        <h1 className="text-4xl font-serif font-bold text-sacred-text">Publish Wisdom</h1>
        <p className="text-sacred-muted mt-2">Share deep insights with the global sanctuary.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-4xl border border-sacred-border shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-sacred-muted uppercase tracking-widest px-1">
              <Type size={14} /> Title
            </label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-sacred-beige/20 border border-sacred-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-sacred-gold/20 font-serif text-lg"
              placeholder="The silence between thoughts..."
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-sacred-muted uppercase tracking-widest px-1">
              <Tag size={14} /> Category
            </label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-sacred-beige/20 border border-sacred-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-sacred-gold/20"
            >
              <option>Mindfulness</option>
              <option>Ancient Wisdom</option>
              <option>Meditation</option>
              <option>Bhakti</option>
              <option>Yoga</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-sacred-muted uppercase tracking-widest px-1">
            <FileText size={14} /> Brief Excerpt
          </label>
          <input 
            type="text" 
            value={formData.excerpt}
            onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
            className="w-full bg-sacred-beige/20 border border-sacred-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-sacred-gold/20 italic font-serif"
            placeholder="A short glimpse into this teaching..."
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-sacred-muted uppercase tracking-widest px-1">
            <FileText size={14} /> Deep Content
          </label>
          <textarea 
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="w-full bg-sacred-beige/20 border border-sacred-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-sacred-gold/20 min-h-60 font-serif leading-relaxed"
            placeholder="Pour your insights here..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-sacred-muted uppercase tracking-widest px-1">
              <Clock size={14} /> Read Time
            </label>
            <input 
              type="text" 
              value={formData.readTime}
              onChange={(e) => setFormData({...formData, readTime: e.target.value})}
              className="w-full bg-sacred-beige/20 border border-sacred-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-sacred-gold/20"
              placeholder="e.g. 5 min"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-sacred-muted uppercase tracking-widest px-1">
              <ImageIcon size={14} /> Cover Image URL
            </label>
            <input 
              type="text" 
              value={formData.coverImage}
              onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
              className="w-full bg-sacred-beige/20 border border-sacred-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-sacred-gold/20"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        </div>

        <Button type="submit" disabled={createMutation.isPending || !formData.title || !formData.content} className="w-full py-6 rounded-2xl text-lg shadow-lg shadow-sacred-gold/20">
          {createMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Plus size={20} className="mr-2" />}
          Publish Insight
        </Button>
      </form>
    </div>
  );
}
