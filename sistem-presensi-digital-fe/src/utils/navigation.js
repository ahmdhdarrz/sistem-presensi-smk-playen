import { 
  LayoutDashboard, 
  ClipboardCheck, 
  FileText, 
  Users, 
  UserCog,
  Eye,
  Download
} from "lucide-react";
import { ROLES } from "@/utils/roles";

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

  return navigationConfig[upperRole] || navigationConfig[ROLES.GURU_MAPEL];
}
