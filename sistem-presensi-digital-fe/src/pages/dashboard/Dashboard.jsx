import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { SessionStatus } from "@/components/dashboard/SessionStatus";
import { AttendanceComparisonChart } from "@/components/dashboard/AttendanceComparisonChart";
import { AttendanceTrendChart } from "@/components/dashboard/AttendanceTrendChart";
import { FrequentAbsenceTable } from "@/components/dashboard/FrequentAbsenceTable";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ClipboardCheck, Eye, ShieldCheck, School, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isAdmin, isWaliKelas, isGuruMapel } from "@/utils/roles";
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

  if (loading) {
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

  if (userIsAdmin || userIsMapel) {
    const s = raw.stats;
    const tidakHadir = (s.izin || 0) + (s.sakit || 0) + (s.alpa || 0);

    dashboardData = {
      stats: userIsMapel
        ? [
            { title: "Total Siswa Terdaftar", value: String(s.total_siswa), description: "Seluruh kelas di SMK M 1 Playen", icon: "Users" },
            { title: "Kehadiran Hari Ini", value: String(s.hadir_hari_ini), description: `${pct(s.hadir_hari_ini, s.total_siswa)} total kehadiran siswa`, icon: "UserCheck" },
            { title: "Siswa Tidak Hadir", value: String(tidakHadir), description: `Izin: ${s.izin} | Sakit: ${s.sakit} | Alpa: ${s.alpa}`, icon: "UserX" },
            { title: "Status Akses", value: "View Only", description: "Akses informasi & rekapitulasi", icon: "Eye" },
          ]
        : [
            { title: "Total Siswa Sekolah", value: String(s.total_siswa), description: `Terdaftar di ${s.total_kelas} kelas`, icon: "Users" },
            { title: "Hadir Hari Ini", value: String(s.hadir_hari_ini), description: `${pct(s.hadir_hari_ini, s.total_siswa)} tingkat kehadiran sekolah`, icon: "UserCheck" },
            { title: "Siswa Tidak Hadir", value: String(tidakHadir), description: `Izin: ${s.izin} | Sakit: ${s.sakit} | Alpa: ${s.alpa}`, icon: "UserX" },
            { title: "Status Presensi Kelas", value: `${s.kelas_sudah_input} / ${s.total_kelas} Kelas`, description: "Kelas telah menginput presensi harian", icon: "School" },
          ],
      sessionStatus: raw.session_status,
      comparisonData: raw.comparison_data,
      trendData: raw.trend_data,
      frequentAbsences: raw.frequent_absences,
      recentLogs: raw.recent_logs || [],
    };
  } else if (userIsWali) {
    const s = raw.stats;
    dashboardData = {
      className: classNameInfo,
      stats: [
        { title: "Total Siswa Kelas", value: String(s.total_siswa), description: `Terdaftar di kelas ${classNameInfo}`, icon: "Users" },
        { title: "Hadir Hari Ini", value: String(s.hadir_hari_ini), description: `${pct(s.hadir_hari_ini, s.total_siswa)} tingkat kehadiran hari ini`, icon: "UserCheck" },
        { title: "Siswa Tidak Hadir", value: String(s.izin + s.sakit + s.alpa), description: `Sakit: ${s.sakit} | Izin: ${s.izin} | Alpa: ${s.alpa}`, icon: "UserX" },
        {
          title: "Status Presensi Hari Ini",
          value: `Pagi: ${s.sesi_pagi ? "✓" : "○"} | Sore: ${s.sesi_sore ? "✓" : "○"}`,
          description: s.sesi_pagi
            ? (s.sesi_sore ? "Sesi Pagi & Sore selesai" : "Sesi Pagi selesai, Sore belum")
            : "Sesi Pagi belum diinput",
          icon: "ClipboardCheck",
        },
      ],
      sessionStatus: raw.session_status,
      comparisonData: raw.comparison_data,
      trendData: raw.trend_data,
      frequentAbsences: raw.frequent_absences,
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
    <div className="space-y-6 pb-8">
      <PageHeader title={headerTitle} description={headerDescription} actions={headerActions} />

      <DashboardFilters role={role} onFilterChange={setFilters} />

      {userIsWali && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-left shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-lg bg-primary text-primary-foreground shrink-0 font-bold">
              <School className="size-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">
                Anda Login sebagai Wali Kelas {classNameInfo}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                Data statistik dan akses input pada dashboard ini terfokus khusus untuk kelas {classNameInfo}.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-bold bg-primary text-white">
            Wali Kelas
          </span>
        </div>
      )}

      <DashboardStats stats={dashboardData.stats} />

      {userIsMapel ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <Card className="h-full border-border text-left">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
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
                      <TableRow className="bg-slate-50/70 dark:bg-slate-800/50">
                        <TableHead className="font-bold text-foreground">Waktu</TableHead>
                        <TableHead className="font-bold text-foreground">Kelas</TableHead>
                        <TableHead className="font-bold text-foreground">Status Log</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.recentLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs font-semibold text-muted-foreground py-3">
                            {log.time}
                          </TableCell>
                          <TableCell className="font-bold text-foreground py-3">{log.class}</TableCell>
                          <TableCell className="text-xs font-medium py-3 text-emerald-700 dark:text-emerald-400">
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

          <div className="lg:col-span-7">
            <AttendanceTrendChart isTeacher={false} data={dashboardData.trendData} />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <SessionStatus
                isTeacher={userIsWali}
                sessionData={dashboardData.sessionStatus}
                classNameInfo={classNameInfo}
              />
            </div>
            <div className="lg:col-span-7">
              <AttendanceComparisonChart isTeacher={userIsWali} data={dashboardData.comparisonData} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <AttendanceTrendChart isTeacher={userIsWali} data={dashboardData.trendData} />
            </div>
            <div className="lg:col-span-5">
              <FrequentAbsenceTable isTeacher={userIsWali} data={dashboardData.frequentAbsences} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;  