"use client";

import { } from "react";
import { useAuthStore } from "@/store/globalStore";
import { useMutation } from "@tanstack/react-query";
import api from "@/services/api";
import { Lock, Trash2, Loader2 } from "lucide-react";

export default function AccountSettingsPage() {
  const { user, logout } = useAuthStore();
  const deactivateMutation = useMutation({
    mutationFn: async () => {
      await api.delete("/auth/deactivate");
    },
    onSuccess: () => {
      alert("Account deactivated. We hope to see you back soon.");
      logout();
      window.location.href = "/";
    },
  });

  return (
    <div className="space-y-6 md:space-y-12">
      <div>
        <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Gatekeeping & Security</h3>
        <p className="text-gray-500 font-medium">Protect your spiritual journey and personal data.</p>
      </div>

      {/* (Removed Incognito Mode and Secured Communications per request) */}

      {/* Password Section */}
      <section className="space-y-4 md:space-y-6">
        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Update Password</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <input 
              type="password"
              placeholder="Current Spiritual Shield (Password)"
              className="w-full bg-gray-50 border-none rounded-2xl py-3.5 md:py-4 px-4 md:px-6 focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
            />
            <input 
              type="password"
              placeholder="New Shield Strength"
              className="w-full bg-gray-50 border-none rounded-2xl py-3.5 md:py-4 px-4 md:px-6 focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
            />
            <button className="w-full md:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition text-sm">
              Update Shield
            </button>
          </div>
          <div className="bg-indigo-50/50 rounded-3xl md:rounded-4xl p-4 md:p-6 border-2 border-indigo-100 flex items-start space-x-4">
            <div className="bg-white p-3 rounded-2xl text-indigo-600 shadow-sm">
              <Lock size={20} />
            </div>
            <p className="text-sm text-indigo-900 font-medium leading-relaxed">
              We recommend using a unique "Mantra" (strong password) of at least 12 characters, including specific symbols for higher protection.
            </p>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="pt-6 md:pt-8 border-t border-red-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xl font-bold text-red-600 flex items-center space-x-2">
            <Trash2 size={24} />
            <span>Abandon Identity</span>
          </h4>
          <p className="text-gray-500 font-medium">
            Deactivate your account. Your data is preserved for 30 days before total soul-cleansing (deletion).
          </p>
        </div>
        <button 
          onClick={() => {
            if(confirm("Are you sure you want to deactivate your account?")) {
              deactivateMutation.mutate();
            }
          }}
          className="w-full md:w-auto border-2 border-red-100 text-red-600 px-8 py-3 rounded-2xl font-bold hover:bg-red-50 transition flex items-center justify-center space-x-2"
        >
          {deactivateMutation.isPending && <Loader2 className="animate-spin" size={18} />}
          <span>Deactivate</span>
        </button>
      </section>
    </div>
  );
}
