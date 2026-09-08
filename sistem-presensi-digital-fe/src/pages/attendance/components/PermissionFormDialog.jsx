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
import { getSiswaByKelas } from "@/services/siswaService";

const EMPTY_FORM = {
  kelasId: "",
  studentId: "",
  date: "",
  time: "",
  reason: "",
  tanggalKembali: "",
  jamKembali: "",
};

/**
 * Dialog Tambah/Edit Izin Harian.

 * classes: [{id, nama_kelas}] dari GET /api/kelas
 * editingData: objek izin yang sedang diedit (null untuk mode tambah)
 */
function PermissionFormDialog({ open, onOpenChange, onSubmit, classes = [], editingData = null }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingData) {
        setForm({
          kelasId: editingData.kelasId 
            ? String(editingData.kelasId) 
            : (classes.find(c => c.nama_kelas === editingData.className)?.id 
                ? String(classes.find(c => c.nama_kelas === editingData.className).id) 
                : ""),
          studentId: editingData.studentId ? String(editingData.studentId) : "",
          date: editingData.date || "",
          time: editingData.time || "",
          reason: editingData.reason || "",
          tanggalKembali: editingData.tanggalKembali || "",
          jamKembali: editingData.jamKembali || "",
        });
      } else {
        const today = new Date().toISOString().split("T")[0];
        setForm({ ...EMPTY_FORM, date: today, time: "07:00" });
      }
      setErrors({});
    }
  }, [open, editingData]);

  // Load siswa tiap kali kelas dipilih
  useEffect(() => {
    if (!form.kelasId) {
      setStudents([]);
      return;
    }
    setLoadingStudents(true);
    getSiswaByKelas(form.kelasId)
      .then((res) => setStudents(res.data || res))
      .catch((err) => console.error(err))
      .finally(() => setLoadingStudents(false));
  }, [form.kelasId]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "kelasId") updated.studentId = ""; // reset siswa saat ganti kelas
      return updated;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.kelasId) newErrors.kelasId = "Kelas wajib dipilih.";
    if (!form.studentId) newErrors.studentId = "Siswa wajib dipilih.";
    if (!form.date) newErrors.date = "Tanggal wajib diisi.";
    if (!form.time) newErrors.time = "Waktu wajib diisi.";
    if (!form.reason.trim()) newErrors.reason = "Alasan wajib diisi.";
    if ((form.tanggalKembali && !form.jamKembali) || (!form.tanggalKembali && form.jamKembali)) {
      newErrors.tanggalKembali = "Tanggal Kembali dan Jam Kembali harus diisi bersamaan.";
    } else if (form.tanggalKembali && form.date && form.tanggalKembali < form.date) {
      newErrors.tanggalKembali = "Tanggal kembali tidak boleh lebih awal dari tanggal izin.";
    }
    return newErrors;
;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      siswa_id: Number(form.studentId),
      tanggal: form.date,
      waktu_keluar: form.time,
      alasan: form.reason,
      tanggal_kembali: form.tanggalKembali || null,
      jam_kembali: form.jamKembali || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            {editingData ? "Edit Izin Harian" : "Tambah Izin Harian"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Catatan: siswa harus sudah tercatat <strong>hadir</strong> pada tanggal tersebut sebelum bisa diinput izin.

          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-4 py-2">
            {/* Kelas */}
            <div className="grid gap-1.5">
              <Label htmlFor="perm-kelas" className="font-semibold text-foreground">
                Kelas <span className="text-destructive">*</span>
              </Label>
              <Select value={form.kelasId} onValueChange={(val) => handleChange("kelasId", val)}>
                <SelectTrigger id="perm-kelas" className={errors.kelasId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Pilih kelas..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={String(cls.id)}>
                      {cls.nama_kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kelasId && <p className="text-xs text-destructive font-medium">{errors.kelasId}</p>}
            </div>

            {/* Siswa */}
            <div className="grid gap-1.5">
              <Label htmlFor="perm-student" className="font-semibold text-foreground">
                Siswa <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.studentId}
                onValueChange={(val) => handleChange("studentId", val)}
                disabled={!form.kelasId || loadingStudents}
              >
                <SelectTrigger id="perm-student" className={errors.studentId ? "border-destructive" : ""}>
                  <SelectValue
                    placeholder={
                      !form.kelasId ? "Pilih kelas dahulu..." : loadingStudents ? "Memuat siswa..." : "Pilih siswa..."
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {students.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.nama} ({s.nis})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.studentId && <p className="text-xs text-destructive font-medium">{errors.studentId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                {errors.date && <p className="text-xs text-destructive font-medium">{errors.date}</p>}
              </div>

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
                {errors.time && <p className="text-xs text-destructive font-medium">{errors.time}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="perm-return-date" className="font-semibold text-foreground">
                  Tanggal Kembali
                </Label>
                <Input
                  id="perm-return-date"
                  type="date"
                  value={form.tanggalKembali}
                  onChange={(e) => handleChange("tanggalKembali", e.target.value)}
                  className={errors.tanggalKembali ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {errors.tanggalKembali && <p className="text-xs text-destructive font-medium">{errors.tanggalKembali}</p>}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="perm-return-time" className="font-semibold text-foreground">
                  Jam Kembali
                </Label>
                <Input
                  id="perm-return-time"
                  type="time"
                  value={form.jamKembali}
                  onChange={(e) => handleChange("jamKembali", e.target.value)}
                  className={errors.jamKembali ? "border-destructive focus-visible:ring-destructive/30" : ""}
                />
                {errors.jamKembali && <p className="text-xs text-destructive font-medium">{errors.jamKembali}</p>}
              </div>
            </div>

            {/* Alasan */}
            <div className="grid gap-1.5">
              <Label htmlFor="perm-reason" className="font-semibold text-foreground">
                Alasan <span className="text-destructive">*</span>
              </Label>
              <Select value={form.reason} onValueChange={(val) => handleChange("reason", val)}>
                <SelectTrigger id="perm-reason" className={errors.reason ? "border-destructive" : ""}>
                  <SelectValue placeholder="Pilih alasan..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sakit">Sakit</SelectItem>
                  <SelectItem value="Keperluan Keluarga">Keperluan Keluarga</SelectItem>
                  <SelectItem value="Lomba / Kompetisi">Lomba / Kompetisi</SelectItem>
                  <SelectItem value="Dispensasi">Dispensasi</SelectItem>
                  <SelectItem value="Pulang Cepat">Pulang Cepat</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {errors.reason && <p className="text-xs text-destructive font-medium">{errors.reason}</p>}
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
              {editingData ? "Perbarui Izin" : "Simpan Izin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PermissionFormDialog;