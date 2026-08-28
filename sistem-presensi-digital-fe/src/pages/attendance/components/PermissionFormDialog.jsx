import React, { useState, useEffect, useMemo } from "react";
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
import { masterStudents } from "@/data/dummyStudents";

const EMPTY_FORM = {
  studentId: "",
  date: "",
  time: "",
  reason: "",
  description: "",
  status: "Izin",
};

/**
 * Dialog untuk Tambah dan Edit data izin harian.
 */
function PermissionFormDialog({ open, onOpenChange, mode = "create", permission = null, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (mode === "edit" && permission) {
        setForm({
          studentId: permission.studentId ? permission.studentId.toString() : "",
          date: permission.date || "",
          time: permission.time || "",
          reason: permission.reason || "",
          description: permission.description || "",
          status: permission.status || "Izin",
        });
      } else {
        const today = new Date().toISOString().split("T")[0];
        setForm({ ...EMPTY_FORM, date: today, time: "07:00" });
      }
      setErrors({});
    }
  }, [open, mode, permission]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.studentId) newErrors.studentId = "Siswa wajib dipilih.";
    if (!form.date) newErrors.date = "Tanggal wajib diisi.";
    if (!form.time) newErrors.time = "Waktu wajib diisi.";
    if (!form.reason.trim()) newErrors.reason = "Alasan wajib diisi.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const selectedStudent = masterStudents.find(s => s.id.toString() === form.studentId);
    if (!selectedStudent) return;

    onSubmit({
      ...form,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      nis: selectedStudent.nis,
      className: selectedStudent.className,
    });
  };

  const title = mode === "edit" ? "Edit Izin Harian" : "Tambah Izin Harian";
  const description =
    mode === "edit"
      ? "Perbarui data izin harian siswa."
      : "Tambahkan data izin harian siswa baru.";
  const submitLabel = mode === "edit" ? "Simpan Perubahan" : "Simpan Izin";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2">
            {/* Siswa */}
            <div className="grid gap-1.5">
              <Label htmlFor="perm-student" className="font-semibold text-foreground">
                Siswa <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.studentId}
                onValueChange={(val) => handleChange("studentId", val)}
              >
                <SelectTrigger
                  id="perm-student"
                  className={errors.studentId ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Pilih siswa..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {masterStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name} ({student.nis}) - {student.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.studentId && (
                <p className="text-xs text-destructive font-medium">{errors.studentId}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tanggal */}
              <div className="grid gap-1.5">
                <Label htmlFor="perm-date" className="font-semibold text-foreground">
                  Tanggal <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="perm-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className={errors.date ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {errors.date && (
                  <p className="text-xs text-destructive font-medium">{errors.date}</p>
                )}
              </div>

              {/* Waktu */}
              <div className="grid gap-1.5">
                <Label htmlFor="perm-time" className="font-semibold text-foreground">
                  Waktu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="perm-time"
                  type="time"
                  value={form.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                  className={errors.time ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {errors.time && (
                  <p className="text-xs text-destructive font-medium">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Alasan */}
            <div className="grid gap-1.5">
              <Label htmlFor="perm-reason" className="font-semibold text-foreground">
                Alasan <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.reason}
                onValueChange={(val) => handleChange("reason", val)}
              >
                <SelectTrigger
                  id="perm-reason"
                  className={errors.reason ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Pilih alasan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sakit">Sakit</SelectItem>
                  <SelectItem value="Keperluan Keluarga">Keperluan Keluarga</SelectItem>
                  <SelectItem value="Lomba">Lomba / Kompetisi</SelectItem>
                  <SelectItem value="Dispensasi">Dispensasi</SelectItem>
                  <SelectItem value="Pulang Cepat">Pulang Cepat</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {errors.reason && (
                <p className="text-xs text-destructive font-medium">{errors.reason}</p>
              )}
            </div>

            {/* Keterangan */}
            <div className="grid gap-1.5">
              <Label htmlFor="perm-desc" className="font-semibold text-foreground">
                Keterangan
              </Label>
              <Input
                id="perm-desc"
                placeholder="Detail keterangan (opsional)"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="grid gap-1.5">
              <Label htmlFor="perm-status" className="font-semibold text-foreground">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.status}
                onValueChange={(val) => handleChange("status", val)}
              >
                <SelectTrigger
                  id="perm-status"
                >
                  <SelectValue placeholder="Pilih status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Izin">Izin (Berlangsung)</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
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

export default PermissionFormDialog;
