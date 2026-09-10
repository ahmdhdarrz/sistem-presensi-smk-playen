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
      className={`relative overflow-hidden rounded-xl border border-border ${accent.bg} p-2.5 sm:p-4 flex flex-col justify-between h-full min-w-0 gap-1.5 sm:gap-3 shadow-xs hover:shadow-md transition-shadow`}
    >
      {/* Left accent bar */}
      <span className={`absolute left-0 top-2 bottom-2 sm:top-3 sm:bottom-3 w-[3px] rounded-r-full ${accent.bar}`} />

      {/* Top row: icon + title */}
      <div className="flex items-start justify-between gap-1.5 sm:gap-2 pl-1.5 sm:pl-2">
        <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider leading-tight pt-0.5 flex-1 line-clamp-2 min-h-[22px] sm:min-h-0">
          {title}
        </p>
        <div className={`flex items-center justify-center size-6.5 sm:size-8 rounded-md sm:rounded-lg shrink-0 ${accent.icon}`}>
          <IconComponent className="size-3.5 sm:size-4" />
        </div>
      </div>

      {/* Value */}
      <div className="pl-1.5 sm:pl-2 mt-auto">
        <p className="text-lg sm:text-3xl font-bold text-foreground tracking-tight leading-none">
          {value}
        </p>
        {description && (
          <p className="text-[9px] sm:text-[11px] text-muted-foreground mt-1 sm:mt-1.5 font-medium leading-snug truncate sm:whitespace-normal">
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
    <div className={`grid ${gridCols} gap-2 sm:gap-3`}>
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
