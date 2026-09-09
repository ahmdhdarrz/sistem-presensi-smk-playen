import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart2 } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-xl shadow-lg text-left text-xs space-y-1 min-w-[120px]">
        <p className="font-bold text-foreground text-[11px] mb-1.5">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-sm shrink-0" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-foreground ml-auto pl-2">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CompactLegend = ({ payload }) => {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-1">
      {payload.map((entry, i) => (
        <span key={i} className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground">
          <span className="inline-block w-3 h-2.5 rounded-sm shrink-0" style={{ background: entry.color }} />
          {entry.value}
        </span>
      ))}
    </div>
  );
};

export function AttendanceComparisonChart({ isTeacher, data }) {
  const isMultiClass = !isTeacher;
  // Give each class group ~72px to breathe; minimum 300px
  const dynamicWidth = isMultiClass && data?.length > 0
    ? Math.max(data.length * 72, 300)
    : undefined;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10 text-primary shrink-0">
            <BarChart2 className="size-3.5" />
          </div>
          <CardTitle className="text-sm font-bold text-foreground">
            {isTeacher ? "Perbandingan Status Kehadiran Kelas" : "Perbandingan Kehadiran Antar Kelas"}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-2 pb-3 pt-1 flex-1">
        {isMultiClass ? (
          <div className="overflow-x-auto">
            <div style={{ width: dynamicWidth, minWidth: "100%" }}>
              <div className="h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="class" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} interval={0} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} width={30} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
                    <Legend content={<CompactLegend />} />
                    <Bar dataKey="Hadir" name="Hadir" fill="#1F5F99" radius={[3, 3, 0, 0]} maxBarSize={18} />
                    <Bar dataKey="Terlambat" name="Terlambat" fill="#F59E0B" radius={[3, 3, 0, 0]} maxBarSize={18} />
                    <Bar dataKey="TidakHadir" name="Tidak Hadir" fill="#EF4444" radius={[3, 3, 0, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[210px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="category" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
                <Legend content={<CompactLegend />} />
                <Bar dataKey="count" name="Jumlah Siswa" fill="#1F5F99" radius={[3, 3, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Terlambat" name="Terlambat" fill="#F59E0B" radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AttendanceComparisonChart;
