import React from "react";
import { Trash2, FileWarning } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

function PermissionTable({ permissions, onDelete, canDelete = false }) {
  if (permissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="flex items-center justify-center size-14 rounded-full bg-muted">
          <FileWarning className="size-7 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Tidak ada data izin</p>
          <p className="text-sm text-muted-foreground">
            Tidak ada data izin harian yang cocok dengan pencarian atau filter Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-12 text-center font-bold text-foreground">No</TableHead>
            <TableHead className="font-bold text-foreground min-w-[150px]">Siswa</TableHead>
            <TableHead className="font-bold text-foreground min-w-[100px]">NIS / Kelas</TableHead>
            <TableHead className="font-bold text-foreground min-w-[130px]">Tanggal & Waktu</TableHead>
            <TableHead className="font-bold text-foreground min-w-[130px]">Alasan</TableHead>
            {canDelete && (
              <TableHead className="font-bold text-foreground text-center min-w-[90px]">Aksi</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((item, index) => {
            const dateObj = new Date(item.date);
            const formattedDate = format(dateObj, "dd MMM yyyy", { locale: idLocale });

            return (
              <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="text-center text-sm text-muted-foreground font-medium">
                  {index + 1}
                </TableCell>
                <TableCell className="font-semibold text-foreground">{item.studentName}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground font-mono">{item.nis}</span>
                    <span className="text-xs text-muted-foreground">{item.className}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{formattedDate}</span>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-semibold text-foreground">{item.reason}</span>
                </TableCell>
                {canDelete && (
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        onClick={() => onDelete(item)}
                        aria-label={`Hapus izin ${item.studentName}`}
                        title="Hapus"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default PermissionTable;