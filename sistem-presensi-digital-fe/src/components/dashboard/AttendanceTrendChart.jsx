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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-md text-left text-xs space-y-1">
        <p className="font-semibold text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {entry.value} siswa
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AttendanceTrendChart({ isTeacher, data }) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          {isTeacher
            ? "Tren Kehadiran Kelas (Minggu Ini)"
            : "Tren Kehadiran Sekolah (Minggu Ini)"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[230px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Line
                type="monotone"
                dataKey="Hadir"
                name="Siswa Hadir"
                stroke="#1F5F99"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#1F5F99" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Alpa"
                name="Tanpa Keterangan (Alpa)"
                stroke="#EF4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#EF4444" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default AttendanceTrendChart;
