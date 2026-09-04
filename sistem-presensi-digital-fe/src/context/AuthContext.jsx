import React, { createContext, useContext, useState } from "react";
import api, { TOKEN_KEY } from "@/services/api";
import { ROLES } from "@/utils/roles";

const AuthContext = createContext(null);

const STORAGE_KEY = "presensi_user_session";

/**
 * Mapping role dari backend Laravel (lowercase, snake_case)
 * ke konstanta role Front-End (uppercase).
 */
function mapBackendRole(backendRole) {
  const role = String(backendRole || "").toLowerCase();
  if (role === "admin") return ROLES.ADMIN;
  if (role === "wali_kelas") return ROLES.GURU_WALI_KELAS;
  if (role === "guru_mapel") return ROLES.GURU_MAPEL;
  return backendRole;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEY);
      if (savedSession) {
        return JSON.parse(savedSession);
      }
    } catch (error) {
      console.error("Gagal memulihkan sesi otentikasi:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  });

  const isAuthenticated = Boolean(user);

  const login = async (username, password) => {
    try {
      const res = await api.post("/login", { username, password });
      const { token, user: backendUser } = res.data;

      const safeUserData = {
        id: backendUser.id,
        username: backendUser.username,
        name: backendUser.nama,
        role: mapBackendRole(backendUser.role),
        classId: backendUser.kelas_id || null,
        assignedClass: null,
        className: null,
        email: `${backendUser.username}@smkm1playen.sch.id`,
      };

      setUser(safeUserData);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUserData));

      return { success: true, user: safeUserData };
    } catch (error) {
      const message =
        error.response?.data?.message || "Username atau password tidak sesuai.";
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Gagal logout di server:", error);
    } finally {
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}

export default AuthContext;