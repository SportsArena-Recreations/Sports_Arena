import { Link, Outlet, useLocation } from "react-router-dom";
import { arenaConfig } from "@/config/arena.config";
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  Trophy,
  Users,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Facilities", path: "/admin/facilities", icon: Building2 },
  { label: "Bookings", path: "/admin/bookings", icon: CalendarDays },
  { label: "Tournaments", path: "/admin/tournaments", icon: Trophy },
  { label: "Teams", path: "/admin/teams", icon: Users },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="font-display text-sm font-bold text-sidebar-primary-foreground">A</span>
          </div>
          <span className="font-display text-lg font-bold text-sidebar-foreground">
            {arenaConfig.name}
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {adminLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
              <ChevronLeft size={16} />
              Back to Site
            </Button>
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 lg:justify-end">
          <div className="flex items-center gap-2 lg:hidden">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Site
            </Link>
          </div>

          {/* Mobile nav */}
          <div className="flex gap-1 overflow-x-auto lg:hidden">
            {adminLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <link.icon size={14} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-sm text-muted-foreground">Admin Panel</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
