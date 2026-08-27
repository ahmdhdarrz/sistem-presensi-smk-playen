import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";

export function FrequentAbsenceTable({ isTeacher, data }) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <AlertCircle className="size-4 text-amber-600 shrink-0" />
          <span>Siswa Paling Sering Alpa</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="max-h-[230px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center font-semibold text-foreground">No.</TableHead>
                <TableHead className="font-semibold text-foreground">Nama Siswa</TableHead>
                {!isTeacher && (
                  <TableHead className="font-semibold text-foreground">Kelas</TableHead>
                )}
                <TableHead className="text-right font-semibold text-foreground">Total Alpa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isTeacher ? 3 : 4} className="text-center py-6 text-muted-foreground text-xs">
                    Tidak ada siswa dengan catatan alpa berlebih.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center font-medium text-muted-foreground py-2.5">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground py-2.5">
                      {item.name}
                    </TableCell>
                    {!isTeacher && (
                      <TableCell className="text-muted-foreground py-2.5">
                        {item.class}
                      </TableCell>
                    )}
                    <TableCell className="text-right py-2.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                        {item.totalAlpa} Hari
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default FrequentAbsenceTable;
