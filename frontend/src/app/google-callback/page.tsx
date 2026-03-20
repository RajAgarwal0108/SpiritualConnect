// src/app/google-callback/page.tsx
"use client";
import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/globalStore";
import { Loader2 } from "lucide-react";

export default function GoogleCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const hasHandledCode = useRef(false);
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code || hasHandledCode.current) return;

    hasHandledCode.current = true;

    const persistedRedirectUri = sessionStorage.getItem("google_oauth_redirect_uri");
    const redirectUri =
      persistedRedirectUri ||
      process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL ||
      window.location.origin + "/google-callback";

    api
      .post("/auth/google", { code, redirectUri })
      .then((res) => {
        setToken(res.data.token);
        setUser(res.data.user);
        router.replace("/"); // prevents history issues
      })
      .catch((err) => {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Google Login Failed";

        console.error("Login Failed", errorMessage, err);

        router.replace(`/login?error=${encodeURIComponent(errorMessage)}`);
      })
      .finally(() => {
        sessionStorage.removeItem("google_oauth_redirect_uri");
      });
  }, [code, router]); // ✅ correct dependencies

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-sacred-beige text-sacred-text">
      <Loader2 className="h-10 w-10 animate-spin text-sacred-gold mb-4" />
      <h2 className="font-serif text-2xl">Authenticating...</h2>
      <p className="text-sacred-muted mt-2">Please wait while we connect your soul to the sanctuary.</p>
    </div>
  );
}