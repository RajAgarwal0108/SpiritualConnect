export function getMediaUrl(url?: string | null) {
  if (!url) return null;
  // If absolute URL, return as-is
  if (/^https?:\/\//i.test(url)) return url;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  // derive base by removing trailing /api if present
  const base = apiUrl.replace(/\/api\/?$/, "");
  // Ensure url starts with '/'
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}
