import React, { useState, useMemo } from "react";
import { UserPlus } from "lucide-react";
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
import TeacherFilters from "@/pages/teachers/components/TeacherFilters";
import TeachersTable from "@/pages/teachers/components/TeachersTable";
import TeacherFormDialog from "@/pages/teachers/components/TeacherFormDialog";
// TODO: Replace masterTeachers with Laravel API response — GET /api/teachers
import { masterTeachers } from "@/data/dummyTeachers";

// Seed ID untuk data guru baru
let nextTempId = 1000;

function Teachers() {
  // ─── State utama ──────────────────────────────────────────────────────────
  const [teachers, setTeachers] = useState(masterTeachers);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // ─── State dialog ─────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [editTarget, setEditTarget] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ─── Toast / feedback sederhana ───────────────────────────────────────────
  const [toast, setToast] = useState(null); // { message, type: "success" | "error" }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Filtering & Search ───────────────────────────────────────────────────
  const filteredTeachers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return teachers.filter((t) => {
      // Filter Role
      const matchesRole = selectedRole === "all" || t.role === selectedRole;
      
      // Filter Status
      const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;

      // Search Name, NIP, Username
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.nip.includes(q) ||
        t.username.toLowerCase().includes(q);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [teachers, search, selectedRole, selectedStatus]);

  // ─── Handlers CRUD ────────────────────────────────────────────────────────

  /** Buka Dialog Tambah Guru */
  const handleOpenAdd = () => {
    setFormMode("create");
    setEditTarget(null);
    setFormOpen(true);
  };

  /** Buka Dialog Edit Guru */
  const handleOpenEdit = (teacher) => {
    setFormMode("edit");
    setEditTarget(teacher);
    setFormOpen(true);
  };

  /** Simpan Data (Tambah atau Edit) */
  const handleFormSubmit = (formData) => {
    if (formMode === "create") {
      // TODO: Replace with POST /api/teachers
      const newTeacher = {
        ...formData,
        id: ++nextTempId,
      };
      setTeachers((prev) => [newTeacher, ...prev]);
      showToast("Data guru berhasil ditambahkan.");
    } else {
      // TODO: Replace with PUT /api/teachers/{id}
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === editTarget.id ? { ...t, ...formData } : t
        )
      );
      showToast("Data guru berhasil diperbarui.");
    }
    setFormOpen(false);
    setEditTarget(null);
  };

  /** Buka konfirmasi Hapus Guru */
  const handleOpenDelete = (teacher) => {
    setDeleteTarget(teacher);
    setDeleteOpen(true);
  };

  /** Konfirmasi hapus */
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    // TODO: Replace with DELETE /api/teachers/{id}
    setTeachers((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    showToast(`Data guru "${deleteTarget.name}" berhasil dihapus.`);
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

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
        title="Data Guru"
        description="Kelola data guru, peran, dan informasi kelas wali."
        actions={
          <Button
            id="btn-tambah-guru"
            onClick={handleOpenAdd}
            className="gap-2 font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <UserPlus className="size-4" />
            Tambah Guru
          </Button>
        }
      />

      {/* ── Card Konten Utama ───────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border shadow-xs p-4 sm:p-6 space-y-4">
        {/* Filter & Search */}
        <TeacherFilters
          search={search}
          onSearchChange={setSearch}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          filteredCount={filteredTeachers.length}
          totalCount={teachers.length}
        />

        {/* Tabel Guru */}
        <TeachersTable
          teachers={filteredTeachers}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      {/* ── Dialog Form Tambah / Edit ──────────────────────────────────── */}
      <TeacherFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        teacher={editTarget}
        teachersList={teachers}
        onSubmit={handleFormSubmit}
      />

      {/* ── Alert Dialog Konfirmasi Hapus ──────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-bold">
              Hapus Data Guru?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus data guru{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>
              ? Data guru yang dihapus akan terhapus dari daftar presensi/pengajar.
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

export default Teachers;
