import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-xl shadow-lg text-left text-xs space-y-1 min-w-[130px]">
        <p className="font-bold text-foreground text-[11px] mb-1.5">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full shrink-0" style={{ background: entry.color }} />
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
          <span className="inline-block w-4 h-0.5 shrink-0" style={{ background: entry.color }} />
          {entry.value}
        </span>
      ))}
    </div>
  );
};

export function AttendanceTrendChart({ isTeacher, data }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-7 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
            <TrendingUp className="size-3.5" />
          </div>
          <CardTitle className="text-sm font-bold text-foreground">
            {isTeacher ? "Tren Kehadiran Kelas (Minggu Ini)" : "Tren Kehadiran Sekolah (Minggu Ini)"}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-1.5 sm:px-2 pb-2.5 sm:pb-3 pt-1 flex-1">
        <div className="h-[180px] sm:h-[210px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} width={26} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
              <Legend content={<CompactLegend />} />
              <Line
                type="monotone"
                dataKey="Hadir"
                name="Hadir"
                stroke="#1F5F99"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#1F5F99", strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="Terlambat"
                name="Terlambat"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={{ r: 2.5, fill: "#F59E0B", strokeWidth: 0 }}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="Alpa"
                name="Alpa"
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2.5, fill: "#EF4444", strokeWidth: 0 }}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default AttendanceTrendChart;
