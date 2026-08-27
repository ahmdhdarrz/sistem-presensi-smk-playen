/**
 * DUMMY DATA GURU
 * 
 * Mengelola master data guru untuk simulasi CRUD di Front-End.
 * Menggunakan standar ROLES dari src/utils/roles.js.
 * 
 * CATATAN INTEGRASI LARAVEL:
 * File ini menyediakan master data guru awal.
 * Nanti saat Backend Laravel siap, data ini akan digantikan dengan response API:
 * - GET /api/teachers (Daftar Guru)
 * - POST /api/teachers (Tambah Guru)
 * - PUT /api/teachers/{id} (Update Guru)
 * - DELETE /api/teachers/{id} (Hapus Guru)
 */

import { ROLES } from "@/utils/roles";

export const masterTeachers = [
  {
    id: 1,
    name: "Administrator Presensi",
    nip: "197001011995011001",
    username: "admin",
    role: ROLES.ADMIN,
    assignedClass: null,
    status: "Aktif"
  },
  {
    id: 2,
    name: "Budi Santoso, S.Pd.",
    nip: "198503152010011002",
    username: "budi.santoso",
    role: ROLES.GURU_WALI_KELAS,
    assignedClass: "X OA",
    status: "Aktif"
  },
  {
    id: 3,
    name: "Siti Rahmawati, S.Pd.",
    nip: "198807242014022003",
    username: "siti.rahmawati",
    role: ROLES.GURU_MAPEL,
    assignedClass: null,
    status: "Aktif"
  },
  {
    id: 4,
    name: "Heri Prasetyo, M.T.",
    nip: "198012112005011004",
    username: "heri.prasetyo",
    role: ROLES.GURU_WALI_KELAS,
    assignedClass: "X OB",
    status: "Aktif"
  },
  {
    id: 5,
    name: "Dwi Wahyuni, S.Pd.",
    nip: "198305092008022005",
    username: "dwi.wahyuni",
    role: ROLES.GURU_WALI_KELAS,
    assignedClass: "X OC",
    status: "Aktif"
  },
  {
    id: 6,
    name: "Joko Susilo, S.Kom.",
    nip: "199201302018011006",
    username: "joko.susilo",
    role: ROLES.GURU_MAPEL,
    assignedClass: null,
    status: "Aktif"
  },
  {
    id: 7,
    name: "Rina Astuti, S.Pd.",
    nip: "198709182012022007",
    username: "rina.astuti",
    role: ROLES.GURU_WALI_KELAS,
    assignedClass: "XI TIA",
    status: "Aktif"
  },
  {
    id: 8,
    name: "Agus Setiawan, M.Pd.",
    nip: "197808082003011008",
    username: "agus.setiawan",
    role: ROLES.GURU_MAPEL,
    assignedClass: null,
    status: "Aktif"
  },
  {
    id: 9,
    name: "Evi Lestari, S.Pd.",
    nip: "199011152015022009",
    username: "evi.lestari",
    role: ROLES.GURU_WALI_KELAS,
    assignedClass: "XI TIB",
    status: "Aktif"
  },
  {
    id: 10,
    name: "Fajar Nugroho, S.T.",
    nip: "198404222011011010",
    username: "fajar.nugroho",
    role: ROLES.GURU_MAPEL,
    assignedClass: null,
    status: "Aktif"
  },
  {
    id: 11,
    name: "Sri Lestari, S.Pd.",
    nip: "197505122000032011",
    username: "sri.lestari",
    role: ROLES.GURU_WALI_KELAS,
    assignedClass: "X OD",
    status: "Aktif"
  },
  {
    id: 12,
    name: "Tri Wibowo, S.Pd.",
    nip: "198906202015011012",
    username: "tri.wibowo",
    role: ROLES.GURU_MAPEL,
    assignedClass: null,
    status: "Tidak Aktif"
  },
  {
    id: 13,
    name: "Nanang Qosim, S.Ag.",
    nip: "197903142006041013",
    username: "nanang.qosim",
    role: ROLES.GURU_MAPEL,
    assignedClass: null,
    status: "Aktif"
  },
  {
    id: 14,
    name: "Dewi Safitri, S.Pd.",
    nip: "199302282019032014",
    username: "dewi.safitri",
    role: ROLES.GURU_WALI_KELAS,
    assignedClass: "XI MA",
    status: "Aktif"
  },
  {
    id: 15,
    name: "Adi Wijaya, S.Pd.",
    nip: "198610102013011015",
    username: "adi.wijaya",
    role: ROLES.GURU_MAPEL,
    assignedClass: null,
    status: "Aktif"
  },
  {
    id: 16,
    name: "Yuni Kartika, S.Si.",
    nip: "199106062016022016",
    username: "yuni.kartika",
    role: ROLES.GURU_WALI_KELAS,
    assignedClass: "XI MB",
    status: "Aktif"
  },
  {
    id: 17,
    name: "Bambang Sugeng, M.T.",
    nip: "197202191998031017",
    username: "bambang.sugeng",
    role: ROLES.GURU_MAPEL,
    assignedClass: null,
    status: "Aktif"
  },
  {
    id: 18,
    name: "Hartini, S.Pd.",
    nip: "197607312002122018",
    username: "hartini",
    role: ROLES.GURU_WALI_KELAS,
    assignedClass: "XI TAV",
    status: "Aktif"
  },
  {
    id: 19,
    name: "Eko Prasetyo, S.Kom.",
    nip: "199508152020011019",
    username: "eko.prasetyo",
    role: ROLES.GURU_MAPEL,
    assignedClass: null,
    status: "Aktif"
  },
  {
    id: 20,
    name: "Lilis Suryani, S.Pd.",
    nip: "198209252009022020",
    username: "lilis.suryani",
    role: ROLES.GURU_MAPEL,
    assignedClass: null,
    status: "Tidak Aktif"
  }
];
