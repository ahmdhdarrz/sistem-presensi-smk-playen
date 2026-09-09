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

export function AttendanceComparisonChart({ isTeacher, data }) {
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          {isTeacher ? "Perbandingan Status Kehadiran Kelas" : "Perbandingan Kehadiran Antar Kelas"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[230px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {isTeacher ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="category" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="count" name="Jumlah Siswa" fill="#1F5F99" radius={[4, 4, 0, 0]} barSize={36} />
                <Bar dataKey="Terlambat" name="Terlambat" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="class" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="Hadir" fill="#1F5F99" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="Terlambat" name="Terlambat" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="TidakHadir" name="Tidak Hadir" fill="#EAB308" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default AttendanceComparisonChart;
