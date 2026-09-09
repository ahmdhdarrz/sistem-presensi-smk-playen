import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileSpreadsheet,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  FileText,
  Trash2,
  Info,
} from "lucide-react";
import { importUsers } from "@/services/userService";

const REQUIRED_HEADERS = ["nama", "username", "role", "kelas_id"];

function TeacherImportDialog({ open, onOpenChange, classes = [], onSuccess, showToast }) {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [headerError, setHeaderError] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendNotice, setBackendNotice] = useState("");

  const resetState = () => {
    setSelectedFile(null);
    setParsing(false);
    setHeaderError("");
    setParsedRows([]);
    setIsSubmitting(false);
    setBackendNotice("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  };

  const processExcelFile = async (file) => {
    if (!file) return;

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      setHeaderError("Format file tidak didukung. Harap unggah file .xlsx, .xls, atau .csv");
      return;
    }

    setSelectedFile(file);
    setParsing(true);
    setHeaderError("");
    setBackendNotice("");
    setParsedRows([]);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

      if (rawRows.length < 2) {
        setHeaderError("File Excel kosong atau tidak memiliki data baris.");
        setParsing(false);
        return;
      }

      let headerRowIndex = 0;
      while (
        headerRowIndex < rawRows.length &&
        (!Array.isArray(rawRows[headerRowIndex]) || rawRows[headerRowIndex].every((c) => !c))
      ) {
        headerRowIndex++;
      }

      if (headerRowIndex >= rawRows.length) {
        setHeaderError("Format header Excel tidak ditemukan.");
        setParsing(false);
        return;
      }

      const rawHeaders = rawRows[headerRowIndex].map((h) => String(h).trim().toLowerCase());

      const missingHeaders = REQUIRED_HEADERS.filter((req) => !rawHeaders.includes(req));
      if (missingHeaders.length > 0) {
        setHeaderError(
          `Header Excel tidak sesuai. Kolom wajib yang hilang: ${missingHeaders.join(", ")}. Format header wajib: nama, username, role, kelas_id`
        );
        setParsing(false);
        return;
      }

      const colMap = {
        nama: rawHeaders.indexOf("nama"),
        username: rawHeaders.indexOf("username"),
        role: rawHeaders.indexOf("role"),
        kelas_id: rawHeaders.indexOf("kelas_id"),
        password: rawHeaders.indexOf("password"),
      };

      const validClassIds = new Set(classes.map((c) => String(c.id)));
      const validRoles = ["admin", "wali_kelas", "guru_mapel", "guru_wali_kelas"];

      const results = [];
      for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        if (!row || row.every((c) => String(c).trim() === "")) continue;

        const excelRowNum = i + 1;
        const nama = String(row[colMap.nama] || "").trim();
        const username = String(row[colMap.username] || "").trim();
        const rawRole = String(row[colMap.role] || "").trim().toLowerCase();
        const rawKelasId = String(row[colMap.kelas_id] || "").trim();
        const password = colMap.password !== -1 ? String(row[colMap.password] || "").trim() : "";

        const rowErrors = [];

        if (!nama) rowErrors.push("Nama guru wajib diisi.");
        if (!username) rowErrors.push("Username wajib diisi.");

        let normalizedRole = rawRole;
        if (rawRole === "guru_wali_kelas") normalizedRole = "wali_kelas";

        if (!rawRole) {
          rowErrors.push("Role wajib diisi.");
        } else if (!validRoles.includes(rawRole)) {
          rowErrors.push(`Role '${rawRole}' tidak valid (hanya: admin, wali_kelas, atau guru_mapel).`);
        }

        let kelasIdNumber = null;
        if (normalizedRole === "wali_kelas") {
          if (!rawKelasId) {
            rowErrors.push("kelas_id wajib diisi untuk role wali_kelas.");
          } else if (isNaN(Number(rawKelasId))) {
            rowErrors.push(`kelas_id '${rawKelasId}' harus berupa angka ID kelas.`);
          } else if (classes.length > 0 && !validClassIds.has(rawKelasId)) {
            rowErrors.push(`kelas_id '${rawKelasId}' tidak ditemukan di daftar kelas database.`);
          } else {
            kelasIdNumber = Number(rawKelasId);
          }
        } else {
          // Untuk admin dan guru_mapel, jika kelas_id diisi angka valid tetap di-parse atau dikosongkan
          if (rawKelasId && !isNaN(Number(rawKelasId))) {
            kelasIdNumber = Number(rawKelasId);
          }
        }

        results.push({
          rowNum: excelRowNum,
          data: {
            nama,
            username,
            role: normalizedRole,
            kelas_id: kelasIdNumber,
            password: password || "12345678",
          },
          rawKelasId,
          isValid: rowErrors.length === 0,
          errors: rowErrors,
        });
      }

      if (results.length === 0) {
        setHeaderError("Tidak ada baris data yang ditemukan di file Excel.");
      }

      setParsedRows(results);
    } catch (err) {
      console.error(err);
      setHeaderError("Gagal membaca file Excel. Pastikan file tidak rusak.");
    } finally {
      setParsing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processExcelFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processExcelFile(file);
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const errorRows = parsedRows.filter((r) => !r.isValid);

  const handleConfirmImport = async () => {
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    setBackendNotice("");

    const payload = validRows.map((r) => r.data);

    try {
      await importUsers({ users: payload });
      showToast?.(`${validRows.length} data guru berhasil diimport.`, "success");
      onSuccess?.();
      handleOpenChange(false);
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 404 || status === 405) {
        setBackendNotice(
          "Catatan: API backend Laravel (POST /api/users/import) belum diimplementasikan di server. Menunggu ketersediaan endpoint backend."
        );
        showToast?.("Endpoint import di backend Laravel belum tersedia.", "error");
      } else {
        showToast?.(message || "Gagal mengimport data guru ke server.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden text-left border-border">
        {/* Dialog Header */}
        <DialogHeader className="p-6 pb-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">Import Data Guru Excel</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Unggah file Excel (.xlsx / .xls / .csv) dengan format header: nama, username, role, kelas_id.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Dropzone */}
          {!selectedFile ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
                <Upload className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Pilih file Excel atau drag & drop ke sini</p>
                <p className="text-xs text-muted-foreground">Format yang didukung: .xlsx, .xls, .csv (Maksimal 5MB)</p>
              </div>
              <Button type="button" size="sm" variant="outline" className="mt-2 text-xs font-bold pointer-events-none">
                Pilih File Excel
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/40">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="size-5 text-emerald-600 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={resetState}
                disabled={isSubmitting || parsing}
                className="size-8 text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                title="Ganti file"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}

          {/* Parsing Spinner */}
          {parsing && (
            <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground text-xs font-medium">
              <LoaderCircle className="size-4 animate-spin" />
              <span>Memproses & memvalidasi file Excel...</span>
            </div>
          )}

          {/* Header Error Alert */}
          {headerError && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Gagal Mengisi Data Excel</p>
                <p className="mt-0.5">{headerError}</p>
              </div>
            </div>
          )}

          {/* Backend Notice */}
          {backendNotice && (
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 text-xs font-medium flex items-start gap-2.5">
              <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">TODO / Status Endpoint Backend</p>
                <p className="mt-0.5">{backendNotice}</p>
              </div>
            </div>
          )}

          {/* Summary & Preview */}
          {parsedRows.length > 0 && !parsing && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/30 text-left">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Baris</span>
                  <p className="text-lg font-extrabold text-foreground mt-0.5">{parsedRows.length}</p>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/30 text-left">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Valid</span>
                  <p className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300 mt-0.5">{validRows.length}</p>
                </div>
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/70 dark:bg-rose-950/30 text-left">
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">Error</span>
                  <p className="text-lg font-extrabold text-rose-800 dark:text-rose-300 mt-0.5">{errorRows.length}</p>
                </div>
              </div>

              {errorRows.length > 0 && (
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 space-y-2 text-left">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                    <XCircle className="size-4 text-rose-600" />
                    <span>Daftar Baris Error ({errorRows.length} baris):</span>
                  </div>
                  <ul className="space-y-1 text-xs text-rose-700 dark:text-rose-400 pl-6 list-disc max-h-32 overflow-y-auto">
                    {errorRows.map((r) => (
                      <li key={r.rowNum}>
                        <span className="font-bold">Baris {r.rowNum}:</span> {r.errors.join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <p className="text-xs font-bold text-foreground">Preview Data Excel (Menampilkan hingga 10 baris):</p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-foreground font-bold border-b border-border">
                      <tr>
                        <th className="py-2 px-3 w-12 text-center">Baris</th>
                        <th className="py-2 px-3">Nama</th>
                        <th className="py-2 px-3">Username</th>
                        <th className="py-2 px-3">Role</th>
                        <th className="py-2 px-3 text-center">Kelas ID</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedRows.slice(0, 10).map((r) => (
                        <tr key={r.rowNum} className={r.isValid ? "hover:bg-muted/20" : "bg-rose-50/30 dark:bg-rose-950/20"}>
                          <td className="py-2 px-3 text-center font-mono text-muted-foreground">{r.rowNum}</td>
                          <td className="py-2 px-3 font-semibold text-foreground">{r.data.nama || "-"}</td>
                          <td className="py-2 px-3 font-mono text-muted-foreground">{r.data.username || "-"}</td>
                          <td className="py-2 px-3 capitalize font-medium">{r.data.role || "-"}</td>
                          <td className="py-2 px-3 text-center font-mono">{r.data.kelas_id ?? r.rawKelasId ?? "-"}</td>
                          <td className="py-2 px-3 text-center">
                            {r.isValid ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold px-2 py-0">
                                Valid
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-[10px] font-bold px-2 py-0">
                                Error
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-border/50 gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
            className="cursor-pointer font-semibold h-9 text-xs"
          >
            Batal
          </Button>
          <Button
            type="button"
            disabled={validRows.length === 0 || isSubmitting || parsing}
            onClick={handleConfirmImport}
            className="cursor-pointer font-bold bg-emerald-600 text-white hover:bg-emerald-700 h-9 text-xs gap-2"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-3.5 animate-spin" />
                <span>Mengimport Data...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                <span>Import ({validRows.length} Data Valid)</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TeacherImportDialog;
