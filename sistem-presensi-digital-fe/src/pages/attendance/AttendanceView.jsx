import React, { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Search, Calendar as CalendarIcon, School, UserCheck,
  UserX, Clock, AlertTriangle, Filter, ShieldCheck, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAbsensi } from "@/services/attendanceService";
import { getKelas } from "@/services/dashboardService";
import { useAuth } from "@/context/AuthContext";
import { isMonitoring, getMonitoringScope } from "@/utils/roles";

const SUMMARY_COLOR_MAP = {
  emerald: {
    border: "border-emerald-200 dark:border-emerald-800/40",
    bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    text: "text-emerald-700 dark:text-emerald-400",
    valueText: "text-emerald-800 dark:text-emerald-300",
  },
  yellow: {
    border: "border-yellow-200 dark:border-yellow-800/40",
    bg: "bg-yellow-50/50 dark:bg-yellow-950/20",
    text: "text-yellow-700 dark:text-yellow-400",
    valueText: "text-yellow-800 dark:text-yellow-300",
  },
  orange: {
    border: "border-orange-200 dark:border-orange-800/40",
    bg: "bg-orange-50/50 dark:bg-orange-950/20",
    text: "text-orange-700 dark:text-orange-400",
    valueText: "text-orange-800 dark:text-orange-300",
  },
  rose: {
    border: "border-rose-200 dark:border-rose-800/40",
    bg: "bg-rose-50/50 dark:bg-rose-950/20",
    text: "text-rose-700 dark:text-rose-400",
    valueText: "text-rose-800 dark:text-rose-300",
  },
};

