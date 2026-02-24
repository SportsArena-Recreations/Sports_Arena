import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { arenaConfig } from "@/config/arena.config";
import {
  LayoutDashboard, Building2, CalendarDays,
  Trophy, Users, ChevronLeft, Zap, LogOut, ShieldCheck, Swords,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const adminLinks = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Facilities", path: "/admin/facilities", icon: Building2 },
  { label: "Bookings", path: "/admin/bookings", icon: CalendarDays },
  { label: "Tournaments", path: "/admin/tournaments", icon: Trophy },
  { label: "Teams", path: "/admin/teams", icon: Users },
  { label: "Matches", path: "/admin/matches", icon: Swords },
];

function getInitials(name: string | null, email: string | null | undefined) {
  if (name?.trim()) return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (email?.[0] ?? "A").toUpperCase();
}

export function AdminLayout() {
  const location = useLocation();
  const { user, isAdmin, loading, fullName, signOut } = useAuth();
  const navigate = useNavigate();

  const initials = getInitials(fullName, user?.email);
  const displayName = fullName?.split(" ")[0] || user?.email?.split("@")[0] || "Admin";

  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Preserve initial entry location or default to /
  const [returnPath] = useState(() => location.state?.from || "/");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080809]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#080809]">

      {/* ── Sidebar ── fixed height, never scrolls ─────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0 h-full border-r border-white/[0.06] bg-[#0c0c10]">

        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-white/[0.05] flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/15">
            <span className="font-bold text-sm text-white">A</span>
          </div>
          <span className="font-bold text-white text-sm tracking-tight truncate">
            {arenaConfig.name}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {adminLinks.map((link) => {
            const isActive =
              link.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${isActive
                  ? "bg-white/[0.10] text-white border border-white/[0.08]"
                  : "text-white/45 hover:text-white/80 hover:bg-white/[0.05]"
                  }`}
              >
                <link.icon size={16} strokeWidth={isActive ? 2 : 1.75} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user + back */}
        <div className="flex-shrink-0 border-t border-white/[0.05] p-3 space-y-1">
          <button
            onClick={() => navigate(returnPath)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/35 hover:text-white/70 hover:bg-white/[0.04] transition-all"
          >
            <ChevronLeft size={15} />
            Back to site
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.07] transition-all"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Right side: header + scrollable main ───────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">

        {/* Header — fixed, never scrolls */}
        <header className="flex-shrink-0 flex h-16 items-center justify-between gap-4 border-b border-white/[0.06] bg-[#0c0c10] px-4 lg:px-6">

          {/* Mobile title/logo replacement since tabs moved to bottom */}
          <div className="flex lg:hidden items-center gap-2">
            <span className="font-bold text-white text-sm tracking-tight">
              {arenaConfig.name}
            </span>
          </div>

          {/* Desktop: admin identity */}
          <div className="hidden lg:flex flex-col">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-white/30" strokeWidth={1.75} />
              <span className="text-xs font-semibold text-white/25 tracking-widest uppercase">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Right: user greeting */}
          <div className="flex items-center gap-3">
            {/* Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
              <Zap size={11} className="text-white/40" strokeWidth={2.5} />
              <span className="text-xs text-white/35 font-medium">Full access</span>
            </div>

            {/* Greeting */}
            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-semibold text-white/80 leading-none">
                Hey, {displayName} 👋
              </p>
              <p className="text-[10px] text-white/30 mt-0.5 tracking-wide">
                You're running the show
              </p>
            </div>

            {/* Avatar circle */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/15 text-xs font-bold text-white select-none flex-shrink-0 hover:bg-white/20 transition-all focus:outline-none"
              >
                {initials}
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-[#121218] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-[100] py-1"
                  >
                    <div className="px-3 py-2 border-b border-white/[0.05] mb-1">
                      <p className="text-sm font-medium text-white truncate">{displayName}</p>
                      <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate(returnPath);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/[0.05] transition-all"
                    >
                      <ChevronLeft size={14} />
                      Back to site
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400/90 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main content — ONLY this scrolls */}
        <main className="flex-1 overflow-y-auto bg-[#080809] p-4 pb-24 lg:p-6 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-around bg-[#0c0c10] border-t border-white/[0.06] pb-2 pt-1 px-2 h-16">
        {adminLinks.map((link) => {
          const isActive =
            link.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 rounded-xl transition-all ${isActive
                ? "text-white"
                : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
            >
              <link.icon size={18} strokeWidth={isActive ? 2 : 1.75} />
              <span className="text-[10px] font-medium leading-none">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Warning Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#0d0d11] border border-white/[0.09] rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                <AlertTriangle size={22} className="text-red-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Sign out of Admin?</h3>
              <p className="text-sm text-white/40 mb-6">
                You will be signed out completely and redirected to the home page.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-sm text-white/50 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/90 text-white text-sm font-bold hover:bg-red-500 transition-all"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
