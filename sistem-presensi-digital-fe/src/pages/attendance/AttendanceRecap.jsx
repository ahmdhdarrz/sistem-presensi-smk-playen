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
} from "lucide-react";
import { isWaliKelas, isAdmin } from "@/utils/roles";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const PERIODS = [
  { id: "daily", label: "Harian", Icon: Calendar },
  { id: "weekly", label: "Mingguan", Icon: CalendarDays },
  { id: "monthly", label: "Bulanan", Icon: CalendarRange },
  { id: "yearly", label: "Tahunan", Icon: CalendarClock },
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
    { label: "Total Siswa", value: summary.total, icon: Users, colorClass: "border-border bg-card", iconClass: "text-primary", valueClass: "text-foreground" },
    { label: "Hadir", value: summary.hadir, icon: UserCheck, colorClass: "border-emerald-200 bg-emerald-50/60", iconClass: "text-emerald-600", valueClass: "text-emerald-800" },
    { label: "Sakit", value: summary.sakit, icon: AlertTriangle, colorClass: "border-orange-200 bg-orange-50/60", iconClass: "text-orange-600", valueClass: "text-orange-800" },
    { label: "Izin", value: summary.izin, icon: Clock, colorClass: "border-yellow-200 bg-yellow-50/60", iconClass: "text-yellow-600", valueClass: "text-yellow-800" },
    { label: "Alpa", value: summary.alpa, icon: UserX, colorClass: "border-rose-200 bg-rose-50/60", iconClass: "text-rose-600", valueClass: "text-rose-800" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(({ label, value, icon: Icon, colorClass, iconClass, valueClass }) => (
        <div key={label} className={cn("p-4 rounded-xl border shadow-xs text-left", colorClass)}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">{label}</span>
            <Icon className={cn("size-4", iconClass)} />
          </div>
          <p className={cn("text-2xl font-bold mt-2 tracking-tight", valueClass)}>{value}</p>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Hadir: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Sakit: "bg-orange-100 text-orange-700 border-orange-200",
    Izin: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Alpa: "bg-rose-100 text-rose-700 border-rose-200",
  };
  if (!status) return <span className="text-xs text-muted-foreground italic">Belum diinput</span>;
  return (
    <Badge className={cn("text-xs font-bold border hover:bg-inherit", map[status] || "bg-muted text-muted-foreground")}>
      {status}
    </Badge>
  );
}

function PctBadge({ pct }) {
  const val = parseFloat(pct);
  const cls =
    val >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : val >= 60 ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-rose-50 text-rose-700 border-rose-200";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border", cls)}>
      {pct}%
    </span>
  );
}

