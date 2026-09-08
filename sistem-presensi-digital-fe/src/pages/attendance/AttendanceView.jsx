import React, { useState, useMemo } from "react";
import PageHeader from "@/components/common/PageHeader";
import { masterClasses, masterStudents } from "@/data/dummyStudents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { 
  Eye, 
  Search, 
  Calendar as CalendarIcon, 
  School, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle,
  Filter,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

// Seed data deterministik status presensi dummy berdasarkan student id & tanggal
function generateDummyStatus(studentId, dateStr) {
  const seed = (studentId * 13 + dateStr.length * 7) % 100;
  if (seed < 82) return { status: "Hadir", note: "-" };
  if (seed < 88) return { status: "Izin", note: "Acara Keluarga" };
  if (seed < 94) return { status: "Sakit", note: "Surat Dokter" };
  return { status: "Alpa", note: "Tanpa Keterangan" };
}

function AttendanceView() {
  const [selectedClassId, setSelectedClassId] = useState("1"); // Default X OA
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Get current class info
  const currentClass = useMemo(() => {
    return masterClasses.find((c) => String(c.id) === String(selectedClassId)) || masterClasses[0];
  }, [selectedClassId]);

  // Get students for selected class with generated dummy status
  const studentsWithAttendance = useMemo(() => {
    const rawStudents = masterStudents.filter((s) => String(s.classId) === String(selectedClassId));
    return rawStudents.map((s) => {
      const att = generateDummyStatus(s.id, selectedDate);
      return {
        ...s,
        status: att.status,
        note: att.note,
      };
    });
  }, [selectedClassId, selectedDate]);

  // Filter students based on search query and status filter
  const filteredStudents = useMemo(() => {
    return studentsWithAttendance.filter((s) => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.includes(searchQuery);

      const matchesStatus = selectedStatus === "ALL" || s.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [studentsWithAttendance, searchQuery, selectedStatus]);

  // Calculate summary counts
  const summary = useMemo(() => {
    let hadir = 0, izin = 0, sakit = 0, alpa = 0;
    studentsWithAttendance.forEach((s) => {
      if (s.status === "Hadir") hadir++;
      else if (s.status === "Izin") izin++;
      else if (s.status === "Sakit") sakit++;
      else if (s.status === "Alpa") alpa++;
    });
    return { total: studentsWithAttendance.length, hadir, izin, sakit, alpa };
  }, [studentsWithAttendance]);

  // Date Indonesian Formatter
  const formattedIndonesianDate = useMemo(() => {
    if (!selectedDate) return "";
    try {
      const d = new Date(selectedDate);
      return d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header with View Only Badge */}
      <PageHeader
        title="Lihat Data Presensi"
        description="Akses informasi kehadiran siswa (View Only)."
        actions={
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-2xs">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>Mode View Only</span>
          </div>
        }
      />

      {/* 2. Control & Filter Card */}
      <Card className="shadow-xs border-border">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Filter className="size-4 text-primary" />
            <span>Filter & Pencarian Presensi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            
            {/* Filter 1: Pilih Kelas */}
            <div className="lg:col-span-4 space-y-1.5 text-left">
              <Label htmlFor="class-select" className="text-xs font-semibold text-foreground">
                Pilih Kelas
              </Label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <select
                  id="class-select"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-foreground text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {masterClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      Kelas {c.name} ({c.grade})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter 2: Pilih Tanggal */}
            <div className="lg:col-span-4 space-y-1.5 text-left">
              <Label htmlFor="date-select" className="text-xs font-semibold text-foreground">
                Tanggal Presensi
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="date-select"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-9 text-xs sm:text-sm font-semibold"
                />
              </div>
            </div>

            {/* Filter 3: Cari Nama/NIS */}
            <div className="lg:col-span-4 space-y-1.5 text-left">
              <Label htmlFor="search-input" className="text-xs font-semibold text-foreground">
                Cari Siswa / NIS
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="search-input"
                  type="text"
                  placeholder="Cari nama atau NIS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs sm:text-sm"
                />
              </div>
            </div>

          </div>

          {/* Quick Status Filter Tabs */}
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

      {/* 3. Summary Badges Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 text-left">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-semibold">HADIR</span>
            <UserCheck className="size-4" />
          </div>
          <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">
            {summary.hadir} <span className="text-xs font-normal text-muted-foreground">Siswa</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 text-left">
          <div className="flex items-center justify-between text-yellow-700 dark:text-yellow-400">
            <span className="text-xs font-semibold">IZIN</span>
            <Clock className="size-4" />
          </div>
          <p className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mt-1">
            {summary.izin} <span className="text-xs font-normal text-muted-foreground">Siswa</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 text-left">
          <div className="flex items-center justify-between text-orange-700 dark:text-orange-400">
            <span className="text-xs font-semibold">SAKIT</span>
            <AlertTriangle className="size-4" />
          </div>
          <p className="text-xl font-bold text-orange-800 dark:text-orange-300 mt-1">
            {summary.sakit} <span className="text-xs font-normal text-muted-foreground">Siswa</span>
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 text-left">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
            <span className="text-xs font-semibold">ALPA</span>
            <UserX className="size-4" />
          </div>
          <p className="text-xl font-bold text-rose-800 dark:text-rose-300 mt-1">
            {summary.alpa} <span className="text-xs font-normal text-muted-foreground">Siswa</span>
          </p>
        </div>
      </div>

      {/* 4. Table Area (Strict Read-Only) */}
      <Card className="shadow-xs border-border">
        <CardHeader className="pb-3 border-b border-border/50 text-left">
          <CardTitle className="text-base font-bold text-foreground">
            Presensi Kelas {currentClass.name} — {formattedIndonesianDate}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 dark:bg-slate-800/50">
                  <TableHead className="w-12 text-center font-bold text-foreground">No.</TableHead>
                  <TableHead className="w-32 font-bold text-foreground">NIS</TableHead>
                  <TableHead className="min-w-[200px] font-bold text-foreground">Nama Siswa</TableHead>
                  <TableHead className="min-w-[140px] text-center font-bold text-foreground">Status Kehadiran</TableHead>
                  <TableHead className="min-w-[180px] font-bold text-foreground">Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s, idx) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-center font-medium text-muted-foreground py-3">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground py-3">
                        {s.nis}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground py-3 text-left">
                        {s.name}
                      </TableCell>
                      <TableCell className="text-center py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold",
                            s.status === "Hadir" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
                            s.status === "Izin" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300",
                            s.status === "Sakit" && "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300",
                            s.status === "Alpa" && "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          )}
                        >
                          {s.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium py-3 text-left">
                        {s.note}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      Tidak ada data siswa yang sesuai dengan filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AttendanceView;
