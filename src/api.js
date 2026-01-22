import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // slightly safer for Render cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= REQUEST INTERCEPTOR =================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network / CORS / backend down
    if (!error.response) {
      console.error("Network error:", error);
      return Promise.reject(error);
    }

    const status = error.response.status;

    // ONLY logout on real auth failures
    if (status === 401) {
      localStorage.removeItem("jwt");
      window.location.href = "/";
    }

    // Let caller handle 400 / 403 / 404 / 500
    return Promise.reject(error);
  }
);

export default api;