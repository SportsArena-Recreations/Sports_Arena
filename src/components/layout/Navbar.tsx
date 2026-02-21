import { Link, useLocation } from "react-router-dom";
import { arenaConfig } from "@/config/arena.config";
import { Menu, X, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Facilities", path: "/facilities" },
  { label: "Tournaments", path: "/tournaments" },
  { label: "Contact", path: "/contact" },
];

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Inner pages are never at the very top of a full-bleed dark hero,
  // so we start "scrolled" (glass visible) immediately.
  const [scrolled, setScrolled] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    // Also set correctly on mount
    setScrolled(window.scrollY > 20 || true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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

          {/* Desktop Nav Links */}
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

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/admin"
              className="text-xs font-semibold tracking-widest uppercase text-white/40 hover:text-white/70 transition-colors px-2"
            >
              Admin
            </Link>
            <Link to="/facilities">
              <button className="flex items-center gap-2 h-9 px-5 rounded-full bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-white/90 transition-all">
                <Zap size={13} strokeWidth={2.5} />
                Book Now
              </button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white/70 hover:text-white transition-colors p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
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
                <Link to="/admin" onClick={() => setMobileOpen(false)}>
                  <button className="w-full py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors text-left px-4">
                    Admin Dashboard
                  </button>
                </Link>
                <Link to="/facilities" onClick={() => setMobileOpen(false)}>
                  <button className="w-full py-3 rounded-xl bg-white text-black text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-white/90 transition-all">
                    <Zap size={14} strokeWidth={2.5} />
                    Book Now
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
