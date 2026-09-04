import axios from "axios";

const TOKEN_KEY = "presensi_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
  },
});

// Sisipkan Bearer token otomatis di setiap request kalau user sudah login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Kalau token expired/invalid (401), otomatis bersihkan sesi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("presensi_user_session");
    }
    return Promise.reject(error);
  }
);

export { TOKEN_KEY };
export default api;