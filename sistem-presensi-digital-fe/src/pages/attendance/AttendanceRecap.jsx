import React, { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { getKelas, getSiswaByKelas } from "@/services/siswaService";
import { getAbsensiHarian, getRekapBulanan, getRekapPeriode } from "@/services/attendanceService";
import { getWeekRange, getYearRange, formatWeekLabel, MONTH_NAMES_ID } from "@/utils/dateHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, UserCheck, UserX, Clock, AlertTriangle, Download, Lock,
  Calendar, CalendarDays, CalendarRange, CalendarClock, LoaderCircle,
  Search, RotateCcw, X, FileSpreadsheet
} from "lucide-react";
import { isWaliKelas, isAdmin } from "@/utils/roles";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const PERIODS = [
  { id: "daily", label: "Harian", Icon: Calendar },
  { id: "weekly", label: "Mingguan", Icon: CalendarDays },
  { id: "monthly", label: "Bulanan", Icon: CalendarRange },
  { id: "semester1", label: "Semester 1", Icon: CalendarClock },
  { id: "semester2", label: "Semester 2", Icon: CalendarClock },
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function capitalize(s) {
  if (!s) return null;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function SummaryCards({ summary }) {
  const cards = [
    {
      label: "Total Siswa",
      value: summary.total,
      icon: Users,
      bgClass: "bg-slate-50 border-border dark:bg-slate-900/30",
      accentBg: "bg-slate-500",
      iconBg: "bg-slate-500 text-white",
    },
    {
      label: "Hadir",
      value: summary.hadir,
      icon: UserCheck,
      bgClass: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800",
      accentBg: "bg-emerald-500",
      iconBg: "bg-emerald-500 text-white",
    },
    {
      label: "Terlambat",
      value: summary.terlambat,
      icon: Clock,
      bgClass: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800",
      accentBg: "bg-amber-500",
      iconBg: "bg-amber-500 text-white",
    },
    {
      label: "Izin",
      value: summary.izin,
      icon: Clock,
      bgClass: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800",
      accentBg: "bg-yellow-500",
      iconBg: "bg-yellow-500 text-white",
    },
    {
      label: "Sakit",
      value: summary.sakit,
      icon: AlertTriangle,
      bgClass: "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800",
      accentBg: "bg-orange-500",
      iconBg: "bg-orange-500 text-white",
    },
    {
      label: "Alpa",
      value: summary.alpa,
      icon: UserX,
      bgClass: "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800",
      accentBg: "bg-rose-500",
      iconBg: "bg-rose-500 text-white",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map(({ label, value, icon: Icon, bgClass, accentBg, iconBg }) => (
        <div
          key={label}
          className={cn(
            "relative overflow-hidden rounded-xl border p-3.5 flex flex-col gap-1.5 shadow-xs text-left transition-all duration-200",
            bgClass
          )}
        >
          <span className={cn("absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full", accentBg)} />
          <div className="flex items-center justify-between pl-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
            <div className={cn("flex items-center justify-center size-6 rounded shrink-0", iconBg)}>
              <Icon className="size-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-foreground pl-2 tracking-tight">{value}</p>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status, isLate = false }) {
  const map = {
    Hadir: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    Sakit: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800",
    Izin: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800",
    Alpa: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  };
  if (!status) return <span className="text-xs text-muted-foreground/70 italic">Belum diinput</span>;
  return (
    <div className="inline-flex items-center justify-center gap-1.5 flex-wrap">
      <Badge className={cn("text-[11px] font-bold border shadow-2xs hover:bg-inherit px-2.5 py-0.5", map[status] || "bg-muted text-muted-foreground")}>
        {status}
      </Badge>
      {status === "Hadir" && isLate && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-2xs">
          <Clock className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Terlambat</span>
        </span>
      )}
    </div>
  );
}

function PctBadge({ pct }) {
  const val = parseFloat(pct);
  const cls =
    val >= 80
      ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
      : val >= 60
      ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
      : "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-extrabold border shadow-2xs", cls)}>
      {pct}%
    </span>
  );
}

// Tabel Harian — status per sesi (Pagi & Sore terpisah)
function DailyTable({ pagiRecords, soreRecords, students, searchQuery }) {
  const pagiMap = useMemo(() => {
    const m = {};
    pagiRecords.forEach((r) => { m[r.siswa_id] = r; });
    return m;
  }, [pagiRecords]);

  const soreMap = useMemo(() => {
    const m = {};
    soreRecords.forEach((r) => { m[r.siswa_id] = r; });
    return m;
  }, [soreRecords]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-border">
            <TableHead className="w-14 text-center font-bold text-foreground text-xs uppercase tracking-wider">No.</TableHead>
            <TableHead className="w-32 font-bold text-foreground text-xs uppercase tracking-wider">NIS</TableHead>
            <TableHead className="min-w-[200px] font-bold text-foreground text-xs uppercase tracking-wider">Nama Siswa</TableHead>
            <TableHead className="text-center font-bold text-foreground text-xs uppercase tracking-wider min-w-[140px]">Sesi Pagi</TableHead>
            <TableHead className="text-center font-bold text-foreground text-xs uppercase tracking-wider min-w-[140px]">Sesi Sore</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Users className="size-8 text-muted-foreground/40" />
                  <p className="font-medium text-sm">
                    {searchQuery ? `Tidak ada siswa yang cocok dengan "${searchQuery}"` : "Tidak ada data siswa untuk kelas ini."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            students.map((s, idx) => {
              const pagi = pagiMap[s.id];
              const sore = soreMap[s.id];
              return (
                <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-center text-muted-foreground font-semibold text-xs py-3">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-xs font-medium text-muted-foreground py-3">{s.nis}</TableCell>
                  <TableCell className="font-bold text-foreground py-3 text-left">{s.name}</TableCell>
                  <TableCell className="text-center py-3">
                    <StatusBadge
                      status={capitalize(pagi?.status)}
                      isLate={Boolean(pagi?.terlambat)}
                    />
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <StatusBadge status={capitalize(sore?.status)} />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Tabel Akumulasi (Mingguan / Bulanan / Semesteran) — dari data rekap backend
function AggregateTable({ rekapData, students, searchQuery }) {
  const aggMap = useMemo(() => {
    const m = {};
    rekapData.forEach((d) => {
      if (d.siswa) m[d.siswa.id] = d;
    });
    return m;
  }, [rekapData]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-border">
            <TableHead className="w-14 text-center font-bold text-foreground text-xs uppercase tracking-wider">No.</TableHead>
            <TableHead className="w-32 font-bold text-foreground text-xs uppercase tracking-wider">NIS</TableHead>
            <TableHead className="min-w-[200px] font-bold text-foreground text-xs uppercase tracking-wider">Nama Siswa</TableHead>
            <TableHead className="text-center font-bold text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wider">Hadir</TableHead>
            <TableHead className="text-center font-bold text-amber-700 dark:text-amber-400 text-xs uppercase tracking-wider">Terlambat</TableHead>
            <TableHead className="text-center font-bold text-orange-700 dark:text-orange-400 text-xs uppercase tracking-wider">Sakit</TableHead>
            <TableHead className="text-center font-bold text-yellow-700 dark:text-yellow-400 text-xs uppercase tracking-wider">Izin</TableHead>
            <TableHead className="text-center font-bold text-rose-700 dark:text-rose-400 text-xs uppercase tracking-wider">Alpa</TableHead>
            <TableHead className="text-center font-bold text-foreground text-xs uppercase tracking-wider">% Kehadiran</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Users className="size-8 text-muted-foreground/40" />
                  <p className="font-medium text-sm">
                    {searchQuery ? `Tidak ada siswa yang cocok dengan "${searchQuery}"` : "Tidak ada data siswa untuk kelas ini."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            students.map((s, idx) => {
              const d = aggMap[s.id];
              const hadir = d?.hadir || 0;
              const terlambat = d?.terlambat || 0;
              const sakit = d?.sakit || 0;
              const izin = d?.izin || 0;
              const alpa = d?.alpa || 0;
              const total = d?.total || 0;
              const pct = total > 0 ? ((hadir / total) * 100).toFixed(1) : "0.0";

              return (
                <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-center text-muted-foreground font-semibold text-xs py-3">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-xs font-medium text-muted-foreground py-3">{s.nis}</TableCell>
                  <TableCell className="font-bold text-foreground py-3 text-left">{s.name}</TableCell>
                  <TableCell className="text-center font-bold text-emerald-700 dark:text-emerald-400 py-3">{hadir}</TableCell>
                  <TableCell className="text-center font-bold text-amber-700 dark:text-amber-400 py-3">{terlambat}</TableCell>
                  <TableCell className="text-center font-bold text-orange-700 dark:text-orange-400 py-3">{sakit}</TableCell>
                  <TableCell className="text-center font-bold text-yellow-700 dark:text-yellow-400 py-3">{izin}</TableCell>
                  <TableCell className="text-center font-bold text-rose-700 dark:text-rose-400 py-3">{alpa}</TableCell>
                  <TableCell className="text-center py-3"><PctBadge pct={pct} /></TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function AttendanceRecap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userIsWali = isWaliKelas(user?.role);
  const userIsAdmin = isAdmin(user?.role);

  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState("");

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [activePeriod, setActivePeriod] = useState("daily");
  const [dailyDate, setDailyDate] = useState(todayStr);
  const [weeklyRef, setWeeklyRef] = useState(todayStr);
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [semesterYear, setSemesterYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");

  const [loadingData, setLoadingData] = useState(false);
  const [dailyPagi, setDailyPagi] = useState([]);
  const [dailySore, setDailySore] = useState([]);
  const [rekapData, setRekapData] = useState([]);
  const [periodLabel, setPeriodLabel] = useState("");

  // Load daftar kelas
  useEffect(() => {
    setLoadingClasses(true);
    getKelas()
      .then((res) => {
        const list = res.data || res;
        setClasses(list);
        if (userIsWali && user?.classId) {
          setSelectedClassId(String(user.classId));
        } else if (list.length > 0) {
          setSelectedClassId(String(list[0].id));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingClasses(false));
  }, [userIsWali, user?.classId]);

  const currentClass = useMemo(() => {
    const found = classes.find((c) => String(c.id) === String(selectedClassId));
    return found ? { id: found.id, name: found.nama_kelas } : { id: selectedClassId, name: "-" };
  }, [classes, selectedClassId]);

  // Load daftar siswa tiap kelas berubah
  useEffect(() => {
    if (!selectedClassId) return;
    setLoadingStudents(true);
    getSiswaByKelas(selectedClassId)
      .then((res) => {
        const list = res.data || res;
        setStudents(list.map((s) => ({ id: s.id, nis: s.nis, name: s.nama })));
      })
      .catch((err) => {
        console.error(err);
        setStudents([]);
      })
      .finally(() => setLoadingStudents(false));
  }, [selectedClassId]);

  // Load data rekap sesuai periode aktif
  useEffect(() => {
    if (!selectedClassId) return;
    setLoadingData(true);

    const run = async () => {
      try {
        if (activePeriod === "daily") {
          const { pagi, sore } = await getAbsensiHarian(selectedClassId, dailyDate);
          setDailyPagi(pagi);
          setDailySore(sore);
          const d = new Date(dailyDate);
          setPeriodLabel(d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
        } else if (activePeriod === "weekly") {
          const { from, to } = getWeekRange(weeklyRef);
          const data = await getRekapPeriode({ kelas_id: selectedClassId, dari: from, sampai: to });
          setRekapData(data.data || data);
          setPeriodLabel(`Minggu: ${formatWeekLabel(from, to)}`);
        } else if (activePeriod === "monthly") {
          const data = await getRekapBulanan({ kelas_id: selectedClassId, bulan: monthlyMonth, tahun: monthlyYear });
          setRekapData(data.data || data);
          setPeriodLabel(`${MONTH_NAMES_ID[monthlyMonth - 1]} ${monthlyYear}`);
        } else if (activePeriod === "semester1") {
          const from = `${semesterYear}-07-01`;
          const to = `${semesterYear}-12-31`;
          const data = await getRekapPeriode({ kelas_id: selectedClassId, dari: from, sampai: to });
          setRekapData(data.data || data);
          setPeriodLabel(`Semester 1 (Ganjil) ${semesterYear}`);
        } else if (activePeriod === "semester2") {
          const from = `${semesterYear}-01-01`;
          const to = `${semesterYear}-06-30`;
          const data = await getRekapPeriode({ kelas_id: selectedClassId, dari: from, sampai: to });
          setRekapData(data.data || data);
          setPeriodLabel(`Semester 2 (Genap) ${semesterYear}`);
        } else {
          const { from, to } = getYearRange(semesterYear);
          const data = await getRekapPeriode({ kelas_id: selectedClassId, dari: from, sampai: to });
          setRekapData(data.data || data);
          setPeriodLabel(`Tahun ${semesterYear}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    run();
  }, [activePeriod, selectedClassId, dailyDate, weeklyRef, monthlyMonth, monthlyYear, semesterYear]);

  // Filter siswa berdasarkan search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter(
      (s) => s.name?.toLowerCase().includes(q) || s.nis?.toString().toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // Cek apakah filter aktif (bisa direset)
  const isFilterActive = useMemo(() => {
    const defaultClassId = userIsWali && user?.classId ? String(user.classId) : (classes[0]?.id ? String(classes[0].id) : "");
    return (
      activePeriod !== "daily" ||
      dailyDate !== todayStr() ||
      searchQuery !== "" ||
      (!userIsWali && selectedClassId !== defaultClassId)
    );
  }, [activePeriod, dailyDate, searchQuery, selectedClassId, userIsWali, user?.classId, classes]);

  const handleResetFilter = () => {
    setActivePeriod("daily");
    setDailyDate(todayStr());
    setWeeklyRef(todayStr());
    setMonthlyMonth(new Date().getMonth() + 1);
    setMonthlyYear(new Date().getFullYear());
    setSemesterYear(new Date().getFullYear());
    setSearchQuery("");
    if (!userIsWali && classes.length > 0) {
      setSelectedClassId(String(classes[0].id));
    }
  };

  // Ringkasan kartu atas
  const summary = useMemo(() => {
    const total = students.length;

    if (activePeriod === "daily") {
      let hadir = 0, sakit = 0, izin = 0, alpa = 0, terlambat = 0;
      const combined = [...dailyPagi, ...dailySore];
      combined.forEach((r) => {
        if (r.status === "hadir") {
          hadir++;
          if (r.terlambat) terlambat++;
        }
        else if (r.status === "sakit") sakit++;
        else if (r.status === "izin") izin++;
        else if (r.status === "alpa") alpa++;
      });
      return { total, hadir, sakit, izin, alpa, terlambat };
    }

    let hadir = 0, sakit = 0, izin = 0, alpa = 0, terlambat = 0;
    rekapData.forEach((d) => {
      hadir += d.hadir || 0;
      sakit += d.sakit || 0;
      izin += d.izin || 0;
      alpa += d.alpa || 0;
      terlambat += d.terlambat || 0;
    });
    return { total, hadir, sakit, izin, alpa, terlambat };
  }, [activePeriod, students, dailyPagi, dailySore, rekapData]);

  const years = [2025, 2026, 2027];

  if (loadingClasses) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" />
        <span className="text-sm font-medium">Memuat data kelas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 overflow-x-hidden">
      <PageHeader
        title="Rekap Absensi"
        description="Lihat ringkasan dan riwayat kehadiran siswa berdasarkan periode."
        actions={
          <Button
            onClick={() => navigate("/attendance/export")}
            className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold gap-2 cursor-pointer shadow-xs"
          >
            <Download className="size-4" />
            <span>Export Excel</span>
          </Button>
        }
      />

      {/* ─── Filter Card ─── */}
      <Card className="shadow-xs border-border text-left overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary shrink-0">
                <Calendar className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">Filter & Periode Rekap</CardTitle>
                <p className="text-xs text-muted-foreground font-medium">Sesuaikan periode, kelas, atau cari nama siswa</p>
              </div>
            </div>

            {/* Periode Tabs */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-border bg-muted/60 flex-wrap sm:flex-nowrap">
              {PERIODS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActivePeriod(id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer",
                    activePeriod === id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/70"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* 1. Pilih Kelas */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Pilih Kelas</Label>
              {userIsWali ? (
                <div className="flex items-center justify-between h-9 px-3 rounded-lg border border-border bg-slate-100/80 dark:bg-slate-800/80">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Lock className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-bold text-xs text-foreground truncate">Kelas {currentClass.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                    Wali Kelas
                  </span>
                </div>
              ) : (
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-card text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>Kelas {c.nama_kelas}</option>
                  ))}
                </select>
              )}
            </div>

            {/* 2. Controls sesuai periode */}
            {activePeriod === "daily" && (
              <div className="space-y-1.5">
                <Label htmlFor="recap-date" className="text-xs font-bold text-foreground">Tanggal</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="recap-date"
                    type="date"
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                    className="pl-9 h-9 text-xs font-bold w-full"
                  />
                </div>
              </div>
            )}

            {activePeriod === "weekly" && (
              <div className="space-y-1.5">
                <Label htmlFor="recap-week-ref" className="text-xs font-bold text-foreground">
                  Tanggal dalam Minggu
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="recap-week-ref"
                    type="date"
                    value={weeklyRef}
                    onChange={(e) => setWeeklyRef(e.target.value)}
                    className="pl-9 h-9 text-xs font-bold w-full"
                  />
                </div>
              </div>
            )}

            {activePeriod === "monthly" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="recap-month" className="text-xs font-bold text-foreground">Bulan</Label>
                  <select
                    id="recap-month"
                    value={monthlyMonth}
                    onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-card text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  >
                    {MONTH_NAMES_ID.map((name, i) => (
                      <option key={i + 1} value={i + 1}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="recap-month-year" className="text-xs font-bold text-foreground">Tahun</Label>
                  <select
                    id="recap-month-year"
                    value={monthlyYear}
                    onChange={(e) => setMonthlyYear(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-card text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  >
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}

            {(activePeriod === "semester1" || activePeriod === "semester2" || activePeriod === "yearly") && (
              <div className="space-y-1.5">
                <Label htmlFor="recap-semester-year" className="text-xs font-bold text-foreground">Tahun Ajaran</Label>
                <select
                  id="recap-semester-year"
                  value={semesterYear}
                  onChange={(e) => setSemesterYear(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-card text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}

            {/* 3. Search Siswa */}
            <div className="space-y-1.5">
              <Label htmlFor="recap-search" className="text-xs font-bold text-foreground">Cari Siswa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  id="recap-search"
                  type="text"
                  placeholder="Cari nama / NIS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-9 text-xs font-semibold w-full"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 4. Reset Filter Button */}
            <div className="flex items-center">
              <Button
                type="button"
                variant="outline"
                disabled={!isFilterActive}
                onClick={handleResetFilter}
                className={cn(
                  "h-9 w-full text-xs font-bold gap-2 cursor-pointer transition-all border-dashed",
                  isFilterActive
                    ? "text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    : "opacity-50 text-muted-foreground cursor-not-allowed"
                )}
              >
                <RotateCcw className="size-3.5" />
                <span>Reset Filter</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Summary / Scorecard ─── */}
      <SummaryCards summary={summary} />

      {/* ─── Tabel Rekap ─── */}
      <Card className="shadow-xs border-border overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50 text-left bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Rekap Kehadiran — Kelas {currentClass.name}
              </CardTitle>
              {searchQuery && (
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Menampilkan hasil pencarian untuk &ldquo;{searchQuery}&rdquo; ({filteredStudents.length} dari {students.length} siswa)
                </p>
              )}
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 self-start sm:self-auto">
              {periodLabel}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingData || loadingStudents ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <LoaderCircle className="size-5 animate-spin" />
              <span className="text-sm font-medium">Memuat data rekap...</span>
            </div>
          ) : activePeriod === "daily" ? (
            <DailyTable
              pagiRecords={dailyPagi}
              soreRecords={dailySore}
              students={filteredStudents}
              searchQuery={searchQuery}
            />
          ) : (
            <AggregateTable
              rekapData={rekapData}
              students={filteredStudents}
              searchQuery={searchQuery}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AttendanceRecap;