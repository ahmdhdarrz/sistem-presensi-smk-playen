import React, { useState, useMemo } from "react";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { masterClasses, masterStudents } from "@/data/dummyStudents";
import {
  getDailyRecords,
  getRangeRecords,
  calcSummary,
  aggregateByStudent,
  getWeekRange,
  formatWeekLabel,
  getMonthRange,
  getYearRange,
  MONTH_NAMES_ID,
} from "@/data/dummyAttendance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  Download,
  Lock,
  Calendar,
  CalendarDays,
  CalendarRange,
  CalendarClock,
} from "lucide-react";
import { isWaliKelas, isAdmin } from "@/utils/roles";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// ─── Period constants ─────────────────────────────────────────────────────────
const PERIODS = [
  { id: "daily",   label: "Harian",   Icon: Calendar },
  { id: "weekly",  label: "Mingguan", Icon: CalendarDays },
  { id: "monthly", label: "Bulanan",  Icon: CalendarRange },
  { id: "yearly",  label: "Tahunan",  Icon: CalendarClock },
];

// ─── Helper: today string ─────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ─── Summary Cards ────────────────────────────────────────────────────────────
function SummaryCards({ summary }) {
  const cards = [
    {
      label: "Total Siswa",
      value: summary.total,
      icon: Users,
      colorClass: "border-border bg-card text-foreground",
      iconClass: "text-primary",
      valueClass: "text-foreground",
    },
    {
      label: "Hadir",
      value: summary.hadir,
      icon: UserCheck,
      colorClass: "border-emerald-200 bg-emerald-50/60",
      iconClass: "text-emerald-600",
      valueClass: "text-emerald-800",
    },
    {
      label: "Sakit",
      value: summary.sakit,
      icon: AlertTriangle,
      colorClass: "border-amber-200 bg-amber-50/60",
      iconClass: "text-amber-600",
      valueClass: "text-amber-800",
    },
    {
      label: "Izin",
      value: summary.izin,
      icon: Clock,
      colorClass: "border-blue-200 bg-blue-50/60",
      iconClass: "text-blue-600",
      valueClass: "text-blue-800",
    },
    {
      label: "Alpa",
      value: summary.alpa,
      icon: UserX,
      colorClass: "border-rose-200 bg-rose-50/60",
      iconClass: "text-rose-600",
      valueClass: "text-rose-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(({ label, value, icon: Icon, colorClass, iconClass, valueClass }) => (
        <div
          key={label}
          className={cn("p-4 rounded-xl border shadow-xs text-left", colorClass)}
        >
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

// ─── Status badge helper ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Hadir:      "bg-emerald-100 text-emerald-700 border-emerald-200",
    Sakit:      "bg-amber-100  text-amber-700  border-amber-200",
    Izin:       "bg-blue-100   text-blue-700   border-blue-200",
    Alpa:       "bg-rose-100   text-rose-700   border-rose-200",
  };
  return (
    <Badge className={cn("text-xs font-bold border hover:bg-inherit", map[status] || "bg-muted text-muted-foreground")}>
      {status}
    </Badge>
  );
}

// ─── Percentage badge ─────────────────────────────────────────────────────────
function PctBadge({ pct }) {
  const val = parseFloat(pct);
  const cls =
    val >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : val >= 60
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-rose-50 text-rose-700 border-rose-200";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border", cls)}>
      {pct}%
    </span>
  );
}

