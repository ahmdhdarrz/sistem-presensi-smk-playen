/**
 * MASTER DATA KELAS DAN SISWA DUMMY
 * 
 * CATATAN INTEGRASI LARAVEL:
 * File ini menyediakan master data 23 kelas (Kelas X & XI) dan dummy siswa per kelas.
 * Nanti saat Backend Laravel siap, data ini akan digantikan dengan response API:
 * - GET /api/classes (Daftar Kelas)
 * - GET /api/students?class_id={id} (Daftar Siswa Per Kelas)
 */

export const masterClasses = [
  // KELAS X
  { id: 1, name: "X OA", grade: "X" },
  { id: 2, name: "X OB", grade: "X" },
  { id: 3, name: "X OC", grade: "X" },
  { id: 4, name: "X OD", grade: "X" },
  { id: 5, name: "X OE", grade: "X" },
  { id: 6, name: "X OF", grade: "X" },
  { id: 7, name: "X MA", grade: "X" },
  { id: 8, name: "X MB", grade: "X" },
  { id: 9, name: "X MC", grade: "X" },
  { id: 10, name: "X TIA", grade: "X" },
  { id: 11, name: "X TIB", grade: "X" },
  { id: 12, name: "X TAV", grade: "X" },

  // KELAS XI
  { id: 13, name: "XI OA", grade: "XI" },
  { id: 14, name: "XI OB", grade: "XI" },
  { id: 15, name: "XI OC", grade: "XI" },
  { id: 16, name: "XI OD", grade: "XI" },
  { id: 17, name: "XI OE", grade: "XI" },
  { id: 18, name: "XI MA", grade: "XI" },
  { id: 19, name: "XI MB", grade: "XI" },
  { id: 20, name: "XI MC", grade: "XI" },
  { id: 21, name: "XI TIA", grade: "XI" },
  { id: 22, name: "XI TIB", grade: "XI" },
  { id: 23, name: "XI TAV", grade: "XI" },
];

const firstNames = [
  "Ahmad", "Budi", "Cahyo", "Dinda", "Eko", "Fajar", "Gilang", "Hana",
  "Indra", "Joko", "Kartika", "Lestari", "Muhammad", "Nabila", "Okta", "Pratama",
  "Rizky", "Siti", "Taufik", "Utami", "Vina", "Wahyu", "Yulia", "Zainal",
  "Aditya", "Bagas", "Citra", "Dedi", "Elisa", "Farhan", "Gita", "Hafiz"
];

const lastNames = [
  "Fauzan", "Santoso", "Wibowo", "Kirana", "Prasetyo", "Nugroho", "Saputra", "Aulia",
  "Kusuma", "Purnomo", "Dewi", "Rahayu", "Firmansyah", "Zahra", "Ramadhan", "Hidayat",
  "Ardiansyah", "Nurhaliza", "Kurniawan", "Sari", "Permana", "Setiawan", "Putri", "Abidin",
  "Mahendra", "Suryana", "Laksana", "Wicaksono", "Anggraini", "Mahardika", "Bachtiar", "Suharto"
];

// Generator dummy siswa untuk seluruh 23 kelas (20 - 28 siswa per kelas)
// TODO: Replace with Laravel API response — GET /api/students
export const masterStudents = masterClasses.flatMap((cls) => {
  // Jumlah siswa bervariasi antara 22 dan 28 per kelas
  const studentCount = 22 + ((cls.id * 3) % 7);

  return Array.from({ length: studentCount }, (_, i) => {
    const fnIndex = (cls.id * 5 + i * 3) % firstNames.length;
    const lnIndex = (cls.id * 7 + i * 2) % lastNames.length;
    const name = `${firstNames[fnIndex]} ${lastNames[lnIndex]}`;

    // Format NIS: 2026 + 2-digit classId + 2-digit index
    const classIdPadded = String(cls.id).padStart(2, "0");
    const idxPadded = String(i + 1).padStart(2, "0");
    const nis = `2026${classIdPadded}${idxPadded}`;

    // Format NISN: 10-digit pseudo-unique number
    const nisn = `006${String(cls.id * 100 + i + 1).padStart(7, "0")}`;

    // Mayoritas siswa berstatus Aktif; siswa ke-i terakhir di setiap kelas Tidak Aktif
    const status = i >= studentCount - 2 ? "Tidak Aktif" : "Aktif";

    return {
      id: cls.id * 100 + (i + 1),
      nis,
      nisn,
      name,
      classId: cls.id,
      className: cls.name,
      status,
    };
  });
});

/**
 * Helper untuk mengambil daftar siswa berdasarkan classId
 */
export function getStudentsByClassId(classId) {
  const numericId = Number(classId);
  return masterStudents.filter((s) => s.classId === numericId);
}

/**
 * Helper untuk mengambil informasi kelas berdasarkan classId atau className
 */
export function getClassInfo(classIdentifier) {
  if (typeof classIdentifier === "number" || !isNaN(Number(classIdentifier))) {
    const numericId = Number(classIdentifier);
    return masterClasses.find((c) => c.id === numericId) || masterClasses[0];
  }
  
  return masterClasses.find(
    (c) => c.name.toLowerCase() === String(classIdentifier).toLowerCase()
  ) || masterClasses[0];
}

/**
 * Helper simulasi simpan absensi (Siap diganti dengan POST /api/attendance di masa depan)
 */
export async function saveAttendanceService(payload) {
  // Simulasi async delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  console.log("Payload Absensi Siap Diposting ke Laravel API:", payload);

  return {
    success: true,
    message: `Data absensi kelas ${payload.class_name || "terpilih"} berhasil disimpan.`,
    data: payload
  };
}
