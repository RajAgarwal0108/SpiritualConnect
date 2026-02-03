import axios from "axios";
import { useAuthStore } from "../store/globalStore";

// Prefer build-time NEXT_PUBLIC_API_URL. If that's missing, choose a sensible
// fallback: use localhost for local dev, otherwise default to the deployed
// backend host (HTTPS) so we don't trigger mixed-content errors when the
// frontend is served over HTTPS.
const DEFAULT_HOST =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://spiritualconnect.onrender.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || `${DEFAULT_HOST}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