// ─── Table: Harian ────────────────────────────────────────────────────────────
function DailyTable({ records, students }) {
  const recordMap = useMemo(() => {
    const m = {};
    for (const r of records) m[r.studentId] = r;
    return m;
  }, [records]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/70">
            <TableHead className="w-12 text-center font-bold text-foreground">No.</TableHead>
            <TableHead className="w-28 font-bold text-foreground">NIS</TableHead>
            <TableHead className="min-w-[180px] font-bold text-foreground">Nama Siswa</TableHead>
            <TableHead className="text-center font-bold text-foreground">Status Kehadiran</TableHead>
            <TableHead className="font-bold text-foreground">Keterangan</TableHead>
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
              const rec = recordMap[s.id];
              return (
                <TableRow key={s.id} className="hover:bg-muted/20">
                  <TableCell className="text-center text-muted-foreground font-medium py-3">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground py-3">{s.nis}</TableCell>
                  <TableCell className="font-semibold text-foreground py-3 text-left">{s.name}</TableCell>
                  <TableCell className="text-center py-3">
                    {rec ? <StatusBadge status={rec.status} /> : <span className="text-xs text-muted-foreground italic">Tidak ada data</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground py-3">
                    {rec?.note || <span className="italic text-xs">—</span>}
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

// ─── Table: Akumulasi (Mingguan / Bulanan / Tahunan) ─────────────────────────
function AggregateTable({ records, students }) {
  const aggMap = useMemo(() => {
    const byStudent = aggregateByStudent(records);
    const m = {};
    for (const d of byStudent) m[d.studentId] = d;
    return m;
  }, [records]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/70">
            <TableHead className="w-12 text-center font-bold text-foreground">No.</TableHead>
            <TableHead className="w-28 font-bold text-foreground">NIS</TableHead>
            <TableHead className="min-w-[180px] font-bold text-foreground">Nama Siswa</TableHead>
            <TableHead className="text-center font-bold text-emerald-700">Hadir</TableHead>
            <TableHead className="text-center font-bold text-amber-700">Sakit</TableHead>
            <TableHead className="text-center font-bold text-blue-700">Izin</TableHead>
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
              const d = aggMap[s.id] || { hadir: 0, sakit: 0, izin: 0, alpa: 0, pct: "0.0" };
              return (
                <TableRow key={s.id} className="hover:bg-muted/20">
                  <TableCell className="text-center text-muted-foreground font-medium py-3">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground py-3">{s.nis}</TableCell>
                  <TableCell className="font-semibold text-foreground py-3 text-left">{s.name}</TableCell>
                  <TableCell className="text-center font-bold text-emerald-700 py-3">{d.hadir}</TableCell>
                  <TableCell className="text-center font-bold text-amber-700 py-3">{d.sakit}</TableCell>
                  <TableCell className="text-center font-bold text-blue-700 py-3">{d.izin}</TableCell>
                  <TableCell className="text-center font-bold text-rose-700 py-3">{d.alpa}</TableCell>
                  <TableCell className="text-center py-3"><PctBadge pct={d.pct} /></TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AttendanceRecap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userIsWali  = isWaliKelas(user?.role);
  const userIsAdmin = isAdmin(user?.role);

  // ── Determine initial class ──────────────────────────────────────────────
  const initialClassId = useMemo(() => {
    if (userIsWali && user?.assignedClass) {
      const found = masterClasses.find(
        (c) => c.name.toLowerCase() === user.assignedClass.toLowerCase()
      );
      if (found) return String(found.id);
    }
    return "1";
  }, [user, userIsWali]);

  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [activePeriod, setActivePeriod] = useState("daily");

  // ── Period-specific filter state ─────────────────────────────────────────
  const [dailyDate,    setDailyDate]    = useState(todayStr);
  const [weeklyRef,    setWeeklyRef]    = useState(todayStr);   // any date in the target week
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyYear,  setMonthlyYear]  = useState(new Date().getFullYear());
  const [yearlyYear,   setYearlyYear]   = useState(new Date().getFullYear());

  // ── Derived: current class & students ───────────────────────────────────
  const currentClass = useMemo(
    () => masterClasses.find((c) => String(c.id) === String(selectedClassId)) || masterClasses[0],
    [selectedClassId]
  );

  const students = useMemo(
    () => masterStudents.filter((s) => String(s.classId) === String(selectedClassId)),
    [selectedClassId]
  );

  // ── Derived: records & summary for each period ───────────────────────────
  const { records, summary, periodLabel } = useMemo(() => {
    let recs = [];
    let label = "";

    if (activePeriod === "daily") {
      recs  = getDailyRecords(selectedClassId, dailyDate);
      const d = new Date(dailyDate);
      label = d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } else if (activePeriod === "weekly") {
      const { from, to } = getWeekRange(weeklyRef);
      recs  = getRangeRecords(selectedClassId, from, to);
      label = `Minggu: ${formatWeekLabel(from, to)}`;
    } else if (activePeriod === "monthly") {
      const { from, to } = getMonthRange(monthlyYear, monthlyMonth);
      recs  = getRangeRecords(selectedClassId, from, to);
      label = `${MONTH_NAMES_ID[monthlyMonth - 1]} ${monthlyYear}`;
    } else {
      // yearly
      const { from, to } = getYearRange(yearlyYear);
      recs  = getRangeRecords(selectedClassId, from, to);
      label = `Tahun ${yearlyYear}`;
    }

    return {
      records: recs,
      summary: calcSummary(recs, students.length),
      periodLabel: label,
    };
  }, [activePeriod, selectedClassId, dailyDate, weeklyRef, monthlyMonth, monthlyYear, yearlyYear, students.length]);

  // ── Available years for select ───────────────────────────────────────────
  const years = [2025, 2026, 2027];

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. Page Header ────────────────────────────────────────────── */}
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

      {/* ── 2. Period Selector (Segmented Buttons) ─────────────────────── */}
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

      {/* ── 3. Filter Card ─────────────────────────────────────────────── */}
      <Card className="shadow-xs border-border text-left">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">

            {/* Pilih Kelas */}
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
                  {masterClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      Kelas {c.name} ({c.grade})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* ── Filter Harian: pilih tanggal ── */}
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

            {/* ── Filter Mingguan: tanggal acuan ── */}
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
                <p className="text-[11px] text-muted-foreground font-medium">
                  {formatWeekLabel(...Object.values(getWeekRange(weeklyRef)))}
                </p>
              </div>
            )}

            {/* ── Filter Bulanan: bulan + tahun ── */}
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

            {/* ── Filter Tahunan: tahun ── */}
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

      {/* ── 4. Summary Cards ───────────────────────────────────────────── */}
      <SummaryCards summary={summary} />

      {/* ── 5. Recap Table ─────────────────────────────────────────────── */}
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
          {activePeriod === "daily" ? (
            <DailyTable records={records} students={students} />
          ) : (
            <AggregateTable records={records} students={students} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AttendanceRecap;
