"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockData = [
  { name: "Mon", users: 400, posts: 240 },
  { name: "Tue", users: 300, posts: 139 },
  { name: "Wed", users: 200, posts: 980 },
  { name: "Thu", users: 278, posts: 390 },
  { name: "Fri", users: 189, posts: 480 },
  { name: "Sat", users: 239, posts: 380 },
  { name: "Sun", users: 349, posts: 430 },
];

export default function EngagementChart() {
  return (
    <div className="lg:col-span-2 bg-white p-4 md:p-8 rounded-3xl md:rounded-4xl border-2 border-gray-50 shadow-sm">
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
      <div className="h-56 md:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }} dy={10} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)", padding: "12px" }}
              itemStyle={{ fontWeight: 800, fontSize: "12px" }}
            />
            <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
