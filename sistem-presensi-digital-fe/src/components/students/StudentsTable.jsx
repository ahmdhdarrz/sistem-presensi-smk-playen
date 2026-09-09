import React from "react";
import { Pencil, Trash2, Users, UserCheck } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function StudentsTable({ students, onEdit, onDelete }) {
  if (students.length === 0) {
    return (
      <Card className="shadow-xs border-border overflow-hidden">
        <CardContent className="py-16 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex items-center justify-center size-12 rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground">
              <Users className="size-6 text-muted-foreground/60" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-foreground text-base">Tidak Ada Data Siswa</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Tidak ada data siswa yang cocok dengan kriteria pencarian atau filter yang Anda pilih.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xs border-border overflow-hidden text-left">
      <CardHeader className="py-3.5 px-5 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="size-4 text-primary" />
            <CardTitle className="text-base font-bold text-foreground">Daftar Data Siswa</CardTitle>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Total {students.length} Siswa Terdaftar
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-border">
                <TableHead className="w-14 text-center font-bold text-foreground text-xs uppercase tracking-wider">No.</TableHead>
                <TableHead className="w-32 font-bold text-foreground text-xs uppercase tracking-wider">NIS</TableHead>
                <TableHead className="min-w-[200px] font-bold text-foreground text-xs uppercase tracking-wider">Nama Siswa</TableHead>
                <TableHead className="w-36 text-center font-bold text-foreground text-xs uppercase tracking-wider">Jenis Kelamin</TableHead>
                <TableHead className="w-32 text-center font-bold text-foreground text-xs uppercase tracking-wider">Kelas</TableHead>
                <TableHead className="w-28 text-center font-bold text-foreground text-xs uppercase tracking-wider">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => (
                <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="text-center text-muted-foreground font-semibold text-xs py-3.5">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-medium text-muted-foreground py-3.5">
                    {student.nis}
                  </TableCell>
                  <TableCell className="font-bold text-foreground py-3.5 text-left">
                    {student.name}
                  </TableCell>
                  <TableCell className="text-center py-3.5">
                    {student.jenisKelamin === "L" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                        Laki-laki
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-300 dark:border-pink-800">
                        Perempuan
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      Kelas {student.className}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-primary hover:bg-primary/10 hover:text-primary cursor-pointer rounded-lg transition-colors"
                        onClick={() => onEdit(student)}
                        aria-label={`Edit siswa ${student.name}`}
                        title="Edit Data Siswa"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-lg transition-colors"
                        onClick={() => onDelete(student)}
                        aria-label={`Hapus siswa ${student.name}`}
                        title="Hapus Data Siswa"
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
      </CardContent>
    </Card>
  );
}

export default StudentsTable;