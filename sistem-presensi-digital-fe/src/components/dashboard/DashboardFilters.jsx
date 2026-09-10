import React, { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getKelas } from "@/services/dashboardService";
import { isAdmin, isWaliKelas, isGuruMapel, isMonitoring } from "@/utils/roles";
import { Filter } from "lucide-react";

export function DashboardFilters({ role, onFilterChange }) {
  const userIsAdmin = isAdmin(role);
  const userIsWali = isWaliKelas(role);
  const userIsMapel = isGuruMapel(role);
  const userIsMon = isMonitoring(role);

  const [kelasList, setKelasList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("Hari Ini");
  const [selectedSemester, setSelectedSemester] = useState("Semester 1");

  useEffect(() => {
    if (userIsAdmin) {
      getKelas()
        .then((res) => {
          setKelasList(Array.isArray(res) ? res : (res?.data || []));
        })
        .catch((err) => console.error("Gagal memuat daftar kelas", err));
    }
  }, [userIsAdmin]);

  useEffect(() => {
    onFilterChange({
      kelas: selectedClass === "all" ? undefined : selectedClass,
      periode: selectedPeriod,
      ...(selectedPeriod === "Semester" ? { semester: selectedSemester } : {})
    });
  }, [selectedClass, selectedPeriod, selectedSemester, onFilterChange]);

  const triggerClass = "h-9 text-xs bg-background border-border hover:bg-muted/50 transition-colors flex-1 sm:flex-none w-full sm:w-[150px] min-w-[130px]";

  if (userIsWali || userIsMapel || userIsMon) {
    return (
      <div className="flex items-center gap-2 flex-wrap w-full">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0 py-1">
          <Filter className="size-3.5" />
          <span>Filter</span>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Pilih Periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Hari Ini">Hari Ini</SelectItem>
            <SelectItem value="Mingguan">Mingguan</SelectItem>
            <SelectItem value="Bulanan">Bulanan</SelectItem>
            <SelectItem value="Semester">Semester</SelectItem>
          </SelectContent>
        </Select>
        {selectedPeriod === "Semester" && (
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder="Pilih Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semester 1">Semester 1</SelectItem>
              <SelectItem value="Semester 2">Semester 2</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
    );
  }

  // ADMIN view
  return (
    <div className="flex items-center gap-2 flex-wrap w-full">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0 py-1">
        <Filter className="size-3.5" />
        <span>Filter</span>
      </div>
      <Select value={selectedClass} onValueChange={setSelectedClass}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder="Pilih Kelas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Kelas</SelectItem>
          {kelasList.map((k) => (
            <SelectItem key={k.id || k.nama_kelas} value={k.id ? String(k.id) : k.nama_kelas}>
              {k.nama_kelas}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder="Pilih Periode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Hari Ini">Hari Ini</SelectItem>
          <SelectItem value="Mingguan">Mingguan</SelectItem>
          <SelectItem value="Bulanan">Bulanan</SelectItem>
          <SelectItem value="Semester">Semester</SelectItem>
        </SelectContent>
      </Select>
      {selectedPeriod === "Semester" && (
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Pilih Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Semester 1">Semester 1</SelectItem>
            <SelectItem value="Semester 2">Semester 2</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
