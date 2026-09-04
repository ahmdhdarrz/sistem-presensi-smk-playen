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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { ROLES, ROLE_LABELS } from "@/utils/roles";

const EMPTY_FORM = {
  nama: "",
  username: "",
  password: "",
  role: "",
  kelas_id: "",
};

// Mapping role FE (uppercase) -> format yang diterima backend Laravel (lowercase)
function mapRoleToBackend(role) {
  if (role === ROLES.ADMIN) return "admin";
  if (role === ROLES.GURU_WALI_KELAS) return "wali_kelas";
  if (role === ROLES.GURU_MAPEL) return "guru_mapel";
  return role;
}

/**
 * Dialog Form untuk Tambah & Edit Data User/Guru.
 *
 * Props:
 *  - open, onOpenChange   : kontrol buka/tutup dialog
 *  - mode                 : "create" | "edit"
 *  - teacher              : data guru yang sedang di-edit (null saat create)
 *  - classes              : [{id, nama_kelas}] dari GET /api/kelas
 *  - onSubmit(formData)   : async handler di parent — lempar error untuk ditangkap di sini
 *  - submitting           : boolean loading state dari parent
 */
function TeacherFormDialog({
  open,
  onOpenChange,
  mode = "create",
  teacher = null,
  classes = [],
  onSubmit,
  submitting = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Sync form saat dialog dibuka
  useEffect(() => {
    if (open) {
      if (mode === "edit" && teacher) {
        setForm({
          nama: teacher.nama || "",
          username: teacher.username || "",
          password: "", // password tidak di-prefill; kosong = tidak diubah
          role: teacher.role || "",
          kelas_id: teacher.kelas_id ? String(teacher.kelas_id) : "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [open, mode, teacher]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset kelas_id jika role diubah bukan ke wali_kelas
      if (field === "role" && value !== ROLES.GURU_WALI_KELAS) {
        updated.kelas_id = "";
      }
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.nama.trim()) newErrors.nama = "Nama wajib diisi.";
    if (!form.username.trim()) newErrors.username = "Username wajib diisi.";

    // Password wajib saat create; opsional saat edit
    if (mode === "create" && !form.password) {
      newErrors.password = "Password wajib diisi saat menambah user baru.";
    }

    if (!form.role) newErrors.role = "Peran / Role wajib dipilih.";

    // kelas_id wajib saat role = wali_kelas
    if (form.role === ROLES.GURU_WALI_KELAS && !form.kelas_id) {
      newErrors.kelas_id = "Kelas wajib dipilih untuk Wali Kelas.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Bangun payload sesuai API backend (role dikonversi ke format lowercase backend)
    const payload = {
      nama: form.nama.trim(),
      username: form.username.trim(),
      role: mapRoleToBackend(form.role),
      kelas_id:
        form.role === ROLES.GURU_WALI_KELAS
          ? Number(form.kelas_id)
          : null,
    };

    // Password hanya dikirim jika diisi
    if (form.password) {
      payload.password = form.password;
    }

    // onSubmit adalah async di parent; error ditangkap di sana
    await onSubmit(payload);
  };

  const isWaliKelas = form.role === ROLES.GURU_WALI_KELAS;

  const title = mode === "edit" ? "Edit Data Guru" : "Tambah Guru";
  const description =
    mode === "edit"
      ? "Perbarui informasi profil dan peran guru terpilih."
      : "Masukkan data guru baru ke dalam sistem.";
  const submitLabel = mode === "edit" ? "Simpan Perubahan" : "Simpan Guru";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2 text-left">
            {/* Nama */}
            <div className="grid gap-1.5">
              <Label htmlFor="teacher-nama" className="font-semibold text-foreground">
                Nama Lengkap <span className="text-destructive">*</span>
              </Label>
              <Input
                id="teacher-nama"
                placeholder="Contoh: Ahmad Santoso, S.Pd."
                value={form.nama}
                onChange={(e) => handleChange("nama", e.target.value)}
                className={errors.nama ? "border-destructive focus-visible:ring-destructive/30" : ""}
                disabled={submitting}
              />
              {errors.nama && (
                <p className="text-xs text-destructive font-medium">{errors.nama}</p>
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
                disabled={submitting}
              />
              {errors.username && (
                <p className="text-xs text-destructive font-medium">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="grid gap-1.5">
              <Label htmlFor="teacher-password" className="font-semibold text-foreground">
                Password{" "}
                {mode === "create" ? (
                  <span className="text-destructive">*</span>
                ) : (
                  <span className="text-muted-foreground font-normal text-xs">
                    (kosongkan jika tidak ingin mengubah)
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="teacher-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    mode === "edit" ? "Kosongkan jika tidak diubah" : "Masukkan password"
                  }
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  disabled={submitting}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-medium">{errors.password}</p>
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
                disabled={submitting}
              >
                <SelectTrigger
                  id="teacher-role"
                  className={errors.role ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Pilih Peran..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLES.ADMIN}>{ROLE_LABELS[ROLES.ADMIN]}</SelectItem>
                  <SelectItem value={ROLES.GURU_WALI_KELAS}>
                    {ROLE_LABELS[ROLES.GURU_WALI_KELAS]}
                  </SelectItem>
                  <SelectItem value={ROLES.GURU_MAPEL}>
                    {ROLE_LABELS[ROLES.GURU_MAPEL]}
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-destructive font-medium">{errors.role}</p>
              )}
            </div>

            {/* Kelas Wali — hanya muncul jika role = GURU_WALI_KELAS */}
            {isWaliKelas && (
              <div className="grid gap-1.5 animate-in fade-in duration-200">
                <Label htmlFor="teacher-kelas" className="font-semibold text-foreground">
                  Kelas Wali <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.kelas_id}
                  onValueChange={(val) => handleChange("kelas_id", val)}
                  disabled={submitting}
                >
                  <SelectTrigger
                    id="teacher-kelas"
                    className={errors.kelas_id ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Pilih Kelas..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Tidak ada kelas tersedia
                      </SelectItem>
                    ) : (
                      classes.map((cls) => (
                        <SelectItem key={cls.id} value={String(cls.id)}>
                          {cls.nama_kelas}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.kelas_id && (
                  <p className="text-xs text-destructive font-medium">{errors.kelas_id}</p>
                )}
                <p className="text-[11px] text-muted-foreground font-medium">
                  Kelas diambil dari data master kelas.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer font-semibold"
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="cursor-pointer font-semibold bg-primary text-primary-foreground hover:bg-primary/90 min-w-[130px]"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TeacherFormDialog;