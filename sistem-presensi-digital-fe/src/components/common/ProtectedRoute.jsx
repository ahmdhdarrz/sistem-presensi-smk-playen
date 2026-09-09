import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isMonitoring } from "@/utils/roles";

/**
 * ProtectedRoute: Memastikan hanya user yang sudah login yang dapat mengakses Halaman Terproteksi.
 * Jika belum login, otomatis redirect ke /login.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/**
 * PublicOnlyRoute / GuestRoute: Memastikan user yang sudah login tidak mengakses kembali halaman /login.
 * Jika sudah login, otomatis redirect ke /dashboard.
 */
export function GuestRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

/**
 * RoleRoute: Memastikan user memiliki role yang diizinkan (misal: ADMIN, GURU_WALI_KELAS, MONITORING).
 * Jika role tidak diizinkan, otomatis redirect ke /unauthorized.
 */
export function RoleRoute({ allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = (user?.role || "").toUpperCase();
  const normalizedAllowed = allowedRoles.map((r) => String(r).toUpperCase());

  // Support legacy role values & monitoring role variants
  let isAllowed = normalizedAllowed.includes(userRole);
  if (!isAllowed) {
    if (userRole === "GURU" && (normalizedAllowed.includes("GURU_WALI_KELAS") || normalizedAllowed.includes("GURU"))) {
      isAllowed = true;
    } else if (isMonitoring(userRole) && normalizedAllowed.some((r) => r.startsWith("MONITORING"))) {
      isAllowed = true;
    }
  }

  if (allowedRoles.length > 0 && !isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
