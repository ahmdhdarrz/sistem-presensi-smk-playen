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
import StudentFilters from "@/components/students/StudentFilters";
import StudentsTable from "@/components/students/StudentsTable";
import StudentFormDialog from "@/components/students/StudentFormDialog";
// TODO: Replace masterStudents with Laravel API response — GET /api/students
import { masterStudents } from "@/data/dummyStudents";

// Seed ID untuk siswa yang ditambahkan via form (tidak bentrok dengan dummy id yang berbasis angka)
let nextTempId = 99000;

function Students() {
  // ─── State utama ──────────────────────────────────────────────────────────
  const [students, setStudents] = useState(masterStudents);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  // ─── State dialog ─────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [editTarget, setEditTarget] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ─── Toast / feedback sederhana ───────────────────────────────────────────
  const [toast, setToast] = useState(null); // { message, type: "success"|"error" }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Filtering & Search ───────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim();
    return students.filter((s) => {
      const matchesClass =
        selectedClass === "all" || s.className === selectedClass;
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        (s.nisn && s.nisn.toLowerCase().includes(q));
      return matchesClass && matchesSearch;
    });
  }, [students, search, selectedClass]);

  // ─── Handlers CRUD ────────────────────────────────────────────────────────

  /** Buka dialog Tambah */
  const handleOpenAdd = () => {
    setFormMode("create");
    setEditTarget(null);
    setFormOpen(true);
  };

  /** Buka dialog Edit */
  const handleOpenEdit = (student) => {
    setFormMode("edit");
    setEditTarget(student);
    setFormOpen(true);
  };

  /** Simpan (Tambah atau Edit) */
  const handleFormSubmit = (formData) => {
    if (formMode === "create") {
      // TODO: Replace with POST /api/students
      const newStudent = {
        ...formData,
        id: ++nextTempId,
        classId: null, // akan diisi oleh API nanti
      };
      setStudents((prev) => [newStudent, ...prev]);
      showToast("Siswa berhasil ditambahkan.");
    } else {
      // TODO: Replace with PUT /api/students/{id}
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editTarget.id ? { ...s, ...formData } : s
        )
      );
      showToast("Data siswa berhasil diperbarui.");
    }
    setFormOpen(false);
    setEditTarget(null);
  };

  /** Buka konfirmasi Hapus */
  const handleOpenDelete = (student) => {
    setDeleteTarget(student);
    setDeleteOpen(true);
  };

  /** Konfirmasi hapus */
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    // TODO: Replace with DELETE /api/students/{id}
    setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    showToast(`Data siswa "${deleteTarget.name}" berhasil dihapus.`);
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
        title="Data Siswa"
        description="Kelola data siswa SMK Muhammadiyah 1 Playen."
        actions={
          <Button
            id="btn-tambah-siswa"
            onClick={handleOpenAdd}
            className="gap-2 font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <UserPlus className="size-4" />
            Tambah Siswa
          </Button>
        }
      />

      {/* ── Card Konten Utama ───────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border shadow-xs p-4 sm:p-6 space-y-4">
        {/* Filter & Search */}
        <StudentFilters
          search={search}
          onSearchChange={setSearch}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          filteredCount={filteredStudents.length}
          totalCount={students.length}
        />

        {/* Tabel Siswa */}
        <StudentsTable
          students={filteredStudents}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      {/* ── Dialog Form Tambah / Edit ──────────────────────────────────── */}
      <StudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        student={editTarget}
        onSubmit={handleFormSubmit}
      />

      {/* ── Alert Dialog Konfirmasi Hapus ──────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-bold">
              Hapus Data Siswa?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Anda akan menghapus data siswa{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.name}
              </span>
              . Data siswa yang dihapus tidak dapat dikembalikan.
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

export default Students;
