import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/common/AppSidebar";
import AppHeader from "@/components/common/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col w-full">
        {/* Desktop Sidebar */}
        <AppSidebar isCollapsed={isCollapsed} role={user?.role} />

        {/* Main Content Wrapper */}
        <div
          className={cn(
            "flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out",
            isCollapsed ? "md:pl-16" : "md:pl-64"
          )}
        >
          {/* Header */}
          <AppHeader
            isCollapsed={isCollapsed}
            onToggleSidebar={toggleSidebar}
            currentUser={user}
          />

          {/* Main Page Area */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default DashboardLayout;
