import React, { useState, useMemo, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { getKelas, getSiswaByKelas } from "@/services/siswaService";
import { submitAbsensi, getAbsensi, updateAbsensi, deleteAbsensi } from "@/services/attendanceService";
import { isAdmin, isWaliKelas } from "@/utils/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Lock,
  ShieldAlert,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABEL = { hadir: "Hadir", izin: "Izin", sakit: "Sakit", alpa: "Alpa" };
const STATUS_OPTIONS = ["Hadir", "Izin", "Sakit", "Alpa"];

function AttendanceInput() {
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user?.role);
  const userIsWali = isWaliKelas(user?.role);

  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState("");

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSession, setSelectedSession] = useState("Pagi");

  const [records, setRecords] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [validationError, setValidationError] = useState("");

  // ─── Cek duplikat: apakah kelas+tanggal+sesi ini sudah pernah diinput ───────
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [existingRecords, setExistingRecords] = useState(null); // null = belum dicek / belum ada; array = sudah ada data

  // ─── Edit state (per-row inline editing) ────────────────────────────────────
  const [editingRowId, setEditingRowId] = useState(null); // siswa_id yang sedang diedit
  const [editDraft, setEditDraft] = useState({ status: "", note: "" }); // draft edit
  const [isUpdating, setIsUpdating] = useState(false);

  // ─── Delete state ───────────────────────────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { absensiId, studentName }
  const [isDeleting, setIsDeleting] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: show toast notification
  // ═══════════════════════════════════════════════════════════════════════════
  const showToast = (type, title, description) => {
    setToastMessage({ type, title, description });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: re-fetch existing records for current kelas+tanggal+sesi
  // ═══════════════════════════════════════════════════════════════════════════
  const refetchExisting = async () => {
    try {
      const data = await getAbsensi({
        kelas_id: selectedClassId,
        tanggal: selectedDate,
        sesi: selectedSession.toLowerCase(),
      });
      const list = data.data || data;
      setExistingRecords(Array.isArray(list) && list.length > 0 ? list : null);
    } catch (err) {
      console.error(err);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LOAD KELAS
  // ═══════════════════════════════════════════════════════════════════════════
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

  const classInfo = useMemo(() => {
    const found = classes.find((c) => String(c.id) === String(selectedClassId));
    return found
      ? { id: found.id, name: found.nama_kelas, tingkat: found.tingkat }
      : { id: selectedClassId, name: "-", tingkat: "" };
  }, [classes, selectedClassId]);

  // ═══════════════════════════════════════════════════════════════════════════
  // LOAD SISWA (per kelas change)
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!selectedClassId) return;
    setLoadingStudents(true);
    setEditingRowId(null); // cancel any active edit on parameter change
    getSiswaByKelas(selectedClassId)
      .then((res) => {
        const list = res.data || res;
        const mapped = list.map((s) => ({ id: s.id, nis: s.nis, name: s.nama }));
        setStudents(mapped);

        const initial = {};
        mapped.forEach((s) => {
          initial[s.id] = { status: null, note: "" };
        });
        setRecords(initial);
        setValidationError("");
      })
      .catch((err) => {
        console.error(err);
        setStudents([]);
      })
      .finally(() => setLoadingStudents(false));
  }, [selectedClassId]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK EXISTING RECORDS (kelas+tanggal+sesi)
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!selectedClassId || !selectedDate || !selectedSession) return;

    setCheckingExisting(true);
    setExistingRecords(null);
    setValidationError("");
    setEditingRowId(null); // cancel any active edit on parameter change

    getAbsensi({
      kelas_id: selectedClassId,
      tanggal: selectedDate,
      sesi: selectedSession.toLowerCase(),
    })
      .then((data) => {
        const list = data.data || data;
        if (Array.isArray(list) && list.length > 0) {
          setExistingRecords(list);
        } else {
          setExistingRecords(null);
        }
      })
      .catch((err) => {
        console.error(err);
        setExistingRecords(null);
      })
      .finally(() => setCheckingExisting(false));
  }, [selectedClassId, selectedDate, selectedSession]);

  const hasExistingData = Boolean(existingRecords && existingRecords.length > 0);

  // ═══════════════════════════════════════════════════════════════════════════
  // SUMMARY — computed from either local records (create mode) or existing records (read mode)
  // ═══════════════════════════════════════════════════════════════════════════
  const summary = useMemo(() => {
    let hadir = 0, alpa = 0, izin = 0, sakit = 0, belumDiisi = 0, terlambat = 0;

    if (hasExistingData) {
      // Read mode — count from existing API data
      existingRecords.forEach((r) => {
        const st = (STATUS_LABEL[r.status] || r.status || "").toLowerCase();
        if (st === "hadir") {
          hadir++;
          if (r.terlambat) terlambat++;
        }
        else if (st === "alpa") alpa++;
        else if (st === "izin") izin++;
        else if (st === "sakit") sakit++;
      });
      return { total: students.length, hadir, alpa, izin, sakit, terlambat, belumDiisi: 0 };
    }

    // Create mode — count from local records
    students.forEach((s) => {
      const rec = records[s.id];
      if (!rec || !rec.status) belumDiisi++;
      else if (rec.status === "Hadir") {
        hadir++;
        if (rec.terlambat && selectedSession.toLowerCase() === "pagi") terlambat++;
      }
      else if (rec.status === "Alpa") alpa++;
      else if (rec.status === "Izin") izin++;
      else if (rec.status === "Sakit") sakit++;
    });
    return { total: students.length, hadir, alpa, izin, sakit, terlambat, belumDiisi };
  }, [students, records, existingRecords, hasExistingData, selectedSession]);

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE MODE HANDLERS (unchanged from existing)
  // ═══════════════════════════════════════════════════════════════════════════
  const handleStatusChange = (studentId, newStatus) => {
    if (hasExistingData) return;
    setRecords((prev) => {
      const current = prev[studentId] || {};
      const isPagi = selectedSession.toLowerCase() === "pagi";
      const isHadir = newStatus === "Hadir";
      return {
        ...prev,
        [studentId]: {
          ...current,
          status: newStatus,
          terlambat: isPagi && isHadir ? Boolean(current.terlambat) : false,
        },
      };
    });
    if (validationError) setValidationError("");
  };

  const handleToggleTerlambat = (studentId) => {
    if (hasExistingData) return;
    setRecords((prev) => {
      const current = prev[studentId] || {};
      if (current.status !== "Hadir" || selectedSession.toLowerCase() !== "pagi") return prev;
      return {
        ...prev,
        [studentId]: {
          ...current,
          terlambat: !current.terlambat,
        },
      };
    });
  };

  const handleNoteChange = (studentId, noteText) => {
    if (hasExistingData) return;
    setRecords((prev) => ({ ...prev, [studentId]: { ...prev[studentId], note: noteText } }));
  };

  const handleMarkAllHadir = () => {
    if (hasExistingData) return;
    setRecords((prev) => {
      const updated = { ...prev };
      students.forEach((s) => {
        updated[s.id] = { ...updated[s.id], status: "Hadir" };
      });
      return updated;
    });
    if (validationError) setValidationError("");
  };

  const handleResetAll = () => {
    if (hasExistingData) return;
    setRecords((prev) => {
      const updated = { ...prev };
      students.forEach((s) => {
        updated[s.id] = { status: null, note: "" };
      });
      return updated;
    });
    setValidationError("");
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATE — submit new attendance
  // ═══════════════════════════════════════════════════════════════════════════
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasExistingData) return;

    if (summary.belumDiisi > 0) {
      setValidationError(`Masih ada ${summary.belumDiisi} siswa yang belum memiliki status kehadiran.`);
      return;
    }

    setValidationError("");
    setIsSaving(true);

    const payload = {
      kelas_id: Number(classInfo.id),
      sesi: selectedSession.toLowerCase(),
      tanggal: selectedDate,
      absensi: students.map((s) => {
        const recStatus = (records[s.id]?.status || "Hadir").toLowerCase();
        const isLate = Boolean(selectedSession.toLowerCase() === "pagi" && recStatus === "hadir" && records[s.id]?.terlambat);
        return {
          siswa_id: s.id,
          status: recStatus,
          terlambat: isLate,
          keterangan: records[s.id]?.note || null,
        };
      }),
    };

    try {
      await submitAbsensi(payload);
      setIsSaving(false);
      showToast("success", "Absensi Berhasil Disimpan", `Presensi kelas ${classInfo.name} (${selectedSession}) tanggal ${selectedDate} telah tersimpan di sistem.`);
      await refetchExisting();
    } catch (err) {
      console.error("Gagal menyimpan absensi:", err);
      setIsSaving(false);
      const message = err.response?.data?.message || "Terjadi kesalahan saat menyimpan data absensi. Silakan coba lagi.";
      setValidationError(message);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // UPDATE — edit a single attendance record inline
  // ═══════════════════════════════════════════════════════════════════════════
  const handleStartEdit = (studentId) => {
    const existing = existingRecords?.find((r) => r.siswa_id === studentId);
    if (!existing) return;
    setEditingRowId(studentId);
    setEditDraft({
      status: STATUS_LABEL[existing.status] || existing.status || "Hadir",
      terlambat: Boolean(existing.terlambat && selectedSession.toLowerCase() === "pagi"),
      note: existing.keterangan || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditDraft({ status: "", note: "" });
  };

  const handleSaveEdit = async () => {
    if (!editingRowId) return;
    const existing = existingRecords?.find((r) => r.siswa_id === editingRowId);
    if (!existing) return;

    const newStatusStr = editDraft.status.toLowerCase();
    const isLate = Boolean(selectedSession.toLowerCase() === "pagi" && newStatusStr === "hadir" && editDraft.terlambat);

    setIsUpdating(true);
    try {
      await updateAbsensi(existing.id, {
        status: newStatusStr,
        terlambat: isLate,
        keterangan: editDraft.note || null,
      });
      setEditingRowId(null);
      setEditDraft({ status: "", note: "" });
      showToast("success", "Presensi Berhasil Diperbarui", `Status kehadiran siswa telah diperbarui.`);
      await refetchExisting();
    } catch (err) {
      console.error("Gagal memperbarui absensi:", err);
      const message = err.response?.data?.message || "Gagal memperbarui data presensi. Silakan coba lagi.";
      showToast("error", "Gagal Memperbarui", message);
    } finally {
      setIsUpdating(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // DELETE — delete a single attendance record
  // ═══════════════════════════════════════════════════════════════════════════
  const handleOpenDelete = (absensiId, studentName) => {
    setDeleteTarget({ absensiId, studentName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAbsensi(deleteTarget.absensiId);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      showToast("success", "Record Presensi Dihapus", `Record presensi untuk ${deleteTarget.studentName} berhasil dihapus.`);
      await refetchExisting();
    } catch (err) {
      console.error("Gagal menghapus absensi:", err);
      const message = err.response?.data?.message || "Gagal menghapus record presensi. Silakan coba lagi.";
      showToast("error", "Gagal Menghapus", message);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: format date
  // ═══════════════════════════════════════════════════════════════════════════
  const formattedIndonesianDate = useMemo(() => {
    if (!selectedDate) return "";
    try {
      const d = new Date(selectedDate);
      return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: find existing absensi record for a student
  // ═══════════════════════════════════════════════════════════════════════════
  const findExistingRecord = (studentId) => {
    if (!existingRecords) return null;
    return existingRecords.find((r) => r.siswa_id === studentId) || null;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER: get display record for a student (existing or local)
  // ═══════════════════════════════════════════════════════════════════════════
  const getDisplayRecord = (studentId) => {
    if (hasExistingData) {
      const found = findExistingRecord(studentId);
      if (found) {
        const stLabel = STATUS_LABEL[found.status] || found.status;
        const isLate = Boolean(selectedSession.toLowerCase() === "pagi" && (found.status || "").toLowerCase() === "hadir" && found.terlambat);
        return {
          status: stLabel,
          note: found.keterangan || "",
          absensiId: found.id,
          terlambat: isLate,
        };
      }
      return { status: null, note: "", absensiId: null, terlambat: false };
    }
    const localRec = records[studentId] || { status: null, note: "" };
    const isLate = Boolean(selectedSession.toLowerCase() === "pagi" && localRec.status === "Hadir" && localRec.terlambat);
    return {
      status: localRec.status,
      note: localRec.note || "",
      terlambat: isLate,
    };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
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
        title="Input Absensi Siswa"
        description={
          userIsAdmin
            ? "Pengisian presensi harian untuk seluruh kelas (Mode Admin)."
            : `Pengisian presensi harian khusus kelas ${classInfo.name}.`
        }
      />

      {/* ─── Toast notification (supports success & error) ─── */}
      {toastMessage && (
        <div
          className={cn(
            "p-4 rounded-xl flex items-start gap-3 shadow-md animate-in slide-in-from-top-2 duration-300 text-left",
            toastMessage.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-destructive/10 border border-destructive/30 text-destructive"
          )}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-bold text-sm leading-tight">{toastMessage.title}</p>
            <p className={cn(
              "text-xs mt-1 font-medium",
              toastMessage.type === "success" ? "text-emerald-700 dark:text-emerald-400" : "text-destructive/80"
            )}>{toastMessage.description}</p>
          </div>
        </div>
      )}

      {/* ─── Banner: data sudah tersimpan (read mode) ─── */}
      {hasExistingData && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-foreground flex items-start gap-3 shadow-md text-left">
          <ShieldAlert className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm leading-tight">
              Absensi Kelas {classInfo.name} Sudah Diinput
            </p>
            <p className="text-xs mt-1 text-muted-foreground font-medium">
              Presensi untuk sesi {selectedSession} tanggal {selectedDate} sudah tersimpan. Anda dapat mengedit atau menghapus record per siswa menggunakan tombol aksi di tabel.
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* KONTROL PARAMETER PRESENSI                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Card className="shadow-xs border-border">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <School className="size-5 text-primary" />
            <span>Kontrol Parameter Presensi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-4 space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-foreground">Pilih Kelas</Label>
              {userIsAdmin ? (
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-card text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Kelas {c.nama_kelas} {c.tingkat ? `(Tingkat ${c.tingkat})` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center justify-between h-10 px-3.5 rounded-lg border border-border bg-slate-100/80 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Lock className="size-3.5 text-muted-foreground" />
                    <span className="font-bold text-sm text-foreground">{classInfo.name}</span>
                    {classInfo.tingkat && <span className="text-xs text-muted-foreground">(Tingkat {classInfo.tingkat})</span>}
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                    Guru Wali Kelas
                  </span>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground font-medium">
                {userIsAdmin ? "Admin berhak memilih seluruh kelas di sekolah." : `Terkunci otomatis pada kelas ${classInfo.name} yang Anda ampu.`}
              </p>
            </div>

            <div className="md:col-span-4 space-y-1.5 text-left">
              <Label htmlFor="date-picker" className="text-xs font-semibold text-foreground">Tanggal Presensi</Label>
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
              <p className="text-[11px] text-muted-foreground font-medium truncate">{formattedIndonesianDate}</p>
            </div>

            <div className="md:col-span-4 space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-foreground">Sesi Presensi</Label>
              <div className="grid grid-cols-2 gap-2 h-10 p-1 rounded-lg border border-border bg-slate-100/70 dark:bg-slate-800/50">
                <button
                  type="button"
                  onClick={() => setSelectedSession("Pagi")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-md text-xs font-bold transition-all cursor-pointer",
                    selectedSession === "Pagi" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
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
                    selectedSession === "Sore" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Moon className={cn("size-3.5", selectedSession === "Sore" ? "text-indigo-500" : "")} />
                  <span>Sesi Sore</span>
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Pilih sesi presensi harian (Pagi/Sore).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {checkingExisting ? (
        <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground text-sm">
          <LoaderCircle className="size-4 animate-spin" />
          <span>Memeriksa status presensi...</span>
        </div>
      ) : (
        <>
          {/* ─── Summary cards ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <div className="p-4 rounded-xl border border-border bg-card shadow-xs text-left">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase">Total Siswa</span>
                <Users className="size-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground mt-2 tracking-tight">{summary.total}</p>
            </div>
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900 text-left">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                <span className="text-xs font-semibold uppercase">Hadir</span>
                <UserCheck className="size-4" />
              </div>
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mt-2 tracking-tight">{summary.hadir}</p>
            </div>
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900 text-left">
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
                <span className="text-xs font-semibold uppercase">Terlambat</span>
                <Clock className="size-4" />
              </div>
              <p className="text-2xl font-bold text-amber-800 dark:text-amber-300 mt-2 tracking-tight">{summary.terlambat}</p>
            </div>
            <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-900 text-left">
              <div className="flex items-center justify-between text-yellow-700 dark:text-yellow-400">
                <span className="text-xs font-semibold uppercase">Izin</span>
                <Clock className="size-4" />
              </div>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mt-2 tracking-tight">{summary.izin}</p>
            </div>
            <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 dark:border-orange-900 text-left">
              <div className="flex items-center justify-between text-orange-700 dark:text-orange-400">
                <span className="text-xs font-semibold uppercase">Sakit</span>
                <AlertTriangle className="size-4" />
              </div>
              <p className="text-2xl font-bold text-orange-800 dark:text-orange-300 mt-2 tracking-tight">{summary.sakit}</p>
            </div>
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-900 text-left">
              <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
                <span className="text-xs font-semibold uppercase">Alpa</span>
                <UserX className="size-4" />
              </div>
              <p className="text-2xl font-bold text-rose-800 dark:text-rose-300 mt-2 tracking-tight">{summary.alpa}</p>
            </div>
            <div
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                !hasExistingData && summary.belumDiisi > 0
                  ? "border-amber-400 bg-amber-100/50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase">Belum Diisi</span>
                <Sparkles className="size-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold mt-2 tracking-tight">
                {hasExistingData ? 0 : summary.belumDiisi}
              </p>
            </div>
          </div>

          {/* ─── Student attendance table ─── */}
          <Card className="shadow-xs border-border">
            <CardHeader className="pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/50">
              <div className="space-y-0.5 text-left">
                <CardTitle className="text-base font-bold text-foreground">Daftar Siswa Kelas {classInfo.name}</CardTitle>
                <p className="text-xs text-muted-foreground font-medium">
                  {hasExistingData
                    ? "Data presensi sudah tersimpan. Gunakan tombol Edit/Hapus untuk mengubah data."
                    : `Tentukan status kehadiran tiap siswa untuk sesi ${selectedSession}.`}
                </p>
              </div>

              {!hasExistingData && (
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
              )}
            </CardHeader>

            <CardContent className="p-0 sm:p-6">
              {loadingStudents ? (
                <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                  <LoaderCircle className="size-5 animate-spin" />
                  <span>Memuat daftar siswa...</span>
                </div>
              ) : students.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">Tidak ada siswa di kelas ini.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/70 dark:bg-slate-800/50">
                        <TableHead className="w-12 text-center font-bold text-foreground">No.</TableHead>
                        <TableHead className="w-28 font-bold text-foreground">NIS</TableHead>
                        <TableHead className="min-w-[180px] font-bold text-foreground">Nama Siswa</TableHead>
                        <TableHead className="min-w-[280px] text-center font-bold text-foreground">Status Kehadiran</TableHead>
                        <TableHead className="min-w-[180px] font-bold text-foreground">Keterangan (Opsional)</TableHead>
                        {hasExistingData && (
                          <TableHead className="w-24 text-center font-bold text-foreground">Aksi</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student, index) => {
                        const displayRec = getDisplayRecord(student.id);
                        const existingRow = findExistingRecord(student.id);
                        const isEditingThis = editingRowId === student.id;
                        const isUnfilled = !hasExistingData && !displayRec.status;

                        return (
                          <TableRow
                            key={student.id}
                            className={cn(
                              "transition-colors",
                              isUnfilled ? "bg-amber-50/30 dark:bg-amber-950/10" : "",
                              isEditingThis ? "bg-primary/5 dark:bg-primary/10" : ""
                            )}
                          >
                            <TableCell className="text-center font-medium text-muted-foreground py-3">{index + 1}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground py-3">{student.nis}</TableCell>
                            <TableCell className="font-semibold text-foreground py-3 text-left">
                              <div className="flex flex-wrap items-center gap-2">
                                <span>{student.name}</span>
                                {isUnfilled && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                    Belum diisi
                                  </span>
                                )}
                                {displayRec.status === "Hadir" && displayRec.terlambat && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-2xs">
                                    <Clock className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                                    <span>Terlambat</span>
                                  </span>
                                )}
                              </div>
                            </TableCell>

                            {/* Status column */}
                            <TableCell className="py-2.5 text-center">
                              {isEditingThis ? (
                                /* ── EDIT MODE: status selector ── */
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="inline-flex items-center p-1 rounded-lg border border-primary/30 bg-primary/5 dark:bg-primary/10 gap-1">
                                    {STATUS_OPTIONS.map((label) => {
                                      const colorMap = {
                                        Hadir: "bg-emerald-600",
                                        Izin: "bg-yellow-500",
                                        Sakit: "bg-orange-500",
                                        Alpa: "bg-rose-600",
                                      };
                                      return (
                                        <button
                                          key={label}
                                          type="button"
                                          onClick={() => setEditDraft((prev) => ({
                                            ...prev,
                                            status: label,
                                            terlambat: label === "Hadir" && selectedSession.toLowerCase() === "pagi" ? prev.terlambat : false
                                          }))}
                                          className={cn(
                                            "px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
                                            editDraft.status === label
                                              ? `${colorMap[label]} ${label === "Izin" ? "text-yellow-950" : "text-white"} shadow-xs`
                                              : "text-muted-foreground"
                                          )}
                                        >
                                          {label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {editDraft.status === "Hadir" && selectedSession.toLowerCase() === "pagi" && (
                                    <button
                                      type="button"
                                      onClick={() => setEditDraft((prev) => ({ ...prev, terlambat: !prev.terlambat }))}
                                      className={cn(
                                        "px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs mt-0.5",
                                        editDraft.terlambat
                                          ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                                          : "bg-amber-50/80 text-amber-800 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                      )}
                                    >
                                      <Clock className="size-3.5 shrink-0" />
                                      <span>{editDraft.terlambat ? "Terlambat" : "+ Tandai Terlambat"}</span>
                                    </button>
                                  )}
                                </div>
                              ) : (
                                /* ── READ / CREATE MODE: status display/selector ── */
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className={cn(
                                    "inline-flex items-center p-1 rounded-lg border border-border bg-slate-100/60 dark:bg-slate-800/60 gap-1",
                                    hasExistingData && "opacity-70"
                                  )}>
                                    {STATUS_OPTIONS.map((label) => {
                                      const colorMap = {
                                        Hadir: "bg-emerald-600",
                                        Izin: "bg-yellow-500",
                                        Sakit: "bg-orange-500",
                                        Alpa: "bg-rose-600",
                                      };
                                      return (
                                        <button
                                          key={label}
                                          type="button"
                                          disabled={hasExistingData}
                                          onClick={() => handleStatusChange(student.id, label)}
                                          className={cn(
                                            "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                            displayRec.status === label
                                              ? `${colorMap[label]} ${label === "Izin" ? "text-yellow-950" : "text-white"} shadow-xs`
                                              : "text-muted-foreground",
                                            hasExistingData ? "cursor-not-allowed" : "cursor-pointer"
                                          )}
                                        >
                                          {label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {!hasExistingData && displayRec.status === "Hadir" && selectedSession.toLowerCase() === "pagi" && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleTerlambat(student.id)}
                                      className={cn(
                                        "px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs mt-0.5",
                                        displayRec.terlambat
                                          ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                                          : "bg-amber-50/80 text-amber-800 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                                      )}
                                    >
                                      <Clock className="size-3.5 shrink-0" />
                                      <span>{displayRec.terlambat ? "Terlambat" : "+ Tandai Terlambat"}</span>
                                    </button>
                                  )}
                                  {hasExistingData && displayRec.status === "Hadir" && displayRec.terlambat && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                      <Clock className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                                      <span>Terlambat</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </TableCell>

                            {/* Keterangan column */}
                            <TableCell className="py-2.5">
                              {isEditingThis ? (
                                <Input
                                  type="text"
                                  placeholder="Keterangan (misal: Demam)"
                                  value={editDraft.note}
                                  onChange={(e) => setEditDraft((prev) => ({ ...prev, note: e.target.value }))}
                                  className="h-8 text-xs bg-card border-primary/30"
                                />
                              ) : (
                                <Input
                                  type="text"
                                  placeholder="Keterangan (misal: Demam)"
                                  value={displayRec.note || ""}
                                  onChange={(e) => handleNoteChange(student.id, e.target.value)}
                                  disabled={hasExistingData}
                                  className="h-8 text-xs bg-card"
                                />
                              )}
                            </TableCell>

                            {/* ── Action column (only in read mode with existing data) ── */}
                            {hasExistingData && (
                              <TableCell className="py-2.5 text-center">
                                {existingRow ? (
                                  isEditingThis ? (
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleSaveEdit}
                                        disabled={isUpdating}
                                        className="size-7 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 cursor-pointer"
                                        aria-label="Simpan perubahan"
                                      >
                                        {isUpdating ? <LoaderCircle className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleCancelEdit}
                                        disabled={isUpdating}
                                        className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                                        aria-label="Batal edit"
                                      >
                                        <X className="size-3.5" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleStartEdit(student.id)}
                                        disabled={editingRowId !== null}
                                        className="size-7 text-primary hover:bg-primary/10 cursor-pointer"
                                        aria-label="Edit presensi"
                                      >
                                        <Pencil className="size-3.5" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenDelete(existingRow.id, student.name)}
                                        disabled={editingRowId !== null}
                                        className="size-7 text-destructive hover:bg-destructive/10 cursor-pointer"
                                        aria-label="Hapus presensi"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </div>
                                  )
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic">—</span>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─── Sticky submit bar (create mode only) ─── */}
          {!hasExistingData && (
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
                    <span>Ringkasan: {summary.hadir} Hadir, {summary.izin} Izin, {summary.sakit} Sakit, {summary.alpa} Alpa</span>
                  </div>
                )}
              </div>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving || loadingStudents}
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
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION DIALOG                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-bold">
              Hapus Record Presensi?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Anda akan menghapus record presensi untuk siswa{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.studentName}</span>.
              Record presensi yang dihapus tidak dapat dikembalikan. Data siswa tidak akan terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-semibold cursor-pointer" disabled={isDeleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <span>Hapus</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AttendanceInput;