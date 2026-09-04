import React, { useState, useMemo, useEffect } from "react";
import { UserPlus, Loader2 } from "lucide-react";
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
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getKelas,
} from "@/services/userService";
import { ROLES } from "@/utils/roles";

function Teachers() {
  // ─── State utama ──────────────────────────────────────────────────────────
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]); // [{id, nama_kelas}]
  const [loading, setLoading] = useState(true);

  // ─── State filter ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  // ─── State dialog ─────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" | "edit"
  const [editTarget, setEditTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ─── Toast / feedback ─────────────────────────────────────────────────────
  const [toast, setToast] = useState(null); // { message, type: "success" | "error" }

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Mapping data API → shape yang dipakai UI ─────────────────────────────
  const mapUser = (item, kelasList) => {
    const kelas = kelasList.find((k) => k.id === item.kelas_id);
    // Normalise role dari backend (lowercase) ke uppercase agar cocok dengan ROLES constant
    const roleNorm = item.role ? String(item.role).toUpperCase() : "";
    const roleKey =
      roleNorm === "WALI_KELAS"
        ? ROLES.GURU_WALI_KELAS
        : roleNorm === "GURU_MAPEL"
        ? ROLES.GURU_MAPEL
        : roleNorm; // ADMIN stays ADMIN

    return {
      id: item.id,
      nama: item.nama,
      username: item.username,
      role: roleKey,
      kelas_id: item.kelas_id,
      kelasNama: kelas ? kelas.nama_kelas : null,
    };
  };

  // ─── Load data dari API ────────────────────────────────────────────────────
  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, kelasRes] = await Promise.all([getUsers(), getKelas()]);
      const kelasList = kelasRes.data || kelasRes;
      setClasses(kelasList);
      const userList = usersRes.data || usersRes;
      setTeachers(userList.map((u) => mapUser(u, kelasList)));
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat data guru dari server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ─── Filtering & Search ───────────────────────────────────────────────────
  const filteredTeachers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return teachers.filter((t) => {
      const matchesRole =
        selectedRole === "all" ||
        String(t.role).toUpperCase() === String(selectedRole).toUpperCase();

      const matchesSearch =
        !q ||
        t.nama.toLowerCase().includes(q) ||
        t.username.toLowerCase().includes(q);

      return matchesRole && matchesSearch;
    });
  }, [teachers, search, selectedRole]);

  // ─── Handlers CRUD ────────────────────────────────────────────────────────

  const handleOpenAdd = () => {
    setFormMode("create");
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (teacher) => {
    setFormMode("edit");
    setEditTarget(teacher);
    setFormOpen(true);
  };

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (formMode === "create") {
        await createUser(payload);
        showToast("Data guru berhasil ditambahkan.");
      } else {
        await updateUser(editTarget.id, payload);
        showToast("Data guru berhasil diperbarui.");
      }
      setFormOpen(false);
      setEditTarget(null);
      await loadData();
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message || "Gagal menyimpan data guru.";
      showToast(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (teacher) => {
    setDeleteTarget(teacher);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      showToast(`Data guru "${deleteTarget.nama}" berhasil dihapus.`);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus data guru.", "error");
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="relative">
      {/* ── Toast feedback ──────────────────────────────────────────────── */}
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

      {/* ── Page Header ─────────────────────────────────────────────────── */}
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

      {/* ── Card Konten Utama ────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border shadow-xs p-4 sm:p-6 space-y-4">
        {/* Filter & Search */}
        <TeacherFilters
          search={search}
          onSearchChange={setSearch}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          filteredCount={filteredTeachers.length}
          totalCount={teachers.length}
        />

        {/* Tabel Guru / Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span>Memuat data guru...</span>
          </div>
        ) : (
          <TeachersTable
            teachers={filteredTeachers}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        )}
      </div>

      {/* ── Dialog Form Tambah / Edit ────────────────────────────────────── */}
      <TeacherFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        teacher={editTarget}
        classes={classes}
        onSubmit={handleFormSubmit}
        submitting={submitting}
      />

      {/* ── Alert Dialog Konfirmasi Hapus ────────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-bold">
              Hapus Data Guru?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Apakah Anda yakin ingin menghapus data guru{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.nama}
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
