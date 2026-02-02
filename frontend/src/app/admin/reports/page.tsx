"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { Loader2, AlertTriangle, User, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminReportsPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ["adminReports"],
    queryFn: async () => {
      const res = await api.get("/admin/reports");
      return res.data;
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">User Reports</h2>
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
          {reports?.length} Reports
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Reporter</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Reported Content</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports?.map((report: any) => (
              <tr key={report.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <User size={14} className="text-gray-400" />
                    <span className="font-bold">{report.reporter.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 truncate max-w-xs">{report.post?.content || "Comment or Profile"}</div>
                </td>
                <td className="px-6 py-4 text-sm text-red-600 font-medium">
                  {report.reason}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={report.postId ? `/posts/${report.postId}` : "#"} 
                    className="text-indigo-600 hover:text-indigo-900 transition flex items-center justify-end space-x-1"
                  >
                    <span>View</span>
                    <ExternalLink size={14} />
                  </Link>
                </td>
              </tr>
            ))}
            {reports?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                  Everything is peaceful. No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
