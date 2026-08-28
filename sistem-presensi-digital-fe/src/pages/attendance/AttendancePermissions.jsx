import React, { useState, useMemo } from "react";
import { UserCheck, Clock, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
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
import PermissionFilters from "./components/PermissionFilters";
import PermissionTable from "./components/PermissionTable";
import PermissionFormDialog from "./components/PermissionFormDialog";

// TODO: Replace with GET /api/permissions
import { masterPermissions } from "@/data/dummyPermissions";

let nextTempId = 99000;

function AttendancePermissions() {
  // ─── State utama ──────────────────────────────────────────────────────────
  const [permissions, setPermissions] = useState(masterPermissions);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  // ─── State dialog ─────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [editTarget, setEditTarget] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ─── Toast / feedback sederhana ───────────────────────────────────────────
  const [toast, setToast] = useState(null); 

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Filtering & Search ───────────────────────────────────────────────────
  const filteredPermissions = useMemo(() => {
    const q = search.toLowerCase().trim();
    return permissions.filter((p) => {
      const matchesClass =
        selectedClass === "all" || p.className === selectedClass;
      const matchesDate = !selectedDate || p.date === selectedDate;
      const matchesSearch =
        !q ||
        p.studentName.toLowerCase().includes(q) ||
        p.nis.toLowerCase().includes(q);
      
      return matchesClass && matchesDate && matchesSearch;
    });
  }, [permissions, search, selectedClass, selectedDate]);

  // ─── Summary Stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const activeToday = permissions.filter(p => p.date === today && p.status === "Izin").length;
    const completed = permissions.filter(p => p.status === "Selesai").length;
    return {
      total: permissions.length,
      activeToday,
      completed
    };
  }, [permissions]);

  // ─── Handlers CRUD ────────────────────────────────────────────────────────

  /** Buka dialog Tambah */
  const handleOpenAdd = () => {
    setFormMode("create");
    setEditTarget(null);
    setFormOpen(true);
  };

  /** Buka dialog Edit */
  const handleOpenEdit = (permission) => {
    setFormMode("edit");
    setEditTarget(permission);
    setFormOpen(true);
  };

  /** Simpan (Tambah atau Edit) */
  const handleFormSubmit = (formData) => {
    if (formMode === "create") {
      // TODO: Replace with POST /api/permissions
      const newPermission = {
        ...formData,
        id: ++nextTempId,
      };
      // Insert di awal array
      setPermissions((prev) => [newPermission, ...prev]);
      showToast("Izin harian berhasil ditambahkan.");
    } else {
      // TODO: Replace with PUT /api/permissions/{id}
      setPermissions((prev) =>
        prev.map((p) =>
          p.id === editTarget.id ? { ...p, ...formData } : p
        )
      );
      showToast("Data izin harian berhasil diperbarui.");
    }
    setFormOpen(false);
    setEditTarget(null);
  };

  /** Buka konfirmasi Hapus */
  const handleOpenDelete = (permission) => {
    setDeleteTarget(permission);
    setDeleteOpen(true);
  };

  /** Konfirmasi hapus */
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    // TODO: Replace with DELETE /api/permissions/{id}
    setPermissions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    showToast(`Data izin "${deleteTarget.studentName}" berhasil dihapus.`);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative">
      {/* ── Toast feedback ─────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 animate-in slide-in-from-bottom-4 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
          role="status"
          aria-live="polite"
        >
          <span
            className={`size-2 rounded-full shrink-0 ${
              toast.type === "success" ? "bg-emerald-500" : "bg-destructive"
            }`}
          />
          {toast.message}
        </div>
      )}

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <PageHeader
        title="Izin Harian"
        description="Kelola data izin harian siswa SMK Muhammadiyah 1 Playen."
        actions={
          <Button
            id="btn-tambah-izin"
            onClick={handleOpenAdd}
            className="gap-2 font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <UserCheck className="size-4" />
            Tambah Izin
          </Button>
        }
      />

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <UserCheck className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Izin</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
            <Clock className="size-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Izin Aktif Hari Ini</p>
            <p className="text-2xl font-bold text-foreground">{stats.activeToday}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Izin Selesai</p>
            <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* ── Card Konten Utama ───────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border shadow-xs p-4 sm:p-6 space-y-4">
        {/* Filter & Search */}
        <PermissionFilters
          search={search}
          onSearchChange={setSearch}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          filteredCount={filteredPermissions.length}
          totalCount={permissions.length}
        />

        {/* Tabel Izin */}
        <PermissionTable
          permissions={filteredPermissions}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      {/* ── Dialog Form Tambah / Edit ──────────────────────────────────── */}
      <PermissionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        permission={editTarget}
        onSubmit={handleFormSubmit}
      />

      {/* ── Alert Dialog Konfirmasi Hapus ──────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-bold">
              Hapus Data Izin?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Anda akan menghapus data izin harian untuk siswa{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.studentName}
              </span>
              . Data izin yang dihapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-semibold cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold cursor-pointer"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AttendancePermissions;
