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
import { ROLES, ROLE_LABELS } from "@/utils/roles";

const EMPTY_FORM = {
  name: "",
  nip: "",
  username: "",
  role: "",
  assignedClass: "",
  status: "",
};

/**
 * Reusable Dialog Form untuk Tambah & Edit Data Guru.
 */
function TeacherFormDialog({
  open,
  onOpenChange,
  mode = "create",
  teacher = null,
  teachersList = [],
  onSubmit,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Sync modal open/close & mode
  useEffect(() => {
    if (open) {
      if (mode === "edit" && teacher) {
        setForm({
          name: teacher.name || "",
          nip: teacher.nip || "",
          username: teacher.username || "",
          role: teacher.role || "",
          assignedClass: teacher.assignedClass || "",
          status: teacher.status || "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [open, mode, teacher]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset assignedClass jika role diubah dari GURU_WALI_KELAS ke role lain
      if (field === "role" && value !== ROLES.GURU_WALI_KELAS) {
        updated.assignedClass = "";
      }
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    // Wajib diisi
    if (!form.name.trim()) newErrors.name = "Nama guru wajib diisi.";
    if (!form.nip.trim()) newErrors.nip = "NIP wajib diisi.";
    if (!form.username.trim()) newErrors.username = "Username wajib diisi.";
    if (!form.role) newErrors.role = "Role / Peran wajib dipilih.";
    if (!form.status) newErrors.status = "Status wajib dipilih.";

    if (form.role === ROLES.GURU_WALI_KELAS && !form.assignedClass) {
      newErrors.assignedClass = "Kelas Wali wajib dipilih.";
    }

    // Validasi NIP & Username Duplikat
    const cleanUsername = form.username.trim().toLowerCase();
    const cleanNip = form.nip.trim();

    const isDuplicateUsername = teachersList.some((t) => {
      if (mode === "edit" && teacher && t.id === teacher.id) return false;
      return t.username.toLowerCase() === cleanUsername;
    });

    const isDuplicateNip = teachersList.some((t) => {
      if (mode === "edit" && teacher && t.id === teacher.id) return false;
      return t.nip === cleanNip;
    });

    if (isDuplicateUsername) {
      newErrors.username = "Username sudah digunakan oleh guru lain.";
    }

    if (isDuplicateNip) {
      newErrors.nip = "NIP sudah terdaftar untuk guru lain.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Ubah string kosong pada assignedClass menjadi null jika bukan wali kelas
    const payload = {
      ...form,
      assignedClass: form.role === ROLES.GURU_WALI_KELAS ? form.assignedClass : null,
    };

    onSubmit(payload);
  };

  // Saring kelas yang sudah di-assign ke guru wali kelas lain agar tidak terjadi tabrakan wali kelas.
  // CATATAN INTEGRASI BACKEND: Validasi final keunikan kelas wali harus divalidasi juga di backend Laravel.
  const availableClasses = masterClasses.filter((cls) => {
    // Jika di mode edit dan kelas ini adalah kelas guru yang sedang di-edit, ijinkan
    if (mode === "edit" && teacher && teacher.assignedClass === cls.name) {
      return true;
    }
    // Cek apakah ada guru lain (berstatus aktif/tidak aktif) yang sudah memegang kelas ini
    const isAssigned = teachersList.some(
      (t) => t.role === ROLES.GURU_WALI_KELAS && t.assignedClass === cls.name
    );
    return !isAssigned;
  });

  const title = mode === "edit" ? "Edit Data Guru" : "Tambah Guru";
  const description =
    mode === "edit"
      ? "Perbarui informasi profil dan peran guru terpilih."
      : "Masukkan data guru baru ke dalam sistem master.";
  const submitLabel = mode === "edit" ? "Simpan Perubahan" : "Simpan Guru";

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
          <div className="grid gap-4 py-2 text-left">
            {/* Nama Guru */}
            <div className="grid gap-1.5">
              <Label htmlFor="teacher-name" className="font-semibold text-foreground">
                Nama Lengkap & Gelar <span className="text-destructive">*</span>
              </Label>
              <Input
                id="teacher-name"
                placeholder="Contoh: Ahmad Santoso, S.Pd."
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={errors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive font-medium">{errors.name}</p>
              )}
            </div>

            {/* NIP */}
            <div className="grid gap-1.5">
              <Label htmlFor="teacher-nip" className="font-semibold text-foreground">
                NIP <span className="text-destructive">*</span>
              </Label>
              <Input
                id="teacher-nip"
                placeholder="Contoh: 19850101XXXXXXXXXX"
                value={form.nip}
                onChange={(e) => handleChange("nip", e.target.value)}
                className={errors.nip ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.nip && (
                <p className="text-xs text-destructive font-medium">{errors.nip}</p>
              )}
            </div>

            {/* Username */}
            <div className="grid gap-1.5">
              <Label htmlFor="teacher-username" className="font-semibold text-foreground">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="teacher-username"
                placeholder="Contoh: ahmad.santoso"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className={errors.username ? "border-destructive focus-visible:ring-destructive/30" : ""}
              />
              {errors.username && (
                <p className="text-xs text-destructive font-medium">{errors.username}</p>
              )}
            </div>

            {/* Role / Peran */}
            <div className="grid gap-1.5">
              <Label htmlFor="teacher-role" className="font-semibold text-foreground">
                Peran / Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.role}
                onValueChange={(val) => handleChange("role", val)}
              >
                <SelectTrigger
                  id="teacher-role"
                  className={errors.role ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Pilih Peran..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLES.ADMIN}>{ROLE_LABELS[ROLES.ADMIN]}</SelectItem>
                  <SelectItem value={ROLES.GURU_WALI_KELAS}>{ROLE_LABELS[ROLES.GURU_WALI_KELAS]}</SelectItem>
                  <SelectItem value={ROLES.GURU_MAPEL}>{ROLE_LABELS[ROLES.GURU_MAPEL]}</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-destructive font-medium">{errors.role}</p>
              )}
            </div>

            {/* Kelas Wali (Hanya render/aktif jika role adalah GURU_WALI_KELAS) */}
            {form.role === ROLES.GURU_WALI_KELAS && (
              <div className="grid gap-1.5 animate-in fade-in duration-200">
                <Label htmlFor="teacher-class" className="font-semibold text-foreground">
                  Kelas Wali <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.assignedClass}
                  onValueChange={(val) => handleChange("assignedClass", val)}
                >
                  <SelectTrigger
                    id="teacher-class"
                    className={errors.assignedClass ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Pilih Kelas yang Tersedia..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Tidak ada kelas kosong tersedia
                      </SelectItem>
                    ) : (
                      availableClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.name}>
                          Kelas {cls.name} ({cls.grade})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.assignedClass && (
                  <p className="text-xs text-destructive font-medium">{errors.assignedClass}</p>
                )}
                <p className="text-[11px] text-muted-foreground font-medium">
                  Hanya menampilkan kelas yang belum memiliki guru wali kelas aktif.
                </p>
              </div>
            )}

            {/* Status */}
            <div className="grid gap-1.5">
              <Label htmlFor="teacher-status" className="font-semibold text-foreground">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.status}
                onValueChange={(val) => handleChange("status", val)}
              >
                <SelectTrigger
                  id="teacher-status"
                  className={errors.status ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Pilih Status..." />
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

export default TeacherFormDialog;
