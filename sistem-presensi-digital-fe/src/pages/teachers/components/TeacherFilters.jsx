import React from "react";
import { Search, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES, ROLE_LABELS } from "@/utils/roles";

/**
 * Filter & Search untuk Halaman Data Guru.
 * Filter Status dihapus karena backend tidak memiliki field status di tabel users.
 */
function TeacherFilters({
  search,
  onSearchChange,
  selectedRole,
  onRoleChange,
  filteredCount,
  totalCount,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          id="teacher-search"
          type="search"
          placeholder="Cari nama atau username..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-card text-foreground"
        />
      </div>

      {/* Filter Role */}
      <div className="w-full sm:w-52">
        <Select value={selectedRole} onValueChange={onRoleChange}>
          <SelectTrigger id="teacher-role-filter" className="bg-card w-full text-foreground">
            <Shield className="size-4 text-muted-foreground mr-1 shrink-0" />
            <SelectValue placeholder="Semua Peran / Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Peran / Role</SelectItem>
            <SelectItem value={ROLES.ADMIN}>{ROLE_LABELS[ROLES.ADMIN]}</SelectItem>
            <SelectItem value={ROLES.GURU_WALI_KELAS}>{ROLE_LABELS[ROLES.GURU_WALI_KELAS]}</SelectItem>
            <SelectItem value={ROLES.GURU_MAPEL}>{ROLE_LABELS[ROLES.GURU_MAPEL]}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Info Jumlah Data */}
      <p className="text-sm text-muted-foreground whitespace-nowrap shrink-0 font-medium ml-auto sm:ml-0">
        Menampilkan{" "}
        <span className="font-bold text-foreground">{filteredCount}</span>{" "}
        dari{" "}
        <span className="font-bold text-foreground">{totalCount}</span>{" "}
        guru
      </p>
    </div>
  );
}

export default TeacherFilters;
