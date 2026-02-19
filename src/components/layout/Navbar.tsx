import { Link, useLocation } from "react-router-dom";
import { arenaConfig } from "@/config/arena.config";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Facilities", path: "/facilities" },
  { label: "Tournaments", path: "/tournaments" },
  { label: "Contact", path: "/contact" },
];

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="font-display text-lg font-bold text-primary-foreground">A</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            {arenaConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/admin">
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </Link>
          <Link to="/facilities">
            <Button size="sm">Book Now</Button>
          </Link>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/admin" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                Admin Dashboard
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
