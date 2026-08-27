import React from "react";
import { useNavigate } from "react-router-dom";
import { PanelLeft, Bell, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MobileSidebar } from "@/components/common/AppSidebar";
import { useAuth } from "@/context/AuthContext";
import { getRoleLabel } from "@/utils/roles";

export function AppHeader({ isCollapsed, onToggleSidebar, currentUser }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = React.useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const activeUser = user || currentUser;

  const confirmLogout = () => {
    setShowConfirmLogout(false);
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
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card/80 px-4 sm:px-6 backdrop-blur-md transition-all duration-300">
        {/* Left side toggle buttons */}
        <div className="flex items-center gap-2">
          {/* Desktop Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hidden md:flex text-muted-foreground hover:text-foreground"
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <PanelLeft className="size-5" />
          </Button>

          {/* Mobile Sidebar Trigger Sheet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="flex md:hidden text-muted-foreground hover:text-foreground"
                aria-label="Buka Menu Navigasi"
              >
                <PanelLeft className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r border-border">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigasi Presensi Digital</SheetTitle>
              </SheetHeader>
              <MobileSidebar
                isOpen={mobileOpen}
                onOpenChange={setMobileOpen}
                role={activeUser?.role}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Right side user actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Icon Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
            aria-label="Notifikasi"
          >
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2.5 px-2 py-1 h-auto focus-visible:ring-1 cursor-pointer"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {getInitials(activeUser?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-medium leading-none text-foreground">
                    {activeUser?.name || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5 font-medium">
                    {getRoleLabel(activeUser?.role)}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-foreground">{activeUser?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground font-medium">
                    {activeUser?.email || "user@smkm1playen.sch.id"}
                  </p>
                  <div className="pt-1">
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {getRoleLabel(activeUser?.role)}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 size-4 text-muted-foreground" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 size-4 text-muted-foreground" />
                <span>Pengaturan</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowConfirmLogout(true)}
                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 font-bold"
              >
                <LogOut className="mr-2 size-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


        </div>
      </header>

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

export default AppHeader;
