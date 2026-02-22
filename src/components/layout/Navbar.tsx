import { Link, useLocation, useNavigate } from "react-router-dom";
import { arenaConfig } from "@/config/arena.config";
import { Menu, X, Zap, LogIn, LogOut, ChevronDown, Settings, LayoutDashboard } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Facilities", path: "/facilities" },
  { label: "Tournaments", path: "/tournaments" },
  { label: "Matches", path: "/matches" },
];

/** Derive up-to-2-letter initials from a display name */
function getInitials(name: string | null, email: string | null | undefined): string {
  if (name && name.trim()) {
    return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }
  return (email?.[0] ?? "U").toUpperCase();
}

/** Frosted-glass dropdown */
function UserDropdown({ onClose }: { onClose: () => void }) {
  const { user, fullName, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    onClose();
    await signOut();
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-0 top-full mt-5 min-w-[230px] rounded-2xl overflow-hidden z-[60]"
      style={{
        background: "rgba(18,18,24,0.65)",
        backdropFilter: "blur(40px) saturate(1.8)",
        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Signed in as */}
      <div className="px-4 py-3.5 border-b border-white/[0.06]">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-1">Signed in as</p>
        <p className="text-sm font-semibold text-white/85 truncate leading-none">{fullName || user?.email}</p>
        {fullName && <p className="text-xs text-white/40 truncate mt-0.5">{user?.email}</p>}
      </div>

      {/* Nav items */}
      <div className="p-1.5">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white/65 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <Settings size={14} strokeWidth={1.75} className="flex-shrink-0" />
          Profile &amp; settings
        </Link>
      </div>

      {/* Sign out */}
      <div className="p-1.5 pt-0 border-t border-white/[0.06]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.12] transition-all"
        >
          <LogOut size={14} strokeWidth={1.75} className="flex-shrink-0" />
          Sign out
        </button>
      </div>
    </motion.div>
  );
}

export function Navbar() {
  const location = useLocation();
  const { user, isAdmin, fullName } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    setScrolled(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const initials = getInitials(fullName, user?.email);
  const displayName = fullName || user?.email || "";

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_40px_rgba(0,0,0,0.5)]"
          : "bg-transparent border-b border-transparent"
          }`}
      >
        <div className="container mx-auto flex h-[72px] items-center justify-between px-6 max-w-7xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/20 group-hover:border-white/40 transition-all duration-300">
              <span className="font-display text-lg font-bold text-white">A</span>
            </div>
            <span className="font-display text-lg font-bold text-white tracking-tight">
              {arenaConfig.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors rounded-full ${location.pathname === link.path ? "text-white" : "text-white/50 hover:text-white/90"
                  }`}
              >
                {location.pathname === link.path && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white/10 border border-white/10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-2">
            {/* Admin quick-link — only for admins */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 h-8 px-3 rounded-full border border-white/[0.12] text-white/45 hover:text-white/80 hover:border-white/25 text-xs font-semibold tracking-wide transition-all"
              >
                <LayoutDashboard size={12} strokeWidth={2.5} />
                Admin
              </Link>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/[0.07] border border-white/[0.12] hover:border-white/25 hover:bg-white/[0.10] transition-all"
                >
                  {/* Avatar circle with initials */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold text-white select-none">
                    {initials}
                  </div>
                  <span className="text-xs text-white/70 font-medium max-w-[110px] truncate">
                    {fullName ? fullName.split(" ")[0] : displayName}
                  </span>
                  <ChevronDown
                    size={11}
                    className={`text-white/35 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {dropdownOpen && <UserDropdown onClose={() => setDropdownOpen(false)} />}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <button className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-xs font-semibold tracking-wide transition-all">
                    <LogIn size={13} strokeWidth={2.5} />
                    Sign in
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="flex items-center gap-2 h-9 px-5 rounded-full bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-white/90 transition-all">
                    <Zap size={13} strokeWidth={2.5} />
                    Get started
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white/70 hover:text-white transition-colors p-1"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[80px] left-4 right-4 z-50 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl"
            >
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === link.path
                      ? "bg-white/10 text-white border border-white/10"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
                {user ? (
                  <>
                    {/* User info row */}
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white flex-shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        {fullName && <p className="text-sm font-medium text-white/80 truncate">{fullName}</p>}
                        <p className="text-xs text-white/35 truncate">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <LayoutDashboard size={15} />
                        Admin dashboard
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Settings size={15} />
                      Profile &amp; settings
                    </Link>
                    <MobileSignOutButton onDone={() => setMobileOpen(false)} />
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <button className="w-full py-3 rounded-xl border border-white/10 text-sm font-semibold text-white/60 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2">
                        <LogIn size={14} strokeWidth={2.5} />
                        Sign in
                      </button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)}>
                      <button className="w-full py-3 rounded-xl bg-white text-black text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-white/90 transition-all">
                        <Zap size={14} strokeWidth={2.5} />
                        Get started
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileSignOutButton({ onDone }: { onDone: () => void }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <button
      onClick={async () => { onDone(); await signOut(); navigate("/"); }}
      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400/75 hover:text-red-400 hover:bg-red-500/[0.07] transition-colors"
    >
      <LogOut size={15} />
      Sign out
    </button>
  );
}
