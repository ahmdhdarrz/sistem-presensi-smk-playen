import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { School, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavigationByRole } from "@/utils/navigation";
import { getRoleLabel } from "@/utils/roles";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function SidebarContent({ isCollapsed, role, onNavItemClick }) {
  const items = getNavigationByRole(role);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const confirmLogout = () => {
    setShowConfirmLogout(false);
    if (onNavItemClick) onNavItemClick();
    logout();
    navigate("/login", { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <div className="flex flex-col h-full bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-r border-[var(--sidebar-border)] select-none">
        {/* Header Logo & Branding */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 h-16 border-b border-[var(--sidebar-border)] transition-all duration-300 shrink-0",
            isCollapsed ? "justify-center px-2" : "justify-start"
          )}
        >
          <div className="flex items-center justify-center size-9 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] shrink-0 shadow-sm">
            <School className="size-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden text-left">
              <span className="font-semibold text-sm leading-tight text-[var(--sidebar-foreground)] truncate">
                Presensi Digital
              </span>
              <span className="text-[11px] text-[var(--sidebar-foreground)]/80 truncate">
                SMK Muhammadiyah 1 Playen
              </span>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;

            const navItemClass = ({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] font-semibold shadow-xs"
                  : "text-[var(--sidebar-foreground)]/80 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
                isCollapsed && "justify-center px-2"
              );

            if (isCollapsed) {
              return (
                <Tooltip key={item.path} delayDuration={100}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.path}
                      onClick={onNavItemClick}
                      className={navItemClass}
                    >
                      <Icon className="size-5 shrink-0" />
                      <span className="sr-only">{item.label}</span>
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium text-xs bg-slate-800 text-white border-slate-700">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavItemClick}
                className={navItemClass}
              >
                <Icon className="size-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer with only Logout button – no user name/role display */}
        <div className="p-3 border-t border-[var(--sidebar-border)] mt-auto shrink-0">
          {isCollapsed ? (
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setShowConfirmLogout(true)}
                  className="w-full flex items-center justify-center p-2.5 rounded-lg text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-colors cursor-pointer"
                  aria-label="Keluar / Logout"
                >
                  <LogOut className="size-5 shrink-0" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold text-xs bg-rose-900 text-white border-rose-800">
                Keluar / Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmLogout(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 transition-colors cursor-pointer text-left"
            >
              <LogOut className="size-4 shrink-0" />
              <span>Keluar / Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal Overlay for Logout */}
      {showConfirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-6 space-y-4 text-left">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                Konfirmasi Keluar
              </h3>
              <p className="text-sm text-muted-foreground font-medium">
                Apakah Anda yakin ingin keluar dari Sistem Presensi Digital?
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmLogout(false)}
                className="font-semibold cursor-pointer"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={confirmLogout}
                className="font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              >
                Keluar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AppSidebar({ isCollapsed, role }) {
  return (
    <aside
      className={cn(
        "hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent isCollapsed={isCollapsed} role={role} />
    </aside>
  );
}

export function MobileSidebar({ isOpen, onOpenChange, role }) {
  return (
    <SidebarContent
      isCollapsed={false}
      role={role}
      onNavItemClick={() => onOpenChange(false)}
    />
  );
}

export default AppSidebar;
