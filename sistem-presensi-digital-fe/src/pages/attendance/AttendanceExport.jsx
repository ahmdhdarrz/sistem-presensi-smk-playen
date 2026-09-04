import React, { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { getKelas } from "@/services/siswaService";
import { exportAbsensiExcel } from "@/services/attendanceService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileSpreadsheet, CheckCircle2, LoaderCircle, AlertTriangle } from "lucide-react";
import { isWaliKelas } from "@/utils/roles";
import { cn } from "@/lib/utils";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function AttendanceExport() {
  const { user } = useAuth();
  const userIsWali = isWaliKelas(user?.role);

  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState(userIsWali ? "" : "ALL");

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [activeShortcut, setActiveShortcut] = useState("today");

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    getKelas()
      .then((res) => {
        const list = res.data || res;
        setClasses(list);
        if (userIsWali && user?.classId) {
          setSelectedClassId(String(user.classId));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingClasses(false));
  }, [userIsWali, user?.classId]);

  const currentClass = classes.find((c) => String(c.id) === String(selectedClassId));

  // ─── Tombol pintasan rentang tanggal ────────────────────────────────────────
  const applyShortcut = (key) => {
    const today = new Date();
    let from = new Date();
    let to = new Date();

    if (key === "today") {
      from = today;
      to = today;
    } else if (key === "week") {
      const day = today.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      from = new Date(today);
      from.setDate(today.getDate() + diffToMonday);
      to = today;
    } else if (key === "month") {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = today;
    } else if (key === "6months") {
      from = new Date(today.getFullYear(), today.getMonth() - 5, 1);
      to = today;
    }

    setStartDate(formatDate(from));
    setEndDate(formatDate(to));
    setActiveShortcut(key);
  };

  const handleDateChange = (setter) => (e) => {
    setter(e.target.value);
    setActiveShortcut(""); // lepas highlight shortcut kalau user edit manual
  };

  const handleExport = async (e) => {
    e.preventDefault();

    if (new Date(endDate) < new Date(startDate)) {
      setErrorMsg("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
      return;
    }

    setIsExporting(true);
    setExportSuccess(false);
    setErrorMsg("");

    try {
      const params = { dari: startDate, sampai: endDate };
      if (selectedClassId && selectedClassId !== "ALL") {
        params.kelas_id = selectedClassId;
      }

      const blob = await exportAbsensiExcel(params);

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      const namaKelas =
        selectedClassId === "ALL" ? "semua-kelas" : currentClass?.nama_kelas || "kelas";
      link.setAttribute("download", `rekap-absensi-${namaKelas}-${startDate}-sd-${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      setErrorMsg("Gagal mengunduh file Excel. Pastikan data untuk periode ini tersedia.");
    }
  };

  if (loadingClasses) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" />
        <span>Memuat data kelas...</span>
      </div>
    );
  }

  const shortcuts = [
    { key: "today", label: "Hari Ini" },
    { key: "week", label: "Minggu Ini" },
    { key: "month", label: "Bulan Ini" },
    { key: "6months", label: "6 Bulan Terakhir" },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={userIsWali ? "Export Rekap Kelas" : "Export Data Presensi"}
        description={
          userIsWali
            ? `Unduh laporan rekapitulasi presensi kelas ${currentClass?.nama_kelas || "-"} dalam rentang tanggal bebas.`
            : "Unduh laporan rekapitulasi presensi per kelas atau seluruh sekolah dalam rentang tanggal bebas."
        }
      />

      {exportSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 shadow-md animate-in slide-in-from-top-2 duration-300 text-left">
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">File Rekap Berhasil Diunduh!</p>
            <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-400 font-medium">
              Laporan presensi periode {startDate} s/d {endDate} telah diunduh.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex items-start gap-3 shadow-md text-left">
          <AlertTriangle className="size-5 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{errorMsg}</p>
        </div>
      )}

      <Card className="max-w-2xl shadow-xs border-border text-left">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-emerald-600" />
            <span>Parameter Export Excel</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleExport} className="space-y-5">
            {/* Pilih Kelas */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Pilih Kelas</Label>
              {userIsWali ? (
                <div className="p-3 rounded-lg border border-border bg-slate-100/70 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-foreground">Kelas {currentClass?.nama_kelas || "-"}</span>
                    <p className="text-[11px] text-muted-foreground">Terkunci khusus kelas yang Anda ampu sebagai Wali Kelas.</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    Guru Wali Kelas
                  </span>
                </div>
              ) : (
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="ALL">Seluruh Kelas (Semua Tingkat)</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>Kelas {c.nama_kelas}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Pintasan Cepat */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Pintasan Cepat</Label>
              <div className="flex flex-wrap gap-2">
                {shortcuts.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyShortcut(key)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer",
                      activeShortcut === key
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card text-muted-foreground border-border hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rentang Tanggal Bebas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="start-date" className="text-xs font-semibold text-foreground">
                  Tanggal Mulai
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={handleDateChange(setStartDate)}
                  className="font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="end-date" className="text-xs font-semibold text-foreground">
                  Tanggal Selesai
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={handleDateChange(setEndDate)}
                  className="font-medium"
                />
              </div>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                disabled={isExporting}
                className="w-full font-bold h-11 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm cursor-pointer gap-2"
              >
                {isExporting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    <span>Menyiapkan File Excel...</span>
                  </>
                ) : (
                  <>
                    <Download className="size-4" />
                    <span>Download Rekap Excel (.xlsx)</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AttendanceExport;