function AttendanceView() {
  const { user } = useAuth();
  const role = user?.role;
  const userIsMon = isMonitoring(role);
  const monScope = getMonitoringScope(role);

  const [kelasList, setKelasList] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSesi, setSelectedSesi] = useState("pagi");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [absensiData, setAbsensiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingKelas, setLoadingKelas] = useState(true);

  // Fetch daftar kelas
  useEffect(() => {
    getKelas()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        setKelasList(list);
        if (list.length > 0) setSelectedClassId(String(list[0].id));
      })
      .catch(console.error)
      .finally(() => setLoadingKelas(false));
  }, []);

  // Fetch absensi saat kelas, tanggal, atau sesi berubah
  useEffect(() => {
    if (!selectedClassId || !selectedDate) return;
    setLoading(true);
    getAbsensi({ kelas_id: selectedClassId, tanggal: selectedDate, sesi: selectedSesi })
      .then((data) => {
        const normalized = (Array.isArray(data) ? data : data.data || []).map((item) => ({
          id: item.id,
          nis: item.siswa?.nis || "-",
          name: item.siswa?.nama || "-",
          status: item.status
            ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
            : "-",
          note: item.keterangan || "-",
        }));
        setAbsensiData(normalized);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedClassId, selectedDate, selectedSesi]);

  const currentClass = useMemo(() => {
    return kelasList.find((c) => String(c.id) === String(selectedClassId));
  }, [kelasList, selectedClassId]);

  const filteredStudents = useMemo(() => {
    return absensiData.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery);
      const matchesStatus = selectedStatus === "ALL" || s.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [absensiData, searchQuery, selectedStatus]);

  const summary = useMemo(() => {
    let hadir = 0, izin = 0, sakit = 0, alpa = 0;
    absensiData.forEach((s) => {
      if (s.status === "Hadir") hadir++;
      else if (s.status === "Izin") izin++;
      else if (s.status === "Sakit") sakit++;
      else if (s.status === "Alpa") alpa++;
    });
    return { total: absensiData.length, hadir, izin, sakit, alpa };
  }, [absensiData]);

  const formattedIndonesianDate = useMemo(() => {
    if (!selectedDate) return "";
    try {
      return new Date(selectedDate).toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });
    } catch { return selectedDate; }
  }, [selectedDate]);

  const headerTitle = userIsMon && monScope
    ? `Lihat Presensi — Kelas ${monScope}`
    : "Lihat Data Presensi";

  const headerDescription = userIsMon
    ? `Akses informasi presensi siswa tingkat ${monScope || "sekolah"} (View Only).`
    : "Akses informasi kehadiran siswa (View Only).";

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={headerTitle}
        description={headerDescription}
        actions={
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-2xs">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>Mode View Only</span>
          </div>
        }
      />

      <Card className="shadow-xs border-border">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Filter className="size-4 text-primary" />
            <span>Filter & Pencarian Presensi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* Dropdown Kelas */}
            <div className="lg:col-span-3 space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-foreground">Pilih Kelas</Label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-foreground text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                  disabled={loadingKelas}
                >
                  {loadingKelas ? (
                    <option>Memuat kelas...</option>
                  ) : (
                    kelasList.map((c) => (
                      <option key={c.id} value={c.id}>
                        Kelas {c.nama_kelas} {c.tingkat ? `(Tingkat ${c.tingkat})` : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Filter Sesi: Pagi / Sore */}
            <div className="lg:col-span-3 space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-foreground">Filter Sesi</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <select
                  value={selectedSesi}
                  onChange={(e) => setSelectedSesi(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-foreground text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="pagi">Sesi Pagi</option>
                  <option value="sore">Sesi Sore</option>
                </select>
              </div>
            </div>

            {/* Tanggal Presensi */}
            <div className="lg:col-span-3 space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-foreground">Tanggal Presensi</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-9 text-xs sm:text-sm font-semibold"
                />
              </div>
            </div>

            {/* Cari Siswa / NIS */}
            <div className="lg:col-span-3 space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-foreground">Cari Siswa / NIS</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Cari nama atau NIS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/50 mt-4">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Filter Status:</span>
            {[
              { key: "ALL", label: `Semua (${summary.total})` },
              { key: "Hadir", label: `Hadir (${summary.hadir})` },
              { key: "Izin", label: `Izin (${summary.izin})` },
              { key: "Sakit", label: `Sakit (${summary.sakit})` },
              { key: "Alpa", label: `Alpa (${summary.alpa})` },
            ].map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => setSelectedStatus(st.key)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                  selectedStatus === st.key
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-muted-foreground hover:text-foreground"
                )}
              >
                {st.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "HADIR", value: summary.hadir, icon: UserCheck, colorKey: "emerald" },
          { label: "IZIN", value: summary.izin, icon: Clock, colorKey: "yellow" },
          { label: "SAKIT", value: summary.sakit, icon: AlertTriangle, colorKey: "orange" },
          { label: "ALPA", value: summary.alpa, icon: UserX, colorKey: "rose" },
        ].map(({ label, value, icon: Icon, colorKey }) => {
          const color = SUMMARY_COLOR_MAP[colorKey];
          return (
            <div key={label} className={`p-3.5 rounded-xl border ${color.border} ${color.bg} text-left`}>
              <div className={`flex items-center justify-between ${color.text}`}>
                <span className="text-xs font-semibold">{label}</span>
                <Icon className="size-4" />
              </div>
              <p className={`text-xl font-bold ${color.valueText} mt-1`}>
                {value} <span className="text-xs font-normal text-muted-foreground">Siswa</span>
              </p>
            </div>
          );
        })}
      </div>

      <Card className="shadow-xs border-border">
        <CardHeader className="pb-3 border-b border-border/50 text-left">
          <CardTitle className="text-base font-bold text-foreground">
            Presensi Kelas {currentClass?.nama_kelas || "-"} ({selectedSesi === "pagi" ? "Sesi Pagi" : "Sesi Sore"}) — {formattedIndonesianDate}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <span>Memuat data presensi...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 dark:bg-slate-800/50">
                    <TableHead className="w-12 text-center font-bold text-foreground">No.</TableHead>
                    <TableHead className="w-32 font-bold text-foreground">NIS</TableHead>
                    <TableHead className="min-w-[200px] font-bold text-foreground">Nama Siswa</TableHead>
                    <TableHead className="min-w-[140px] text-center font-bold text-foreground">Status</TableHead>
                    <TableHead className="min-w-[180px] font-bold text-foreground">Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s, idx) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-center font-medium text-muted-foreground py-3">{idx + 1}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground py-3">{s.nis}</TableCell>
                        <TableCell className="font-semibold text-foreground py-3 text-left">{s.name}</TableCell>
                        <TableCell className="text-center py-3">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold",
                            s.status === "Hadir" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                            s.status === "Izin" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
                            s.status === "Sakit" && "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
                            s.status === "Alpa" && "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
                          )}>
                            {s.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium py-3 text-left">{s.note}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        {absensiData.length === 0
                          ? "Belum ada data presensi untuk kelas, tanggal, dan sesi ini."
                          : "Tidak ada data yang sesuai filter."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AttendanceView;