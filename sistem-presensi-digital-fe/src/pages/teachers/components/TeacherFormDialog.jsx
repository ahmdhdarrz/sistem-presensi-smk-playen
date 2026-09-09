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
import { Loader2, Eye, EyeOff, UserPlus, Pencil, User, AtSign, Key, Shield, BookOpen } from "lucide-react";
import { ROLES, ROLE_LABELS } from "@/utils/roles";

const EMPTY_FORM = {
  nama: "",
  username: "",
  password: "",
  role: "",
  kelas_id: "",
};

function mapRoleToBackend(role) {
  if (role === ROLES.ADMIN) return "admin";
  if (role === ROLES.GURU_WALI_KELAS) return "wali_kelas";
  if (role === ROLES.GURU_MAPEL) return "guru_mapel";
  return role;
}

/**
 * Dialog Form untuk Tambah & Edit Data User/Guru.
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

  useEffect(() => {
    if (open) {
      if (mode === "edit" && teacher) {
        setForm({
          nama: teacher.nama || "",
          username: teacher.username || "",
          password: "",
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

    if (mode === "create" && !form.password) {
      newErrors.password = "Password wajib diisi saat menambah user baru.";
    }

    if (!form.role) newErrors.role = "Peran / Role wajib dipilih.";

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

    const payload = {
      nama: form.nama.trim(),
      username: form.username.trim(),
      role: mapRoleToBackend(form.role),
      kelas_id:
        form.role === ROLES.GURU_WALI_KELAS
          ? Number(form.kelas_id)
          : null,
    };

    if (form.password) {
      payload.password = form.password;
    }

    await onSubmit(payload);
  };

  const isWaliKelas = form.role === ROLES.GURU_WALI_KELAS;

  const title = mode === "edit" ? "Edit Data Guru" : "Tambah Guru Baru";
  const description =
    mode === "edit"
      ? "Perbarui informasi profil dan peran guru yang sudah terdaftar."
      : "Masukkan informasi lengkap untuk menambahkan akun guru baru ke sistem.";
  const submitLabel = mode === "edit" ? "Simpan Perubahan" : "Simpan Guru";

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
          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <Label htmlFor="teacher-nama" className="text-xs font-bold text-foreground flex items-center gap-1">
              <User className="size-3.5 text-muted-foreground" />
              <span>Nama Lengkap</span>
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="teacher-nama"
              placeholder="Contoh: Ahmad Santoso, S.Pd."
              value={form.nama}
              onChange={(e) => handleChange("nama", e.target.value)}
              className={errors.nama ? "border-destructive focus-visible:ring-destructive/30 h-9 text-xs font-semibold" : "h-9 text-xs font-semibold"}
              disabled={submitting}
            />
            {errors.nama && <p className="text-xs text-destructive font-medium">{errors.nama}</p>}
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="teacher-username" className="text-xs font-bold text-foreground flex items-center gap-1">
                <AtSign className="size-3.5 text-muted-foreground" />
                <span>Username</span>
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="teacher-username"
                placeholder="Contoh: ahmad.santoso"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className={errors.username ? "border-destructive focus-visible:ring-destructive/30 h-9 text-xs font-semibold font-mono" : "h-9 text-xs font-semibold font-mono"}
                disabled={submitting}
              />
              {errors.username && <p className="text-xs text-destructive font-medium">{errors.username}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="teacher-password" className="text-xs font-bold text-foreground flex items-center gap-1">
                <Key className="size-3.5 text-muted-foreground" />
                <span>Password</span>
                {mode === "create" && <span className="text-destructive">*</span>}
              </Label>
              <div className="relative">
                <Input
                  id="teacher-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "edit" ? "Kosongkan jika tidak diubah" : "Password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`pr-9 h-9 text-xs font-semibold ${errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  disabled={submitting}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password}</p>}
            </div>
          </div>

          {/* Role / Peran & Kelas Wali */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Role */}
            <div className="space-y-1.5">
              <Label htmlFor="teacher-role" className="text-xs font-bold text-foreground flex items-center gap-1">
                <Shield className="size-3.5 text-muted-foreground" />
                <span>Role / Peran</span>
                <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.role}
                onValueChange={(val) => handleChange("role", val)}
                disabled={submitting}
              >
                <SelectTrigger
                  id="teacher-role"
                  className={errors.role ? "border-destructive h-9 text-xs font-semibold" : "h-9 text-xs font-semibold"}
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
              {errors.role && <p className="text-xs text-destructive font-medium">{errors.role}</p>}
            </div>

            {/* Kelas Wali (hanya jika Wali Kelas) */}
            {isWaliKelas ? (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <Label htmlFor="teacher-kelas" className="text-xs font-bold text-foreground flex items-center gap-1">
                  <BookOpen className="size-3.5 text-muted-foreground" />
                  <span>Kelas Wali</span>
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.kelas_id}
                  onValueChange={(val) => handleChange("kelas_id", val)}
                  disabled={submitting}
                >
                  <SelectTrigger
                    id="teacher-kelas"
                    className={errors.kelas_id ? "border-destructive h-9 text-xs font-semibold" : "h-9 text-xs font-semibold"}
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
                          Kelas {cls.nama_kelas}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.kelas_id && <p className="text-xs text-destructive font-medium">{errors.kelas_id}</p>}
              </div>
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-border/50 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer font-semibold h-9 text-xs"
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="cursor-pointer font-semibold bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-xs min-w-[120px]"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  <span>Menyimpan...</span>
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