"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/globalStore";
import { Loader2 } from "lucide-react";

export default function ProfileRoot() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace(`/profile/${user.id}`);
    } else {
      router.replace('/login');
    }
  }, [user, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-sacred-gold" size={36} />
    </div>
  );
}
