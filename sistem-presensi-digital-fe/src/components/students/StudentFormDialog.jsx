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
import { masterClasses } from "@/data/dummyStudents";

const EMPTY_FORM = {
  name: "",
  nis: "",
  nisn: "",
  className: "",
  status: "",
};

/**
 * Reusable dialog untuk Tambah dan Edit data siswa.
 * mode: "create" | "edit"
 * student: objek siswa yang akan diedit (opsional, hanya saat mode "edit")
 */
function StudentFormDialog({ open, onOpenChange, mode = "create", student = null, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Saat dialog dibuka, isi form sesuai mode
  useEffect(() => {
    if (open) {
      if (mode === "edit" && student) {
        setForm({
          name: student.name || "",
          nis: student.nis || "",
          nisn: student.nisn || "",
          className: student.className || "",
          status: student.status || "",
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
    if (!form.nisn.trim()) newErrors.nisn = "NISN wajib diisi.";
    if (!form.className) newErrors.className = "Kelas wajib dipilih.";
    if (!form.status) newErrors.status = "Status wajib dipilih.";
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
    mode === "edit"
      ? "Perbarui data siswa yang sudah terdaftar."
      : "Masukkan data siswa yang akan ditambahkan.";
  const submitLabel = mode === "edit" ? "Simpan Perubahan" : "Simpan Siswa";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
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
              {errors.name && (
                <p className="text-xs text-destructive font-medium">{errors.name}</p>
              )}
            </div>

            {/* NIS */}
            <div className="grid gap-1.5">
              <Label htmlFor="student-nis" className="font-semibold text-foreground">
                NIS <span className="text-destructive">*</span>
              </Label>
              <Input
                id="student-nis"
                placeholder="Contoh: 2026010101"
                value={form.nis}
                onChange={(e) => handleChange("nis", e.target.value)}
                className={errors.nis ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.nis && (
                <p className="text-xs text-destructive font-medium">{errors.nis}</p>
              )}
            </div>

            {/* NISN */}
            <div className="grid gap-1.5">
              <Label htmlFor="student-nisn" className="font-semibold text-foreground">
                NISN <span className="text-destructive">*</span>
              </Label>
              <Input
                id="student-nisn"
                placeholder="Contoh: 0061234567"
                value={form.nisn}
                onChange={(e) => handleChange("nisn", e.target.value)}
                className={errors.nisn ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.nisn && (
                <p className="text-xs text-destructive font-medium">{errors.nisn}</p>
              )}
            </div>

            {/* Kelas */}
            <div className="grid gap-1.5">
              <Label htmlFor="student-class" className="font-semibold text-foreground">
                Kelas <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.className}
                onValueChange={(val) => handleChange("className", val)}
              >
                <SelectTrigger
                  id="student-class"
                  className={errors.className ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Pilih kelas..." />
                </SelectTrigger>
                <SelectContent>
                  {masterClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.className && (
                <p className="text-xs text-destructive font-medium">{errors.className}</p>
              )}
            </div>

            {/* Status */}
            <div className="grid gap-1.5">
              <Label htmlFor="student-status" className="font-semibold text-foreground">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.status}
                onValueChange={(val) => handleChange("status", val)}
              >
                <SelectTrigger
                  id="student-status"
                  className={errors.status ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Pilih status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-destructive font-medium">{errors.status}</p>
              )}
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
