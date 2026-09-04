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

  const title = mode === "edit" ? "Edit Data Siswa" : "Tambah Siswa";
  const description =
    mode === "edit" ? "Perbarui data siswa yang sudah terdaftar." : "Masukkan data siswa yang akan ditambahkan.";
  const submitLabel = mode === "edit" ? "Simpan Perubahan" : "Simpan Siswa";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2">
            {/* Nama */}
            <div className="grid gap-1.5">
              <Label htmlFor="student-name" className="font-semibold text-foreground">
                Nama Siswa <span className="text-destructive">*</span>
              </Label>
              <Input
                id="student-name"
                placeholder="Contoh: Ahmad Fauzan"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
            </div>

            {/* NIS */}
            <div className="grid gap-1.5">
              <Label htmlFor="student-nis" className="font-semibold text-foreground">
                NIS <span className="text-destructive">*</span>
              </Label>
              <Input
                id="student-nis"
                placeholder="Contoh: 2026001"
                value={form.nis}
                onChange={(e) => handleChange("nis", e.target.value)}
                className={errors.nis ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.nis && <p className="text-xs text-destructive font-medium">{errors.nis}</p>}
            </div>

            {/* Jenis Kelamin */}
            <div className="grid gap-1.5">
              <Label htmlFor="student-gender" className="font-semibold text-foreground">
                Jenis Kelamin <span className="text-destructive">*</span>
              </Label>
              <Select value={form.jenisKelamin} onValueChange={(val) => handleChange("jenisKelamin", val)}>
                <SelectTrigger id="student-gender" className={errors.jenisKelamin ? "border-destructive" : ""}>
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
            <div className="grid gap-1.5">
              <Label htmlFor="student-class" className="font-semibold text-foreground">
                Kelas <span className="text-destructive">*</span>
              </Label>
              <Select value={form.kelasId} onValueChange={(val) => handleChange("kelasId", val)}>
                <SelectTrigger id="student-class" className={errors.kelasId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Pilih kelas..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={String(cls.id)}>
                      {cls.nama_kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kelasId && <p className="text-xs text-destructive font-medium">{errors.kelasId}</p>}
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="cursor-pointer font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
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