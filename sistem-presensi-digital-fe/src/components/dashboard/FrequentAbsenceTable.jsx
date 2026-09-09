import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function FrequentAbsenceTable({ isTeacher, data }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-7 rounded-lg bg-rose-100 text-rose-600 shrink-0">
            <AlertCircle className="size-3.5" />
          </div>
          <CardTitle className="text-sm font-bold text-foreground">Sering Alpa</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 pt-0 flex-1 flex flex-col min-h-0">
        {data.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-6">
            Tidak ada data alpa berlebih.
          </p>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5">
            {data.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/60 transition-colors"
              >
                {/* Rank badge */}
                <span className={`flex items-center justify-center shrink-0 size-6 rounded-full text-[10px] font-bold
                  ${index === 0 ? "bg-rose-500 text-white" :
                    index === 1 ? "bg-rose-300 text-rose-900" :
                    index === 2 ? "bg-rose-200 text-rose-800" :
                    "bg-muted text-muted-foreground"}`}>
                  {index + 1}
                </span>

                {/* Name + class */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                  {!isTeacher && item.class && (
                    <p className="text-[10px] text-muted-foreground">{item.class}</p>
                  )}
                </div>

                {/* Count badge */}
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  {item.totalAlpa}×
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FrequentAbsenceTable;
