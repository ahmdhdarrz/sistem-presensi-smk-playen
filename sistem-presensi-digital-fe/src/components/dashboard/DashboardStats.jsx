import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, School, ClipboardCheck, Eye } from "lucide-react";

const iconMap = {
  Users: Users,
  UserCheck: UserCheck,
  UserX: UserX,
  School: School,
  ClipboardCheck: ClipboardCheck,
  Eye: Eye,
};

export function StatCard({ title, value, description, icon }) {
  const IconComponent = iconMap[icon] || Users;

  return (
    <Card className="hover:shadow-md transition-shadow border-border text-left">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary shrink-0">
            <IconComponent className="size-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {value}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 font-semibold leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
