import React, { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getKelas } from "@/services/dashboardService";
import { isAdmin, isWaliKelas, isGuruMapel } from "@/utils/roles";

export function DashboardFilters({ role, onFilterChange }) {
  const userIsAdmin = isAdmin(role);
  const userIsWali = isWaliKelas(role);
  const userIsMapel = isGuruMapel(role);

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

  // WALI_KELAS tidak menampilkan dropdown kelas
  // GURU_MAPEL view-only, juga tidak menampilkan dropdown kelas
  if (userIsWali || userIsMapel) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
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
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
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
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Select value={selectedClass} onValueChange={setSelectedClass}>
        <SelectTrigger className="w-full sm:w-[180px] bg-background">
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
        <SelectTrigger className="w-full sm:w-[180px] bg-background">
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
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
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
