import { ROLES } from "@/utils/roles";

/**
 * MOCK USERS DATA (DEVELOPMENT ONLY)
 * 
 * Tiga akun terstandarisasi untuk pengujian 3 role:
 * 1. ADMIN (username: admin, password: admin123)
 * 2. GURU WALI KELAS (username: wali, password: wali123, assignedClass: X OA)
 * 3. GURU MAPEL (username: mapel, password: mapel123)
 */

export const mockUsers = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "Administrator Piket",
    role: ROLES.ADMIN,
    email: "admin@smkm1playen.sch.id",
  },
  {
    id: 2,
    username: "wali",
    password: "wali123",
    name: "Budi Santoso, S.Pd.",
    role: ROLES.GURU_WALI_KELAS,
    classId: 1,
    assignedClass: "X OA",
    className: "X OA",
    email: "budi.santoso@smkm1playen.sch.id",
  },
  {
    id: 3,
    username: "mapel",
    password: "mapel123",
    name: "Siti Rahmawati, S.Pd.",
    role: ROLES.GURU_MAPEL,
    email: "siti.rahmawati@smkm1playen.sch.id",
  },
];
