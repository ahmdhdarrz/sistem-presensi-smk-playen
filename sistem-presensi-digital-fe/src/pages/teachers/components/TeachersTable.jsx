import React from "react";
import { Pencil, Trash2, Users, UserCheck, Shield, BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRoleLabel, ROLES } from "@/utils/roles";

/**
 * Tabel Data Guru — data bersumber dari API /api/users.
 *
 * Setiap item teacher memiliki field:
 *   id, nama, username, role, kelas_id, kelasNama
 */
function TeachersTable({ teachers, onEdit, onDelete }) {
  if (teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border rounded-xl bg-card shadow-xs">
        <div className="flex items-center justify-center size-14 rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground border border-border">
          <Users className="size-7" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-foreground text-sm">Data guru tidak ditemukan</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Coba ubah kata kunci pencarian atau reset filter yang sedang aktif.
          </p>
        </div>
      </div>
    );
  }

  const getRoleBadgeStyle = (role) => {
    const upper = String(role).toUpperCase();
    if (upper === ROLES.ADMIN)
      return "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300";
    if (upper === ROLES.GURU_WALI_KELAS || upper === "WALI_KELAS")
      return "bg-primary/10 text-primary border-primary/20";
    if (upper === ROLES.GURU_MAPEL || upper === "GURU_MAPEL")
      return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden text-left">
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-slate-900/80 hover:bg-slate-50/80 dark:hover:bg-slate-900/80 border-b border-border">
              <TableHead className="w-14 text-center font-extrabold text-foreground text-xs uppercase tracking-wider">No</TableHead>
              <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider min-w-[220px]">Nama Guru</TableHead>
              <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider min-w-[140px]">Username</TableHead>
              <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider min-w-[160px]">Role / Peran</TableHead>
              <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider min-w-[140px]">Kelas Wali</TableHead>
              <TableHead className="font-extrabold text-foreground text-xs uppercase tracking-wider text-center min-w-[110px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {teachers.map((teacher, index) => {
              const isWali = String(teacher.role).toUpperCase() === ROLES.GURU_WALI_KELAS;
              return (
                <TableRow
                  key={teacher.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors"
                >
                  {/* No */}
                  <TableCell className="text-center text-xs text-muted-foreground font-mono font-medium">
                    {index + 1}
                  </TableCell>

                  {/* Nama Guru */}
                  <TableCell className="font-bold text-foreground text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10 text-primary font-extrabold text-[11px]">
                        {teacher.nama?.charAt(0) || "G"}
                      </div>
                      <span>{teacher.nama}</span>
                    </div>
                  </TableCell>

                  {/* Username */}
                  <TableCell className="text-xs text-muted-foreground font-mono font-semibold">
                    @{teacher.username}
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getRoleBadgeStyle(teacher.role)} font-bold text-[11px] border px-2.5 py-0.5`}
                    >
                      {getRoleLabel(teacher.role)}
                    </Badge>
                  </TableCell>

                  {/* Kelas Wali */}
                  <TableCell>
                    {isWali && teacher.kelasNama ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <BookOpen className="size-3 shrink-0" />
                        <span>Kelas {teacher.kelasNama}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic text-xs font-medium">—</span>
                    )}
                  </TableCell>

                  {/* Aksi */}
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                        onClick={() => onEdit(teacher)}
                        aria-label={`Edit guru ${teacher.nama}`}
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        onClick={() => onDelete(teacher)}
                        aria-label={`Hapus guru ${teacher.nama}`}
                        title="Hapus"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default TeachersTable;
