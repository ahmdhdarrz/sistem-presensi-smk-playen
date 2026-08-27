/**
 * STANDARDISED ROLE CONSTANTS & ACCESS CONTROL HELPERS
 * 
 * Nilai role internal strictly konsisten menggunakan huruf kapital:
 * - ADMIN
 * - GURU_WALI_KELAS
 * - GURU_MAPEL
 */

export const ROLES = {
  ADMIN: "ADMIN",
  GURU_WALI_KELAS: "GURU_WALI_KELAS",
  GURU_MAPEL: "GURU_MAPEL",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.GURU_WALI_KELAS]: "Guru Wali Kelas",
  [ROLES.GURU_MAPEL]: "Guru Mata Pelajaran",
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

export function canInputAttendance(role) {
  const upper = String(role).toUpperCase();
  return upper === ROLES.ADMIN || upper === ROLES.GURU_WALI_KELAS || upper === "GURU";
}

export function canManageMasterData(role) {
  return isAdmin(role);
}
