/**
 * STANDARDISED ROLE CONSTANTS & ACCESS CONTROL HELPERS
 * 
 * Nilai role internal strictly konsisten menggunakan huruf kapital:
 * - ADMIN
 * - GURU_WALI_KELAS
 * - GURU_MAPEL
 * - MONITORING (termasuk varian scope: MONITORING_X, MONITORING_XI, MONITORING_XII)
 */

export const ROLES = {
  ADMIN: "ADMIN",
  GURU_WALI_KELAS: "GURU_WALI_KELAS",
  GURU_MAPEL: "GURU_MAPEL",
  MONITORING: "MONITORING",
  MONITORING_X: "MONITORING_X",
  MONITORING_XI: "MONITORING_XI",
  MONITORING_XII: "MONITORING_XII",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.GURU_WALI_KELAS]: "Guru Wali Kelas",
  [ROLES.GURU_MAPEL]: "Guru Mata Pelajaran",
  [ROLES.MONITORING]: "Monitoring",
  [ROLES.MONITORING_X]: "Monitoring Kelas X",
  [ROLES.MONITORING_XI]: "Monitoring Kelas XI",
  [ROLES.MONITORING_XII]: "Monitoring Kelas XII",
};

/**
 * Mendapatkan label tampilan role untuk UI
 */
export function getRoleLabel(role) {
  if (!role) return "Tamu";
  
  const upperRole = String(role).toUpperCase();
  if (upperRole === "ADMIN") return ROLE_LABELS[ROLES.ADMIN];
  if (upperRole === "GURU_WALI_KELAS" || upperRole === "WALI_KELAS") return ROLE_LABELS[ROLES.GURU_WALI_KELAS];
  if (upperRole === "GURU_MAPEL" || upperRole === "MAPEL") return ROLE_LABELS[ROLES.GURU_MAPEL];
  if (upperRole === "GURU") return ROLE_LABELS[ROLES.GURU_WALI_KELAS];

  if (upperRole === "MONITORING_X") return ROLE_LABELS[ROLES.MONITORING_X];
  if (upperRole === "MONITORING_XI") return ROLE_LABELS[ROLES.MONITORING_XI];
  if (upperRole === "MONITORING_XII") return ROLE_LABELS[ROLES.MONITORING_XII];
  if (upperRole === "MONITORING") return ROLE_LABELS[ROLES.MONITORING];

  return ROLE_LABELS[role] || role;
}

/**
 * Helper Pengecekan Role
 */
export function isAdmin(role) {
  return String(role).toUpperCase() === ROLES.ADMIN;
}

export function isWaliKelas(role) {
  const upper = String(role).toUpperCase();
  return upper === ROLES.GURU_WALI_KELAS || upper === "WALI_KELAS";
}

export function isGuruMapel(role) {
  const upper = String(role).toUpperCase();
  return upper === ROLES.GURU_MAPEL || upper === "MAPEL";
}

/**
 * Cek apakah role adalah salah satu varian MONITORING (monitoring, monitoring_x, monitoring_xi, monitoring_xii).
 */
export function isMonitoring(role) {
  if (!role) return false;
  const upper = String(role).toUpperCase();
  return (
    upper === ROLES.MONITORING ||
    upper === ROLES.MONITORING_X ||
    upper === ROLES.MONITORING_XI ||
    upper === ROLES.MONITORING_XII ||
    upper.startsWith("MONITORING")
  );
}

/**
 * Mendapatkan tingkat/scope angkatan dari role Monitoring ("X", "XI", "XII", atau null)
 */
export function getMonitoringScope(role) {
  if (!role) return null;
  const upper = String(role).toUpperCase();
  if (upper.endsWith("_X") || upper === "MONITORING_X") return "X";
  if (upper.endsWith("_XI") || upper === "MONITORING_XI") return "XI";
  if (upper.endsWith("_XII") || upper === "MONITORING_XII") return "XII";
  return null;
}

export function canInputAttendance(role) {
  const upper = String(role).toUpperCase();
  return upper === ROLES.ADMIN || upper === ROLES.GURU_WALI_KELAS || upper === "GURU";
}

export function canManageMasterData(role) {
  return isAdmin(role);
}
