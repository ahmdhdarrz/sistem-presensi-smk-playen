import React, { useState, useMemo, useEffect } from "react";
import { UserCheck, Clock, CheckCircle2, LoaderCircle } from "lucide-react";
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
import { getIzinHarian, createIzinHarian, deleteIzinHarian } from "@/services/izinHarianService";
import { getKelas } from "@/services/siswaService";
import { useAuth } from "@/context/AuthContext";
import { isAdmin } from "@/utils/roles";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function AttendancePermissions() {
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user?.role);

  const [permissions, setPermissions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [selectedClass, setSelectedClass] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load daftar kelas (untuk filter & form)
  useEffect(() => {
    getKelas()
      .then((res) => setClasses(res.data || res))
      .catch((err) => console.error(err));
  }, []);

  // Fetch izin harian tiap kali tanggal berubah
  useEffect(() => {
    fetchIzinHarian(selectedDate);
  }, [selectedDate]);

  const fetchIzinHarian = async (tanggal) => {
    try {
      setLoading(true);
      const data = await getIzinHarian(tanggal);
      const mapped = (data.data || data).map((item) => ({
        id: item.id,
        studentId: item.siswa_id,
        studentName: item.siswa?.nama || "-",
        nis: item.siswa?.nis || "-",
        className: item.siswa?.kelas?.nama_kelas || "-",
        date: item.tanggal,
        time: item.waktu_keluar,
        reason: item.alasan,
      }));
      setPermissions(mapped);
    } catch (error) {
      console.error(error);
      showToast("Gagal memuat data izin harian", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredPermissions = useMemo(() => {
    const q = search.toLowerCase().trim();
    return permissions.filter((p) => {
      const matchesClass = selectedClass === "all" || p.className === selectedClass;
      const matchesSearch =
        !q || p.studentName.toLowerCase().includes(q) || p.nis.toLowerCase().includes(q);
      return matchesClass && matchesSearch;
    });
  }, [permissions, search, selectedClass]);

  const stats = useMemo(() => {
    const today = todayStr();
    const activeToday = permissions.filter((p) => p.date === today).length;
    return { total: permissions.length, activeToday };
  }, [permissions]);

  const handleOpenAdd = () => setFormOpen(true);

  const handleFormSubmit = async (formData) => {
    try {
      await createIzinHarian({
        siswa_id: formData.studentId,
        tanggal: formData.date,
        waktu_keluar: formData.time,
        alasan: formData.reason,
      });
      showToast("Izin harian berhasil ditambahkan.");
      setFormOpen(false);
      fetchIzinHarian(selectedDate);
    } catch (error) {
      const message = error.response?.data?.message || "Gagal menyimpan data izin harian.";
      showToast(message, "error");
    }
  };

  const handleOpenDelete = (permission) => {
    setDeleteTarget(permission);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteIzinHarian(deleteTarget.id);
      showToast(`Data izin "${deleteTarget.studentName}" berhasil dihapus.`);
      fetchIzinHarian(selectedDate);
    } catch (error) {
      showToast("Gagal menghapus data izin harian", "error");
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="relative">
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

      <PageHeader
        title="Izin Harian"
        description="Kelola data izin harian siswa SMK Muhammadiyah 1 Playen."
        actions={
          userIsAdmin ? (
            <Button
              id="btn-tambah-izin"
              onClick={handleOpenAdd}
              className="gap-2 font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <UserCheck className="size-4" />
              Tambah Izin
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <UserCheck className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Izin (Tanggal Terpilih)</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
            <Clock className="size-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Izin Hari Ini</p>
            <p className="text-2xl font-bold text-foreground">{stats.activeToday}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-xs p-4 sm:p-6 space-y-4">
        <PermissionFilters
          search={search}
          onSearchChange={setSearch}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          filteredCount={filteredPermissions.length}
          totalCount={permissions.length}
          classes={classes}
        />
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <LoaderCircle className="size-5 animate-spin" />
            <span>Memuat data izin harian...</span>
          </div>
        ) : (
          <PermissionTable
            permissions={filteredPermissions}
            onDelete={handleOpenDelete}
            canDelete={userIsAdmin}
          />
        )}
      </div>

      {userIsAdmin && (
        <PermissionFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
          classes={classes}
        />
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-bold">Hapus Data Izin?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Anda akan menghapus data izin harian untuk siswa{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.studentName}</span>. Data izin
              yang dihapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-semibold cursor-pointer">Batal</AlertDialogCancel>
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