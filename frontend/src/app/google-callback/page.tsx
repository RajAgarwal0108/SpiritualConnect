// src/app/google-callback/page.tsx
"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/services/api"; // Your axios instance
import { useAuthStore } from "@/store/globalStore";

export default function GoogleCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  
  useEffect(() => {
    const code = searchParams.get("code");
    
    if (code) {
      // Send the code to your backend immediately
      api.post("/auth/google", { code })
         .then((res) => {
             // Backend validates code and returns YOUR token
             setToken(res.data.token);
             setUser(res.data.user);
             router.push("/"); // Login success!
         })
         .catch((err) => {
             console.error("Login Failed", err.response?.data || err);
             // Optional: Display error on the login page by passing it as a query param
             router.push(`/login?error=${encodeURIComponent(err.response?.data?.message || err.message || "Google Login Failed")}`);
         });
    }
  }, [searchParams]);

  return <div>Verifying with Google...</div>;
}