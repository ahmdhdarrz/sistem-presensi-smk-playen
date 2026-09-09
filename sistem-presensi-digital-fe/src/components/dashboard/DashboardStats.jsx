import React from "react";
import { Users, UserCheck, UserX, School, ClipboardCheck, Eye, Clock, TrendingUp } from "lucide-react";

const ICON_MAP = {
  Users: Users,
  UserCheck: UserCheck,
  UserX: UserX,
  School: School,
  ClipboardCheck: ClipboardCheck,
  Eye: Eye,
  Clock: Clock,
};

// Color accent per icon type — all drawn from the existing design system palette
const ACCENT_MAP = {
  Users:          { bg: "bg-primary/8",    icon: "bg-primary text-primary-foreground",       bar: "bg-primary" },
  UserCheck:      { bg: "bg-emerald-50",   icon: "bg-emerald-500 text-white",                bar: "bg-emerald-500" },
  UserX:          { bg: "bg-rose-50",      icon: "bg-rose-500 text-white",                   bar: "bg-rose-500" },
  Clock:          { bg: "bg-amber-50",     icon: "bg-amber-500 text-white",                  bar: "bg-amber-500" },
  School:         { bg: "bg-primary/8",    icon: "bg-primary text-primary-foreground",       bar: "bg-primary" },
  ClipboardCheck: { bg: "bg-emerald-50",   icon: "bg-emerald-500 text-white",                bar: "bg-emerald-500" },
  Eye:            { bg: "bg-secondary",    icon: "bg-secondary-foreground text-white",       bar: "bg-secondary-foreground" },
};

export function StatCard({ title, value, description, icon }) {
  const IconComponent = ICON_MAP[icon] || Users;
  const accent = ACCENT_MAP[icon] || ACCENT_MAP.Users;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border ${accent.bg} p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow`}
    >
      {/* Left accent bar */}
      <span className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${accent.bar}`} />

      {/* Top row: icon + title */}
      <div className="flex items-start justify-between gap-2 pl-2">
        <p className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider leading-tight pt-0.5 flex-1">
          {title}
        </p>
        <div className={`flex items-center justify-center size-8 rounded-lg shrink-0 ${accent.icon}`}>
          <IconComponent className="size-4" />
        </div>
      </div>

      {/* Value */}
      <div className="pl-2">
        <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-none">
          {value}
        </p>
        {description && (
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1.5 font-medium leading-snug">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export function DashboardStats({ stats }) {
  const count = stats?.length || 4;

  const gridCols =
    count <= 4
      ? "grid-cols-2 lg:grid-cols-4"
      : count === 5
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6";

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {stats.map((stat, idx) => (
        <StatCard
          key={idx}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}

export default DashboardStats;
