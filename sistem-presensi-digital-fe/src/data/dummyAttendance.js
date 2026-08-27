/**
 * DUMMY ATTENDANCE DATA
 *
 * Data presensi dummy yang digunakan oleh halaman Rekap Absensi.
 * Mencakup rentang 3 bulan terakhir (Juli – September 2026) untuk 23 kelas.
 *
 * Struktur setiap record:
 * {
 *   studentId: number,
 *   classId:   number,
 *   date:      string (YYYY-MM-DD),  // tanggal presensi
 *   status:    "Hadir" | "Sakit" | "Izin" | "Alpa",
 *   note:      string,
 * }
 *
 * TODO: Replace with Laravel API response
 *   GET /api/attendance?class_id={id}&date_from={from}&date_to={to}
 *   GET /api/attendance/recap?class_id={id}&period={daily|weekly|monthly|yearly}&ref={ref}
 */

import { masterClasses, masterStudents } from "@/data/dummyStudents";

// ─── Helper: generate school days (Mon–Sat) for a given month ────────────────
function schoolDaysInMonth(year, month) {
  const days = [];
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    const dow = date.getDay(); // 0=Sun, 6=Sat
    if (dow !== 0) {
      // exclude Sundays (Sabtu tetap masuk di SMK)
      days.push(date.toISOString().split("T")[0]);
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// We generate 3 months of data: July, August, September 2026
const MONTHS = [
  { year: 2026, month: 7 },
  { year: 2026, month: 8 },
  { year: 2026, month: 9 },
];

const STATUS_OPTIONS = ["Hadir", "Hadir", "Hadir", "Hadir", "Hadir", "Sakit", "Izin", "Alpa"];

/**
 * Pseudo-deterministic status based on student id + date string.
 * Keeps data stable across renders without being truly random.
 */
function deterministicStatus(studentId, dateStr) {
  let hash = studentId * 31;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 17 + dateStr.charCodeAt(i)) & 0xffff;
  }
  return STATUS_OPTIONS[hash % STATUS_OPTIONS.length];
}

// Build the full dataset once
const _allRecords = [];

for (const { year, month } of MONTHS) {
  const days = schoolDaysInMonth(year, month);
  for (const cls of masterClasses) {
    const students = masterStudents.filter((s) => s.classId === cls.id);
    for (const day of days) {
      for (const student of students) {
        _allRecords.push({
          studentId: student.id,
          classId: cls.id,
          date: day,
          status: deterministicStatus(student.id, day),
          note: "",
        });
      }
    }
  }
}

/**
 * Export seluruh records (immutable).
 * Gunakan helper di bawah agar lebih efisien.
 */
export const allAttendanceRecords = _allRecords;

// ─── Helper: filter records by classId ───────────────────────────────────────

/**
 * Ambil seluruh records untuk kelas tertentu.
 * TODO: Replace with GET /api/attendance?class_id={classId}
 */
export function getRecordsByClass(classId) {
  const id = Number(classId);
  return allAttendanceRecords.filter((r) => r.classId === id);
}

/**
 * Ambil records untuk kelas + tanggal tertentu (Rekap Harian).
 * TODO: Replace with GET /api/attendance?class_id={classId}&date={date}
 */
export function getDailyRecords(classId, date) {
  const id = Number(classId);
  return allAttendanceRecords.filter(
    (r) => r.classId === id && r.date === date
  );
}

/**
 * Ambil records untuk kelas + rentang tanggal (Rekap Mingguan / Bulanan / Tahunan).
 * TODO: Replace with GET /api/attendance?class_id={classId}&date_from={from}&date_to={to}
 */
export function getRangeRecords(classId, dateFrom, dateTo) {
  const id = Number(classId);
  return allAttendanceRecords.filter(
    (r) => r.classId === id && r.date >= dateFrom && r.date <= dateTo
  );
}

/**
 * Hitung summary { total, hadir, sakit, izin, alpa } dari sekumpulan records.
 * Untuk harian: total = jumlah siswa.
 * Untuk akumulasi: total = total record (hadir + sakit + izin + alpa).
 */
export function calcSummary(records, totalStudents) {
  let hadir = 0, sakit = 0, izin = 0, alpa = 0;
  for (const r of records) {
    if (r.status === "Hadir") hadir++;
    else if (r.status === "Sakit") sakit++;
    else if (r.status === "Izin") izin++;
    else if (r.status === "Alpa") alpa++;
  }
  return { total: totalStudents, hadir, sakit, izin, alpa };
}

/**
 * Agregasi per-siswa dari sekumpulan records.
 * Returns: [{ studentId, hadir, sakit, izin, alpa, totalDays, pct }]
 */
export function aggregateByStudent(records) {
  const map = {};
  for (const r of records) {
    if (!map[r.studentId]) {
      map[r.studentId] = { studentId: r.studentId, hadir: 0, sakit: 0, izin: 0, alpa: 0, totalDays: 0 };
    }
    map[r.studentId].totalDays++;
    if (r.status === "Hadir") map[r.studentId].hadir++;
    else if (r.status === "Sakit") map[r.studentId].sakit++;
    else if (r.status === "Izin") map[r.studentId].izin++;
    else if (r.status === "Alpa") map[r.studentId].alpa++;
  }
  return Object.values(map).map((d) => ({
    ...d,
    pct: d.totalDays > 0 ? ((d.hadir / d.totalDays) * 100).toFixed(1) : "0.0",
  }));
}

// ─── Week helpers ─────────────────────────────────────────────────────────────

/**
 * Dari sebuah tanggal referensi, kembalikan Senin dan Sabtu minggu tersebut.
 */
export function getWeekRange(refDateStr) {
  const d = new Date(refDateStr);
  const day = d.getDay(); // 0=Sun
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sat = new Date(mon);
  sat.setDate(mon.getDate() + 5); // Mon + 5 = Sat
  const fmt = (dt) => dt.toISOString().split("T")[0];
  return { from: fmt(mon), to: fmt(sat) };
}

/**
 * Format rentang tanggal ke label Indonesia.
 * Contoh: "18 – 24 Agustus 2026"
 */
export function formatWeekLabel(from, to) {
  const opts = { day: "numeric", month: "long", year: "numeric" };
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const fromFmt = fromDate.toLocaleDateString("id-ID", { day: "numeric", month: "long" });
  const toFmt = toDate.toLocaleDateString("id-ID", opts);
  return `${fromFmt} – ${toFmt}`;
}

// ─── Month / Year range helpers ───────────────────────────────────────────────

export function getMonthRange(year, month) {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const last = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  return { from, to };
}

export function getYearRange(year) {
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

/** Format bulan ke label Indonesia */
export const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
