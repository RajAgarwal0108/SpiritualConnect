"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Loader2, Plus, Type, FileText, Tag, Clock, Image as ImageIcon, GraduationCap, DollarSign, BarChart } from "lucide-react";

export default function AdminCoursesPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "0",
    duration: "",
    level: "Beginner",
    category: "Philosophy",
    thumbnail: "",
    instructorId: ""
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (newCourse: typeof formData) => {
      const res = await api.post("/admin/courses", newCourse);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setFormData({
        title: "",
        description: "",
        price: "0",
        duration: "",
        level: "Beginner",
        category: "Philosophy",
        thumbnail: "",
        instructorId: ""
      });
      alert("New Dharma Course initiated!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-sacred-gold/10 rounded-2xl text-sacred-gold">
          <GraduationCap size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-sacred-text">Initiate Course</h1>
          <p className="text-sacred-muted mt-2">Design a structured path for seekers to follow.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-4xl border border-sacred-border shadow-sm space-y-8">
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-sacred-muted uppercase tracking-widest px-1">
              <Type size={14} /> Course Title
            </label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-sacred-beige/20 border border-sacred-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-sacred-gold/20 font-serif text-lg"
              placeholder="Foundation of Vedic Breath..."
            />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-sacred-muted uppercase tracking-widest px-1">
            <FileText size={14} /> Curriculum Description
          </label>
          <textarea 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full bg-sacred-beige/20 border border-sacred-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-sacred-gold/20 min-h-40 font-serif leading-relaxed"
            placeholder="What wisdom will seekers gain from this path?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-sacred-muted uppercase tracking-widest px-1">
              <DollarSign size={14} /> Energy Exchange (Price)
            </label>
            <input 
              type="number" 
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full bg-sacred-beige/20 border border-sacred-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-sacred-gold/20"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-sacred-muted uppercase tracking-widest px-1">
              <Clock size={14} /> Journey Duration
            </label>
            <input 
              type="text" 
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
              className="w-full bg-sacred-beige/20 border border-sacred-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-sacred-gold/20"
              placeholder="e.g. 12 Weeks"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-sacred-muted uppercase tracking-widest px-1">
              <BarChart size={14} /> Depth (Level)
            </label>
            <select 
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: e.target.value})}
              className="w-full bg-sacred-beige/20 border border-sacred-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-sacred-gold/20"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Mastery</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-sacred-muted uppercase tracking-widest px-1">
              <Tag size={14} /> Category
            </label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-sacred-beige/20 border border-sacred-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-sacred-gold/20"
            >
              <option>Philosophy</option>
              <option>Breathwork</option>
              <option>Meditation</option>
              <option>Scriptures</option>
              <option>Wellness</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-sacred-muted uppercase tracking-widest px-1">
              <ImageIcon size={14} /> Thumbnail URL
            </label>
            <input 
              type="text" 
              value={formData.thumbnail}
              onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
              className="w-full bg-sacred-beige/20 border border-sacred-border rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-sacred-gold/20"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        </div>

        <Button type="submit" disabled={createMutation.isPending || !formData.title || !formData.description} className="w-full py-6 rounded-2xl text-lg shadow-lg shadow-sacred-gold/20">
          {createMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Plus size={20} className="mr-2" />}
          Initiate Course
        </Button>
      </form>
    </div>
  );
}
