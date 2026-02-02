"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/globalStore";
import { useMutation } from "@tanstack/react-query";
import api from "@/services/api";
import { Shield, Lock, Eye, EyeOff, Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function AccountSettingsPage() {
  const { user, logout } = useAuthStore();
  const [isPrivate, setIsPrivate] = useState(false); // In real app, fetch from user data

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

  const togglePrivacyMutation = useMutation({
    mutationFn: async (private_state: boolean) => {
      await api.patch(`/users/${user?.id}/privacy`, { isPrivate: private_state });
    }
  });

  return (
    <div className="space-y-12">
      <div>
        <h3 className="text-3xl font-black text-gray-900 mb-2">Gatekeeping & Security</h3>
        <p className="text-gray-500 font-medium">Protect your spiritual journey and personal data.</p>
      </div>

      {/* Privacy Section */}
      <section className="bg-white border-2 border-gray-100 rounded-[2.5rem] p-8 space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Eye className="text-indigo-600" size={24} />
              <span>Incognito Mode</span>
            </h4>
            <p className="text-gray-500 font-medium max-w-md">
              When active, your profile, posts, and spiritual progress are only visible to your accepted followers.
            </p>
          </div>
          <button 
            onClick={() => {
              setIsPrivate(!isPrivate);
              togglePrivacyMutation.mutate(!isPrivate);
            }}
            className={`w-16 h-8 rounded-full transition-all duration-300 relative ${isPrivate ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${isPrivate ? 'left-9' : 'left-1'}`} />
          </button>
        </div>

        <div className="h-px bg-gray-100" />

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Shield className="text-indigo-600" size={24} />
              <span>Secured Communications</span>
            </h4>
            <p className="text-gray-500 font-medium max-w-md">
              Allow AI Assistant to use your profile context for more personalized guidance.
            </p>
          </div>
          <button className="w-16 h-8 rounded-full bg-indigo-600 relative">
            <div className="absolute top-1 left-9 w-6 h-6 bg-white rounded-full" />
          </button>
        </div>
      </section>

      {/* Password Section */}
      <section className="space-y-6">
        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Update Password</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <input 
              type="password"
              placeholder="Current Spiritual Shield (Password)"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
            />
            <input 
              type="password"
              placeholder="New Shield Strength"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-indigo-600 font-medium transition-all"
            />
            <button className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition text-sm">
              Update Shield
            </button>
          </div>
          <div className="bg-indigo-50/50 rounded-4xl p-6 border-2 border-indigo-100 flex items-start space-x-4">
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
      <section className="pt-8 border-t border-red-50 flex items-center justify-between">
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
          className="border-2 border-red-100 text-red-600 px-8 py-3 rounded-2xl font-bold hover:bg-red-50 transition flex items-center space-x-2"
        >
          {deactivateMutation.isPending && <Loader2 className="animate-spin" size={18} />}
          <span>Deactivate</span>
        </button>
      </section>
    </div>
  );
}
