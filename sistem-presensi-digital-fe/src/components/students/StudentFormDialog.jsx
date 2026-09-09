import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Pencil, User, Hash, School, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_FORM = {
  name: "",
  nis: "",
  jenisKelamin: "",
  kelasId: "",
};

/**
 * classes: [{ id, nama_kelas }] — dari API GET /api/kelas
 */
function StudentFormDialog({ open, onOpenChange, mode = "create", student = null, onSubmit, classes = [] }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (mode === "edit" && student) {
        setForm({
          name: student.name || "",
          nis: student.nis || "",
          jenisKelamin: student.jenisKelamin || "",
          kelasId: student.classId ? String(student.classId) : "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [open, mode, student]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Nama siswa wajib diisi.";
    if (!form.nis.trim()) newErrors.nis = "NIS wajib diisi.";
    if (!form.jenisKelamin) newErrors.jenisKelamin = "Jenis kelamin wajib dipilih.";
    if (!form.kelasId) newErrors.kelasId = "Kelas wajib dipilih.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(form);
  };

  const title = mode === "edit" ? "Edit Data Siswa" : "Tambah Siswa Baru";
  const description =
    mode === "edit" ? "Perbarui informasi data siswa yang sudah terdaftar." : "Masukkan informasi lengkap untuk menambahkan siswa baru.";
  const submitLabel = mode === "edit" ? "Simpan Perubahan" : "Simpan Siswa";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden text-left border-border">
        <DialogHeader className="p-6 pb-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0">
              {mode === "edit" ? <Pencil className="size-5" /> : <UserPlus className="size-5" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {/* Nama */}
          <div className="space-y-1.5">
            <Label htmlFor="student-name" className="text-xs font-bold text-foreground flex items-center gap-1">
              <User className="size-3.5 text-muted-foreground" />
              <span>Nama Siswa</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="student-name"
              placeholder="Contoh: Ahmad Fauzan"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={errors.name ? "border-destructive focus-visible:ring-destructive/30 h-9 text-xs font-semibold" : "h-9 text-xs font-semibold"}
            />
            {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
          </div>

          {/* NIS */}
          <div className="space-y-1.5">
            <Label htmlFor="student-nis" className="text-xs font-bold text-foreground flex items-center gap-1">
              <Hash className="size-3.5 text-muted-foreground" />
              <span>NIS (Nomor Induk Siswa)</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="student-nis"
              placeholder="Contoh: 2026001"
              value={form.nis}
              onChange={(e) => handleChange("nis", e.target.value)}
              className={errors.nis ? "border-destructive focus-visible:ring-destructive/30 font-mono h-9 text-xs font-semibold" : "h-9 text-xs font-semibold font-mono"}
            />
            {errors.nis && <p className="text-xs text-destructive font-medium">{errors.nis}</p>}
          </div>

          {/* Jenis Kelamin & Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Jenis Kelamin */}
            <div className="space-y-1.5">
              <Label htmlFor="student-gender" className="text-xs font-bold text-foreground flex items-center gap-1">
                <Users className="size-3.5 text-muted-foreground" />
                <span>Jenis Kelamin</span>
                <span className="text-destructive">*</span>
              </Label>
              <Select value={form.jenisKelamin} onValueChange={(val) => handleChange("jenisKelamin", val)}>
                <SelectTrigger id="student-gender" className={errors.jenisKelamin ? "border-destructive h-9 text-xs font-semibold" : "h-9 text-xs font-semibold"}>
                  <SelectValue placeholder="Pilih jenis kelamin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
              {errors.jenisKelamin && (
                <p className="text-xs text-destructive font-medium">{errors.jenisKelamin}</p>
              )}
            </div>

            {/* Kelas */}
            <div className="space-y-1.5">
              <Label htmlFor="student-class" className="text-xs font-bold text-foreground flex items-center gap-1">
                <School className="size-3.5 text-muted-foreground" />
                <span>Kelas</span>
                <span className="text-destructive">*</span>
              </Label>
              <Select value={form.kelasId} onValueChange={(val) => handleChange("kelasId", val)}>
                <SelectTrigger id="student-class" className={errors.kelasId ? "border-destructive h-9 text-xs font-semibold" : "h-9 text-xs font-semibold"}>
                  <SelectValue placeholder="Pilih kelas..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={String(cls.id)}>
                      Kelas {cls.nama_kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kelasId && <p className="text-xs text-destructive font-medium">{errors.kelasId}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/50 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer font-semibold h-9 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="cursor-pointer font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs"
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default StudentFormDialog;