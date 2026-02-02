"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Loader2, TrendingUp, BarChart3, PieChart } from "lucide-react";

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics");
      return res.data;
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <TrendingUp size={20} className="text-green-500" />
            <span>User Growth</span>
          </h3>
          <div className="h-64 bg-gray-50 rounded-2xl flex items-end justify-between px-8 py-6 space-x-2 overflow-hidden">
            {analytics?.map((d: any, i: number) => (
              <div 
                key={i} 
                className="bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600 cursor-pointer w-full"
                style={{ height: `${(d.users / 60) * 100}%` }}
                title={`${d.date}: ${d.users} users`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-bold uppercase">
            <span>Start</span>
            <span>Current Month</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <BarChart3 size={20} className="text-purple-500" />
            <span>Content Production</span>
          </h3>
          <div className="h-64 bg-gray-50 rounded-2xl flex items-end justify-between px-8 py-6 space-x-2 overflow-hidden">
            {analytics?.map((d: any, i: number) => (
              <div 
                key={i} 
                className="bg-purple-500 rounded-t-lg transition-all duration-500 hover:bg-purple-600 cursor-pointer w-full"
                style={{ height: `${(d.posts / 120) * 100}%` }}
                title={`${d.date}: ${d.posts} posts`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-bold uppercase">
            <span>Start</span>
            <span>Current Month</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Demographics & Engagement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-50 rounded-2xl text-center">
            <p className="text-gray-500 text-sm font-bold uppercase">Avg Posts / User</p>
            <p className="text-3xl font-black text-indigo-900 mt-2">4.2</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl text-center">
            <p className="text-gray-500 text-sm font-bold uppercase">Daily Active Users</p>
            <p className="text-3xl font-black text-indigo-900 mt-2">82%</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl text-center">
            <p className="text-gray-500 text-sm font-bold uppercase">Retention Rate</p>
            <p className="text-3xl font-black text-indigo-900 mt-2">95%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
