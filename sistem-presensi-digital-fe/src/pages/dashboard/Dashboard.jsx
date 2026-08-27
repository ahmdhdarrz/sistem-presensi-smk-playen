import React from "react";
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
import { ClipboardCheck, Eye, ShieldCheck, School, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isAdmin, isWaliKelas, isGuruMapel, getRoleLabel } from "@/utils/roles";
import { 
  adminDashboardData, 
  waliKelasDashboardData, 
  mapelDashboardData 
} from "@/data/dummyDashboard";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;

  const userIsAdmin = isAdmin(role);
  const userIsWali = isWaliKelas(role);
  const userIsMapel = isGuruMapel(role);

  const classNameInfo = user?.assignedClass || user?.className || waliKelasDashboardData.className;

  // Select dashboard dataset based on role
  let dashboardData = adminDashboardData;
  if (userIsWali) {
    dashboardData = waliKelasDashboardData;
  } else if (userIsMapel) {
    dashboardData = mapelDashboardData;
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
      {/* 1. Page Header */}
      <PageHeader
        title={headerTitle}
        description={headerDescription}
        actions={headerActions}
      />

      {/* Identity Banner for Wali Kelas */}
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

      {/* 2. Statistics Cards Grid */}
      <DashboardStats stats={dashboardData.stats} />

      {/* 3. Role-Based Dashboard Content Layout */}
      {userIsMapel ? (
        /* GURU MAPEL VIEW: Recent Activity Logs + Attendance Trend Chart */
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
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/70 dark:bg-slate-800/50">
                      <TableHead className="font-bold text-foreground">Waktu</TableHead>
                      <TableHead className="font-bold text-foreground">Kelas</TableHead>
                      <TableHead className="font-bold text-foreground">Status Log</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mapelDashboardData.recentLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs font-semibold text-muted-foreground py-3">
                          {log.time}
                        </TableCell>
                        <TableCell className="font-bold text-foreground py-3">
                          {log.class}
                        </TableCell>
                        <TableCell className="text-xs font-medium py-3 text-emerald-700 dark:text-emerald-400">
                          {log.status}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-7">
            <AttendanceTrendChart
              isTeacher={false}
              data={mapelDashboardData.trendData}
            />
          </div>
        </div>
      ) : (
        /* ADMIN & GURU WALI KELAS VIEW */
        <>
          {/* Section 1: Session Status & Comparison Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <SessionStatus
                isTeacher={userIsWali}
                sessionData={dashboardData.sessionStatus}
                classNameInfo={classNameInfo}
              />
            </div>
            <div className="lg:col-span-7">
              <AttendanceComparisonChart
                isTeacher={userIsWali}
                data={dashboardData.comparisonData}
              />
            </div>
          </div>

          {/* Section 2: Trend Chart & Frequent Absence Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <AttendanceTrendChart
                isTeacher={userIsWali}
                data={dashboardData.trendData}
              />
            </div>
            <div className="lg:col-span-5">
              <FrequentAbsenceTable
                isTeacher={userIsWali}
                data={dashboardData.frequentAbsences}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
