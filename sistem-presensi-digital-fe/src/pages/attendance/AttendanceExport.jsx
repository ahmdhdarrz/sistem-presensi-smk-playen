import React, { useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { masterClasses } from "@/data/dummyStudents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileSpreadsheet, CheckCircle2, LoaderCircle, ShieldAlert } from "lucide-react";
import { isWaliKelas, isAdmin } from "@/utils/roles";

function AttendanceExport() {
  const { user } = useAuth();
  const userIsWali = isWaliKelas(user?.role);
  const userIsAdmin = isAdmin(user?.role);

  // If Wali Kelas, lock class selector to assignedClass
  const defaultClass = userIsWali && user?.assignedClass ? user.assignedClass : "ALL";

  const [selectedClass, setSelectedClass] = useState(defaultClass);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = (e) => {
    e.preventDefault();
    setIsExporting(true);
    setExportSuccess(false);

    // Simulate Excel file generation & download
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={userIsWali ? "Export Rekap Kelas" : "Export Data Presensi"}
        description={
          userIsWali
            ? `Unduh laporan rekapitulasi presensi kelas ${user?.assignedClass || "diampu"} dalam format Excel.`
            : "Unduh laporan rekapitulasi presensi sekolah dalam format Excel / Spreadsheet."
        }
      />

      {exportSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 shadow-md animate-in slide-in-from-top-2 duration-300 text-left">
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">File Rekap Berhasil Di-export!</p>
            <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-400 font-medium">
              Laporan presensi periode {startDate} s/d {endDate} telah diunduh (Simulasi Excel Export).
            </p>
          </div>
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
            {/* Filter Kelas */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Pilih Scope Kelas
              </Label>
              {userIsWali ? (
                <div className="p-3 rounded-lg border border-border bg-slate-100/70 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-foreground">Kelas {user?.assignedClass || "X OA"}</span>
                    <p className="text-[11px] text-muted-foreground">Terkuci khusus kelas yang Anda ampu sebagai Wali Kelas.</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    Guru Wali Kelas
                  </span>
                </div>
              ) : (
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="ALL">Seluruh Kelas (Semua Tingkat)</option>
                  {masterClasses.map((c) => (
                    <option key={c.id} value={c.name}>
                      Kelas {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="start-date" className="text-xs font-semibold text-foreground">
                  Tanggal Mulai
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
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
                  onChange={(e) => setEndDate(e.target.value)}
                  className="font-medium"
                />
              </div>
            </div>

            {/* Submit Export Button */}
            <div className="pt-3">
              <Button
                type="submit"
                disabled={isExporting}
                className="w-full font-bold h-11 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm cursor-pointer gap-2"
              >
                {isExporting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    <span>Menaikkan File Excel...</span>
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
