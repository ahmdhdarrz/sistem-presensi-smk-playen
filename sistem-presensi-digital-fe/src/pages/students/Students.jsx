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
import StudentFilters from "@/components/students/StudentFilters";
import StudentsTable from "@/components/students/StudentsTable";
import StudentFormDialog from "@/components/students/StudentFormDialog";
import {
  getSiswa,
  createSiswa,
  updateSiswa,
  deleteSiswa,
  getKelas,
} from "@/services/siswaService";

function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]); // [{id, nama_kelas}]
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editTarget, setEditTarget] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Mapping data siswa dari API -> bentuk yang dipakai UI
  const mapSiswa = (item, kelasList) => {
    const kelas = kelasList.find((k) => k.id === item.kelas_id);
    return {
      id: item.id,
      name: item.nama,
      nis: item.nis,
      jenisKelamin: item.jenis_kelamin, // "L" | "P"
      classId: item.kelas_id,
      className: kelas ? kelas.nama_kelas : "-",
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [siswaRes, kelasRes] = await Promise.all([getSiswa(), getKelas()]);
      const kelasList = kelasRes.data || kelasRes;
      setClasses(kelasList);
      const siswaList = siswaRes.data || siswaRes;
      setStudents(siswaList.map((s) => mapSiswa(s, kelasList)));
    } catch (err) {
      console.error(err);
      showToast("Gagal memuat data siswa dari server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim();
    return students.filter((s) => {
      const matchesClass =
        selectedClass === "all" || s.className === selectedClass;
      const matchesSearch =
        !q || s.name.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
      return matchesClass && matchesSearch;
    });
  }, [students, search, selectedClass]);

  const handleOpenAdd = () => {
    setFormMode("create");
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (student) => {
    setFormMode("edit");
    setEditTarget(student);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const payload = {
      nama: formData.name,
      nis: formData.nis,
      jenis_kelamin: formData.jenisKelamin,
      kelas_id: Number(formData.kelasId),
    };

    try {
      if (formMode === "create") {
        await createSiswa(payload);
        showToast("Siswa berhasil ditambahkan.");
      } else {
        await updateSiswa(editTarget.id, payload);
        showToast("Data siswa berhasil diperbarui.");
      }
      setFormOpen(false);
      setEditTarget(null);
      await loadData();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Gagal menyimpan data siswa.";
      showToast(message, "error");
    }
  };

  const handleOpenDelete = (student) => {
    setDeleteTarget(student);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSiswa(deleteTarget.id);
      showToast(`Data siswa "${deleteTarget.name}" berhasil dihapus.`);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus data siswa.", "error");
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

      <div className="bg-card rounded-xl border border-border shadow-xs p-4 sm:p-6 space-y-4">
        <StudentFilters
          search={search}
          onSearchChange={setSearch}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          filteredCount={filteredStudents.length}
          totalCount={students.length}
          classes={classes}
        />

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span>Memuat data siswa...</span>
          </div>
        ) : (
          <StudentsTable
            students={filteredStudents}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        )}
      </div>

      <StudentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        student={editTarget}
        onSubmit={handleFormSubmit}
        classes={classes}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-bold">
              Hapus Data Siswa?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Anda akan menghapus data siswa{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>
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