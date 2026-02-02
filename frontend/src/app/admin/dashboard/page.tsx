"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Loader2, TrendingUp, Users, FileText, BookOpen, AlertCircle, ArrowUpRight, ArrowDownRight, Activity, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'Mon', users: 400, posts: 240 },
  { name: 'Tue', users: 300, posts: 139 },
  { name: 'Wed', users: 200, posts: 980 },
  { name: 'Thu', users: 278, posts: 390 },
  { name: 'Fri', users: 189, posts: 480 },
  { name: 'Sat', users: 239, posts: 380 },
  { name: 'Sun', users: 349, posts: 430 },
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    },
  });

  if (isLoading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-sacred-gold" size={40} />
      <p className="text-sacred-muted font-serif italic animate-pulse">Gathering Sanctuary Data...</p>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-serif font-semibold text-sacred-text tracking-tight">Ecosystem Health</h2>
          <p className="text-sacred-muted font-medium mt-1">A high-level view of the spiritual sanctuary.</p>
        </div>
        <div className="flex items-center space-x-2 bg-sacred-gold/10 text-sacred-gold px-5 py-2.5 rounded-2xl font-semibold text-sm border border-sacred-gold/20">
          <Activity size={18} />
          <span>System Sync Active</span>
        </div>
      </div>
      
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Seekers", val: stats?.userCount, icon: Users, color: "sacred-gold", trend: "+12%" },
          { label: "Reflections", val: stats?.postCount, icon: FileText, color: "emerald", trend: "+5.4%" },
          { label: "Circles", val: stats?.communityCount, icon: Compass, color: "amber", trend: "Stable" },
          { label: "Alerts", val: stats?.reportCount || 0, icon: AlertCircle, color: "rose", trend: "Normal" }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-4xl border border-sacred-border shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-${item.color === 'sacred-gold' ? 'sacred-gold/10' : item.color + '-50'} flex items-center justify-center text-${item.color === 'sacred-gold' ? 'sacred-gold' : item.color + '-600'} mb-6 group-hover:scale-110 transition-transform`}>
              <item.icon size={28} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-sacred-muted text-xs font-bold uppercase tracking-[0.15em]">{item.label}</h3>
                <p className="text-4xl font-serif font-semibold text-sacred-text mt-2">{item.val}</p>
              </div>
              <div className={`flex items-center text-xs font-bold ${item.trend.startsWith('+') ? 'text-emerald-500' : item.trend === 'Normal' ? 'text-sacred-muted' : 'text-rose-500'}`}>
                {item.trend}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-4xl border-2 border-gray-50 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900">Engagement Flow</h3>
              <p className="text-sm font-medium text-gray-400">Activity trends over the last 7 days</p>
            </div>
            <select className="bg-gray-50 border-none rounded-xl text-sm font-bold px-4 py-2 focus:ring-2 focus:ring-indigo-600 transition">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Moderation Queue */}
        <div className="bg-gray-900 rounded-4xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2">Gatekeeper Hub</h3>
            <p className="text-gray-400 text-sm font-medium mb-8">Pending actions requiring attention.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition group cursor-pointer">
                <div>
                  <p className="text-sm font-bold">Unresolved Reports</p>
                  <p className="text-[10px] uppercase font-black text-orange-400 tracking-tighter">Immediate Review Required</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-xs">
                  {stats?.reportCount || 0}
                </div>
              </div>
            </div>

            <button className="w-full mt-8 bg-white text-gray-900 py-4 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition">
              Enterprise Dashboard
            </button>
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
