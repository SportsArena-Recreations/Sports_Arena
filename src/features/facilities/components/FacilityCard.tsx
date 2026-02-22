import { useState } from "react";
import { Link } from "react-router-dom";
import { Facility } from "@/features/facilities/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Users, Clock } from "lucide-react";

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
}

export function FacilityCard({ facility }: FacilityCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasImage = facility.imageUrl && facility.imageUrl.startsWith("http") && !imgError;
  const placeholder = SPORT_PLACEHOLDERS[facility.type] ?? SPORT_PLACEHOLDERS.multipurpose;

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

        {/* Meta pills */}
        <div className="absolute left-6 bottom-6 z-10 flex gap-2">
          <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 border border-white/10">
            <Users size={14} />
            {facility.capacity}
          </span>
          <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white/90 border border-white/10">
            <Clock size={14} />
            1hr
          </span>
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
        <p className="text-white/50 leading-relaxed max-w-[90%] line-clamp-2 text-sm md:text-base">
          {facility.description}
        </p>
      </div>
    </Link>
  );
}
