import axios from "axios";

const api = axios.create({
  baseURL: "https://realtime-chat-app-production-67a2.up.railway.app/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;