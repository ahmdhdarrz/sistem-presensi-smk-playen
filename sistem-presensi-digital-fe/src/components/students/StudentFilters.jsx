import React from "react";
import { Search, Filter, RotateCcw, X, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  onResetFilter,
  isFilterActive,
}) {
  return (
    <Card className="shadow-xs border-border text-left overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="student-search"
                type="text"
                placeholder="Cari nama atau NIS..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs font-semibold w-full bg-card"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Kelas */}
            <div className="w-full sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <select
                  id="student-class-filter"
                  value={selectedClass}
                  onChange={(e) => onClassChange(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-card text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer appearance-none"
                >
                  <option value="all">Semua Kelas</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.nama_kelas}>
                      Kelas {cls.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset Filter Button */}
            <Button
              type="button"
              variant="outline"
              disabled={!isFilterActive}
              onClick={onResetFilter}
              className={cn(
                "h-9 text-xs font-bold gap-2 cursor-pointer transition-all border-dashed shrink-0",
                isFilterActive
                  ? "text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  : "opacity-50 text-muted-foreground cursor-not-allowed"
              )}
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Filter</span>
            </Button>
          </div>

          {/* Count Badge */}
          <div className="flex items-center gap-2 self-end lg:self-auto text-xs text-muted-foreground font-medium shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/50 w-full lg:w-auto justify-between lg:justify-end">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-foreground font-bold border border-border">
              <Users className="size-3.5 text-primary" />
              <span>{filteredCount} / {totalCount} Siswa</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StudentFilters;