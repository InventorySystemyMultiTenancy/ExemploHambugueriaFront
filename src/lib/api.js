import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
});

// ─── Request interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hb_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and force re-login
      localStorage.removeItem("hb_token");
      localStorage.removeItem("hb_user");
      // Dispatch event so AuthContext can react without circular dependency
      window.dispatchEvent(new CustomEvent("hb:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export { api };
