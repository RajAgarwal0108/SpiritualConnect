"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SettingsOverview() {
  const router = useRouter();

  // Redirect to profile settings by default
  useEffect(() => {
    router.replace("/settings/profile");
  }, [router]);

  return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-sacred-gold" size={32} />
    </div>
  );
}
