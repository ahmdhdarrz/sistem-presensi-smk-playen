import React, { createContext, useContext, useState } from "react";
import { mockUsers } from "@/data/mockUsers";

const AuthContext = createContext(null);

const STORAGE_KEY = "presensi_user_session";

/**
 * AUTH CONTEXT PROVIDER (TEMPORARY MOCK AUTHENTICATION)
 * 
 * Mengelola state otentikasi di Front-End dan menyimpan sesi tanpa password di localStorage.
 * Nanti saat backend Laravel siap, fungsi login/logout di sini tinggal disesuaikan
 * untuk memanggil API REST (Axios) dan mengelola Token Bearer / Sanctum.
 */
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

  const login = (username, password) => {
    const sanitizedUsername = (username || "").trim().toLowerCase();
    const sanitizedPassword = (password || "").trim();

    const foundUser = mockUsers.find(
      (u) => u.username.toLowerCase() === sanitizedUsername && u.password === sanitizedPassword
    );

    if (foundUser) {
      // Data user aman tanpa password untuk disimpan di state & localStorage
      const safeUserData = {
        id: foundUser.id,
        username: foundUser.username,
        name: foundUser.name,
        role: foundUser.role,
        classId: foundUser.classId || null,
        assignedClass: foundUser.assignedClass || foundUser.className || null,
        className: foundUser.className || foundUser.assignedClass || null,
        email: foundUser.email || `${foundUser.username}@smkm1playen.sch.id`,
      };

      setUser(safeUserData);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUserData));
      } catch (e) {
        console.error("Gagal menyimpan sesi ke localStorage:", e);
      }

      return { success: true, user: safeUserData };
    }

    return {
      success: false,
      message: "Username atau password tidak sesuai.",
    };
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Gagal menghapus sesi dari localStorage:", e);
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
