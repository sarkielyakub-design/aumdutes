import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ypadn-backend-production.up.railway.app";


// ============================================================
// AXIOS API
// ============================================================

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});


// ============================================================
// ASSET URL
// ============================================================

export const getAssetUrl = (path) => {
  if (!path) {
    return "";
  }

  const value = String(path).trim();

  if (!value) {
    return "";
  }

  // Already a complete URL
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  // Remove filesystem prefix if backend accidentally
  // returns something like /app/uploads/...
  let cleanPath = value.replace(/\\/g, "/");

  if (cleanPath.includes("/uploads/")) {
    cleanPath =
      "uploads/" +
      cleanPath.split("/uploads/")[1];
  }

  // Remove leading slash
  cleanPath = cleanPath.replace(/^\/+/, "");

  return `${API_URL}/${cleanPath}`;
};


// ============================================================
// AXIOS INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);


export default api;