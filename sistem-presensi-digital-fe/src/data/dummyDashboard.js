// Dummy data terpisah untuk 3 Role Dashboard (ADMIN, GURU_WALI_KELAS, GURU_MAPEL)

export const adminDashboardData = {
  stats: [
    {
      title: "Total Siswa Sekolah",
      value: "842",
      description: "Terdaftar di 23 kelas (Tingkat X & XI)",
      icon: "Users",
    },
    {
      title: "Hadir Hari Ini",
      value: "798",
      description: "94.7% tingkat kehadiran sekolah",
      icon: "UserCheck",
    },
    {
      title: "Siswa Tidak Hadir",
      value: "44",
      description: "Izin: 18 | Sakit: 14 | Alpa: 12",
      icon: "UserX",
    },
    {
      title: "Status Presensi Kelas",
      value: "20 / 23 Kelas",
      description: "Kelas telah menginput presensi harian",
      icon: "School",
    },
  ],
  sessionStatus: [
    { class: "X OA", morning: true, afternoon: true, teacher: "Budi Santoso, S.Pd." },
    { class: "X OB", morning: true, afternoon: false, teacher: "Siti Rahmawati, S.Pd." },
    { class: "XI OA", morning: true, afternoon: true, teacher: "Eko Prasetyo, S.Kom." },
    { class: "XI OB", morning: false, afternoon: false, teacher: "Nur Hidayah, M.Pd." },
    { class: "X MA", morning: true, afternoon: true, teacher: "Agus Setiawan, S.T." },
    { class: "XI MA", morning: true, afternoon: false, teacher: "Dewi Lestari, S.Pd." },
  ],
  comparisonData: [
    { class: "X OA", Hadir: 22, TidakHadir: 4 },
    { class: "X OB", Hadir: 24, TidakHadir: 2 },
    { class: "X OC", Hadir: 23, TidakHadir: 3 },
    { class: "XI OA", Hadir: 25, TidakHadir: 1 },
    { class: "XI OB", Hadir: 20, TidakHadir: 6 },
    { class: "XI MA", Hadir: 22, TidakHadir: 3 },
  ],
  trendData: [
    { day: "Senin", Hadir: 810, Alpa: 10 },
    { day: "Selasa", Hadir: 805, Alpa: 12 },
    { day: "Rabu", Hadir: 798, Alpa: 15 },
    { day: "Kamis", Hadir: 802, Alpa: 8 },
    { day: "Jumat", Hadir: 790, Alpa: 14 },
  ],
  frequentAbsences: [
    { id: 1, name: "Muhammad Rizky", class: "XI OB", totalAlpa: 7 },
    { id: 2, name: "Andi Saputra", class: "X OB", totalAlpa: 5 },
    { id: 3, name: "Bagus Hermawan", class: "XI MA", totalAlpa: 4 },
    { id: 4, name: "Dinda Kirana", class: "X OA", totalAlpa: 4 },
    { id: 5, name: "Fajar Nugroho", class: "XI OA", totalAlpa: 3 },
  ],
};

export const waliKelasDashboardData = {
  className: "X OA",
  stats: [
    {
      title: "Total Siswa Kelas",
      value: "26",
      description: "Terdaftar di kelas X OA",
      icon: "Users",
    },
    {
      title: "Hadir Hari Ini",
      value: "22",
      description: "84.6% tingkat kehadiran hari ini",
      icon: "UserCheck",
    },
    {
      title: "Siswa Tidak Hadir",
      value: "4",
      description: "Sakit: 2 | Izin: 1 | Alpa: 1",
      icon: "UserX",
    },
    {
      title: "Status Presensi Hari Ini",
      value: "Pagi: ✓ | Sore: ○",
      description: "Sesi Pagi selesai, Sore belum",
      icon: "ClipboardCheck",
    },
  ],
  sessionStatus: {
    morning: { status: "Sudah Diinput", time: "07:15 WIB", isComplete: true },
    afternoon: { status: "Belum Diinput", time: "-", isComplete: false },
  },
  comparisonData: [
    { category: "Hadir", count: 22 },
    { category: "Izin", count: 1 },
    { category: "Sakit", count: 2 },
    { category: "Alpa", count: 1 },
  ],
  trendData: [
    { day: "Senin", Hadir: 25, Alpa: 0 },
    { day: "Selasa", Hadir: 24, Alpa: 1 },
    { day: "Rabu", Hadir: 23, Alpa: 1 },
    { day: "Kamis", Hadir: 25, Alpa: 0 },
    { day: "Jumat", Hadir: 22, Alpa: 1 },
  ],
  frequentAbsences: [
    { id: 1, name: "Dinda Kirana", class: "X OA", totalAlpa: 4 },
    { id: 2, name: "Fajar Nugroho", class: "X OA", totalAlpa: 3 },
    { id: 3, name: "Reza Rahardian", class: "X OA", totalAlpa: 2 },
  ],
};

export const mapelDashboardData = {
  stats: [
    {
      title: "Total Siswa Terdaftar",
      value: "842",
      description: "Seluruh kelas di SMK M 1 Playen",
      icon: "Users",
    },
    {
      title: "Kehadiran Hari Ini",
      value: "798",
      description: "94.7% total kehadiran siswa",
      icon: "UserCheck",
    },
    {
      title: "Siswa Tidak Hadir",
      value: "44",
      description: "Detail: Izin 18, Sakit 14, Alpa 12",
      icon: "UserX",
    },
    {
      title: "Status Akses",
      value: "View Only",
      description: "Akses informasi & rekapitulasi",
      icon: "Eye",
    },
  ],
  recentLogs: [
    { id: 1, time: "07:20 WIB", class: "X OA", status: "Presensi Pagi Diinput", teacher: "Budi Santoso, S.Pd." },
    { id: 2, time: "07:25 WIB", class: "X OB", status: "Presensi Pagi Diinput", teacher: "Siti Rahmawati, S.Pd." },
    { id: 3, time: "07:30 WIB", class: "XI TIA", status: "Presensi Pagi Diinput", teacher: "Eko Prasetyo, S.Kom." },
    { id: 4, time: "07:35 WIB", class: "X MA", status: "Presensi Pagi Diinput", teacher: "Agus Setiawan, S.T." },
  ],
  trendData: [
    { day: "Senin", Hadir: 810, Alpa: 10 },
    { day: "Selasa", Hadir: 805, Alpa: 12 },
    { day: "Rabu", Hadir: 798, Alpa: 15 },
    { day: "Kamis", Hadir: 802, Alpa: 8 },
    { day: "Jumat", Hadir: 790, Alpa: 14 },
  ],
};
