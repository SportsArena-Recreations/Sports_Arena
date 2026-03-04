import { useState } from "react";
import { Link } from "react-router-dom";
import { Facility } from "@/features/facilities/types";
import { Booking } from "@/features/bookings/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Users, Clock, CalendarDays, ArrowRight } from "lucide-react";

// Sport-specific gradient placeholders — shown when no image is set
const SPORT_PLACEHOLDERS: Record<string, { emoji: string; from: string; via: string; to: string }> = {
  basketball: { emoji: "🏀", from: "#7c3200", via: "#3d1a00", to: "#111" },
  soccer: { emoji: "⚽", from: "#1a4d2e", via: "#0d2718", to: "#111" },
  tennis: { emoji: "🎾", from: "#4d3a00", via: "#2a1f00", to: "#111" },
  volleyball: { emoji: "🏐", from: "#4a1d96", via: "#2d1060", to: "#111" },
  swimming: { emoji: "🏊", from: "#0d3b6e", via: "#061e3a", to: "#111" },
  badminton: { emoji: "🏸", from: "#1d4d3a", via: "#0d2820", to: "#111" },
  multipurpose: { emoji: "🏟️", from: "#3d1a4d", via: "#200d2a", to: "#111" },
};

interface FacilityCardProps {
  facility: Facility;
  closestBooking?: Booking;
}

export function FacilityCard({ facility, closestBooking }: FacilityCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasImage = facility.imageUrl && facility.imageUrl.startsWith("http") && !imgError;
  const placeholder = SPORT_PLACEHOLDERS[facility.type] ?? SPORT_PLACEHOLDERS.multipurpose;

  const isLive = (() => {
    if (!closestBooking || closestBooking.status !== "confirmed") return false;
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(closestBooking.date + "T00:00:00");

    if (bookingDate.getTime() === today.getTime()) {
      const startHour = parseInt(closestBooking.startTime.split(':')[0], 10);
      const endHour = parseInt(closestBooking.endTime.split(':')[0], 10);
      const currentHour = now.getHours();
      return currentHour >= startHour && currentHour < endHour;
    }
    return false;
  })();

  return (
    <Link to={`/facilities/${facility.id}`} className="group block">
      {/*
       * ─── Unified card shell ─────────────────────────────────────────────────
       * One card, three zones separated by a thin rule:
       *   1. Large image / placeholder area   (flex-1)
       *   2. Name + price divider strip       (fixed height)
       *   3. Booking CTA footer               (compact)
       */}
      <div className="relative w-full overflow-hidden rounded-[2rem] bg-[#0d0d10] border border-white/[0.07] group-hover:border-white/[0.14] transition-all duration-500 shadow-[0_4px_40px_rgba(0,0,0,0.5)] group-hover:shadow-[0_8px_60px_rgba(0,0,0,0.7)] flex flex-col">

        {/* ── Zone 1: Visual image area ─────────────────────────────────────── */}
        <div className="relative h-[260px] md:h-[300px] w-full overflow-hidden flex-shrink-0">
          {hasImage ? (
            <div className="absolute inset-0">
              <img
                src={facility.imageUrl}
                alt={facility.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover opacity-55 grayscale group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-70 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{
                background: `radial-gradient(ellipse at 60% 40%, ${placeholder.from} 0%, ${placeholder.via} 50%, ${placeholder.to} 100%)`,
              }}
            >
              <span
                className="text-7xl select-none opacity-25 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500"
                style={{ filter: "grayscale(1)" }}
              >
                {placeholder.emoji}
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-white/15 group-hover:text-white/25 transition-colors">
                {facility.type}
              </span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>
          )}

          {/* Status badge */}
          <div className="absolute right-5 top-5 z-10">
            <StatusBadge status={facility.status} />
          </div>

          {/* Capacity & duration pills — bottom-left of image */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-5 flex flex-col justify-end pt-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <p className="text-white/80 line-clamp-2 text-sm leading-relaxed mb-3 group-hover:text-white transition-colors">
              {facility.description}
            </p>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white border border-white/10">
                <Users size={13} className="opacity-70" />
                {facility.capacity}
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white border border-white/10">
                <Clock size={13} className="opacity-70" />
                1 hr min
              </span>
            </div>
          </div>
        </div>

        {/* ── Zone 2: Separator / name + price strip ────────────────────────── */}
        {/*
         * This strip is the visual "cut" between the two halves.
         * It sits flush between the image and the footer — no gap, no margin.
         * A subtle notch effect via box-shadow gives the "torn" illusion.
         */}
        <div className="relative flex items-center justify-between gap-3 px-5 py-3.5 bg-[#111117] border-t border-b border-white/[0.07]"
          style={{ boxShadow: "0 -6px 18px rgba(0,0,0,0.5) inset, 0 6px 18px rgba(0,0,0,0.4) inset" }}
        >
          {/* Decorative left notch */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#020202] border border-white/[0.06] z-10" />
          {/* Decorative right notch */}
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#020202] border border-white/[0.06] z-10" />

          <h3 className="text-base md:text-lg font-bold tracking-tight text-white truncate group-hover:text-white/90 transition-colors">
            {facility.name}
          </h3>
          <div className="shrink-0 text-sm font-bold text-white/80 bg-white/[0.05] border border-white/[0.08] px-3 py-1 rounded-lg whitespace-nowrap">
            ₦{facility.pricePerHour.toLocaleString("en-NG")}<span className="text-white/40 font-normal text-xs">/hr</span>
          </div>
        </div>

        {/* ── Zone 3: Booking CTA footer ────────────────────────────────────── */}
        <div className="px-5 py-3.5 bg-[#0d0d10]">
          {closestBooking ? (
            <div className={`flex items-center gap-3 ${isLive ? 'text-green-400' : 'text-sky-400'}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isLive ? 'bg-green-500/15' : 'bg-sky-500/15'}`}>
                <CalendarDays size={14} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {isLive && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                    {isLive ? 'Live Now' : 'Upcoming Booking'}
                  </p>
                </div>
                <p className="text-xs font-semibold text-white/70 truncate">
                  {new Date(closestBooking.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {closestBooking.startTime.slice(0, 5)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-white/40 group-hover:text-white/70 group-hover:bg-white/[0.09] transition-all">
                  <CalendarDays size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5 group-hover:text-white/50 transition-colors">Available</p>
                  <p className="text-xs font-semibold text-white/50 group-hover:text-white/80 transition-colors">Book your session</p>
                </div>
              </div>
              <ArrowRight
                size={15}
                className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all duration-300 shrink-0"
              />
            </div>
          )}
        </div>

      </div>
    </Link>
  );
}
