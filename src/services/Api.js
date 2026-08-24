import axios from "axios";

// ============================================================
// AUM BACKEND URL
// ============================================================

export const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://aum-backend-production.up.railway.app";

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    Accept: "application/json",
  },
});

// ============================================================
// ASSET URL
// ============================================================

export const getAssetUrl = (path) => {
  if (!path) {
    return "";
  }

  let value = String(path).trim();

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

  // Normalize slashes
  value = value.replace(/\\/g, "/");

  // Convert paths such as:
  // /app/uploads/cards/file.pdf
  // /uploads/cards/file.pdf
  // uploads/cards/file.pdf
  //
  // into:
  // uploads/cards/file.pdf

  if (value.includes("/uploads/")) {
    value =
      "uploads/" +
      value.split("/uploads/")[1];
  }

  value = value.replace(/^\/+/, "");

  return `${API_URL}/${value}`;
};

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
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

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default api;