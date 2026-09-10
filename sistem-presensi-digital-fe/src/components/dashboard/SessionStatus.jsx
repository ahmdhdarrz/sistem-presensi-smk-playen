import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export function SessionStatus({ isTeacher, sessionData, classNameInfo }) {
  if (isTeacher) {
    const { morning, afternoon } = sessionData;

    return (
      <Card className="h-full">
        <CardHeader className="pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
            Status Input Presensi Kelas ({classNameInfo})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 space-y-2.5 sm:space-y-4">
          {/* Sesi Pagi */}
          <div className="flex items-center justify-between p-2.5 sm:p-3.5 rounded-lg border border-border bg-slate-50/50">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-bold text-foreground">Sesi Pagi</span>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Jam Masuk (07:00 - 08:00)</p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {morning.isComplete ? (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="size-3 sm:size-3.5 text-emerald-600" />
                  {morning.status}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-100 text-amber-800">
                  <Clock className="size-3 sm:size-3.5 text-amber-600" />
                  {morning.status}
                </span>
              )}
            </div>
          </div>

          {/* Sesi Sore */}
          <div className="flex items-center justify-between p-2.5 sm:p-3.5 rounded-lg border border-border bg-slate-50/50">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-bold text-foreground">Sesi Sore</span>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Jam Pulang (15:00 - 16:00)</p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {afternoon.isComplete ? (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="size-3 sm:size-3.5 text-emerald-600" />
                  {afternoon.status}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-slate-100 text-slate-700">
                  <Clock className="size-3 sm:size-3.5 text-slate-500" />
                  {afternoon.status}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Admin view
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
        <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
          Monitoring Input Presensi Per Kelas
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-3 pt-0">
        <div className="overflow-x-auto w-full max-h-[220px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-foreground text-xs px-2 sm:px-3">Kelas</TableHead>
                <TableHead className="font-semibold text-foreground text-center text-xs px-2 sm:px-3">Sesi Pagi</TableHead>
                <TableHead className="font-semibold text-foreground text-center text-xs px-2 sm:px-3">Sesi Sore</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionData.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-foreground py-2 text-xs px-2 sm:px-3">
                    {row.class}
                  </TableCell>
                  <TableCell className="text-center py-2 px-2 sm:px-3">
                    {row.morning ? (
                      <span className="inline-flex items-center justify-center size-5.5 sm:size-6 rounded-full bg-emerald-100 text-emerald-700 mx-auto">
                        <CheckCircle2 className="size-3.5 sm:size-4" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center size-5.5 sm:size-6 rounded-full bg-rose-100 text-rose-700 mx-auto">
                        <XCircle className="size-3.5 sm:size-4" />
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center py-2 px-2 sm:px-3">
                    {row.afternoon ? (
                      <span className="inline-flex items-center justify-center size-5.5 sm:size-6 rounded-full bg-emerald-100 text-emerald-700 mx-auto">
                        <CheckCircle2 className="size-3.5 sm:size-4" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center size-5.5 sm:size-6 rounded-full bg-slate-100 text-slate-500 mx-auto">
                        <Clock className="size-3.5 sm:size-4" />
                      </span>
                    )}
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

export default SessionStatus;
