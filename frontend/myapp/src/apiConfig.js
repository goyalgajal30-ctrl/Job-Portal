export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:4000");

export const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";
export default API_BASE;
