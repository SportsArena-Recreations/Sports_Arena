import { Link, useLocation, useNavigate } from "react-router-dom";
import { arenaConfig } from "@/config/arena.config";
import {
  Menu, X, Zap, LogIn, LogOut, UserCircle2, ChevronDown, Settings,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Facilities", path: "/facilities" },
  { label: "Tournaments", path: "/tournaments" },
  { label: "Contact", path: "/contact" },
];

/** Small dropdown that appears when user clicks their email pill */
function UserDropdown({ onClose }: { onClose: () => void }) {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    onClose();
    await signOut();
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-0 top-full mt-2.5 min-w-[220px] bg-black/70 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[60]"
    >
      {/* Signed in as */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <p className="text-[10px] text-white/30 font-semibold tracking-widest uppercase mb-0.5">Signed in as</p>
        <p className="text-xs text-white/60 truncate font-medium">{user?.email}</p>
      </div>

      {/* Links */}
      <div className="p-1.5 space-y-0.5">
        <Link
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.07] rounded-xl transition-all"
        >
          <Settings size={14} strokeWidth={1.75} className="flex-shrink-0" />
          Profile &amp; settings
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.07] rounded-xl transition-all"
          >
            <UserCircle2 size={14} strokeWidth={1.75} className="flex-shrink-0" />
            Admin dashboard
          </Link>
        )}
      </div>

      {/* Sign out */}
      <div className="p-1.5 pt-0 border-t border-white/[0.06]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.08] rounded-xl transition-all"
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
  const { user, isAdmin } = useAuth();
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

  // Close dropdown on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

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
                className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors rounded-full ${location.pathname === link.path
                  ? "text-white"
                  : "text-white/50 hover:text-white/90"
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
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 hover:border-white/25 transition-all"
                >
                  <UserCircle2 size={15} className="text-white/60 flex-shrink-0" />
                  <span className="text-xs text-white/70 font-medium max-w-[130px] truncate">
                    {user.email}
                  </span>
                  <ChevronDown
                    size={12}
                    className={`text-white/40 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <UserDropdown onClose={() => setDropdownOpen(false)} />
                  )}
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
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Settings size={15} />
                      <div>
                        <p className="font-medium leading-none">Profile & settings</p>
                        <p className="text-xs text-white/30 mt-1 truncate">{user.email}</p>
                      </div>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <UserCircle2 size={15} />
                        Admin dashboard
                      </Link>
                    )}
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

/** Isolated sign-out button so it can call useAuth cleanly */
function MobileSignOutButton({ onDone }: { onDone: () => void }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    onDone();
    await signOut();
    navigate("/");
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
    >
      <LogOut size={15} />
      Sign out
    </button>
  );
}
