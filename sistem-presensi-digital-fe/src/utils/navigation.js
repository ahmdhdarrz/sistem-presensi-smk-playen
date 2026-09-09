import { 
  LayoutDashboard, 
  ClipboardCheck, 
  FileText, 
  Users, 
  UserCog,
  Eye,
  Download,
  UserCheck
} from "lucide-react";
import { ROLES, isMonitoring } from "@/utils/roles";

export const navigationConfig = {
  [ROLES.ADMIN]: [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Input Absensi",
      path: "/attendance/input",
      icon: ClipboardCheck,
    },
    {
      label: "Rekap Absensi",
      path: "/attendance/recap",
      icon: FileText,
    },
    {
      label: "Izin Harian",
      path: "/attendance/permissions",
      icon: UserCheck,
    },
    {
      label: "Data Siswa",
      path: "/students",
      icon: Users,
    },
    {
      label: "Data Guru",
      path: "/teachers",
      icon: UserCog,
    },
    {
      label: "Export Data",
      path: "/attendance/export",
      icon: Download,
    },
  ],
  [ROLES.GURU_WALI_KELAS]: [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Input Absensi",
      path: "/attendance/input",
      icon: ClipboardCheck,
    },
    {
      label: "Rekap Absensi",
      path: "/attendance/recap",
      icon: FileText,
    },
    {
      label: "Export Rekap",
      path: "/attendance/export",
      icon: Download,
    },
  ],
  [ROLES.GURU_MAPEL]: [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Lihat Absensi",
      path: "/attendance/view",
      icon: Eye,
    },
  ],
  [ROLES.MONITORING]: [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Lihat Absensi",
      path: "/attendance/view",
      icon: Eye,
    },
  ],
};

export function getNavigationByRole(role) {
  if (!role) return navigationConfig[ROLES.GURU_MAPEL];

  const upperRole = String(role).toUpperCase();

  if (upperRole === ROLES.ADMIN || upperRole === "ADMIN") {
    return navigationConfig[ROLES.ADMIN];
  }
  
  if (upperRole === ROLES.GURU_WALI_KELAS || upperRole === "WALI_KELAS" || upperRole === "GURU") {
    return navigationConfig[ROLES.GURU_WALI_KELAS];
  }

  if (upperRole === ROLES.GURU_MAPEL || upperRole === "MAPEL") {
    return navigationConfig[ROLES.GURU_MAPEL];
  }

  if (isMonitoring(role) || upperRole.startsWith("MONITORING")) {
    return navigationConfig[ROLES.MONITORING];
  }

  return navigationConfig[upperRole] || navigationConfig[ROLES.GURU_MAPEL];
}
