import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { SessionStatus } from "@/components/dashboard/SessionStatus";
import { AttendanceComparisonChart } from "@/components/dashboard/AttendanceComparisonChart";
import { AttendanceTrendChart } from "@/components/dashboard/AttendanceTrendChart";
import { FrequentAbsenceTable } from "@/components/dashboard/FrequentAbsenceTable";
import { FrequentLateTable } from "@/components/dashboard/FrequentLateTable";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ClipboardCheck, Eye, ShieldCheck, School, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isAdmin, isWaliKelas, isGuruMapel, isMonitoring, getMonitoringScope } from "@/utils/roles";
import { getDashboard } from "@/services/dashboardService";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";

function pct(part, total) {
  if (!total) return "0%";
  return ((part / total) * 100).toFixed(1) + "%";
}

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;

  const userIsAdmin = isAdmin(role);
  const userIsWali = isWaliKelas(role);
  const userIsMapel = isGuruMapel(role);
  const userIsMon = isMonitoring(role);
  const monScope = getMonitoringScope(role);

  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [filters, setFilters] = useState({ periode: "Hari Ini" });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDashboard(filters)
      .then((data) => {
        if (mounted) setRaw(data);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setErrorMsg("Gagal memuat data dashboard dari server.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [filters]);

  if (loading && !raw) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span>Memuat dashboard...</span>
      </div>
    );
  }

  if (errorMsg || !raw) {
    return (
      <div className="flex items-center justify-center py-24 text-destructive font-medium">
        {errorMsg || "Data tidak tersedia."}
      </div>
    );
  }

  const classNameInfo = raw.class_name || user?.assignedClass || user?.className || "-";

  // ─── Bangun bentuk data sesuai role ────────────────────────────────────────
  let dashboardData = {};

  if (userIsAdmin || userIsMapel || userIsMon) {
    const s = raw.stats || {};
    const tidakHadir = (s.izin || 0) + (s.sakit || 0) + (s.alpa || 0);

    let statsList = [];
    if (userIsMon) {
      const scopeLabel = monScope ? ` (Kelas ${monScope})` : "";
      statsList = [
        { title: `Total Siswa${scopeLabel}`, value: String(s.total_siswa || 0), description: s.total_kelas ? `Terdaftar di ${s.total_kelas} kelas` : "Siswa terdaftar", icon: "Users" },
        { title: "Hadir Hari Ini", value: String(s.hadir_hari_ini || 0), description: `${pct(s.hadir_hari_ini || 0, s.total_siswa || 0)} total kehadiran siswa`, icon: "UserCheck" },
        { title: "Siswa Tidak Hadir", value: String(tidakHadir), description: `Izin: ${s.izin || 0} | Sakit: ${s.sakit || 0} | Alpa: ${s.alpa || 0}`, icon: "UserX" },
        { title: "Status Presensi Kelas", value: `${s.kelas_sudah_input || 0} / ${s.total_kelas || 0} Kelas`, description: "Kelas telah menginput presensi harian", icon: "School" },
      ];
    } else if (userIsMapel) {
      statsList = [
        { title: "Total Siswa Terdaftar", value: String(s.total_siswa || 0), description: "Seluruh kelas di SMK M 1 Playen", icon: "Users" },
        { title: "Kehadiran Hari Ini", value: String(s.hadir_hari_ini || 0), description: `${pct(s.hadir_hari_ini || 0, s.total_siswa || 0)} total kehadiran siswa`, icon: "UserCheck" },
        { title: "Siswa Tidak Hadir", value: String(tidakHadir), description: `Izin: ${s.izin || 0} | Sakit: ${s.sakit || 0} | Alpa: ${s.alpa || 0}`, icon: "UserX" },
        { title: "Siswa Terlambat", value: String(s.terlambat || 0), description: "Hadir namun terlambat (Sesi Pagi)", icon: "Clock" },
        { title: "Status Akses", value: "View Only", description: "Akses informasi & rekapitulasi", icon: "Eye" },
      ];
    } else {
      statsList = [
        { title: "Total Siswa Sekolah", value: String(s.total_siswa || 0), description: `Terdaftar di ${s.total_kelas || 0} kelas`, icon: "Users" },
        { title: "Hadir Hari Ini", value: String(s.hadir_hari_ini || 0), description: `${pct(s.hadir_hari_ini || 0, s.total_siswa || 0)} tingkat kehadiran sekolah`, icon: "UserCheck" },
        { title: "Siswa Tidak Hadir", value: String(tidakHadir), description: `Izin: ${s.izin || 0} | Sakit: ${s.sakit || 0} | Alpa: ${s.alpa || 0}`, icon: "UserX" },
        { title: "Siswa Terlambat", value: String(s.terlambat || 0), description: "Hadir namun terlambat (Sesi Pagi)", icon: "Clock" },
        { title: "Status Presensi Kelas", value: `${s.kelas_sudah_input || 0} / ${s.total_kelas || 0} Kelas`, description: "Kelas telah menginput presensi harian", icon: "School" },
      ];
    }

    dashboardData = {
      stats: statsList,
      sessionStatus: raw.session_status || [],
      comparisonData: (raw.comparison_data || []).map((item) => ({ ...item, Terlambat: item.Terlambat || 0 })),
      trendData: (raw.trend_data || []).map((item) => ({ ...item, Terlambat: item.Terlambat || 0 })),
      frequentAbsences: raw.frequent_absences || [],
      frequentLates: raw.frequent_lates || [],
      recentLogs: raw.recent_logs || [],
    };
  } else if (userIsWali) {
    const s = raw.stats || {};
    dashboardData = {
      className: classNameInfo,
      stats: [
        { title: "Total Siswa Kelas", value: String(s.total_siswa || 0), description: `Terdaftar di kelas ${classNameInfo}`, icon: "Users" },
        { title: "Hadir Hari Ini", value: String(s.hadir_hari_ini || 0), description: `${pct(s.hadir_hari_ini || 0, s.total_siswa || 0)} tingkat kehadiran hari ini`, icon: "UserCheck" },
        { title: "Siswa Tidak Hadir", value: String((s.izin || 0) + (s.sakit || 0) + (s.alpa || 0)), description: `Sakit: ${s.sakit || 0} | Izin: ${s.izin || 0} | Alpa: ${s.alpa || 0}`, icon: "UserX" },
        { title: "Siswa Terlambat", value: String(s.terlambat || 0), description: "Hadir namun terlambat (Sesi Pagi)", icon: "Clock" },
        {
          title: "Status Presensi Hari Ini",
          value: `Pagi: ${s.sesi_pagi ? "✓" : "○"} | Sore: ${s.sesi_sore ? "✓" : "○"}`,
          description: s.sesi_pagi
            ? (s.sesi_sore ? "Sesi Pagi & Sore selesai" : "Sesi Pagi selesai, Sore belum")
            : "Sesi Pagi belum diinput",
          icon: "ClipboardCheck",
        },
      ],
      sessionStatus: raw.session_status || [],
      comparisonData: (raw.comparison_data || []).map((item) => ({ ...item, Terlambat: item.Terlambat || 0 })),
      trendData: (raw.trend_data || []).map((item) => ({ ...item, Terlambat: item.Terlambat || 0 })),
      frequentAbsences: raw.frequent_absences || [],
      frequentLates: raw.frequent_lates || [],
    };
  }

  // Header Title & Description
  let headerTitle = "Dashboard Presensi";
  let headerDescription = "Ringkasan data presensi sekolah.";

  if (userIsAdmin) {
    headerTitle = "Dashboard Administrator";
    headerDescription = "Monitoring & rekapitulasi presensi seluruh kelas di sekolah.";
  } else if (userIsWali) {
    headerTitle = `Dashboard Wali Kelas (${classNameInfo})`;
    headerDescription = `Ringkasan dan pengelolaan presensi harian kelas ${classNameInfo}.`;
  } else if (userIsMapel) {
    headerTitle = "Dashboard Guru Mata Pelajaran";
    headerDescription = "Pemantauan informasi presensi siswa secara terpadu (View Only).";
  } else if (userIsMon) {
    headerTitle = monScope ? `Dashboard Monitoring — Kelas ${monScope}` : "Dashboard Monitoring";
    headerDescription = `Monitoring presensi seluruh kelas tingkat ${monScope || "sekolah"} hari ini.`;
  }

  // Header CTA Actions
  let headerActions = null;
  if (userIsAdmin || userIsWali) {
    headerActions = (
      <Button
        onClick={() => navigate("/attendance/input")}
        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs gap-2 font-bold cursor-pointer"
      >
        <ClipboardCheck className="size-4" />
        <span>Input Absensi</span>
      </Button>
    );
  } else if (userIsMapel) {
    headerActions = (
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-2xs">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>Mode View Only</span>
        </div>
        <Button
          onClick={() => navigate("/attendance/view")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs gap-2 font-bold cursor-pointer"
        >
          <Eye className="size-4" />
          <span>Lihat Absensi</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <PageHeader title={headerTitle} description={headerDescription} actions={headerActions} />

      {/* Filter row */}
      <DashboardFilters role={role} onFilterChange={setFilters} />

      {/* Wali Kelas info banner */}
      {userIsWali && (
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-primary/8 border border-primary/20 shadow-2xs">
          <div className="flex items-center justify-center size-7 rounded-md bg-primary text-primary-foreground shrink-0">
            <School className="size-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs sm:text-sm text-foreground truncate">
              Wali Kelas {classNameInfo}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium hidden sm:block">
              Data terfokus khusus untuk kelas {classNameInfo}.
            </p>
          </div>
          <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary text-white shrink-0">
            Wali Kelas
          </span>
        </div>
      )}

      {/* ── KPI Scorecard ── */}
      <DashboardStats stats={dashboardData.stats} />

      {/* ── Content Area ── */}
      {userIsMapel ? (
        /* Guru Mapel: Aktivitas log, trend, & tabel sering terlambat / alpa */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-7 flex flex-col gap-4 min-w-0">
            {/* 1. Tren Kehadiran */}
            <AttendanceTrendChart isTeacher={false} data={dashboardData.trendData} />

            {/* 2. Aktivitas Input Presensi Terbaru */}
            <Card className="border-border text-left">
              <CardHeader className="pb-2 pt-4 px-4 border-b border-border/50">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <span>Aktivitas Input Presensi Terbaru</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {dashboardData.recentLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-6 text-center">
                    Belum ada aktivitas input presensi hari ini.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-bold text-foreground text-xs">Waktu</TableHead>
                        <TableHead className="font-bold text-foreground text-xs">Kelas</TableHead>
                        <TableHead className="font-bold text-foreground text-xs">Status Log</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.recentLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs font-semibold text-muted-foreground py-2.5">
                            {log.time}
                          </TableCell>
                          <TableCell className="font-bold text-foreground py-2.5 text-xs">{log.class}</TableCell>
                          <TableCell className="text-xs font-medium py-2.5 text-emerald-700 dark:text-emerald-400">
                            {log.status}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-5 flex flex-col gap-4 min-w-0 lg:self-stretch">
            {/* 1. Sering Terlambat */}
            <div className="flex-1 flex flex-col min-h-0">
              <FrequentLateTable isTeacher={false} data={dashboardData.frequentLates} />
            </div>

            {/* 2. Sering Alpa */}
            <div className="flex-1 flex flex-col min-h-0">
              <FrequentAbsenceTable isTeacher={false} data={dashboardData.frequentAbsences} />
            </div>
          </div>
        </div>
      ) : (
        /*
         * Admin, Wali Kelas, & Monitoring layout:
         *
         * Desktop: 2-column grid
         *   LEFT  (col-span-7): Monitoring → Perbandingan → Tren (stacked)
         *   RIGHT (col-span-5): Terlambat → Alpa (stacked, sticky-like)
         *
         * Mobile: single column, left content first then right content
         */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-7 flex flex-col gap-4 min-w-0">
            {/* 1. Monitoring Input Presensi Per Kelas */}
            <SessionStatus
              isTeacher={userIsWali}
              sessionData={dashboardData.sessionStatus}
              classNameInfo={classNameInfo}
            />

            {/* 2. Perbandingan Kehadiran */}
            <AttendanceComparisonChart isTeacher={userIsWali} data={dashboardData.comparisonData} />

            {/* 3. Tren Kehadiran */}
            <AttendanceTrendChart isTeacher={userIsWali} data={dashboardData.trendData} />
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-5 flex flex-col gap-4 min-w-0 lg:self-stretch">
            {/* 1. Sering Terlambat */}
            <div className="flex-1 flex flex-col min-h-0">
              <FrequentLateTable isTeacher={userIsWali} data={dashboardData.frequentLates} />
            </div>

            {/* 2. Sering Alpa */}
            <div className="flex-1 flex flex-col min-h-0">
              <FrequentAbsenceTable isTeacher={userIsWali} data={dashboardData.frequentAbsences} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;