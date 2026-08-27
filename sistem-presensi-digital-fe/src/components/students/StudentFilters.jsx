import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { masterClasses } from "@/data/dummyStudents";

/**
 * Komponen area filter dan pencarian untuk halaman Data Siswa.
 * Menampilkan search input, filter kelas, dan informasi jumlah data.
 */
function StudentFilters({ search, onSearchChange, selectedClass, onClassChange, filteredCount, totalCount }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          id="student-search"
          type="search"
          placeholder="Cari nama, NIS, atau NISN..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      {/* Filter Kelas */}
      <div className="w-full sm:w-44">
        <Select value={selectedClass} onValueChange={onClassChange}>
          <SelectTrigger id="student-class-filter" className="bg-card w-full">
            <Filter className="size-4 text-muted-foreground mr-1 shrink-0" />
            <SelectValue placeholder="Semua Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {masterClasses.map((cls) => (
              <SelectItem key={cls.id} value={cls.name}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Info Jumlah Data */}
      <p className="text-sm text-muted-foreground whitespace-nowrap shrink-0 font-medium">
        Menampilkan{" "}
        <span className="font-bold text-foreground">{filteredCount}</span>{" "}
        dari{" "}
        <span className="font-bold text-foreground">{totalCount}</span>{" "}
        siswa
      </p>
    </div>
  );
}

export default StudentFilters;
