import { useState } from "react";
import { Link } from "react-router-dom";
import { Facility } from "@/features/facilities/types";
import { Booking } from "@/features/bookings/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Users, Clock, CalendarDays } from "lucide-react";

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
      <div className="relative h-[300px] md:h-[350px] w-full overflow-hidden rounded-[2rem] bg-[#111] border border-white/5 mb-5">

        {hasImage ? (
          /* Real image */
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
          /* Sport-type placeholder */
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{
              background: `radial-gradient(ellipse at 60% 40%, ${placeholder.from} 0%, ${placeholder.via} 50%, ${placeholder.to} 100%)`,
            }}
          >
            {/* Big sport emoji */}
            <span
              className="text-7xl select-none opacity-25 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500"
              style={{ filter: "grayscale(1)" }}
            >
              {placeholder.emoji}
            </span>
            {/* Type label */}
            <span className="text-xs font-semibold uppercase tracking-widest text-white/15 group-hover:text-white/25 transition-colors">
              {facility.type}
            </span>
            {/* Bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute right-6 top-6 z-10">
          <StatusBadge status={facility.status} />
        </div>

        {/* Info overlay inside card */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 flex flex-col justify-end pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <p className="text-white/80 line-clamp-2 text-sm leading-relaxed mb-4 group-hover:text-white transition-colors">
            {facility.description}
          </p>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white border border-white/10 hover:bg-white/20 transition-colors">
              <Users size={14} className="opacity-70" />
              {facility.capacity}
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white border border-white/10 hover:bg-white/20 transition-colors">
              <Clock size={14} className="opacity-70" />
              1hr
            </span>
          </div>
        </div>
      </div>

      {/* Info below card */}
      <div>
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white group-hover:text-white/80 transition-colors">
            {facility.name}
          </h3>
          <div className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-white/90 font-medium text-sm whitespace-nowrap">
            ₦{facility.pricePerHour.toLocaleString("en-NG")}/hr
          </div>
        </div>

        {closestBooking ? (
          <div className={`mb-3 flex items-center gap-2 p-2.5 rounded-xl ${isLive ? 'bg-green-500/[0.08] border border-green-500/20' : 'bg-sky-500/[0.08] border border-sky-500/20'}`}>
            <div className={`flex h-7 w-7 items-center justify-center rounded-full ${isLive ? 'bg-green-500/20 text-green-400' : 'bg-sky-500/20 text-sky-400'}`}>
              <CalendarDays size={14} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                {isLive && (
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                )}
                <p className={`text-[10px] font-bold uppercase tracking-widest ${isLive ? 'text-green-400' : 'text-sky-400/80'}`}>
                  {isLive ? 'Live Now' : 'Upcoming Booking'}
                </p>
              </div>
              <p className={`text-xs font-semibold ${isLive ? 'text-green-100' : 'text-sky-100'}`}>
                {new Date(closestBooking.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {closestBooking.startTime.slice(0, 5)}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-3 flex items-center gap-2 p-2.5 bg-white/[0.02] border border-white/[0.05] rounded-xl group-hover:bg-white/[0.04] group-hover:border-white/10 transition-colors">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.05] text-white/40 group-hover:text-white/60 transition-colors">
              <CalendarDays size={14} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5 group-hover:text-white/40 transition-colors">Available</p>
              <p className="text-xs font-semibold text-white/50 group-hover:text-white/70 transition-colors">
                Book your next session
              </p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
