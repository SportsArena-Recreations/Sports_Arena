import { arenaConfig } from "@/config/arena.config";
import { MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card pt-4 relative z-10 w-full overflow-hidden">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-display text-sm font-bold text-primary-foreground">A</span>
              </div>
              <span className="font-display text-lg font-bold">{arenaConfig.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">{arenaConfig.tagline}</p>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><MapPin size={14} /> {arenaConfig.contact.address}, {arenaConfig.contact.city}</p>
              <p className="flex items-center gap-2"><Phone size={14} /> {arenaConfig.contact.phone}</p>
              <p className="flex items-center gap-2"><Mail size={14} /> {arenaConfig.contact.email}</p>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-display font-semibold">Hours</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Weekdays: {arenaConfig.operatingHours.weekday}</p>
              <p>Weekends: {arenaConfig.operatingHours.weekend}</p>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {arenaConfig.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
