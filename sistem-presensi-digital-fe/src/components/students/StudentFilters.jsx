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

/**
 * classes: [{ id, nama_kelas }] — dari API GET /api/kelas
 */
function StudentFilters({
  search,
  onSearchChange,
  selectedClass,
  onClassChange,
  filteredCount,
  totalCount,
  classes = [],
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="relative flex-1 w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          id="student-search"
          type="search"
          placeholder="Cari nama atau NIS..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      <div className="w-full sm:w-44">
        <Select value={selectedClass} onValueChange={onClassChange}>
          <SelectTrigger id="student-class-filter" className="bg-card w-full">
            <Filter className="size-4 text-muted-foreground mr-1 shrink-0" />
            <SelectValue placeholder="Semua Kelas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.nama_kelas}>
                {cls.nama_kelas}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground whitespace-nowrap shrink-0 font-medium">
        Menampilkan <span className="font-bold text-foreground">{filteredCount}</span>{" "}
        dari <span className="font-bold text-foreground">{totalCount}</span> siswa
      </p>
    </div>
  );
}

export default StudentFilters;