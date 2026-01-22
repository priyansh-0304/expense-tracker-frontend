import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
});


// ---------------- REQUEST INTERCEPTOR ----------------
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

// ---------------- RESPONSE INTERCEPTOR ----------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔴 DO NOT LOGOUT ON NORMAL ERRORS
    if (!error.response) {
      console.error("Network / CORS error:", error);
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 🔴 ONLY logout on REAL auth failures
    if (status === 401) {
      console.warn("JWT expired or invalid. Logging out.");
      localStorage.removeItem("jwt");
      window.location.href = "/";
    }

    // 🔴 400 / 422 / 500 should NOT log out
    return Promise.reject(error);
  }
);

export default api;