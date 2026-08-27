import React from "react";
import { Pencil, Trash2, Users } from "lucide-react";
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
 * Tabel Data Guru dengan layout responsif (horizontal scroll di mobile).
 * Menggunakan design tokens yang konsisten.
 */
function TeachersTable({ teachers, onEdit, onDelete }) {
  if (teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="flex items-center justify-center size-14 rounded-full bg-muted">
          <Users className="size-7 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Data guru tidak ditemukan</p>
          <p className="text-sm text-muted-foreground">
            Coba ubah kata kunci pencarian atau filter yang digunakan.
          </p>
        </div>
      </div>
    );
  }

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100";
      case ROLES.GURU_WALI_KELAS:
        return "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10";
      case ROLES.GURU_MAPEL:
        return "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12 text-center font-bold text-foreground">No</TableHead>
            <TableHead className="font-bold text-foreground min-w-[200px]">Nama Guru</TableHead>
            <TableHead className="font-bold text-foreground min-w-[150px]">NIP</TableHead>
            <TableHead className="font-bold text-foreground min-w-[120px]">Username</TableHead>
            <TableHead className="font-bold text-foreground min-w-[140px]">Role</TableHead>
            <TableHead className="font-bold text-foreground min-w-[100px]">Kelas Wali</TableHead>
            <TableHead className="font-bold text-foreground min-w-[100px]">Status</TableHead>
            <TableHead className="font-bold text-foreground text-center min-w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher, index) => (
            <TableRow
              key={teacher.id}
              className="hover:bg-muted/30 transition-colors"
            >
              {/* No */}
              <TableCell className="text-center text-sm text-muted-foreground font-medium">
                {index + 1}
              </TableCell>

              {/* Nama Guru */}
              <TableCell className="font-semibold text-foreground">
                {teacher.name}
              </TableCell>

              {/* NIP */}
              <TableCell className="text-sm text-foreground font-mono">
                {teacher.nip}
              </TableCell>

              {/* Username */}
              <TableCell className="text-sm text-foreground font-mono">
                {teacher.username}
              </TableCell>

              {/* Role */}
              <TableCell>
                <Badge
                  variant="outline"
                  className={`${getRoleBadgeStyle(teacher.role)} font-semibold text-xs border`}
                >
                  {getRoleLabel(teacher.role)}
                </Badge>
              </TableCell>

              {/* Kelas Wali */}
              <TableCell>
                {teacher.role === ROLES.GURU_WALI_KELAS && teacher.assignedClass ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    {teacher.assignedClass}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic text-xs">—</span>
                )}
              </TableCell>

              {/* Status */}
              <TableCell>
                {teacher.status === "Aktif" ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold text-xs border">
                    Aktif
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100 font-semibold text-xs border"
                  >
                    Tidak Aktif
                  </Badge>
                )}
              </TableCell>

              {/* Aksi */}
              <TableCell>
                <div className="flex items-center justify-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-primary hover:bg-primary/10 hover:text-primary cursor-pointer"
                    onClick={() => onEdit(teacher)}
                    aria-label={`Edit guru ${teacher.name}`}
                    title="Edit"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    onClick={() => onDelete(teacher)}
                    aria-label={`Hapus guru ${teacher.name}`}
                    title="Hapus"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default TeachersTable;
