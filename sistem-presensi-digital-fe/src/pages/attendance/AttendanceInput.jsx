import React, { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { 
  masterClasses,
  getStudentsByClassId, 
  getClassInfo, 
  saveAttendanceService 
} from "@/data/dummyStudents";
import { isAdmin, isWaliKelas } from "@/utils/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { 
  School, 
  Calendar as CalendarIcon, 
  Sun, 
  Moon, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  LoaderCircle, 
  RotateCcw,
  Sparkles,
  CheckCheck,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

function AttendanceInput() {
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user?.role);
  const userIsWali = isWaliKelas(user?.role);

  // Initial class determination
  const initialClassId = useMemo(() => {
    if (userIsWali && user?.assignedClass) {
      const found = masterClasses.find((c) => c.name.toLowerCase() === user.assignedClass.toLowerCase());
      if (found) return String(found.id);
    }
    return user?.classId ? String(user.classId) : "1";
  }, [user, userIsWali]);

  const [selectedClassId, setSelectedClassId] = useState(initialClassId);

  // Synchronize when initialClassId changes (e.g. after login switch)
  useEffect(() => {
    setSelectedClassId(initialClassId);
  }, [initialClassId]);

  // Determine current class info
  const classInfo = useMemo(() => getClassInfo(selectedClassId), [selectedClassId]);

  // Form Controls State
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedSession, setSelectedSession] = useState("Pagi");

  // Fetch dynamic students list for chosen class
  const students = useMemo(() => getStudentsByClassId(selectedClassId), [selectedClassId]);

  // Attendance State: { [studentId]: { status: "Hadir" | "Alpa" | "Izin" | "Sakit" | null, note: "" } }
  const [records, setRecords] = useState({});

  // UI / Save State
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [validationError, setValidationError] = useState("");

  // Initialize records when students list loads
  useEffect(() => {
    const initial = {};
    students.forEach((s) => {
      initial[s.id] = { status: null, note: "" };
    });
    setRecords(initial);
    setValidationError("");
  }, [students]);

  // Real-time Summary Calculations (Derived state)
  const summary = useMemo(() => {
    let hadir = 0;
    let alpa = 0;
    let izin = 0;
    let sakit = 0;
    let belumDiisi = 0;

    students.forEach((s) => {
      const rec = records[s.id];
      if (!rec || !rec.status) {
        belumDiisi++;
      } else if (rec.status === "Hadir") {
        hadir++;
      } else if (rec.status === "Alpa") {
        alpa++;
      } else if (rec.status === "Izin") {
        izin++;
      } else if (rec.status === "Sakit") {
        sakit++;
      }
    });

    return {
      total: students.length,
      hadir,
      alpa,
      izin,
      sakit,
      belumDiisi,
    };
  }, [students, records]);

  // Handlers for Status Change
  const handleStatusChange = (studentId, newStatus) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: newStatus,
      },
    }));
    if (validationError) setValidationError("");
  };

  const handleNoteChange = (studentId, noteText) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note: noteText,
      },
    }));
  };

  // Productivity Batch Helpers
  const handleMarkAllHadir = () => {
    setRecords((prev) => {
      const updated = { ...prev };
      students.forEach((s) => {
        updated[s.id] = {
          ...updated[s.id],
          status: "Hadir",
        };
      });
      return updated;
    });
    if (validationError) setValidationError("");
  };

  const handleResetAll = () => {
    setRecords((prev) => {
      const updated = { ...prev };
      students.forEach((s) => {
        updated[s.id] = {
          status: null,
          note: "",
        };
      });
      return updated;
    });
    setValidationError("");
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (summary.belumDiisi > 0) {
      setValidationError(
        `Masih ada ${summary.belumDiisi} siswa yang belum memiliki status kehadiran.`
      );
      return;
    }

    setValidationError("");
    setIsSaving(true);

    // Prepare payload formatted for future Laravel API (POST /api/attendance)
    const payload = {
      class_id: classInfo.id,
      class_name: classInfo.name,
      date: selectedDate,
      session: selectedSession,
      teacher_name: user?.name || "Penginput Presensi",
      attendances: students.map((s) => ({
        student_id: s.id,
        nis: s.nis,
        student_name: s.name,
        status: records[s.id]?.status || "Hadir",
        note: records[s.id]?.note || "",
      })),
    };

    try {
      await saveAttendanceService(payload);
      setIsSaving(false);
      
      setToastMessage({
        type: "success",
        title: "Absensi Berhasil Disimpan",
        description: `Presensi kelas ${classInfo.name} (${selectedSession}) tanggal ${selectedDate} telah tersimpan di sistem.`,
      });

      // Hide toast notification after 5 seconds
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    } catch (err) {
      console.error("Gagal menyimpan absensi:", err);
      setIsSaving(false);
      setValidationError("Terjadi kesalahan saat menyimpan data absensi. Silakan coba lagi.");
    }
  };

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
      {/* 1. Page Header */}
      <PageHeader
        title="Input Absensi Siswa"
        description={
          userIsAdmin
            ? "Pengisian presensi harian untuk seluruh kelas (Mode Admin)."
            : `Pengisian presensi harian khusus kelas ${classInfo.name}.`
        }
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 shadow-md animate-in slide-in-from-top-2 duration-300 text-left">
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm leading-tight">{toastMessage.title}</p>
            <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-400 font-medium">
              {toastMessage.description}
            </p>
          </div>
        </div>
      )}

      {/* 2. Control Card (Class, Date, Session Selection) */}
      <Card className="shadow-xs border-border">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <School className="size-5 text-primary" />
            <span>Kontrol Parameter Presensi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Field 1: Class Selector */}
            <div className="md:col-span-4 space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-foreground">
                Pilih Kelas
              </Label>
              {userIsAdmin ? (
                /* Admin: Full Access to all classes */
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
              ) : (
                /* Wali Kelas: Locked to assignedClass */
                <div className="flex items-center justify-between h-10 px-3.5 rounded-lg border border-border bg-slate-100/80 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Lock className="size-3.5 text-muted-foreground" />
                    <span className="font-bold text-sm text-foreground">
                      {classInfo.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (Tingkat {classInfo.grade})
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                    Guru Wali Kelas
                  </span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground font-medium">
                {userIsAdmin
                  ? "Admin berhak memilih seluruh kelas di sekolah."
                  : `Terkunci otomatis pada kelas ${classInfo.name} yang Anda ampu.`}
              </p>
            </div>

            {/* Field 2: Date Picker */}
            <div className="md:col-span-4 space-y-1.5 text-left">
              <Label htmlFor="date-picker" className="text-xs font-semibold text-foreground">
                Tanggal Presensi
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="date-picker"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-9 font-semibold text-xs sm:text-sm"
                />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium truncate">
                {formattedIndonesianDate}
              </p>
            </div>

            {/* Field 3: Session Selector (Pagi / Sore) */}
            <div className="md:col-span-4 space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-foreground">
                Sesi Presensi
              </Label>
              <div className="grid grid-cols-2 gap-2 h-10 p-1 rounded-lg border border-border bg-slate-100/70 dark:bg-slate-800/50">
                <button
                  type="button"
                  onClick={() => setSelectedSession("Pagi")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-md text-xs font-bold transition-all cursor-pointer",
                    selectedSession === "Pagi"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sun className={cn("size-3.5", selectedSession === "Pagi" ? "text-amber-500" : "")} />
                  <span>Sesi Pagi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSession("Sore")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-md text-xs font-bold transition-all cursor-pointer",
                    selectedSession === "Sore"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Moon className={cn("size-3.5", selectedSession === "Sore" ? "text-indigo-500" : "")} />
                  <span>Sesi Sore</span>
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                Pilih sesi presensi harian (Pagi/Sore).
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* 3. Real-Time Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Siswa */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs text-left">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Total Siswa</span>
            <Users className="size-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2 tracking-tight">
            {summary.total}
          </p>
        </div>

        {/* Hadir */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900 text-left">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase">Hadir</span>
            <UserCheck className="size-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-2 tracking-tight">
            {summary.hadir}
          </p>
        </div>

        {/* Izin */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 text-left">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400">
            <span className="text-xs font-semibold uppercase">Izin</span>
            <Clock className="size-4" />
          </div>
          <p className="text-2xl font-bold text-blue-800 dark:text-blue-300 mt-2 tracking-tight">
            {summary.izin}
          </p>
        </div>

        {/* Sakit */}
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900 text-left">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-xs font-semibold uppercase">Sakit</span>
            <AlertTriangle className="size-4" />
          </div>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-300 mt-2 tracking-tight">
            {summary.sakit}
          </p>
        </div>

        {/* Alpa */}
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-900 text-left">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
            <span className="text-xs font-semibold uppercase">Alpa</span>
            <UserX className="size-4" />
          </div>
          <p className="text-2xl font-bold text-rose-800 dark:text-rose-300 mt-2 tracking-tight">
            {summary.alpa}
          </p>
        </div>

        {/* Belum Diisi */}
        <div className={cn(
          "p-4 rounded-xl border text-left transition-all",
          summary.belumDiisi > 0 
            ? "border-amber-400 bg-amber-100/50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200" 
            : "border-border bg-card text-muted-foreground"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase">Belum Diisi</span>
            <Sparkles className="size-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold mt-2 tracking-tight">
            {summary.belumDiisi}
          </p>
        </div>

      </div>

      {/* 4. Student List Card & Table Area */}
      <Card className="shadow-xs border-border">
        <CardHeader className="pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/50">
          <div className="space-y-0.5 text-left">
            <CardTitle className="text-base font-bold text-foreground">
              Daftar Siswa Kelas {classInfo.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium">
              Tentukan status kehadiran tiap siswa untuk sesi {selectedSession}.
            </p>
          </div>

          {/* Quick Batch Actions */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkAllHadir}
              className="text-xs font-semibold gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 cursor-pointer"
            >
              <CheckCheck className="size-3.5" />
              <span>Tandai Semua Hadir</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetAll}
              className="text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 dark:bg-slate-800/50">
                  <TableHead className="w-12 text-center font-bold text-foreground">No.</TableHead>
                  <TableHead className="w-28 font-bold text-foreground">NIS</TableHead>
                  <TableHead className="min-w-[180px] font-bold text-foreground">Nama Siswa</TableHead>
                  <TableHead className="min-w-[280px] text-center font-bold text-foreground">Status Kehadiran</TableHead>
                  <TableHead className="min-w-[180px] font-bold text-foreground">Keterangan (Opsional)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => {
                  const currentRec = records[student.id] || { status: null, note: "" };
                  const isUnfilled = !currentRec.status;

                  return (
                    <TableRow 
                      key={student.id}
                      className={cn(
                        "transition-colors",
                        isUnfilled ? "bg-amber-50/30 dark:bg-amber-950/10" : ""
                      )}
                    >
                      {/* No */}
                      <TableCell className="text-center font-medium text-muted-foreground py-3">
                        {index + 1}
                      </TableCell>

                      {/* NIS */}
                      <TableCell className="font-mono text-xs text-muted-foreground py-3">
                        {student.nis}
                      </TableCell>

                      {/* Name */}
                      <TableCell className="font-semibold text-foreground py-3 text-left">
                        <div className="flex items-center gap-2">
                          <span>{student.name}</span>
                          {isUnfilled && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                              Belum diisi
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status Selector Buttons */}
                      <TableCell className="py-2.5 text-center">
                        <div className="inline-flex items-center p-1 rounded-lg border border-border bg-slate-100/60 dark:bg-slate-800/60 gap-1">
                          
                          {/* Hadir */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "Hadir")}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
                              currentRec.status === "Hadir"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-emerald-700 dark:text-slate-300"
                            )}
                          >
                            Hadir
                          </button>

                          {/* Izin */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "Izin")}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
                              currentRec.status === "Izin"
                                ? "bg-blue-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-blue-700 dark:text-slate-300"
                            )}
                          >
                            Izin
                          </button>

                          {/* Sakit */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "Sakit")}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
                              currentRec.status === "Sakit"
                                ? "bg-amber-500 text-white shadow-xs"
                                : "text-slate-600 hover:text-amber-700 dark:text-slate-300"
                            )}
                          >
                            Sakit
                          </button>

                          {/* Alpa */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "Alpa")}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
                              currentRec.status === "Alpa"
                                ? "bg-rose-600 text-white shadow-xs"
                                : "text-slate-600 hover:text-rose-700 dark:text-slate-300"
                            )}
                          >
                            Alpa
                          </button>

                        </div>
                      </TableCell>

                      {/* Note Input */}
                      <TableCell className="py-2.5">
                        <Input
                          type="text"
                          placeholder="Keterangan (misal: Demam)"
                          value={currentRec.note || ""}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          className="h-8 text-xs bg-card"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 5. Sticky Bottom Action & Validation Bar */}
      <div className="sticky bottom-4 z-10 p-4 rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="text-left space-y-1 w-full sm:w-auto">
          {validationError ? (
            <div className="flex items-center gap-2 text-destructive font-semibold text-xs sm:text-sm">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm font-medium">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>
                Ringkasan: {summary.hadir} Hadir, {summary.izin} Izin, {summary.sakit} Sakit, {summary.alpa} Alpa
              </span>
            </div>
          )}
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="w-full sm:w-auto font-bold h-11 px-8 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
        >
          {isSaving ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              <span>Menyimpan Absensi...</span>
            </>
          ) : (
            <span>Simpan Absensi</span>
          )}
        </Button>

      </div>
    </div>
  );
}

export default AttendanceInput;
