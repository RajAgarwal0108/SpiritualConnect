"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Loader2, Compass, Plus, Trash2, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface Community {
  id: number;
  name: string;
  description: string;
}

export default function AdminCommunitiesPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: communities = [], isLoading } = useQuery<Community[]>({
    queryKey: ["adminCommunities"],
    queryFn: async () => {
      const res = await api.get("/communities");
      return res.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newCommunity: { name: string; description: string }) => {
      const res = await api.post("/communities", newCommunity);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCommunities"] });
      setName("");
      setDescription("");
      alert("Community created!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/communities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCommunities"] });
      alert("Community removed from sanctuary.");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to delete community");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name, description });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sacred-gold" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-sacred-text">Manage Communities</h1>
        <p className="text-sacred-muted mt-2">Create and organize spiritual circles.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-sacred-border shadow-sm">
        <h3 className="text-lg font-bold mb-4">Create New Community</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-sacred-muted uppercase tracking-wider mb-2">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-sacred-beige/20 border border-sacred-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-sacred-gold/20"
              placeholder="e.g. 🧘 Yoga"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-sacred-muted uppercase tracking-wider mb-2">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-sacred-beige/20 border border-sacred-border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-sacred-gold/20 min-h-25"
              placeholder="Describe the essence of this circle..."
            />
          </div>
          <Button type="submit" disabled={createMutation.isPending || !name} className="w-full">
            {createMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Plus size={18} className="mr-2" />}
            Create Community
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-sacred-border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-sacred-beige/20">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-sacred-muted uppercase tracking-widest">Community</th>
              <th className="px-6 py-4 text-xs font-bold text-sacred-muted uppercase tracking-widest">Description</th>
              <th className="px-6 py-4 text-right pr-10 text-xs font-bold text-sacred-muted uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sacred-border/10">
            {communities.map((c) => (
              <tr key={c.id} className="hover:bg-sacred-beige/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-sacred-text">{c.name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-sacred-muted">
                  <p className="line-clamp-1">{c.description}</p>
                </td>
                <td className="px-6 py-4 text-right pr-6 space-x-2">
                  <Link 
                    href={`/admin/communities/${c.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sacred-gold/10 text-sacred-gold text-xs font-bold hover:bg-sacred-gold hover:text-white transition-all"
                  >
                    <ExternalLink size={14} /> Manage
                  </Link>
                  <button 
                    onClick={() => confirm("Are you sure you want to remove this community and all its content?") && deleteMutation.mutate(c.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-sacred-muted hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Delete Community"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