// Tabel Harian — status per sesi (Pagi & Sore terpisah)
function DailyTable({ pagiRecords, soreRecords, students }) {
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
          <TableRow className="bg-slate-50/70">
            <TableHead className="w-12 text-center font-bold text-foreground">No.</TableHead>
            <TableHead className="w-28 font-bold text-foreground">NIS</TableHead>
            <TableHead className="min-w-[180px] font-bold text-foreground">Nama Siswa</TableHead>
            <TableHead className="text-center font-bold text-foreground">Sesi Pagi</TableHead>
            <TableHead className="text-center font-bold text-foreground">Sesi Sore</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground font-medium">
                Tidak ada data siswa untuk kelas ini.
              </TableCell>
            </TableRow>
          ) : (
            students.map((s, idx) => {
              const pagi = pagiMap[s.id];
              const sore = soreMap[s.id];
              return (
                <TableRow key={s.id} className="hover:bg-muted/20">
                  <TableCell className="text-center text-muted-foreground font-medium py-3">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground py-3">{s.nis}</TableCell>
                  <TableCell className="font-semibold text-foreground py-3 text-left">{s.name}</TableCell>
                  <TableCell className="text-center py-3"><StatusBadge status={capitalize(pagi?.status)} /></TableCell>
                  <TableCell className="text-center py-3"><StatusBadge status={capitalize(sore?.status)} /></TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Tabel Akumulasi (Mingguan / Bulanan / Tahunan) — dari data rekap backend
function AggregateTable({ rekapData, students }) {
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
          <TableRow className="bg-slate-50/70">
            <TableHead className="w-12 text-center font-bold text-foreground">No.</TableHead>
            <TableHead className="w-28 font-bold text-foreground">NIS</TableHead>
            <TableHead className="min-w-[180px] font-bold text-foreground">Nama Siswa</TableHead>
            <TableHead className="text-center font-bold text-emerald-700">Hadir</TableHead>
            <TableHead className="text-center font-bold text-orange-700">Sakit</TableHead>
            <TableHead className="text-center font-bold text-yellow-700">Izin</TableHead>
            <TableHead className="text-center font-bold text-rose-700">Alpa</TableHead>
            <TableHead className="text-center font-bold text-foreground">% Kehadiran</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-muted-foreground font-medium">
                Tidak ada data siswa untuk kelas ini.
              </TableCell>
            </TableRow>
          ) : (
            students.map((s, idx) => {
              const d = aggMap[s.id];
              const hadir = d?.hadir || 0;
              const sakit = d?.sakit || 0;
              const izin = d?.izin || 0;
              const alpa = d?.alpa || 0;
              const total = d?.total || 0;
              const pct = total > 0 ? ((hadir / total) * 100).toFixed(1) : "0.0";

              return (
                <TableRow key={s.id} className="hover:bg-muted/20">
                  <TableCell className="text-center text-muted-foreground font-medium py-3">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground py-3">{s.nis}</TableCell>
                  <TableCell className="font-semibold text-foreground py-3 text-left">{s.name}</TableCell>
                  <TableCell className="text-center font-bold text-emerald-700 py-3">{hadir}</TableCell>
                  <TableCell className="text-center font-bold text-orange-700 py-3">{sakit}</TableCell>
                  <TableCell className="text-center font-bold text-yellow-700 py-3">{izin}</TableCell>
                  <TableCell className="text-center font-bold text-rose-700 py-3">{alpa}</TableCell>
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
  const [yearlyYear, setYearlyYear] = useState(new Date().getFullYear());

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
        } else {
          const { from, to } = getYearRange(yearlyYear);
          const data = await getRekapPeriode({ kelas_id: selectedClassId, dari: from, sampai: to });
          setRekapData(data.data || data);
          setPeriodLabel(`Tahun ${yearlyYear}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    run();
  }, [activePeriod, selectedClassId, dailyDate, weeklyRef, monthlyMonth, monthlyYear, yearlyYear]);

  // Ringkasan kartu atas
  const summary = useMemo(() => {
    const total = students.length;

    if (activePeriod === "daily") {
      let hadir = 0, sakit = 0, izin = 0, alpa = 0;
      const combined = [...dailyPagi, ...dailySore];
      combined.forEach((r) => {
        if (r.status === "hadir") hadir++;
        else if (r.status === "sakit") sakit++;
        else if (r.status === "izin") izin++;
        else if (r.status === "alpa") alpa++;
      });
      return { total, hadir, sakit, izin, alpa };
    }

    let hadir = 0, sakit = 0, izin = 0, alpa = 0;
    rekapData.forEach((d) => {
      hadir += d.hadir || 0;
      sakit += d.sakit || 0;
      izin += d.izin || 0;
      alpa += d.alpa || 0;
    });
    return { total, hadir, sakit, izin, alpa };
  }, [activePeriod, students, dailyPagi, dailySore, rekapData]);

  const years = [2025, 2026, 2027];

  if (loadingClasses) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" />
        <span>Memuat data kelas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Rekap Absensi"
        description="Lihat ringkasan dan riwayat kehadiran siswa berdasarkan periode."
        actions={
          <Button
            onClick={() => navigate("/attendance/export")}
            className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold gap-2 cursor-pointer shadow-xs"
          >
            <Download className="size-4" />
            Export Excel
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
          Pilih Periode
        </span>
        <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-border bg-muted/50 flex-wrap sm:flex-nowrap">
          {PERIODS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActivePeriod(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer",
                activePeriod === id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/70"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <Card className="shadow-xs border-border text-left">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
            <div className="space-y-1.5 min-w-[200px]">
              <Label className="text-xs font-semibold text-foreground">Pilih Kelas</Label>
              {userIsWali ? (
                <div className="flex items-center justify-between h-10 px-3.5 rounded-lg border border-border bg-slate-100/80">
                  <div className="flex items-center gap-2">
                    <Lock className="size-3.5 text-muted-foreground" />
                    <span className="font-bold text-sm text-foreground">Kelas {currentClass.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    Guru Wali Kelas
                  </span>
                </div>
              ) : (
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-card text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>Kelas {c.nama_kelas}</option>
                  ))}
                </select>
              )}
            </div>

            {activePeriod === "daily" && (
              <div className="space-y-1.5">
                <Label htmlFor="recap-date" className="text-xs font-semibold text-foreground">Tanggal</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="recap-date"
                    type="date"
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                    className="pl-9 font-semibold text-sm w-auto"
                  />
                </div>
              </div>
            )}

            {activePeriod === "weekly" && (
              <div className="space-y-1.5">
                <Label htmlFor="recap-week-ref" className="text-xs font-semibold text-foreground">
                  Pilih Tanggal dalam Minggu
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="recap-week-ref"
                    type="date"
                    value={weeklyRef}
                    onChange={(e) => setWeeklyRef(e.target.value)}
                    className="pl-9 font-semibold text-sm w-auto"
                  />
                </div>
              </div>
            )}

            {activePeriod === "monthly" && (
              <div className="flex gap-2 flex-wrap">
                <div className="space-y-1.5">
                  <Label htmlFor="recap-month" className="text-xs font-semibold text-foreground">Bulan</Label>
                  <select
                    id="recap-month"
                    value={monthlyMonth}
                    onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                    className="h-10 px-3.5 rounded-lg border border-border bg-card text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  >
                    {MONTH_NAMES_ID.map((name, i) => (
                      <option key={i + 1} value={i + 1}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="recap-month-year" className="text-xs font-semibold text-foreground">Tahun</Label>
                  <select
                    id="recap-month-year"
                    value={monthlyYear}
                    onChange={(e) => setMonthlyYear(Number(e.target.value))}
                    className="h-10 px-3.5 rounded-lg border border-border bg-card text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  >
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}

            {activePeriod === "yearly" && (
              <div className="space-y-1.5">
                <Label htmlFor="recap-year" className="text-xs font-semibold text-foreground">Tahun</Label>
                <select
                  id="recap-year"
                  value={yearlyYear}
                  onChange={(e) => setYearlyYear(Number(e.target.value))}
                  className="h-10 px-3.5 rounded-lg border border-border bg-card text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SummaryCards summary={summary} />

      <Card className="shadow-xs border-border">
        <CardHeader className="pb-3 border-b border-border/50 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-base font-bold text-foreground">
              Rekap Kehadiran — Kelas {currentClass.name}
            </CardTitle>
            <span className="text-sm text-muted-foreground font-medium">{periodLabel}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingData || loadingStudents ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <LoaderCircle className="size-5 animate-spin" />
              <span>Memuat data rekap...</span>
            </div>
          ) : activePeriod === "daily" ? (
            <DailyTable pagiRecords={dailyPagi} soreRecords={dailySore} students={students} />
          ) : (
            <AggregateTable rekapData={rekapData} students={students} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AttendanceRecap;