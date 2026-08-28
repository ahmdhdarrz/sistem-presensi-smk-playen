import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute, GuestRoute, RoleRoute } from "@/components/common/ProtectedRoute";
import { ROLES } from "@/utils/roles";

import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";

import Login from "@/pages/auth/Login";
import Unauthorized from "@/pages/auth/Unauthorized";
import Dashboard from "@/pages/dashboard/Dashboard";
import AttendanceInput from "@/pages/attendance/AttendanceInput";
import AttendanceView from "@/pages/attendance/AttendanceView";
import AttendanceRecap from "@/pages/attendance/AttendanceRecap";
import AttendanceExport from "@/pages/attendance/AttendanceExport";
import Students from "@/pages/students/Students";
import Teachers from "@/pages/teachers/Teachers";
import AttendancePermissions from "@/pages/attendance/AttendancePermissions";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Guest routes (Redirect to /dashboard if logged in) */}
          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>
          </Route>

          {/* Protected routes (Redirect to /login if NOT logged in) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Dashboard: Accessible by all 3 roles */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Attendance Input: Accessible by ADMIN and GURU_WALI_KELAS */}
              <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.GURU_WALI_KELAS]} />}>
                <Route path="/attendance/input" element={<AttendanceInput />} />
              </Route>

              {/* Attendance View: Accessible by all 3 roles (Main route for GURU_MAPEL) */}
              <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.GURU_WALI_KELAS, ROLES.GURU_MAPEL]} />}>
                <Route path="/attendance/view" element={<AttendanceView />} />
              </Route>

              {/* Attendance Recap & Export: Accessible by ADMIN and GURU_WALI_KELAS */}
              <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN, ROLES.GURU_WALI_KELAS]} />}>
                <Route path="/attendance/recap" element={<AttendanceRecap />} />
                <Route path="/attendance/export" element={<AttendanceExport />} />
              </Route>

              {/* Master Data Management: Accessible strictly by ADMIN */}
              <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
                <Route path="/attendance/permissions" element={<AttendancePermissions />} />
                <Route path="/students" element={<Students />} />
                <Route path="/teachers" element={<Teachers />} />
              </Route>

              {/* 403 Unauthorized Route */}
              <Route path="/unauthorized" element={<Unauthorized />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
