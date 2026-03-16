// src/app/google-callback/page.tsx
"use client";
import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { useAuthStore } from "@/store/globalStore";

export default function GoogleCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const hasHandledCode = useRef(false);
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code || hasHandledCode.current) return;

    hasHandledCode.current = true;

    const redirectUri =
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
      });
  }, [code, router]); // ✅ correct dependencies

  return <div>Verifying with Google...</div>;
}