import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
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
    // Backend unreachable
    if (!error.response) {
      console.error("Backend unreachable");
      localStorage.removeItem("jwt");
      window.location.href = "/";
      return Promise.reject(error);
    }

    // Auth errors
    if (error.response.status === 401 || error.response.status === 403) {
      localStorage.removeItem("jwt");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;