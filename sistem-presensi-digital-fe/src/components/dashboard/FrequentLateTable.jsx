import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function FrequentLateTable({ isTeacher, data }) {
  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-7 rounded-lg bg-amber-100 text-amber-600 shrink-0">
            <Clock className="size-3.5" />
          </div>
          <CardTitle className="text-sm font-bold text-foreground">Sering Terlambat</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-2.5 sm:px-3 pb-2.5 sm:pb-3 pt-0 flex-1 flex flex-col min-h-0">
        {data.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-6">
            Tidak ada data terlambat berlebih.
          </p>
        ) : (
          <div className="overflow-y-auto max-h-[280px] lg:max-h-none flex-1 min-h-0 space-y-1 sm:space-y-1.5 pr-0.5">
            {data.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2 sm:gap-2.5 rounded-lg px-2 sm:px-2.5 py-1.5 sm:py-2 hover:bg-muted/60 transition-colors"
              >
                {/* Rank badge */}
                <span className={`flex items-center justify-center shrink-0 size-5.5 sm:size-6 rounded-full text-[9px] sm:text-[10px] font-bold
                  ${index === 0 ? "bg-amber-500 text-white" :
                    index === 1 ? "bg-amber-300 text-amber-900" :
                    index === 2 ? "bg-amber-200 text-amber-800" :
                    "bg-muted text-muted-foreground"}`}>
                  {index + 1}
                </span>

                {/* Name + class */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{item.name}</p>
                  {!isTeacher && item.class && (
                    <p className="text-[10px] text-muted-foreground truncate">{item.class}</p>
                  )}
                </div>

                {/* Count badge */}
                <span className="shrink-0 inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                  {item.totalTerlambat}×
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FrequentLateTable;
