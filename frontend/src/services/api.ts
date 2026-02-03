import axios from "axios";
import { useAuthStore } from "../store/globalStore";

// Prefer build-time NEXT_PUBLIC_API_URL. If that's missing, and we're in the
// browser, fallback to the frontend origin + /api so client requests target the
// same host that served the frontend (works with reverse proxies / same-domain
// deployments). Otherwise fall back to localhost for local development.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? `${window.location.origin}/api` : "http://localhost:3001/api");

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
