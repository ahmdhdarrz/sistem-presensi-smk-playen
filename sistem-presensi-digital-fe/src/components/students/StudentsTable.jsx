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

/**
 * Tabel daftar siswa dengan aksi Edit dan Hapus.
 * Mendukung horizontal scroll di mobile.
 */
function StudentsTable({ students, onEdit, onDelete }) {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="flex items-center justify-center size-14 rounded-full bg-muted">
          <Users className="size-7 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Tidak ada data siswa</p>
          <p className="text-sm text-muted-foreground">
            Tidak ada data siswa yang cocok dengan pencarian atau filter Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    /* Wrapper horizontal-scroll untuk mobile agar tabel tidak pecah */
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12 text-center font-bold text-foreground">No</TableHead>
            <TableHead className="font-bold text-foreground min-w-[180px]">Nama Siswa</TableHead>
            <TableHead className="font-bold text-foreground min-w-[120px]">NIS</TableHead>
            <TableHead className="font-bold text-foreground min-w-[130px]">NISN</TableHead>
            <TableHead className="font-bold text-foreground min-w-[90px]">Kelas</TableHead>
            <TableHead className="font-bold text-foreground min-w-[100px]">Status</TableHead>
            <TableHead className="font-bold text-foreground text-center min-w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow
              key={student.id}
              className="hover:bg-muted/30 transition-colors"
            >
              {/* No */}
              <TableCell className="text-center text-sm text-muted-foreground font-medium">
                {index + 1}
              </TableCell>

              {/* Nama */}
              <TableCell className="font-semibold text-foreground">
                {student.name}
              </TableCell>

              {/* NIS */}
              <TableCell className="text-sm text-foreground font-mono">
                {student.nis}
              </TableCell>

              {/* NISN */}
              <TableCell className="text-sm text-foreground font-mono">
                {student.nisn || (
                  <span className="text-muted-foreground italic text-xs">—</span>
                )}
              </TableCell>

              {/* Kelas */}
              <TableCell>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {student.className}
                </span>
              </TableCell>

              {/* Status */}
              <TableCell>
                {student.status === "Aktif" ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold text-xs">
                    Aktif
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-slate-100 text-slate-500 border-slate-200 font-semibold text-xs"
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
                    onClick={() => onEdit(student)}
                    aria-label={`Edit siswa ${student.name}`}
                    title="Edit"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    onClick={() => onDelete(student)}
                    aria-label={`Hapus siswa ${student.name}`}
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

export default StudentsTable;
